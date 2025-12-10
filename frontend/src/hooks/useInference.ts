import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { api, PaginatedResponse } from '@/lib/api-client'

/**
 * Inference request status
 */
export type InferenceStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * Inference request interface
 */
export interface InferenceRequest {
  id: string
  modelType: string
  status: InferenceStatus
  progress: number
  inputUrl: string
  outputUrl?: string
  result?: {
    confidence: number
    metadata: any
  }
  error?: string
  createdAt: string
  completedAt?: string
}

/**
 * Inference predict data
 */
export interface InferencePredictData {
  modelType: string
  file: File
  options?: {
    threshold?: number
    outputFormat?: string
  }
}

/**
 * Inference history parameters
 */
export interface InferenceHistoryParams {
  page?: number
  limit?: number
}

/**
 * Query keys for inference
 */
export const inferenceKeys = {
  all: ['inference'] as const,
  requests: () => [...inferenceKeys.all, 'request'] as const,
  request: (id: string) => [...inferenceKeys.requests(), id] as const,
  history: () => [...inferenceKeys.all, 'history'] as const,
  historyList: (params: InferenceHistoryParams) =>
    [...inferenceKeys.history(), params] as const,
}

/**
 * Hook to fetch inference request status
 */
export function useInferenceRequest(
  requestId: string,
  options?: UseQueryOptions<InferenceRequest>
) {
  return useQuery({
    queryKey: inferenceKeys.request(requestId),
    queryFn: async () => {
      const response = await api.inference.status(requestId)
      return response.data
    },
    enabled: !!requestId,
    refetchInterval: (data) => {
      // Auto-refetch if request is processing
      return data?.status === 'processing' || data?.status === 'pending'
        ? 2000
        : false // 2 seconds
    },
    ...options,
  })
}

/**
 * Hook to fetch inference result
 */
export function useInferenceResult(
  requestId: string,
  options?: UseQueryOptions<any>
) {
  return useQuery({
    queryKey: [...inferenceKeys.request(requestId), 'result'],
    queryFn: async () => {
      const response = await api.inference.result(requestId)
      return response.data
    },
    enabled: !!requestId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

/**
 * Hook to fetch inference history
 */
export function useInferenceHistory(
  params: InferenceHistoryParams = {},
  options?: UseQueryOptions<PaginatedResponse<InferenceRequest>>
) {
  return useQuery({
    queryKey: inferenceKeys.historyList(params),
    queryFn: async () => {
      const response = await api.inference.history(params)
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

/**
 * Hook to create inference prediction
 */
export function usePredict() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InferencePredictData) => {
      const formData = new FormData()
      formData.append('modelType', data.modelType)
      formData.append('file', data.file)

      if (data.options) {
        Object.entries(data.options).forEach(([key, value]) => {
          formData.append(key, String(value))
        })
      }

      const response = await api.inference.predict(formData)
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate history
      queryClient.invalidateQueries({ queryKey: inferenceKeys.history() })

      // Start polling for the request
      queryClient.setQueryData(inferenceKeys.request(data.id), data)
    },
  })
}

/**
 * Hook to create batch inference prediction
 */
export function useBatchPredict() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      modelType: string
      files: File[]
      options?: any
    }) => {
      const formData = new FormData()
      formData.append('modelType', data.modelType)

      data.files.forEach((file) => {
        formData.append('files', file)
      })

      if (data.options) {
        Object.entries(data.options).forEach(([key, value]) => {
          formData.append(key, String(value))
        })
      }

      const response = await api.inference.batch(formData)
      return response.data
    },
    onSuccess: () => {
      // Invalidate history
      queryClient.invalidateQueries({ queryKey: inferenceKeys.history() })
    },
  })
}

/**
 * Hook to poll inference request until completion
 */
export function usePollInference(requestId: string) {
  const { data, isLoading, error } = useInferenceRequest(requestId)

  const isComplete = data?.status === 'completed'
  const isFailed = data?.status === 'failed'
  const isProcessing = data?.status === 'processing' || data?.status === 'pending'

  return {
    request: data,
    isLoading,
    error,
    isComplete,
    isFailed,
    isProcessing,
  }
}

/**
 * Custom hook for complete inference workflow
 * Handles prediction and polling for result
 */
export function useInferenceWorkflow() {
  const queryClient = useQueryClient()
  const { mutateAsync: predict, isPending: isPredicting } = usePredict()

  const runInference = async (data: InferencePredictData) => {
    // Step 1: Create prediction request
    const request = await predict(data)

    // Step 2: Wait for completion
    return new Promise<InferenceRequest>((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const response = await api.inference.status(request.id)
          const currentRequest = response.data

          // Update query cache
          queryClient.setQueryData(
            inferenceKeys.request(request.id),
            currentRequest
          )

          // Check if completed
          if (currentRequest.status === 'completed') {
            clearInterval(pollInterval)
            resolve(currentRequest)
          } else if (currentRequest.status === 'failed') {
            clearInterval(pollInterval)
            reject(new Error(currentRequest.error || 'Inference failed'))
          }
        } catch (error) {
          clearInterval(pollInterval)
          reject(error)
        }
      }, 2000) // Poll every 2 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        reject(new Error('Inference timeout'))
      }, 5 * 60 * 1000)
    })
  }

  return {
    runInference,
    isPredicting,
  }
}
