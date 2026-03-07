import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/sysadmin/useAuth"
import type { UserRole } from "../../types/auth"

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  const auth = isCollegePath ? collegeAuth : sysAdminAuth;
  const user = auth?.user ?? null;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const isLoading = auth?.isLoading ?? false;

  if (!isAuthenticated) {
    const loginPath = location.pathname.startsWith("/collegeadmin")
      ? "/collegeadmin/login"
      : "/sysadmin/login";
    return <Navigate to={loginPath} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>;
};
