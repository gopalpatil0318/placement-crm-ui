import { useAuthStore } from "./../stores/authStore"
import type { UserRole } from "./../types/auth"

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, error, login, logout } = useAuthStore()

  const hasRole = (role: UserRole) => user?.role === role

  const isSuperAdmin = () => user?.role === "sysadmin"
  const isCollegeAdmin = () => user?.role === "college_admin"
  const isStudent = () => user?.role === "student"

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    hasRole,
    isSuperAdmin,
    isCollegeAdmin,
    isStudent,
  }
}
