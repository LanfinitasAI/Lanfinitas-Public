import { Circle, Minus, ArrowRight, Pentagon, Eye, EyeOff, Trash2, Edit2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Annotation } from './ImageCanvas'

const annotationIcons = {
  keypoint: Circle,
  seam: Minus,
  grainline: ArrowRight,
  region: Pentagon,
  none: Circle,
}

const annotationLabels = {
  keypoint: 'Keypoint',
  seam: 'Seam Line',
  grainline: 'Grainline',
  region: 'Region',
  none: 'None',
}

interface AnnotationListProps {
  annotations: Annotation[]
  selectedAnnotation?: string | null
  onSelect: (id: string) => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string) => void
}

export function AnnotationList({
  annotations,
  selectedAnnotation,
  onSelect,
  onToggleVisibility,
  onDelete,
  onEdit,
}: AnnotationListProps) {
  const getAnnotationSummary = (annotation: Annotation): string => {
    switch (annotation.type) {
      case 'keypoint':
        return `Point (${annotation.points[0]?.x}, ${annotation.points[0]?.y})`
      case 'seam':
      case 'grainline':
        return `${annotation.points.length} points`
      case 'region':
        return `${annotation.points.length} vertices`
      default:
        return ''
    }
  }

  return (
    <Card className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Annotations ({annotations.length})
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {annotations.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p className="text-sm text-slate-400">
              No annotations yet. Use the tools to add annotations.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {annotations.map((annotation) => {
              const Icon = annotationIcons[annotation.type]
              const isSelected = selectedAnnotation === annotation.id

              return (
                <div
                  key={annotation.id}
                  onClick={() => onSelect(annotation.id)}
                  className={`
                    group relative rounded-lg border-2 p-3 transition-all cursor-pointer
                    ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="rounded p-1.5"
                      style={{
                        backgroundColor: `${annotation.color}20`,
                        color: annotation.color,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-slate-900">
                          {annotationLabels[annotation.type]}
                        </h4>
                        <div className="flex items-center gap-1">
                          {/* Visibility Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleVisibility(annotation.id)
                            }}
                            className="rounded p-1 hover:bg-slate-200"
                            title={annotation.visible ? 'Hide' : 'Show'}
                          >
                            {annotation.visible ? (
                              <Eye className="h-3.5 w-3.5 text-slate-600" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                            )}
                          </button>

                          {/* Edit Button */}
                          {onEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(annotation.id)
                              }}
                              className="rounded p-1 hover:bg-slate-200"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(annotation.id)
                            }}
                            className="rounded p-1 hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="mt-1 text-xs text-slate-600">
                        {getAnnotationSummary(annotation)}
                      </p>

                      {/* Label if exists */}
                      {annotation.label && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {annotation.label}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with statistics */}
      {annotations.length > 0 && (
        <div className="border-t bg-slate-50 px-4 py-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-600">Keypoints:</span>{' '}
              <span className="font-medium text-slate-900">
                {annotations.filter((a) => a.type === 'keypoint').length}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Seams:</span>{' '}
              <span className="font-medium text-slate-900">
                {annotations.filter((a) => a.type === 'seam').length}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Grainlines:</span>{' '}
              <span className="font-medium text-slate-900">
                {annotations.filter((a) => a.type === 'grainline').length}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Regions:</span>{' '}
              <span className="font-medium text-slate-900">
                {annotations.filter((a) => a.type === 'region').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
