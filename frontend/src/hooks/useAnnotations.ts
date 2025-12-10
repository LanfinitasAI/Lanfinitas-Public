import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

/**
 * Annotation interface
 */
export interface Annotation {
  id: string
  patternId: string
  type: 'keypoint' | 'seam' | 'grainline' | 'region'
  points: { x: number; y: number }[]
  label?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

/**
 * Annotation create data
 */
export interface AnnotationCreateData {
  type: 'keypoint' | 'seam' | 'grainline' | 'region'
  points: { x: number; y: number }[]
  label?: string
  metadata?: any
}

/**
 * Annotation update data
 */
export interface AnnotationUpdateData {
  type?: 'keypoint' | 'seam' | 'grainline' | 'region'
  points?: { x: number; y: number }[]
  label?: string
  metadata?: any
}

/**
 * Query keys for annotations
 */
export const annotationKeys = {
  all: ['annotations'] as const,
  lists: () => [...annotationKeys.all, 'list'] as const,
  list: (patternId: string) => [...annotationKeys.lists(), patternId] as const,
  details: () => [...annotationKeys.all, 'detail'] as const,
  detail: (patternId: string, annotationId: string) =>
    [...annotationKeys.details(), patternId, annotationId] as const,
}

/**
 * Hook to fetch annotations for a pattern
 */
export function useAnnotations(
  patternId: string,
  options?: UseQueryOptions<Annotation[]>
) {
  return useQuery({
    queryKey: annotationKeys.list(patternId),
    queryFn: async () => {
      const response = await api.annotations.list(patternId)
      return response.data
    },
    enabled: !!patternId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

/**
 * Hook to fetch single annotation
 */
export function useAnnotation(
  patternId: string,
  annotationId: string,
  options?: UseQueryOptions<Annotation>
) {
  return useQuery({
    queryKey: annotationKeys.detail(patternId, annotationId),
    queryFn: async () => {
      const response = await api.annotations.get(patternId, annotationId)
      return response.data
    },
    enabled: !!patternId && !!annotationId,
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

/**
 * Hook to create annotation
 */
export function useCreateAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      patternId,
      data,
    }: {
      patternId: string
      data: AnnotationCreateData
    }) => {
      const response = await api.annotations.create(patternId, data)
      return response.data
    },
    onMutate: async ({ patternId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: annotationKeys.list(patternId),
      })

      // Snapshot the previous value
      const previousAnnotations = queryClient.getQueryData<Annotation[]>(
        annotationKeys.list(patternId)
      )

      // Optimistically add new annotation
      if (previousAnnotations) {
        const optimisticAnnotation: Annotation = {
          id: `temp-${Date.now()}`,
          patternId,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        queryClient.setQueryData<Annotation[]>(
          annotationKeys.list(patternId),
          [...previousAnnotations, optimisticAnnotation]
        )
      }

      return { previousAnnotations }
    },
    onError: (err, { patternId }, context) => {
      // Rollback on error
      if (context?.previousAnnotations) {
        queryClient.setQueryData(
          annotationKeys.list(patternId),
          context.previousAnnotations
        )
      }
    },
    onSettled: (data, error, { patternId }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: annotationKeys.list(patternId),
      })
    },
  })
}

/**
 * Hook to update annotation
 */
export function useUpdateAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      patternId,
      annotationId,
      data,
    }: {
      patternId: string
      annotationId: string
      data: AnnotationUpdateData
    }) => {
      const response = await api.annotations.update(
        patternId,
        annotationId,
        data
      )
      return response.data
    },
    onMutate: async ({ patternId, annotationId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: annotationKeys.list(patternId),
      })

      // Snapshot the previous value
      const previousAnnotations = queryClient.getQueryData<Annotation[]>(
        annotationKeys.list(patternId)
      )

      // Optimistically update
      if (previousAnnotations) {
        queryClient.setQueryData<Annotation[]>(
          annotationKeys.list(patternId),
          previousAnnotations.map((annotation) =>
            annotation.id === annotationId
              ? {
                  ...annotation,
                  ...data,
                  updatedAt: new Date().toISOString(),
                }
              : annotation
          )
        )
      }

      return { previousAnnotations }
    },
    onError: (err, { patternId }, context) => {
      // Rollback on error
      if (context?.previousAnnotations) {
        queryClient.setQueryData(
          annotationKeys.list(patternId),
          context.previousAnnotations
        )
      }
    },
    onSettled: (data, error, { patternId }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: annotationKeys.list(patternId),
      })
    },
  })
}

/**
 * Hook to delete annotation
 */
export function useDeleteAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      patternId,
      annotationId,
    }: {
      patternId: string
      annotationId: string
    }) => {
      const response = await api.annotations.delete(patternId, annotationId)
      return response.data
    },
    onMutate: async ({ patternId, annotationId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: annotationKeys.list(patternId),
      })

      // Snapshot the previous value
      const previousAnnotations = queryClient.getQueryData<Annotation[]>(
        annotationKeys.list(patternId)
      )

      // Optimistically remove
      if (previousAnnotations) {
        queryClient.setQueryData<Annotation[]>(
          annotationKeys.list(patternId),
          previousAnnotations.filter(
            (annotation) => annotation.id !== annotationId
          )
        )
      }

      return { previousAnnotations }
    },
    onError: (err, { patternId }, context) => {
      // Rollback on error
      if (context?.previousAnnotations) {
        queryClient.setQueryData(
          annotationKeys.list(patternId),
          context.previousAnnotations
        )
      }
    },
    onSettled: (data, error, { patternId }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: annotationKeys.list(patternId),
      })
    },
  })
}

/**
 * Hook to export annotations
 */
export function useExportAnnotations() {
  return useMutation({
    mutationFn: async ({
      patternId,
      format,
    }: {
      patternId: string
      format: 'json' | 'coco' | 'yolo'
    }) => {
      const response = await api.annotations.export(patternId, format)
      return response.data
    },
  })
}
