import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface StudentPublicRouteProps {
    children: ReactNode;
}

const StudentPublicRoute = ({ children }: StudentPublicRouteProps) => {
    const { isAuthenticated, isLoading, user } = useStudentAuth();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
        );
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