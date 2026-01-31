import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/sysadmin/useAuth"

interface PublicRouteProps {
  children: ReactNode
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isSuperAdmin } = useAuth()

  if (isAuthenticated) {
    // Logic: Redirect to dashboard based on role
    if (isSuperAdmin()) {
      return <Navigate to="/sysadmin/dashboard" replace />
    }
    // Add other role redirects here if needed
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}