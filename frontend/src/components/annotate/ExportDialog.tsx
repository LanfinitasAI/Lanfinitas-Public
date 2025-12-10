import { useState } from 'react'
import { Download, FileJson, FileCode, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Annotation } from './ImageCanvas'

export type ExportFormat = 'json' | 'coco' | 'yolo'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  annotations: Annotation[]
  imageName?: string
  imageWidth?: number
  imageHeight?: number
}

const exportFormats = [
  {
    id: 'json' as ExportFormat,
    name: 'JSON',
    description: 'Standard JSON format with all annotation data',
    icon: FileJson,
    extension: 'json',
  },
  {
    id: 'coco' as ExportFormat,
    name: 'COCO',
    description: 'COCO format for object detection and segmentation',
    icon: FileCode,
    extension: 'json',
  },
  {
    id: 'yolo' as ExportFormat,
    name: 'YOLO',
    description: 'YOLO format for object detection training',
    icon: FileText,
    extension: 'txt',
  },
]

export function ExportDialog({
  open,
  onOpenChange,
  annotations,
  imageName = 'annotations',
  imageWidth = 800,
  imageHeight = 600,
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')

  const exportToJSON = (): string => {
    const data = {
      version: '1.0',
      image: {
        name: imageName,
        width: imageWidth,
        height: imageHeight,
      },
      annotations: annotations.map((annotation) => ({
        id: annotation.id,
        type: annotation.type,
        points: annotation.points,
        label: annotation.label,
        color: annotation.color,
      })),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalAnnotations: annotations.length,
        annotationTypes: {
          keypoint: annotations.filter((a) => a.type === 'keypoint').length,
          seam: annotations.filter((a) => a.type === 'seam').length,
          grainline: annotations.filter((a) => a.type === 'grainline').length,
          region: annotations.filter((a) => a.type === 'region').length,
        },
      },
    }

    return JSON.stringify(data, null, 2)
  }

  const exportToCOCO = (): string => {
    // COCO format structure
    const cocoData = {
      info: {
        description: 'Fashion Pattern Annotations',
        version: '1.0',
        year: new Date().getFullYear(),
        date_created: new Date().toISOString(),
      },
      images: [
        {
          id: 1,
          file_name: imageName,
          width: imageWidth,
          height: imageHeight,
        },
      ],
      annotations: annotations
        .filter((a) => a.type === 'region') // COCO focuses on regions/segmentation
        .map((annotation, index) => {
          // Convert points to segmentation format
          const segmentation = [
            annotation.points.flatMap((p) => [p.x, p.y]),
          ]

          // Calculate bounding box
          const xs = annotation.points.map((p) => p.x)
          const ys = annotation.points.map((p) => p.y)
          const minX = Math.min(...xs)
          const minY = Math.min(...ys)
          const maxX = Math.max(...xs)
          const maxY = Math.max(...ys)
          const bbox = [minX, minY, maxX - minX, maxY - minY]

          // Calculate area
          const area = (maxX - minX) * (maxY - minY)

          return {
            id: index + 1,
            image_id: 1,
            category_id: 1,
            segmentation,
            bbox,
            area,
            iscrowd: 0,
          }
        }),
      categories: [
        {
          id: 1,
          name: 'pattern_region',
          supercategory: 'pattern',
        },
      ],
    }

    return JSON.stringify(cocoData, null, 2)
  }

  const exportToYOLO = (): string => {
    // YOLO format: <class> <x_center> <y_center> <width> <height>
    // All values normalized to [0, 1]
    const lines: string[] = []

    annotations
      .filter((a) => a.type === 'region')
      .forEach((annotation) => {
        const xs = annotation.points.map((p) => p.x)
        const ys = annotation.points.map((p) => p.y)
        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        const maxX = Math.max(...xs)
        const maxY = Math.max(...ys)

        const centerX = ((minX + maxX) / 2) / imageWidth
        const centerY = ((minY + maxY) / 2) / imageHeight
        const width = (maxX - minX) / imageWidth
        const height = (maxY - minY) / imageHeight

        // Class 0 for all pattern regions
        lines.push(
          `0 ${centerX.toFixed(6)} ${centerY.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}`
        )
      })

    return lines.join('\n')
  }

  const handleExport = () => {
    let content = ''
    let filename = ''
    let mimeType = ''

    switch (selectedFormat) {
      case 'json':
        content = exportToJSON()
        filename = `${imageName}.json`
        mimeType = 'application/json'
        break
      case 'coco':
        content = exportToCOCO()
        filename = `${imageName}_coco.json`
        mimeType = 'application/json'
        break
      case 'yolo':
        content = exportToYOLO()
        filename = `${imageName}.txt`
        mimeType = 'text/plain'
        break
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Annotations</DialogTitle>
          <DialogDescription>
            Choose a format to export your annotations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            {exportFormats.map((format) => {
              const Icon = format.icon
              const isSelected = selectedFormat === format.id

              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`
                    flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-all
                    ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div
                    className={`
                      rounded p-2
                      ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {format.name}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600">
                      {format.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Info Alert */}
          {annotations.length === 0 && (
            <Alert>
              <AlertDescription>
                No annotations to export. Add some annotations first.
              </AlertDescription>
            </Alert>
          )}

          {selectedFormat === 'yolo' &&
            annotations.filter((a) => a.type === 'region').length === 0 && (
              <Alert>
                <AlertDescription>
                  YOLO format requires region annotations. No regions found.
                </AlertDescription>
              </Alert>
            )}

          {/* Export Summary */}
          {annotations.length > 0 && (
            <div className="rounded-lg bg-slate-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-slate-700">
                Export Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-600">Total Annotations:</div>
                <div className="font-medium text-slate-900">
                  {annotations.length}
                </div>
                <div className="text-slate-600">Format:</div>
                <div className="font-medium text-slate-900">
                  {exportFormats.find((f) => f.id === selectedFormat)?.name}
                </div>
                <div className="text-slate-600">File Extension:</div>
                <div className="font-medium text-slate-900">
                  .{exportFormats.find((f) => f.id === selectedFormat)?.extension}
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={annotations.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
