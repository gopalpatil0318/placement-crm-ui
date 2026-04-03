import { Navigate } from "react-router-dom"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import type { ReactNode } from "react"

const StudentProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, user, isLoading } = useStudentAuth()

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "student") {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export default StudentProtectedRoute