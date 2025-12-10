import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'

export interface Agent {
  id: string
  name: string
  type: 'AGENT_SYSTEM' | 'AGENT_WORKER'
  capabilities: string[]
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  currentTaskId?: string
  metadata?: Record<string, any>
}

export interface Task {
  id: string
  name: string
  description: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'BACKGROUND'
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  assignedAgentId?: string
  createdBy: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  metadata?: Record<string, any>
  result?: any
  error?: string
}

export interface Delegation {
  id: string
  taskId: string
  agentId: string
  delegatedBy: string
  permissions: string[]
  status: 'ACTIVE' | 'COMPLETED' | 'REVOKED' | 'EXPIRED'
  createdAt: string
  revokedAt?: string
  expiresAt?: string
}

export interface CreateTaskData {
  name: string
  description: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'BACKGROUND'
  metadata?: Record<string, any>
}

export interface CreateDelegationData {
  taskId: string
  agentId: string
  permissions: string[]
  expiresIn?: number
}

/**
 * Main hook for delegation management
 */
export const useDelegation = () => {
  const queryClient = useQueryClient()

  // Fetch available agents
  const {
    data: agents,
    isLoading: agentsLoading,
    error: agentsError,
  } = useQuery<Agent[]>({
    queryKey: ['agents', 'available'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/identity', {
        params: { type: 'AGENT_SYSTEM,AGENT_WORKER' },
      })
      return response.data.identities || []
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  })

  // Fetch tasks
  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/tasks')
      return response.data.tasks || []
    },
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
  })

  // Fetch delegations
  const {
    data: delegations,
    isLoading: delegationsLoading,
    error: delegationsError,
    refetch: refetchDelegations,
  } = useQuery<Delegation[]>({
    queryKey: ['delegations'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/delegation')
      return response.data.delegations || []
    },
    refetchInterval: 3000,
  })

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const response = await apiClient.post('/v1/tasks', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Create delegation mutation
  const createDelegation = useMutation({
    mutationFn: async (data: CreateDelegationData) => {
      const response = await apiClient.post('/v1/delegation', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Revoke delegation mutation
  const revokeDelegation = useMutation({
    mutationFn: async (delegationId: string) => {
      await apiClient.delete(`/v1/delegation/${delegationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Update task status mutation
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await apiClient.put(`/v1/tasks/${taskId}`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const refetch = () => {
    refetchTasks()
    refetchDelegations()
  }

  return {
    agents,
    tasks,
    delegations,
    isLoading: agentsLoading || tasksLoading || delegationsLoading,
    error: agentsError || tasksError || delegationsError,
    createTask,
    createDelegation,
    revokeDelegation,
    updateTaskStatus,
    refetch,
  }
}

/**
 * Hook to get delegation by task ID
 */
export const useDelegationByTask = (taskId: string) => {
  return useQuery<Delegation | null>({
    queryKey: ['delegation', 'task', taskId],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/delegation/task/${taskId}`)
      return response.data || null
    },
    enabled: !!taskId,
  })
}

/**
 * Hook to get agent details
 */
export const useAgent = (agentId: string) => {
  return useQuery<Agent>({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/identity/${agentId}`)
      return response.data
    },
    enabled: !!agentId,
  })
}
