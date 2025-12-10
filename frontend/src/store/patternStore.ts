import { create } from 'zustand'
import axios from 'axios'
import type { PatternStore, Pattern } from '@/types/store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const usePatternStore = create<PatternStore>((set, get) => ({
  // State
  patterns: [],
  currentPattern: null,
  isLoading: false,
  error: null,

  // Actions
  fetchPatterns: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/api/patterns`)
      set({
        patterns: response.data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to fetch patterns'

      set({
        patterns: [],
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  fetchPatternById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/api/patterns/${id}`)
      set({
        currentPattern: response.data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to fetch pattern'

      set({
        currentPattern: null,
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  createPattern: async (data: Partial<Pattern>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/api/patterns`, data)
      const newPattern = response.data

      set((state) => ({
        patterns: [...state.patterns, newPattern],
        currentPattern: newPattern,
        isLoading: false,
        error: null,
      }))

      return newPattern
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to create pattern'

      set({
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  updatePattern: async (id: string, data: Partial<Pattern>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.put(`${API_URL}/api/patterns/${id}`, data)
      const updatedPattern = response.data

      set((state) => ({
        patterns: state.patterns.map((p) =>
          p.id === id ? updatedPattern : p
        ),
        currentPattern:
          state.currentPattern?.id === id
            ? updatedPattern
            : state.currentPattern,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to update pattern'

      set({
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  deletePattern: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await axios.delete(`${API_URL}/api/patterns/${id}`)

      set((state) => ({
        patterns: state.patterns.filter((p) => p.id !== id),
        currentPattern:
          state.currentPattern?.id === id ? null : state.currentPattern,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Failed to delete pattern'

      set({
        isLoading: false,
        error: message,
      })
      throw error
    }
  },

  setCurrentPattern: (pattern: Pattern | null) => {
    set({ currentPattern: pattern })
  },

  clearError: () => {
    set({ error: null })
  },
}))
