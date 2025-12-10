import { Eye, Download, Trash2, GitCompare } from 'lucide-react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface Result {
  id: string
  thumbnailUrl: string
  fullImageUrl: string
  modelType: string
  confidence: number
  createdAt: string
  metadata: {
    inputFile: string
    processingTime: number
    outputFormat: string
  }
}

interface ResultCardProps {
  result: Result
  onView: (result: Result) => void
  onDownload: (result: Result) => void
  onDelete: (result: Result) => void
  onCompare?: (result: Result) => void
  isComparing?: boolean
  isSelected?: boolean
}

export function ResultCard({
  result,
  onView,
  onDownload,
  onDelete,
  onCompare,
  isComparing = false,
  isSelected = false,
}: ResultCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <Card
      className={`group overflow-hidden transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-indigo-500' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={result.thumbnailUrl}
          alt={`Result ${result.id}`}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onView(result)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDownload(result)}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          {onCompare && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onCompare(result)}
              title="Add to Comparison"
            >
              <GitCompare className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Confidence Badge */}
        <div className="absolute right-2 top-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${getConfidenceColor(
              result.confidence
            )}`}
          >
            {Math.round(result.confidence * 100)}%
          </span>
        </div>

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute left-2 top-2">
            <span className="rounded-full bg-indigo-500 px-2 py-1 text-xs font-semibold text-white">
              Selected
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Model Type */}
        <h3 className="mb-1 truncate font-semibold text-slate-900">
          {result.modelType}
        </h3>

        {/* Metadata */}
        <div className="space-y-1 text-xs text-slate-600">
          <p className="truncate" title={result.metadata.inputFile}>
            Input: {result.metadata.inputFile}
          </p>
          <p>
            Date: {format(new Date(result.createdAt), 'MMM dd, yyyy HH:mm')}
          </p>
          <p>Processing: {result.metadata.processingTime}s</p>
        </div>

        {/* Actions */}
        {!isComparing && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(result)}
              className="flex-1"
            >
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(result)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
