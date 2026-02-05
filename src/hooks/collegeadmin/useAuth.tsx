import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"
import type { UserRole } from "@/types/auth"

/**
 * Custom hook to access college admin authentication context.
 * Provides user data, authentication state, and role-specific helpers.
 */
export const useAuth = () => {
  const context = useContext(AuthContext)

  // Ensure hook is used within the proper Provider
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  const { user, isAuthenticated, isLoading, login, logout } = context

  /**
   * Helper function to verify specific roles.
   * Based on the central AuthContext role mapping.
   */
  const hasRole = (role: UserRole) => user?.role === role
  
  // Specific role check for College Administrators
  const isCollegeAdmin = () => user?.role === "collegeadmin"

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    isCollegeAdmin,
  }
}