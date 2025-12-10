import { vi } from 'vitest'

// Mock API client
export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

// Mock data for Identity Management
export const mockIdentities = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'ADMIN',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'USER',
  },
]

// Mock data for Agents
export const mockAgents = [
  {
    id: 'agent-1',
    name: 'Fashion Agent',
    type: 'AGENT_SYSTEM' as const,
    capabilities: ['DESIGN', 'PATTERN'],
    status: 'AVAILABLE' as const,
  },
  {
    id: 'agent-2',
    name: 'Pattern Generator',
    type: 'AGENT_WORKER' as const,
    capabilities: ['PATTERN', 'LAYOUT'],
    status: 'BUSY' as const,
  },
]

// Mock data for Tasks
export const mockTasks = [
  {
    id: 'task-1',
    name: 'Design Fashion Pattern',
    description: 'Create a new fashion pattern',
    priority: 'HIGH' as const,
    status: 'IN_PROGRESS' as const,
    assignedAgentId: 'agent-1',
    createdBy: 'user-1',
    createdAt: '2025-11-21T10:00:00Z',
  },
  {
    id: 'task-2',
    name: 'Generate Layout',
    description: 'Generate layout for design',
    priority: 'MEDIUM' as const,
    status: 'COMPLETED' as const,
    assignedAgentId: 'agent-2',
    createdBy: 'user-1',
    createdAt: '2025-11-20T10:00:00Z',
    completedAt: '2025-11-20T15:00:00Z',
  },
]

// Mock data for Delegations
export const mockDelegations = [
  {
    id: 'delegation-1',
    taskId: 'task-1',
    agentId: 'agent-1',
    delegatedBy: 'user-1',
    permissions: ['READ', 'WRITE'],
    status: 'ACTIVE' as const,
    createdAt: '2025-11-21T10:00:00Z',
  },
]

// Mock data for Wallet
export const mockWalletBalance = {
  lftToken: 12345.67,
  usdc: 1234.56,
  lastUpdated: '2025-11-21T10:00:00Z',
}

// Mock data for Transactions
export const mockTransactions = [
  {
    id: 'tx-1',
    type: 'REWARD' as const,
    amount: 100.0,
    currency: 'LFT' as const,
    status: 'COMPLETED' as const,
    description: 'Agent reward',
    timestamp: '2025-11-21T10:00:00Z',
  },
  {
    id: 'tx-2',
    type: 'PAYMENT' as const,
    amount: 50.0,
    currency: 'LFT' as const,
    status: 'COMPLETED' as const,
    description: 'Task fee',
    timestamp: '2025-11-20T10:00:00Z',
  },
  {
    id: 'tx-3',
    type: 'REWARD' as const,
    amount: 200.0,
    currency: 'LFT' as const,
    status: 'COMPLETED' as const,
    description: 'Contribution reward',
    timestamp: '2025-11-19T10:00:00Z',
  },
]

// Mock data for Templates
export const mockTemplates = [
  {
    id: 'template-1',
    name: 'Fashion Agent',
    description: 'AI agent for fashion design',
    category: 'FASHION',
    rating: 4.5,
    usageCount: 234,
    isPremium: false,
    tags: ['fashion', 'design'],
    author: 'System',
    createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 'template-2',
    name: 'Pattern Generator',
    description: 'Generate fashion patterns',
    category: 'PATTERN',
    rating: 5.0,
    usageCount: 567,
    isPremium: true,
    tags: ['pattern', 'generation'],
    author: 'System',
    createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 'template-3',
    name: 'Layout Optimizer',
    description: 'Optimize layout designs',
    category: 'LAYOUT',
    rating: 3.5,
    usageCount: 89,
    isPremium: false,
    tags: ['layout', 'optimization'],
    author: 'System',
    createdAt: '2025-11-01T00:00:00Z',
  },
]

// Mock template categories and tags
export const mockCategories = ['FASHION', 'PATTERN', 'LAYOUT', 'DESIGN']
export const mockTags = ['fashion', 'design', 'pattern', 'generation', 'layout', 'optimization']
