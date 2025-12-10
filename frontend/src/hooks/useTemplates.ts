import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'

export interface Template {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  rating: number
  reviewCount: number
  usageCount: number
  author: string
  authorAvatar?: string
  createdAt: string
  updatedAt: string
  thumbnail?: string
  capabilities: string[]
  config: Record<string, any>
  isPremium: boolean
  price?: number
}

export interface Review {
  id: string
  templateId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
}

export interface TemplateFilters {
  search?: string
  category?: string[]
  tags?: string[]
  minRating?: number
  sortBy?: 'popular' | 'rating' | 'recent' | 'usage'
}

/**
 * Hook to fetch templates with infinite scroll
 */
export const useTemplates = (filters?: TemplateFilters) => {
  return useInfiniteQuery({
    queryKey: ['templates', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = {
        page: pageParam,
        limit: 12,
      }

      if (filters?.search) params.search = filters.search
      if (filters?.category?.length) params.category = filters.category.join(',')
      if (filters?.tags?.length) params.tags = filters.tags.join(',')
      if (filters?.minRating) params.minRating = filters.minRating
      if (filters?.sortBy) params.sortBy = filters.sortBy

      const response = await apiClient.get('/v1/templates', { params })
      return {
        templates: response.data.templates || [],
        nextPage: response.data.hasMore ? pageParam + 1 : undefined,
        total: response.data.total || 0,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  })
}

/**
 * Hook to fetch single template details
 */
export const useTemplate = (templateId: string) => {
  return useQuery<Template>({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/templates/${templateId}`)
      return response.data
    },
    enabled: !!templateId,
  })
}

/**
 * Hook to fetch template reviews
 */
export const useTemplateReviews = (templateId: string, page: number = 1, limit: number = 10) => {
  return useQuery<{ reviews: Review[]; total: number }>({
    queryKey: ['template-reviews', templateId, page, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/templates/${templateId}/reviews`, {
        params: { page, limit },
      })
      return {
        reviews: response.data.reviews || [],
        total: response.data.total || 0,
      }
    },
    enabled: !!templateId,
  })
}

/**
 * Hook to get template categories
 */
export const useTemplateCategories = () => {
  return useQuery<string[]>({
    queryKey: ['template-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/templates/categories')
      return response.data.categories || []
    },
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Hook to get popular tags
 */
export const useTemplateTags = () => {
  return useQuery<string[]>({
    queryKey: ['template-tags'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/templates/tags')
      return response.data.tags || []
    },
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Hook for template mutations (use template, submit review, etc.)
 */
export const useTemplateMutations = () => {
  const queryClient = useQueryClient()

  const useTemplateMutation = useMutation({
    mutationFn: async (data: { templateId: string; name: string; config?: Record<string, any> }) => {
      const response = await apiClient.post('/v1/templates/use', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const submitReview = useMutation({
    mutationFn: async (data: { templateId: string; rating: number; comment: string }) => {
      const response = await apiClient.post(`/v1/templates/${data.templateId}/reviews`, {
        rating: data.rating,
        comment: data.comment,
      })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template', variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ['template-reviews', variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const markReviewHelpful = useMutation({
    mutationFn: async (data: { templateId: string; reviewId: string }) => {
      const response = await apiClient.post(
        `/v1/templates/${data.templateId}/reviews/${data.reviewId}/helpful`
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template-reviews', variables.templateId] })
    },
  })

  return {
    useTemplate: useTemplateMutation,
    submitReview,
    markReviewHelpful,
  }
}
