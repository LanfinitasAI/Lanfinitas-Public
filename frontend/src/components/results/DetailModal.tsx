import { Download, Share2, GitCompare, X } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Result } from './ResultCard'

interface DetailModalProps {
  result: Result | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (result: Result) => void
  onCompare?: (result: Result) => void
}

export function DetailModal({
  result,
  open,
  onOpenChange,
  onDownload,
  onCompare,
}: DetailModalProps) {
  if (!result) return null

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Result - ${result.modelType}`,
          text: `Check out this result from ${result.modelType}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: Copy link to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>{result.modelType}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(result)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              {onCompare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onCompare(result)
                    onOpenChange(false)
                  }}
                >
                  <GitCompare className="mr-2 h-4 w-4" />
                  Compare
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" className="mt-4">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-4">
            <div className="overflow-hidden rounded-lg bg-slate-100">
              <img
                src={result.fullImageUrl}
                alt={`Result ${result.id}`}
                className="mx-auto max-h-[600px] w-full object-contain"
              />
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Confidence</p>
                <p
                  className={`text-xl font-bold ${getConfidenceColor(
                    result.confidence
                  )}`}
                >
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Processing Time</p>
                <p className="text-xl font-bold text-slate-900">
                  {result.metadata.processingTime}s
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Format</p>
                <p className="text-xl font-bold text-slate-900">
                  {result.metadata.outputFormat}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Date</p>
                <p className="text-sm font-bold text-slate-900">
                  {format(new Date(result.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="mt-4">
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Result ID:</span>
                    <p className="font-medium text-slate-900">{result.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Model Type:</span>
                    <p className="font-medium text-slate-900">
                      {result.modelType}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Created At:</span>
                    <p className="font-medium text-slate-900">
                      {format(
                        new Date(result.createdAt),
                        'MMM dd, yyyy HH:mm:ss'
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Confidence Score:</span>
                    <p
                      className={`font-medium ${getConfidenceColor(
                        result.confidence
                      )}`}
                    >
                      {(result.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Processing Information */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Processing Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Input File:</span>
                    <p className="font-medium text-slate-900">
                      {result.metadata.inputFile}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Processing Time:</span>
                    <p className="font-medium text-slate-900">
                      {result.metadata.processingTime} seconds
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Output Format:</span>
                    <p className="font-medium text-slate-900">
                      {result.metadata.outputFormat}
                    </p>
                  </div>
                </div>
              </div>

              {/* File Information */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  File Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Thumbnail URL:</span>
                    <p className="truncate font-mono text-xs text-slate-900">
                      {result.thumbnailUrl}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Full Image URL:</span>
                    <p className="truncate font-mono text-xs text-slate-900">
                      {result.fullImageUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              {/* Performance Metrics */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Performance Metrics
                </h3>
                <div className="space-y-3">
                  {/* Confidence Bar */}
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600">Confidence Score</span>
                      <span className="font-medium text-slate-900">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full ${
                          result.confidence >= 0.8
                            ? 'bg-green-500'
                            : result.confidence >= 0.6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Processing Time */}
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600">Processing Speed</span>
                      <span className="font-medium text-slate-900">
                        {result.metadata.processingTime}s
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Processing completed in{' '}
                      {result.metadata.processingTime < 5
                        ? 'excellent'
                        : result.metadata.processingTime < 10
                        ? 'good'
                        : 'acceptable'}{' '}
                      time
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Information */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Model Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Model Type:</span>
                    <span className="font-medium text-slate-900">
                      {result.modelType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Model Version:</span>
                    <span className="font-medium text-slate-900">v2.0.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Framework:</span>
                    <span className="font-medium text-slate-900">PyTorch</span>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Additional Information
                </h3>
                <p className="text-sm text-slate-600">
                  This result was generated using AI-powered pattern recognition
                  technology. The confidence score represents the model's
                  certainty in the prediction. Higher scores indicate more
                  reliable results.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
