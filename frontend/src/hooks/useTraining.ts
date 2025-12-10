import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { api, PaginatedResponse } from '@/lib/api-client'

/**
 * Training job status
 */
export type TrainingJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused'

/**
 * Training job interface
 */
export interface TrainingJob {
  id: string
  name: string
  modelType: string
  dataset: string
  status: TrainingJobStatus
  progress: number
  currentEpoch?: number
  totalEpochs: number
  hyperparameters: {
    batchSize: number
    learningRate: number
    epochs: number
  }
  startedAt?: string
  completedAt?: string
  error?: string
  createdAt: string
  updatedAt: string
}

/**
 * Training metrics interface
 */
export interface TrainingMetrics {
  epoch: number
  loss: number
  accuracy?: number
  valLoss?: number
  valAccuracy?: number
  timestamp: string
}

/**
 * Training job create data
 */
export interface TrainingJobCreateData {
  name: string
  modelType: string
  dataset: string
  hyperparameters: {
    batchSize: number
    learningRate: number
    epochs: number
  }
}

/**
 * Training job list parameters
 */
export interface TrainingJobListParams {
  status?: TrainingJobStatus
  page?: number
  limit?: number
}

/**
 * Query keys for training
 */
export const trainingKeys = {
  all: ['training'] as const,
  lists: () => [...trainingKeys.all, 'list'] as const,
  list: (params: TrainingJobListParams) => [...trainingKeys.lists(), params] as const,
  details: () => [...trainingKeys.all, 'detail'] as const,
  detail: (id: string) => [...trainingKeys.details(), id] as const,
  metrics: (id: string) => [...trainingKeys.detail(id), 'metrics'] as const,
  logs: (id: string) => [...trainingKeys.detail(id), 'logs'] as const,
}

/**
 * Hook to fetch training jobs list
 */
export function useTrainingJobs(
  params: TrainingJobListParams = {},
  options?: UseQueryOptions<PaginatedResponse<TrainingJob>>
) {
  return useQuery({
    queryKey: trainingKeys.list(params),
    queryFn: async () => {
      const response = await api.training.list(params)
      return response.data
    },
    refetchInterval: (data) => {
      // Auto-refetch if there are running jobs
      const hasRunningJobs = data?.data.some(
        (job) => job.status === 'running' || job.status === 'pending'
      )
      return hasRunningJobs ? 5000 : false // 5 seconds
    },
    ...options,
  })
}

/**
 * Hook to fetch single training job
 */
export function useTrainingJob(
  id: string,
  options?: UseQueryOptions<TrainingJob>
) {
  return useQuery({
    queryKey: trainingKeys.detail(id),
    queryFn: async () => {
      const response = await api.training.get(id)
      return response.data
    },
    enabled: !!id,
    refetchInterval: (data) => {
      // Auto-refetch if job is running
      return data?.status === 'running' || data?.status === 'pending'
        ? 5000
        : false
    },
    ...options,
  })
}

/**
 * Hook to fetch training metrics
 */
export function useTrainingMetrics(
  jobId: string,
  options?: UseQueryOptions<TrainingMetrics[]>
) {
  return useQuery({
    queryKey: trainingKeys.metrics(jobId),
    queryFn: async () => {
      const response = await api.training.metrics(jobId)
      return response.data
    },
    enabled: !!jobId,
    refetchInterval: (data, query) => {
      // Auto-refetch if job is running
      const job = query.queryClient.getQueryData<TrainingJob>(
        trainingKeys.detail(jobId)
      )
      return job?.status === 'running' ? 5000 : false
    },
    ...options,
  })
}

/**
 * Hook to fetch training logs
 */
export function useTrainingLogs(
  jobId: string,
  params: { offset?: number; limit?: number } = {},
  options?: UseQueryOptions<string[]>
) {
  return useQuery({
    queryKey: [...trainingKeys.logs(jobId), params],
    queryFn: async () => {
      const response = await api.training.logs(jobId, params)
      return response.data
    },
    enabled: !!jobId,
    refetchInterval: (data, query) => {
      // Auto-refetch if job is running
      const job = query.queryClient.getQueryData<TrainingJob>(
        trainingKeys.detail(jobId)
      )
      return job?.status === 'running' ? 5000 : false
    },
    ...options,
  })
}

/**
 * Hook to create training job
 */
export function useCreateTrainingJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TrainingJobCreateData) => {
      const response = await api.training.create(data)
      return response.data
    },
    onSuccess: () => {
      // Invalidate training jobs list
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
    },
  })
}

/**
 * Hook to start training job
 */
export function useStartTrainingJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.training.start(jobId)
      return response.data
    },
    onMutate: async (jobId) => {
      // Optimistically update status
      await queryClient.cancelQueries({ queryKey: trainingKeys.detail(jobId) })

      const previousJob = queryClient.getQueryData<TrainingJob>(
        trainingKeys.detail(jobId)
      )

      if (previousJob) {
        queryClient.setQueryData<TrainingJob>(trainingKeys.detail(jobId), {
          ...previousJob,
          status: 'running',
          startedAt: new Date().toISOString(),
        })
      }

      return { previousJob }
    },
    onError: (err, jobId, context) => {
      if (context?.previousJob) {
        queryClient.setQueryData(
          trainingKeys.detail(jobId),
          context.previousJob
        )
      }
    },
    onSettled: (data, error, jobId) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(jobId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
    },
  })
}

/**
 * Hook to stop training job
 */
export function useStopTrainingJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.training.stop(jobId)
      return response.data
    },
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: trainingKeys.detail(jobId) })

      const previousJob = queryClient.getQueryData<TrainingJob>(
        trainingKeys.detail(jobId)
      )

      if (previousJob) {
        queryClient.setQueryData<TrainingJob>(trainingKeys.detail(jobId), {
          ...previousJob,
          status: 'failed',
          error: 'Stopped by user',
          completedAt: new Date().toISOString(),
        })
      }

      return { previousJob }
    },
    onError: (err, jobId, context) => {
      if (context?.previousJob) {
        queryClient.setQueryData(
          trainingKeys.detail(jobId),
          context.previousJob
        )
      }
    },
    onSettled: (data, error, jobId) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(jobId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
    },
  })
}

/**
 * Hook to pause training job
 */
export function usePauseTrainingJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.training.pause(jobId)
      return response.data
    },
    onSuccess: (data, jobId) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(jobId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
    },
  })
}

/**
 * Hook to resume training job
 */
export function useResumeTrainingJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.training.resume(jobId)
      return response.data
    },
    onSuccess: (data, jobId) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(jobId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
    },
  })
}

/**
 * Hook to download trained model
 */
export function useDownloadModel() {
  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.training.download(jobId)

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `model-${jobId}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return response.data
    },
  })
}
