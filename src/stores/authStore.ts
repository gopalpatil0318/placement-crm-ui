import { create } from "zustand"
import type { AuthState, User } from "../types/auth"
import { authService } from "./../services/authService"

interface AuthStoreActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState & AuthStoreActions>((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(email, password)

      const user: User = {
        id: email, // Using email as ID if not provided
        email: response.email,
        role: (response.role || response.type) as any,
        type: response.type,
        isActive: true,
      }

      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(user))

      set({
        user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },

  setUser: (user: User | null) => {
    set({ user })
  },

  setToken: (token: string | null) => {
    set({ token })
  },

  setError: (error: string | null) => {
    set({ error })
  },
}))
