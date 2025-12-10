/**
 * Centralized store exports
 *
 * This file exports all Zustand stores for easy access throughout the application.
 */

export { useAuthStore } from './authStore'
export { usePatternStore } from './patternStore'
export { useTrainingStore } from './trainingStore'

// Re-export types
export type {
  AuthStore,
  PatternStore,
  TrainingStore,
  User,
  Pattern,
  TrainingJob,
} from '@/types/store'
