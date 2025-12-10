import { X, Download, Maximize2 } from 'lucide-react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Result } from './ResultCard'

interface ComparisonViewProps {
  results: Result[]
  onRemove: (id: string) => void
  onDownloadAll?: () => void
  onClose: () => void
}

export function ComparisonView({
  results,
  onRemove,
  onDownloadAll,
  onClose,
}: ComparisonViewProps) {
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-400">
          No results selected for comparison. Add results to compare.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          Comparison View ({results.length})
        </h2>
        <div className="flex gap-2">
          {onDownloadAll && results.length > 1 && (
            <Button variant="outline" onClick={onDownloadAll}>
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div
        className={`grid gap-4 ${
          results.length === 1
            ? 'grid-cols-1'
            : results.length === 2
            ? 'grid-cols-2'
            : 'grid-cols-3'
        }`}
      >
        {results.map((result) => (
          <Card key={result.id} className="overflow-hidden">
            {/* Image */}
            <div className="group relative aspect-square bg-slate-100">
              <img
                src={result.fullImageUrl}
                alt={`Result ${result.id}`}
                className="h-full w-full object-contain"
              />

              {/* Remove Button */}
              <button
                onClick={() => onRemove(result.id)}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                title="Remove from comparison"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Expand Button */}
              <button
                className="absolute left-2 top-2 rounded-full bg-slate-900/80 p-2 text-white opacity-0 transition-opacity hover:bg-slate-900 group-hover:opacity-100"
                title="View fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Details */}
            <div className="p-4">
              <h3 className="mb-2 font-semibold text-slate-900">
                {result.modelType}
              </h3>

              <div className="space-y-2 text-sm">
                {/* Confidence */}
                <div className="flex justify-between">
                  <span className="text-slate-600">Confidence:</span>
                  <span className="font-medium text-slate-900">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>

                {/* Date */}
                <div className="flex justify-between">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-medium text-slate-900">
                    {format(new Date(result.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>

                {/* Processing Time */}
                <div className="flex justify-between">
                  <span className="text-slate-600">Processing:</span>
                  <span className="font-medium text-slate-900">
                    {result.metadata.processingTime}s
                  </span>
                </div>

                {/* Input File */}
                <div className="border-t pt-2">
                  <span className="text-xs text-slate-600">Input:</span>
                  <p className="truncate text-sm font-medium text-slate-900">
                    {result.metadata.inputFile}
                  </p>
                </div>

                {/* Output Format */}
                <div>
                  <span className="text-xs text-slate-600">Format:</span>
                  <p className="text-sm font-medium text-slate-900">
                    {result.metadata.outputFormat}
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => {
                  // Download individual result
                  const link = document.createElement('a')
                  link.href = result.fullImageUrl
                  link.download = `result-${result.id}.png`
                  link.click()
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison Stats */}
      {results.length > 1 && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Comparison Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Avg Confidence:</span>
              <p className="font-medium text-slate-900">
                {Math.round(
                  (results.reduce((sum, r) => sum + r.confidence, 0) /
                    results.length) *
                    100
                )}
                %
              </p>
            </div>
            <div>
              <span className="text-slate-600">Avg Processing:</span>
              <p className="font-medium text-slate-900">
                {(
                  results.reduce(
                    (sum, r) => sum + r.metadata.processingTime,
                    0
                  ) / results.length
                ).toFixed(1)}
                s
              </p>
            </div>
            <div>
              <span className="text-slate-600">Model Types:</span>
              <p className="font-medium text-slate-900">
                {new Set(results.map((r) => r.modelType)).size} unique
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
