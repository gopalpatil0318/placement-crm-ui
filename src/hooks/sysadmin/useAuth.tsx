import { useContext } from "react"
import { SysAdminAuthContext } from "@/context/SysAdminAuthContext"
import type { UserRole } from "@/types/auth"

export const useAuth = () => {
  const context = useContext(SysAdminAuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within a SysAdminAuthProvider")
  }

  const { user, isAuthenticated, isLoading, login, logout } = context

  // Helper functions
  const hasRole = (role: UserRole) => user?.role === role

  const isSuperAdmin = () => user?.role === "sysadmin"

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    isSuperAdmin,
  }
}