import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export type GenerationStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'error'

interface GenerationStep {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress?: number
}

interface GenerationProgressProps {
  status: GenerationStatus
  progress: number
  steps: GenerationStep[]
  error?: string
}

export function GenerationProgress({
  status,
  progress,
  steps,
  error,
}: GenerationProgressProps) {
  if (status === 'idle') {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'completed' ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Generation Complete
            </>
          ) : status === 'error' ? (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              Generation Failed
            </>
          ) : (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              Generating Pattern...
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        {status !== 'completed' && status !== 'error' && (
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Overall Progress</span>
              <span className="text-slate-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Error Message */}
        {error && status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              {/* Step Icon */}
              <div className="mt-1">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : step.status === 'error' ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : step.status === 'in-progress' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={
                      step.status === 'completed'
                        ? 'font-medium text-slate-900'
                        : step.status === 'in-progress'
                          ? 'font-medium text-indigo-600'
                          : 'text-slate-600'
                    }
                  >
                    {step.title}
                  </span>
                  {step.status === 'in-progress' && step.progress !== undefined && (
                    <span className="text-sm text-slate-600">
                      {Math.round(step.progress)}%
                    </span>
                  )}
                </div>

                {/* Step Progress Bar */}
                {step.status === 'in-progress' && step.progress !== undefined && (
                  <Progress value={step.progress} className="mt-2 h-1" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        {status === 'completed' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Your pattern has been generated successfully! You can now preview
              and download it below.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
