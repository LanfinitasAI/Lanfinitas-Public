import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'

export interface Identity {
  id: string
  name: string
  type: 'HUMAN' | 'TEAM' | 'AGENT_SYSTEM' | 'AGENT_WORKER'
  email?: string
  role?: 'ADMIN' | 'USER' | 'VIEWER'
  description?: string
  capabilities?: string[]
  ownerId?: string
  members?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  name: string
  email: string
  role: 'ADMIN' | 'USER' | 'VIEWER'
  metadata?: Record<string, any>
}

export interface CreateTeamData {
  name: string
  description?: string
  members?: string[]
  metadata?: Record<string, any>
}

export interface CreateAgentData {
  name: string
  type: 'AGENT_SYSTEM' | 'AGENT_WORKER'
  capabilities: string[]
  ownerId: string
  metadata?: Record<string, any>
}

/**
 * Custom hook for managing identities
 */
export const useIdentities = (type?: 'user' | 'team' | 'agent') => {
  const queryClient = useQueryClient()

  // Fetch identities
  const {
    data: identities,
    isLoading,
    error,
    refetch,
  } = useQuery<Identity[]>({
    queryKey: ['identities', type],
    queryFn: async () => {
      const params: any = {}

      if (type === 'user') {
        params.type = 'HUMAN'
      } else if (type === 'team') {
        params.type = 'TEAM'
      } else if (type === 'agent') {
        params.type = 'AGENT_SYSTEM,AGENT_WORKER'
      }

      const response = await apiClient.get('/v1/identity', { params })
      return response.data.identities || []
    },
    staleTime: 30000, // 30 seconds
  })

  // Create identity mutation
  const createIdentity = useMutation({
    mutationFn: async (data: CreateUserData | CreateTeamData | CreateAgentData) => {
      const response = await apiClient.post('/v1/identity', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identities'] })
    },
  })

  // Update identity mutation
  const updateIdentity = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Identity> }) => {
      const response = await apiClient.put(`/v1/identity/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identities'] })
    },
  })

  // Delete identity mutation
  const deleteIdentity = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/v1/identity/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identities'] })
    },
  })

  // Get single identity
  const getIdentity = async (id: string): Promise<Identity> => {
    const response = await apiClient.get(`/v1/identity/${id}`)
    return response.data
  }

  return {
    identities,
    isLoading,
    error,
    refetch,
    createIdentity,
    updateIdentity,
    deleteIdentity,
    getIdentity,
  }
}

/**
 * Hook to fetch available users for team members
 */
export const useAvailableUsers = () => {
  return useQuery<Identity[]>({
    queryKey: ['users', 'available'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/identity', {
        params: { type: 'HUMAN' },
      })
      return response.data.identities || []
    },
  })
}
