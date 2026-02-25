import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useContext } from "react"
import { SysAdminAuthContext } from "@/context/SysAdminAuthContext"
import { CollegeAuthContext } from "@/context/CollegeAuthContext"
import type { UserRole } from "@/types/auth"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation()
  const isCollegePath = location.pathname.startsWith("/collegeadmin")

  // Pick the correct auth context based on the route
  const sysAdminAuth = useContext(SysAdminAuthContext)
  const collegeAuth = useContext(CollegeAuthContext)

  const auth = isCollegePath ? collegeAuth : sysAdminAuth
  const user = auth?.user ?? null
  const isAuthenticated = auth?.isAuthenticated ?? false
  const isLoading = auth?.isLoading ?? false

  if (isLoading) return <div className="p-10 text-center">Loading...</div>

  // 1. Not authenticated → redirect to the correct login page
  if (!isAuthenticated) {
    const loginPath = isCollegePath ? "/collegeadmin/login" : "/sysadmin/login"
    return <Navigate to={loginPath} replace />
  }

  // 2. Role check
  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    console.warn("Access Denied: Role mismatch", { userRole: user.role, allowed: allowedRoles })
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
