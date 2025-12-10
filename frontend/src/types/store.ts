// Authentication Types
export interface User {
  id: string
  email: string
  username: string
  fullName?: string
  avatar?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  clearError: () => void
}

export type AuthStore = AuthState & AuthActions

// Pattern Types
export interface Pattern {
  id: string
  name: string
  description?: string
  imageUrl?: string
  thumbnailUrl?: string
  modelFile?: string
  patternFile?: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  userId: string
}

export interface PatternState {
  patterns: Pattern[]
  currentPattern: Pattern | null
  isLoading: boolean
  error: string | null
}

export interface PatternActions {
  fetchPatterns: () => Promise<void>
  fetchPatternById: (id: string) => Promise<void>
  createPattern: (data: Partial<Pattern>) => Promise<Pattern>
  updatePattern: (id: string, data: Partial<Pattern>) => Promise<void>
  deletePattern: (id: string) => Promise<void>
  setCurrentPattern: (pattern: Pattern | null) => void
  clearError: () => void
}

export type PatternStore = PatternState & PatternActions

// Training Types
export interface TrainingJob {
  id: string
  name: string
  type: 'pattern_generation' | 'fabric_simulation' | 'layout_optimization'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  totalEpochs?: number
  currentEpoch?: number
  metrics?: Record<string, number>
  config?: Record<string, unknown>
  startedAt?: string
  completedAt?: string
  error?: string
  userId: string
}

export interface TrainingState {
  jobs: TrainingJob[]
  currentJob: TrainingJob | null
  isLoading: boolean
  error: string | null
}

export interface TrainingActions {
  fetchJobs: () => Promise<void>
  fetchJobById: (id: string) => Promise<void>
  fetchJobStatus: (id: string) => Promise<void>
  startTraining: (config: Record<string, unknown>) => Promise<TrainingJob>
  stopTraining: (id: string) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  setCurrentJob: (job: TrainingJob | null) => void
  clearError: () => void
}

export type TrainingStore = TrainingState & TrainingActions
