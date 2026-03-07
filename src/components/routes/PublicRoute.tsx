import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { SysAdminAuthContext } from "@/context/SysAdminAuthContext";
import { CollegeAuthContext } from "@/context/CollegeAuthContext";
import { COLLEGE_ROLES } from "@/types/auth";

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isSuperAdmin, isCollegeAdmin } = useAuth()

  if (isAuthenticated) {
    // Logic: Redirect to dashboard based on role
    if (isSuperAdmin()) {
      return <Navigate to="/sysadmin/colleges" replace />

    }

    if (isCollegeAdmin()) {
      return <Navigate to="/collegeadmin/dashboard" replace />

    }
    // Add other role redirects here if needed
    return <Navigate to="/" replace />
  }

  // Check College auth (any college role)
  if (
    collegeAuth?.isAuthenticated &&
    collegeAuth?.user?.role &&
    COLLEGE_ROLES.includes(collegeAuth.user.role)
  ) {
    return <Navigate to="/collegeadmin/dashboard" replace />;
  }

  return <>{children}</>;
};
