import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { SysAdminAuthContext } from "@/context/SysAdminAuthContext";
import { CollegeAuthContext } from "@/context/CollegeAuthContext";
import { StudentAuthContext } from "@/context/students/StudentAuthContext";
import { COLLEGE_ROLES } from "@/types/auth";

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const sysAdminAuth = useContext(SysAdminAuthContext);
  const collegeAuth = useContext(CollegeAuthContext);
  const studentAuth = useContext(StudentAuthContext);

  // Check SysAdmin auth
  if (
    sysAdminAuth?.isAuthenticated &&
    sysAdminAuth?.user?.role === "sysadmin"
  ) {
    return <Navigate to="/sysadmin/dashboard" replace />;
  }

  // Check College auth (any college role)
  if (
    collegeAuth?.isAuthenticated &&
    collegeAuth?.user?.role &&
    COLLEGE_ROLES.includes(collegeAuth.user.role)
  ) {
    return <Navigate to="/college/dashboard" replace />;
  }

  // Check Student auth
  if (studentAuth?.isAuthenticated && studentAuth?.user?.role === "student") {
    if (!studentAuth.user?.profileComplete || !studentAuth.user?.profileIsApproved) {
      return <Navigate to="/student/profile" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};
