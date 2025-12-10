import { create } from 'zustand'
import axios from 'axios'
import type { TrainingStore, TrainingJob } from '@/types/store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  // State
  jobs: [],
  currentJob: null,
  isLoading: false,
  error: null,

  // Actions
  fetchJobs: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/api/training/jobs`)
      set({
        jobs: response.data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to fetch training jobs'

      set({
        jobs: [],
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  fetchJobById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/api/training/jobs/${id}`)
      set({
        currentJob: response.data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to fetch training job'

      set({
        currentJob: null,
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  fetchJobStatus: async (id: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/training/jobs/${id}/status`
      )
      const updatedJob = response.data

      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === id ? updatedJob : job
        ),
        currentJob:
          state.currentJob?.id === id ? updatedJob : state.currentJob,
      }))
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to fetch job status'

      set({ error: message })
      throw error
    }
  },

  startTraining: async (config: Record<string, unknown>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(
        `${API_URL}/api/training/jobs`,
        config
      )
      const newJob = response.data

      set((state) => ({
        jobs: [...state.jobs, newJob],
        currentJob: newJob,
        isLoading: false,
        error: null,
      }))

      return newJob
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to start training'

      set({
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  stopTraining: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(
        `${API_URL}/api/training/jobs/${id}/stop`
      )
      const updatedJob = response.data

      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === id ? updatedJob : job
        ),
        currentJob:
          state.currentJob?.id === id ? updatedJob : state.currentJob,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to stop training'

      set({
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  deleteJob: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await axios.delete(`${API_URL}/api/training/jobs/${id}`)

      set((state) => ({
        jobs: state.jobs.filter((job) => job.id !== id),
        currentJob:
          state.currentJob?.id === id ? null : state.currentJob,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to delete training job'

      set({
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  setCurrentJob: (job: TrainingJob | null) => {
    set({ currentJob: job })
  },

  clearError: () => {
    set({ error: null })
  },
}))
