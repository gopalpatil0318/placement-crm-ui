
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/routes/ProtectedRoute"
import { PublicRoute } from "./components/routes/PublicRoute"

import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin'
import Dashboard from './pages/SuperAdmin/Dashboard'
import CreateCollege from './pages/SuperAdmin/CreateCollege'
import ViewColleges from './pages/SuperAdmin/ViewColleges'
import College from './pages/SuperAdmin/College'
import EditCollege from './pages/SuperAdmin/EditCollege'

import CollegeAdminLogin from './pages/collegeadmin/CollegeAdminLogin'
import CollegeDashboard from './pages/collegeadmin/Dashboard'
import ViewUser from './pages/collegeadmin/ViewUser'


import './App.css'
import CreateUser from "./pages/collegeadmin/CreateUser"
import UpdateUser from "./pages/collegeadmin/UpdateUser"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/sysadmin/login"
            element={
              <PublicRoute>
                <SuperAdminLogin />
              </PublicRoute>
            }
          />

          <Route
            path="/collegeadmin/login"
            element={
              <PublicRoute>
                <CollegeAdminLogin />
              </PublicRoute>
            }
          />

          <Route path="/login" element={<Navigate to="/sysadmin/login" replace />} />

          <Route
            path="/sysadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["sysadmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/sysadmin/create-college" element={<ProtectedRoute allowedRoles={["sysadmin"]}><CreateCollege /></ProtectedRoute>} />
          <Route path="/sysadmin/edit-college/:collegeId" element={<ProtectedRoute allowedRoles={["sysadmin"]}><EditCollege /></ProtectedRoute>} />
          <Route path="/sysadmin/view-colleges" element={<ProtectedRoute allowedRoles={["sysadmin"]}><ViewColleges /></ProtectedRoute>} />
          <Route path="/sysadmin/view-colleges/:collegeId" element={<ProtectedRoute allowedRoles={["sysadmin"]}><College /></ProtectedRoute>} />

          <Route
            path="/collegeadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["collegeadmin"]}>
                <CollegeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/collegeadmin/view-users"
            element={
              <ProtectedRoute allowedRoles={["collegeadmin"]}>
                <ViewUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sysadmin/view-colleges"
            element={
              <ProtectedRoute allowedRoles={["sysadmin"]}>
                <ViewColleges />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sysadmin/view-colleges/:collegeId"
            element={
              <ProtectedRoute allowedRoles={["sysadmin"]}>
                <College />
              </ProtectedRoute>
            }
          />


          <Route
            path="/collegeadmin/create-user"
            element={
              <ProtectedRoute allowedRoles={["collegeadmin"]}>
                <CreateUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collegeadmin/update-user/:userId"
            element={
              <ProtectedRoute allowedRoles={["collegeadmin"]}>
                <UpdateUser />
              </ProtectedRoute>
            }
          />


          {/* --- Common Routes --- */}
          <Route path="/unauthorized" element={<div className="p-10 text-center text-xl">Unauthorized Access</div>} />

          <Route path="/" element={<Navigate to="/sysadmin/login" replace />} />
          <Route path="*" element={<Navigate to="/sysadmin/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App