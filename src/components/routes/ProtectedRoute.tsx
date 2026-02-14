// import type { ReactNode } from "react"
// import { Navigate } from "react-router-dom"
// import { useAuth } from "@/hooks/sysadmin/useAuth"
// import type { UserRole } from "../../types/auth"

// interface ProtectedRouteProps {
//   children: ReactNode
//   allowedRoles?: UserRole[]
// }

// export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
//   const { isAuthenticated, user, isLoading } = useAuth()

//   console.log('user', user);
//   if (isLoading) return <div>Loading...</div> // Or a spinner component

//   if (!isAuthenticated) {
//     return <Navigate to="/sysadmin/login" replace />
//   }

//   if (allowedRoles && user && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/unauthorized" replace />
//   }

//   return <>{children}</>
// }


import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
// Use your central auth hook
import { useAuth } from "@/hooks/sysadmin/useAuth" 
import type { UserRole } from "../../types/auth"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation() // To detect the current path

  console.log('Current User Role:', user?.role);

  if (isLoading) return <div className="p-10 text-center">Loading...</div>

  // 1. Dynamic Login Redirect
  if (!isAuthenticated) {
    // Determine which login page to show based on the URL path
    const loginPath = location.pathname.startsWith("/collegeadmin") 
      ? "/collegeadmin/login" 
      : "/sysadmin/login";
      
    return <Navigate to={loginPath} replace />
  }

  // 2. Role Verification Logic
  // Check if user's role exists in the allowedRoles array defined in App.tsx
  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    console.warn("Access Denied: Role mismatch", { userRole: user.role, allowed: allowedRoles });
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
