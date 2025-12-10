import { Download, Save, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatFileSize, formatDate } from '@/lib/utils'

interface PatternResult {
  id: string
  name: string
  imageUrl?: string
  downloadUrl: string
  fileSize: number
  format: string
  createdAt: string
}

interface ResultPreviewProps {
  result: PatternResult
  onSave?: (result: PatternResult) => void
  onDownload?: (result: PatternResult) => void
}

export function ResultPreview({
  result,
  onSave,
  onDownload,
}: ResultPreviewProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload(result)
    } else {
      // Default download behavior
      const link = document.createElement('a')
      link.href = result.downloadUrl
      link.download = result.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Pattern Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview Image */}
        <div className="aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {result.imageUrl ? (
            <img
              src={result.imageUrl}
              alt={result.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <div className="text-center">
                <Eye className="mx-auto mb-2 h-12 w-12" />
                <p className="text-sm">Preview not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Pattern Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Name:</span>
            <span className="font-medium text-slate-900">{result.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Format:</span>
            <span className="font-medium text-slate-900">
              {result.format.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">File Size:</span>
            <span className="font-medium text-slate-900">
              {formatFileSize(result.fileSize)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Created:</span>
            <span className="font-medium text-slate-900">
              {formatDate(result.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {onSave && (
            <Button
              onClick={() => onSave(result)}
              variant="outline"
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
