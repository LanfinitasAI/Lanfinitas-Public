import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { api, APIResponse, PaginatedResponse } from '@/lib/api-client'

/**
 * Pattern interface
 */
export interface Pattern {
  id: string
  name: string
  description?: string
  type: '3d' | '2d'
  fileUrl: string
  thumbnailUrl?: string
  metadata: {
    fileSize: number
    format: string
    dimensions?: {
      width: number
      height: number
      depth?: number
    }
  }
  createdAt: string
  updatedAt: string
  userId: string
}

/**
 * Pattern list parameters
 */
export interface PatternListParams {
  page?: number
  limit?: number
  search?: string
}

/**
 * Pattern create data
 */
export interface PatternCreateData {
  name: string
  description?: string
  type: '3d' | '2d'
  file: File
}

/**
 * Pattern update data
 */
export interface PatternUpdateData {
  name?: string
  description?: string
}

/**
 * Query keys for patterns
 */
export const patternKeys = {
  all: ['patterns'] as const,
  lists: () => [...patternKeys.all, 'list'] as const,
  list: (params: PatternListParams) => [...patternKeys.lists(), params] as const,
  details: () => [...patternKeys.all, 'detail'] as const,
  detail: (id: string) => [...patternKeys.details(), id] as const,
}

/**
 * Hook to fetch patterns list
 */
export function usePatterns(
  params: PatternListParams = {},
  options?: UseQueryOptions<PaginatedResponse<Pattern>>
) {
  return useQuery({
    queryKey: patternKeys.list(params),
    queryFn: async () => {
      const response = await api.patterns.list(params)
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Hook to fetch single pattern
 */
export function usePattern(
  id: string,
  options?: UseQueryOptions<Pattern>
) {
  return useQuery({
    queryKey: patternKeys.detail(id),
    queryFn: async () => {
      const response = await api.patterns.get(id)
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * Hook to create pattern
 */
export function useCreatePattern() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PatternCreateData) => {
      const formData = new FormData()
      formData.append('name', data.name)
      if (data.description) formData.append('description', data.description)
      formData.append('type', data.type)
      formData.append('file', data.file)

      const response = await api.patterns.create(formData)
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch patterns list
      queryClient.invalidateQueries({ queryKey: patternKeys.lists() })
    },
  })
}

/**
 * Hook to update pattern
 */
export function useUpdatePattern() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: PatternUpdateData
    }) => {
      const response = await api.patterns.update(id, data)
      return response.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: patternKeys.detail(id) })

      // Snapshot the previous value
      const previousPattern = queryClient.getQueryData<Pattern>(
        patternKeys.detail(id)
      )

      // Optimistically update
      if (previousPattern) {
        queryClient.setQueryData<Pattern>(patternKeys.detail(id), {
          ...previousPattern,
          ...data,
          updatedAt: new Date().toISOString(),
        })
      }

      return { previousPattern }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousPattern) {
        queryClient.setQueryData(patternKeys.detail(id), context.previousPattern)
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: patternKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: patternKeys.lists() })
    },
  })
}

/**
 * Hook to delete pattern
 */
export function useDeletePattern() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patterns.delete(id)
      return response.data
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: patternKeys.lists() })

      // Snapshot previous value
      const previousPatterns = queryClient.getQueriesData({
        queryKey: patternKeys.lists(),
      })

      // Optimistically remove from all lists
      queryClient.setQueriesData<PaginatedResponse<Pattern>>(
        { queryKey: patternKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter((pattern) => pattern.id !== id),
            total: old.total - 1,
          }
        }
      )

      return { previousPatterns }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousPatterns) {
        context.previousPatterns.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: patternKeys.lists() })
    },
  })
}

/**
 * Hook to generate pattern
 */
export function useGeneratePattern() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      inputType: '3d-mesh' | 'image' | 'parameters'
      file?: File
      parameters?: any
    }) => {
      const response = await api.patterns.generate(data)
      return response.data
    },
    onSuccess: () => {
      // Invalidate patterns list
      queryClient.invalidateQueries({ queryKey: patternKeys.lists() })
    },
  })
}
