import { useState } from 'react'
import {
  Play,
  Pause,
  Square,
  Download,
  FileText,
  TrendingUp,
  Settings,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricsChart, type MetricPoint } from './MetricsChart'
import type { TrainingJob } from './JobList'

interface JobDetailsProps {
  job: TrainingJob | null
  metrics?: MetricPoint[]
  logs?: string[]
  onStop?: () => void
  onPause?: () => void
  onResume?: () => void
  onDownloadModel?: () => void
}

export function JobDetails({
  job,
  metrics = [],
  logs = [],
  onStop,
  onPause,
  onResume,
  onDownloadModel,
}: JobDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!job) {
    return (
      <Card className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-400">
            Select a job to view details
          </p>
        </div>
      </Card>
    )
  }

  const canPause = job.status === 'running'
  const canResume = job.status === 'pending'
  const canStop = job.status === 'running' || job.status === 'pending'
  const canDownload = job.status === 'completed'

  // Get latest metrics
  const latestMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null

  return (
    <Card className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{job.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{job.modelType}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {canResume && onResume && (
              <Button size="sm" onClick={onResume}>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
            {canPause && onPause && (
              <Button size="sm" variant="outline" onClick={onPause}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
            {canStop && onStop && (
              <Button size="sm" variant="outline" onClick={onStop}>
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            )}
            {canDownload && onDownloadModel && (
              <Button size="sm" onClick={onDownloadModel}>
                <Download className="mr-2 h-4 w-4" />
                Download Model
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {job.status === 'running' && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
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
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Current Metrics */}
            {latestMetrics && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Current Loss</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {latestMetrics.loss.toFixed(4)}
                  </p>
                  {latestMetrics.valLoss && (
                    <p className="mt-1 text-xs text-slate-600">
                      Val: {latestMetrics.valLoss.toFixed(4)}
                    </p>
                  )}
                </Card>

                {latestMetrics.accuracy !== undefined && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Current Accuracy</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {(latestMetrics.accuracy * 100).toFixed(2)}%
                    </p>
                    {latestMetrics.valAccuracy && (
                      <p className="mt-1 text-xs text-slate-600">
                        Val: {(latestMetrics.valAccuracy * 100).toFixed(2)}%
                      </p>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* Job Information */}
            <Card className="p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                Job Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Status:</span>
                  <p className="font-medium text-slate-900">{job.status}</p>
                </div>
                <div>
                  <span className="text-slate-600">Dataset:</span>
                  <p className="font-medium text-slate-900">{job.dataset}</p>
                </div>
                <div>
                  <span className="text-slate-600">Total Epochs:</span>
                  <p className="font-medium text-slate-900">{job.totalEpochs}</p>
                </div>
                <div>
                  <span className="text-slate-600">Current Epoch:</span>
                  <p className="font-medium text-slate-900">
                    {job.currentEpoch || '-'}
                  </p>
                </div>
                {job.startedAt && (
                  <div>
                    <span className="text-slate-600">Started:</span>
                    <p className="font-medium text-slate-900">
                      {new Date(job.startedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {job.completedAt && (
                  <div>
                    <span className="text-slate-600">Completed:</span>
                    <p className="font-medium text-slate-900">
                      {new Date(job.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Error Information */}
            {job.status === 'failed' && job.error && (
              <Card className="border-red-200 bg-red-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-red-900">Error</h4>
                <p className="text-sm text-red-700">{job.error}</p>
              </Card>
            )}

            {/* Recent Logs Preview */}
            {logs.length > 0 && (
              <Card className="p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">
                  Recent Logs
                </h4>
                <div className="max-h-40 overflow-y-auto rounded bg-slate-900 p-3 font-mono text-xs text-slate-100">
                  {logs.slice(-10).map((log, index) => (
                    <div key={index} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="flex-1 overflow-y-auto p-4">
          <MetricsChart data={metrics} showValidation />
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="flex-1 overflow-y-auto p-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">
                Training Logs
              </h4>
              <span className="text-xs text-slate-500">
                {logs.length} lines
              </span>
            </div>
            <div className="max-h-[600px] overflow-y-auto rounded bg-slate-900 p-4 font-mono text-xs text-slate-100">
              {logs.length === 0 ? (
                <div className="text-slate-400">No logs available</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-slate-500">[{index + 1}]</span> {log}
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="flex-1 overflow-y-auto p-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-slate-600" />
              <h4 className="text-sm font-semibold text-slate-900">
                Training Configuration
              </h4>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  Model
                </h5>
                <div className="rounded bg-slate-50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="font-medium text-slate-900">
                      {job.modelType}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  Dataset
                </h5>
                <div className="rounded bg-slate-50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-medium text-slate-900">
                      {job.dataset}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  Hyperparameters
                </h5>
                <div className="space-y-2 rounded bg-slate-50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Epochs:</span>
                    <span className="font-medium text-slate-900">
                      {job.totalEpochs}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Batch Size:</span>
                    <span className="font-medium text-slate-900">32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Learning Rate:</span>
                    <span className="font-medium text-slate-900">0.001</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
