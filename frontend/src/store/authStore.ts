import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import type { AuthStore, User } from '@/types/store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Configure axios defaults
axios.defaults.baseURL = API_URL

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post('/api/auth/login', {
            email,
            password,
          })

          const { access_token, user } = response.data

          // Set axios authorization header
          axios.defaults.headers.common['Authorization'] =
            `Bearer ${access_token}`

          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const message =
            axios.isAxiosError(error) && error.response?.data?.detail
              ? error.response.data.detail
              : 'Login failed. Please try again.'

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          })
          throw error
        }
      },

      register: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post('/api/auth/register', {
            email,
            password,
            username,
          })

          const { access_token, user } = response.data

          // Set axios authorization header
          axios.defaults.headers.common['Authorization'] =
            `Bearer ${access_token}`

          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const message =
            axios.isAxiosError(error) && error.response?.data?.detail
              ? error.response.data.detail
              : 'Registration failed. Please try again.'

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          })
          throw error
        }
      },

      logout: () => {
        // Remove axios authorization header
        delete axios.defaults.headers.common['Authorization']

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      setUser: (user: User | null) => {
        set({ user })
      },

      setToken: (token: string | null) => {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ token, isAuthenticated: true })
        } else {
          delete axios.defaults.headers.common['Authorization']
          set({ token, isAuthenticated: false })
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore axios header on rehydration
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] =
            `Bearer ${state.token}`
        }
      },
    }
  )
)
