import { createContext, useState, useEffect, type ReactNode } from "react"
import api from "../lib/api"
import type { User, AuthContextType, ApiLoginResponse } from "../types/auth"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user", e)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post<ApiLoginResponse>("/auth/login", { email, password })
    const { data } = response.data

    if (!data) throw new Error("Invalid response from server")

    const newUser: User = {
      id: email, // Or data.id if backend provides it
      email: data.email,
      role: (data.role || data.type) as any,
      type: data.type,
      isActive: true,
    }

    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout error", error)
    } finally {
      setUser(null)
      localStorage.removeItem("user")
      // We do not navigate here to keep context pure; component handles navigation or App handles it via state change
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {!isLoading && children} 
    </AuthContext.Provider>
  )
}