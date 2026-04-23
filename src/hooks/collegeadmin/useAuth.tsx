import { useContext } from "react"
import { CollegeAuthContext } from "@/context/CollegeAuthContext"
import type { UserRole } from "@/types/auth"
import { COLLEGE_ROLES } from "@/types/auth"

/**
 * Custom hook to access college admin authentication context.
 * Provides user data, authentication state, and role-specific helpers.
 */
export const useAuth = () => {
  const context = useContext(CollegeAuthContext)

  // Ensure hook is used within the proper Provider
  if (context === undefined) {
    throw new Error("useAuth must be used within a CollegeAuthProvider")
  }

  const { user, isAuthenticated, isLoading, login, logout, refreshPermissions } = context

  /**
   * Helper function to verify specific roles.
   */
  const hasRole = (role: UserRole) => user?.role === role

  // Check if user has any college portal role
  const isCollegeUser = () => !!(user?.role && COLLEGE_ROLES.includes(user.role))

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshPermissions,
    hasRole,
    isCollegeUser,
  }
}