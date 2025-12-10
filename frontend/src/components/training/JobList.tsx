import { Clock, CheckCircle2, XCircle, Loader2, Play } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface TrainingJob {
  id: string
  name: string
  modelType: string
  dataset: string
  status: JobStatus
  progress: number
  currentEpoch?: number
  totalEpochs: number
  startedAt?: string
  completedAt?: string
  error?: string
}

interface JobListProps {
  jobs: TrainingJob[]
  selectedJob?: string | null
  onSelectJob: (id: string) => void
  onStartJob?: (id: string) => void
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
  },
  running: {
    icon: Loader2,
    label: 'Running',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
}

export function JobList({
  jobs,
  selectedJob,
  onSelectJob,
  onStartJob,
}: JobListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return '-'
    const start = new Date(startedAt).getTime()
    const end = completedAt ? new Date(completedAt).getTime() : Date.now()
    const duration = Math.floor((end - start) / 1000)

    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = duration % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <Card className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Training Jobs ({jobs.length})
        </h3>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto p-2">
        {jobs.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p className="text-sm text-slate-400">
              No training jobs yet. Start a new job to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => {
              const config = statusConfig[job.status]
              const Icon = config.icon
              const isSelected = selectedJob === job.id

              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  className={`
                    group cursor-pointer rounded-lg border-2 p-4 transition-all
                    ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate text-sm font-semibold text-slate-900">
                        {job.name}
                      </h4>
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {job.modelType}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${config.bgColor}`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ${config.color} ${
                          config.animate ? 'animate-spin' : ''
                        }`}
                      />
                      <span className={`text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {job.status === 'running' && (
                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          Epoch {job.currentEpoch}/{job.totalEpochs}
                        </span>
                        <span className="font-medium text-slate-900">
                          {Math.round(job.progress)}%
                        </span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Dataset:</span>
                      <p className="truncate font-medium text-slate-900">
                        {job.dataset}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Duration:</span>
                      <p className="font-medium text-slate-900">
                        {formatDuration(job.startedAt, job.completedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="mt-2 border-t pt-2 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Started: {formatDate(job.startedAt)}</span>
                      {job.completedAt && (
                        <span>Completed: {formatDate(job.completedAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {job.status === 'failed' && job.error && (
                    <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-700">
                      {job.error}
                    </div>
                  )}

                  {/* Actions for Pending Jobs */}
                  {job.status === 'pending' && onStartJob && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onStartJob(job.id)
                        }}
                        className="w-full"
                      >
                        <Play className="mr-2 h-3.5 w-3.5" />
                        Start Job
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with Summary */}
      {jobs.length > 0 && (
        <div className="border-t bg-slate-50 px-4 py-3">
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-600">Pending:</span>{' '}
              <span className="font-medium text-slate-900">
                {jobs.filter((j) => j.status === 'pending').length}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Running:</span>{' '}
              <span className="font-medium text-blue-600">
                {jobs.filter((j) => j.status === 'running').length}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Completed:</span>{' '}
              <span className="font-medium text-green-600">
                {jobs.filter((j) => j.status === 'completed').length}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Failed:</span>{' '}
              <span className="font-medium text-red-600">
                {jobs.filter((j) => j.status === 'failed').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
