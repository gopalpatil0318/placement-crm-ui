import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { Navigate } from "react-router-dom";
import { useContext, type ReactNode } from "react";
import { SysAdminAuthContext } from "@/context/SysAdminAuthContext";
import { CollegeAuthContext } from "@/context/CollegeAuthContext";
import { COLLEGE_ROLES } from "@/types/auth";

interface StudentPublicRouteProps {
    children: ReactNode;
}

const StudentPublicRoute = ({ children }: StudentPublicRouteProps) => {
    const { isAuthenticated, isLoading, user } = useStudentAuth();
    const sysAdminAuth = useContext(SysAdminAuthContext);
    const collegeAuth = useContext(CollegeAuthContext);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
        );
    }

    // Redirect sysadmin users away from student login
    if (sysAdminAuth?.isAuthenticated && sysAdminAuth?.user?.role === "sysadmin") {
        return <Navigate to="/sysadmin/dashboard" replace />;
    }

    // Redirect college users away from student login
    if (collegeAuth?.isAuthenticated && collegeAuth?.user?.role && COLLEGE_ROLES.includes(collegeAuth.user.role)) {
        return <Navigate to="/college/dashboard" replace />;
    }

    if (isAuthenticated) {
        // Profile-based redirect: incomplete profile → /student/profile
        if (!user?.profileComplete || !user?.profileIsApproved) {
            return <Navigate to="/student/profile" replace />
        }
        return <Navigate to="/student/dashboard" replace />
    }

    return <>{children}</>
};

export default StudentPublicRoute;