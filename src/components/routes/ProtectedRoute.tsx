import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/sysadmin/useAuth"
import type { UserRole } from "../../types/auth"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div> // Or a spinner component

  if (!isAuthenticated) {
    return <Navigate to="/sysadmin/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}