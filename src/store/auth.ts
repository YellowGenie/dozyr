import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginCredentials, RegisterData } from '@/types'
import { api } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
  verifyEmailCode: (code: string) => Promise<void>
  resendVerificationCode: (email: string) => Promise<void>
}

type AuthStore = AuthState & AuthActions

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
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null })
          const response = await api.login(credentials)
          
          // Set token with appropriate expiration based on remember me
          if (credentials.remember && response.token) {
            // For remember me, store token in localStorage with longer expiration
            localStorage.setItem('auth_token', response.token)
            localStorage.setItem('remember_me', 'true')
          }
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null })
          const response = await api.register(data)
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await api.logout()
        } catch (error) {
          console.error('Logout API call failed:', error)
        } finally {
          // Clear remember me state
          localStorage.removeItem('remember_me')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true, error: null })
          const updatedUser = await api.updateProfile(data)
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message || 'Profile update failed',
            isLoading: false
          })
          throw error
        }
      },

      checkAuth: async () => {
        const { token } = get()
        const rememberMe = localStorage.getItem('remember_me')
        
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        // Check if token might be expired client-side
        if (api.isTokenLikelyExpired()) {
          console.log('Token appears expired, clearing auth state')
          api.clearToken()
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          return
        }

        try {
          set({ isLoading: true, error: null })
          const user = await api.getProfile()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          console.error('Auth check failed:', error)
          
          // Only clear token if not remembering, or if it's an auth error
          if (!rememberMe || error.status === 401) {
            localStorage.removeItem('remember_me')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
            api.clearToken()
          } else {
            // Keep the token but mark as unauthenticated for now
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
        }
      },

      clearError: () => set({ error: null }),
      
      setUser: (user: User | null) => set({ user }),

      verifyEmailCode: async (code: string) => {
        try {
          set({ isLoading: true, error: null })
          const response = await api.verifyEmailCode(code)

          // Update the current user's email_verified status
          const currentUser = get().user
          if (currentUser) {
            const updatedUser = { ...currentUser, email_verified: true }
            set({
              user: updatedUser,
              isLoading: false,
              error: null
            })

            // Force a fresh user profile fetch to ensure backend sync
            try {
              const freshUser = await api.getProfile()
              set({ user: freshUser })
              console.log('Fresh user data after verification:', freshUser)
            } catch (profileError) {
              console.warn('Failed to refresh profile after verification:', profileError)
              // Keep the manually updated user if API call fails
            }
          }
        } catch (error: any) {
          set({
            error: error.message || 'Email verification failed',
            isLoading: false
          })
          throw error
        }
      },

      resendVerificationCode: async (email: string) => {
        try {
          set({ isLoading: true, error: null })
          await api.resendVerificationCode(email)
          set({ isLoading: false, error: null })
        } catch (error: any) {
          set({
            error: error.message || 'Failed to resend verification code',
            isLoading: false
          })
          throw error
        }
      }
    }),
    {
      name: 'dozyr-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.setToken(state.token)
          
          // Check if remember me was enabled, and if so, restore auth state
          const rememberMe = localStorage.getItem('remember_me')
          if (rememberMe && state.user) {
            // Only auto-authenticate if remember me was enabled
            setTimeout(() => {
              const store = useAuthStore.getState()
              if (!store.user && state.token) {
                store.checkAuth()
              }
            }, 100)
          }
        }
      }
    }
  )
)