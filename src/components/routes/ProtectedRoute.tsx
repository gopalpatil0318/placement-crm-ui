import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/sysadmin/useAuth"
import type { UserRole } from "../../types/auth"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="p-10 text-center">Loading...</div>

  if (!isAuthenticated) {
    const loginPath = location.pathname.startsWith("/collegeadmin")
      ? "/collegeadmin/login"
      : "/sysadmin/login";
    return <Navigate to={loginPath} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
