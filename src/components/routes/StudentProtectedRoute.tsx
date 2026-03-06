// StudentProtectedRoute.tsx

import { Navigate } from "react-router-dom"
import { useStudentAuth } from "../../hooks/student/useStudentAuth"

const StudentProtectedRoute = ({ children }: any) => {
    const { isAuthenticated, user, isLoading } = useStudentAuth()

    if (isLoading) return <div>Loading...</div>

    if (!isAuthenticated || user?.role !== "student") {
        return <Navigate to="/student/login" replace />
    }

    return children
}

export default StudentProtectedRoute