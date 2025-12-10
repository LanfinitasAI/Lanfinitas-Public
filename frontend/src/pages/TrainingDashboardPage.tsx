import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  JobList,
  JobDetails,
  StartTrainingDialog,
  type TrainingJob,
  type JobStatus,
} from '@/components/training'
import type { MetricPoint } from '@/components/training/MetricsChart'
import type { TrainingConfig } from '@/components/training/StartTrainingDialog'

// Simulated polling interval (5 seconds)
const POLLING_INTERVAL = 5000

export function TrainingDashboardPage() {
  const [jobs, setJobs] = useState<TrainingJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [metrics, setMetrics] = useState<Record<string, MetricPoint[]>>({})
  const [logs, setLogs] = useState<Record<string, string[]>>({})

  // Initialize with some demo jobs
  useEffect(() => {
    const demoJobs: TrainingJob[] = [
      {
        id: 'job-1',
        name: 'Pattern Segmentation Training v1',
        modelType: 'pattern-segmentation',
        dataset: 'Fashion Patterns Dataset v1',
        status: 'completed',
        progress: 100,
        currentEpoch: 100,
        totalEpochs: 100,
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: 'job-2',
        name: 'Keypoint Detection Training',
        modelType: 'keypoint-detection',
        dataset: 'Annotated Patterns',
        status: 'running',
        progress: 45,
        currentEpoch: 45,
        totalEpochs: 100,
        startedAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'job-3',
        name: 'Seam Detection v2',
        modelType: 'seam-detection',
        dataset: 'Fashion Patterns Dataset v2',
        status: 'pending',
        progress: 0,
        totalEpochs: 150,
      },
    ]

    setJobs(demoJobs)
    setSelectedJobId(demoJobs[1].id) // Select running job by default

    // Initialize demo metrics for completed job
    const demoMetrics: MetricPoint[] = []
    for (let i = 1; i <= 100; i++) {
      demoMetrics.push({
        epoch: i,
        loss: 2.0 * Math.exp(-i / 30) + 0.1 + Math.random() * 0.1,
        accuracy: 1 - Math.exp(-i / 25) * 0.9 + Math.random() * 0.02,
        valLoss: 2.0 * Math.exp(-i / 30) + 0.15 + Math.random() * 0.15,
        valAccuracy: 1 - Math.exp(-i / 25) * 0.9 + Math.random() * 0.03,
      })
    }
    setMetrics({ 'job-1': demoMetrics })

    // Initialize demo metrics for running job (partial)
    const runningMetrics: MetricPoint[] = []
    for (let i = 1; i <= 45; i++) {
      runningMetrics.push({
        epoch: i,
        loss: 2.0 * Math.exp(-i / 30) + 0.1 + Math.random() * 0.1,
        accuracy: 1 - Math.exp(-i / 25) * 0.9 + Math.random() * 0.02,
        valLoss: 2.0 * Math.exp(-i / 30) + 0.15 + Math.random() * 0.15,
        valAccuracy: 1 - Math.exp(-i / 25) * 0.9 + Math.random() * 0.03,
      })
    }
    setMetrics((prev) => ({ ...prev, 'job-2': runningMetrics }))

    // Initialize demo logs
    const demoLogs = [
      '[2024-01-15 10:30:25] Starting training job...',
      '[2024-01-15 10:30:26] Loading dataset: Fashion Patterns Dataset v1',
      '[2024-01-15 10:30:28] Dataset loaded: 1250 images',
      '[2024-01-15 10:30:29] Initializing model: pattern-segmentation',
      '[2024-01-15 10:30:31] Model initialized with 12.5M parameters',
      '[2024-01-15 10:30:32] Starting training for 100 epochs...',
      '[2024-01-15 10:31:15] Epoch 1/100 - Loss: 1.8542, Acc: 0.3245',
      '[2024-01-15 10:32:03] Epoch 2/100 - Loss: 1.6234, Acc: 0.4123',
      '[2024-01-15 10:32:51] Epoch 3/100 - Loss: 1.4567, Acc: 0.4856',
      '[2024-01-15 10:33:39] Epoch 4/100 - Loss: 1.3245, Acc: 0.5421',
    ]
    setLogs({
      'job-1': demoLogs,
      'job-2': demoLogs.slice(0, 7),
    })
  }, [])

  // Simulate real-time updates for running jobs
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.status === 'running' && job.currentEpoch) {
            const newEpoch = Math.min(job.currentEpoch + 1, job.totalEpochs)
            const newProgress = (newEpoch / job.totalEpochs) * 100

            // Update metrics
            setMetrics((prev) => {
              const jobMetrics = prev[job.id] || []
              const newMetric: MetricPoint = {
                epoch: newEpoch,
                loss: 2.0 * Math.exp(-newEpoch / 30) + 0.1 + Math.random() * 0.1,
                accuracy:
                  1 - Math.exp(-newEpoch / 25) * 0.9 + Math.random() * 0.02,
                valLoss:
                  2.0 * Math.exp(-newEpoch / 30) + 0.15 + Math.random() * 0.15,
                valAccuracy:
                  1 - Math.exp(-newEpoch / 25) * 0.9 + Math.random() * 0.03,
              }
              return {
                ...prev,
                [job.id]: [...jobMetrics, newMetric],
              }
            })

            // Update logs
            setLogs((prev) => {
              const jobLogs = prev[job.id] || []
              const newLog = `[${new Date().toLocaleString()}] Epoch ${newEpoch}/${
                job.totalEpochs
              } - Loss: ${(2.0 * Math.exp(-newEpoch / 30) + 0.1).toFixed(4)}, Acc: ${(1 - Math.exp(-newEpoch / 25) * 0.9).toFixed(4)}`
              return {
                ...prev,
                [job.id]: [...jobLogs, newLog],
              }
            })

            // Complete job if reached total epochs
            if (newEpoch >= job.totalEpochs) {
              return {
                ...job,
                currentEpoch: newEpoch,
                progress: 100,
                status: 'completed' as JobStatus,
                completedAt: new Date().toISOString(),
              }
            }

            return {
              ...job,
              currentEpoch: newEpoch,
              progress: newProgress,
            }
          }
          return job
        })
      )
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const handleStartTraining = useCallback((config: TrainingConfig) => {
    const newJob: TrainingJob = {
      id: `job-${Date.now()}`,
      name: config.jobName,
      modelType: config.modelType,
      dataset: config.dataset,
      status: 'running',
      progress: 0,
      currentEpoch: 0,
      totalEpochs: config.epochs,
      startedAt: new Date().toISOString(),
    }

    setJobs((prev) => [newJob, ...prev])
    setSelectedJobId(newJob.id)
    setMetrics((prev) => ({ ...prev, [newJob.id]: [] }))
    setLogs((prev) => ({
      ...prev,
      [newJob.id]: [
        `[${new Date().toLocaleString()}] Starting training job: ${config.jobName}`,
        `[${new Date().toLocaleString()}] Model: ${config.modelType}`,
        `[${new Date().toLocaleString()}] Dataset: ${config.dataset}`,
        `[${new Date().toLocaleString()}] Epochs: ${config.epochs}, Batch Size: ${config.batchSize}, LR: ${config.learningRate}`,
      ],
    }))
  }, [])

  const handleStopJob = useCallback(() => {
    if (!selectedJobId) return

    setJobs((prev) =>
      prev.map((job) =>
        job.id === selectedJobId
          ? {
              ...job,
              status: 'failed' as JobStatus,
              error: 'Training stopped by user',
              completedAt: new Date().toISOString(),
            }
          : job
      )
    )
  }, [selectedJobId])

  const handlePauseJob = useCallback(() => {
    if (!selectedJobId) return

    setJobs((prev) =>
      prev.map((job) =>
        job.id === selectedJobId
          ? { ...job, status: 'pending' as JobStatus }
          : job
      )
    )
  }, [selectedJobId])

  const handleResumeJob = useCallback(() => {
    if (!selectedJobId) return

    setJobs((prev) =>
      prev.map((job) =>
        job.id === selectedJobId
          ? {
              ...job,
              status: 'running' as JobStatus,
              startedAt: job.startedAt || new Date().toISOString(),
            }
          : job
      )
    )
  }, [selectedJobId])

  const handleDownloadModel = useCallback(() => {
    // Simulate model download
    console.log('Downloading model...')
    alert('Model download started (demo)')
  }, [])

  const handleRefresh = useCallback(() => {
    // In a real app, this would refetch data from the server
    console.log('Refreshing training jobs...')
  }, [])

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || null
  const selectedMetrics = selectedJobId ? metrics[selectedJobId] || [] : []
  const selectedLogs = selectedJobId ? logs[selectedJobId] || [] : []

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Training Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Monitor and manage AI model training jobs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Training Job
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Left Sidebar - Job List */}
        <div className="w-96 flex-shrink-0">
          <JobList
            jobs={jobs}
            selectedJob={selectedJobId}
            onSelectJob={setSelectedJobId}
            onStartJob={(id) => {
              setJobs((prev) =>
                prev.map((job) =>
                  job.id === id
                    ? {
                        ...job,
                        status: 'running' as JobStatus,
                        startedAt: new Date().toISOString(),
                        currentEpoch: 0,
                      }
                    : job
                )
              )
            }}
          />
        </div>

        {/* Right - Job Details */}
        <div className="flex-1 overflow-hidden">
          <JobDetails
            job={selectedJob}
            metrics={selectedMetrics}
            logs={selectedLogs}
            onStop={handleStopJob}
            onPause={handlePauseJob}
            onResume={handleResumeJob}
            onDownloadModel={handleDownloadModel}
          />
        </div>
      </div>

      {/* Start Training Dialog */}
      <StartTrainingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStart={handleStartTraining}
      />
    </div>
  )
}
