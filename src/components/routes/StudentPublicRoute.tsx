import { useStudentAuth } from "../../hooks/student/useStudentAuth"
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface StudentPublicRouteProps {
    children: ReactNode;
}
const StudentPublicRoute = ({ children }: StudentPublicRouteProps) => {
    const { isAuthenticated, isLoading } = useStudentAuth();

    if (isLoading) return <div>Loading..</div>;

    if (isAuthenticated) {
        return <Navigate to="/student/dashboard" replace />
    }
    return <>{children}</>
};

export default StudentPublicRoute;