import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"
import type { UserRole } from "@/types/auth"

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  const { user, isAuthenticated, isLoading, login, logout } = context

  // Helper functions
  const hasRole = (role: UserRole) => user?.role === role
  
  const isSuperAdmin = () => user?.role === "sysadmin"
  const isCollegeAdmin = () => user?.role === "collegeadmin"
  const isStudent = () => user?.role === "student"

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    isSuperAdmin,
    isCollegeAdmin,
    isStudent,
  }
}