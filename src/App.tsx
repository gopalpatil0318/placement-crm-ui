import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { SysAdminAuthProvider } from "./context/SysAdminAuthContext"
import { CollegeAuthProvider } from "./context/CollegeAuthContext"
import { StudentAuthProvider } from "./context/students/StudentAuthContext"
import { ProtectedRoute } from "./components/routes/ProtectedRoute"
import { PublicRoute } from "./components/routes/PublicRoute"
import StudentPublicRoute from "./components/routes/StudentPublicRoute"
import StudentProtectedRoute from "./components/routes/StudentProtectedRoute"
import { COLLEGE_ROLES } from "./types/auth"

import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin'
import Dashboard from './pages/SuperAdmin/Dashboard'
import CreateCollege from './pages/SuperAdmin/CreateCollege'
import ViewColleges from './pages/SuperAdmin/ViewColleges'
import College from './pages/SuperAdmin/College'
import EditCollege from './pages/SuperAdmin/EditCollege'

import CollegeAdminLogin from './pages/collegeadmin/CollegeAdminLogin'
import CollegeDashboard from './pages/collegeadmin/Dashboard'
import ViewUser from './pages/collegeadmin/ViewUser'
import CreateUser from "./pages/collegeadmin/CreateUser"
import UpdateUser from "./pages/collegeadmin/UpdateUser"

import StudentPublicRoute from "./components/routes/StudentPublicRoute"
import StudentProtectedRoute from "./components/routes/StudentProtectedRoute"
import StudentLogin from "./pages/Students/StudentLogin"
import StudentDashboard from "./pages/Students/StudentDashboard"
import StudentProfile from "./pages/Students/StudentProfile"
import { StudentAuthProvider } from "./context/students/StudentAuthContext"

import './App.css'

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <Router>
          <Routes>
            {/* --- Sysadmin Routes --- */}
            <Route
              path="/sysadmin/login"
              element={
                <PublicRoute>
                  <SuperAdminLogin />
                </PublicRoute>
              }
            />
            <Route path="/sysadmin/dashboard" element={<ProtectedRoute allowedRoles={["sysadmin"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/sysadmin/colleges" element={<ProtectedRoute allowedRoles={["sysadmin"]}><ViewColleges /></ProtectedRoute>} />
            <Route path="/sysadmin/colleges/create" element={<ProtectedRoute allowedRoles={["sysadmin"]}><CreateCollege /></ProtectedRoute>} />
            <Route path="/sysadmin/colleges/:collegeId" element={<ProtectedRoute allowedRoles={["sysadmin"]}><College /></ProtectedRoute>} />
            <Route path="/sysadmin/colleges/:collegeId/edit" element={<ProtectedRoute allowedRoles={["sysadmin"]}><EditCollege /></ProtectedRoute>} />

            {/* --- College Admin Routes --- */}
            <Route
              path="/collegeadmin/login"
              element={
                <PublicRoute>
                  <CollegeAdminLogin />
                </PublicRoute>
              }
            />
            <Route path="/collegeadmin/dashboard" element={<ProtectedRoute allowedRoles={["collegeadmin"]}><CollegeDashboard /></ProtectedRoute>} />
            <Route path="/collegeadmin/view-users" element={<ProtectedRoute allowedRoles={["collegeadmin"]}><ViewUser /></ProtectedRoute>} />
            <Route path="/collegeadmin/create-user" element={<ProtectedRoute allowedRoles={["collegeadmin"]}><CreateUser /></ProtectedRoute>} />
            <Route path="/collegeadmin/update-user/:userId" element={<ProtectedRoute allowedRoles={["collegeadmin"]}><UpdateUser /></ProtectedRoute>} />

            {/* --- Student Routes --- */}
            <Route path="/student/login" element={<StudentPublicRoute><StudentLogin /></StudentPublicRoute>} />
            <Route path="/student/dashboard" element={<StudentProtectedRoute><StudentDashboard /></StudentProtectedRoute>} />
            <Route path="/student/profile" element={<StudentProtectedRoute><StudentProfile /></StudentProtectedRoute>} />

            {/* --- Common Routes --- */}
            <Route path="/unauthorized" element={<div className="p-10 text-center text-xl">Unauthorized Access</div>} />
            <Route path="/login" element={<Navigate to="/sysadmin/login" replace />} />
            <Route path="/" element={<Navigate to="/sysadmin/login" replace />} />
            <Route path="*" element={<Navigate to="/sysadmin/login" replace />} />
          </Routes>
        </Router>
      </StudentAuthProvider>
    </AuthProvider>
  )
}

export default App