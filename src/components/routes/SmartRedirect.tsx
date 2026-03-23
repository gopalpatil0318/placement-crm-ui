import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { SysAdminAuthContext } from "@/context/SysAdminAuthContext"
import { CollegeAuthContext } from "@/context/CollegeAuthContext"
import { StudentAuthContext } from "@/context/students/StudentAuthContext"

/**
 * Smart catch-all redirect that checks all three auth contexts
 * and sends the user to the correct dashboard (or login page).
 */
export default function SmartRedirect() {
  const sysAdminAuth = useContext(SysAdminAuthContext)
  const collegeAuth = useContext(CollegeAuthContext)
  const studentAuth = useContext(StudentAuthContext)

  if (sysAdminAuth?.isAuthenticated) {
    return <Navigate to="/sysadmin/dashboard" replace />
  }

  if (collegeAuth?.isAuthenticated) {
    return <Navigate to="/college/dashboard" replace />
  }

  if (studentAuth?.isAuthenticated) {
    const user = studentAuth.user
    if (!user?.profileComplete || !user?.profileIsApproved) {
      return <Navigate to="/student/profile" replace />
    }
    return <Navigate to="/student/dashboard" replace />
  }

  // No one is logged in — default to college login
  return <Navigate to="/college/login" replace />
}
