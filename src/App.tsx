import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/routes/ProtectedRoute"
import { PublicRoute } from "./components/routes/PublicRoute"

// Import Pages
import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin'
import Dashboard from './pages/SuperAdmin/Dashboard'
import CreateCollege from './pages/SuperAdmin/CreateCollege'
import ViewColleges from './pages/SuperAdmin/ViewColleges'
import College from './pages/SuperAdmin/College'
import EditCollege from './pages/SuperAdmin/EditCollege'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- Public Routes (Accessible only if NOT logged in) --- */}
          <Route 
            path="/sysadmin/login" 
            element={
              <PublicRoute>
                <SuperAdminLogin />
              </PublicRoute>
            } 
          />
          
          {/* Legacy login redirect */}
          <Route path="/login" element={<Navigate to="/sysadmin/login" replace />} />

          {/* --- Protected Routes (Require Login + Role) --- */}
          <Route
            path="/sysadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["sysadmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sysadmin/create-college"
            element={
              <ProtectedRoute allowedRoles={["sysadmin"]}>
                <CreateCollege />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sysadmin/edit-college/:collegeId"
            element={
              <ProtectedRoute allowedRoles={["sysadmin"]}>
                <EditCollege />
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

          {/* --- Common Routes --- */}
          <Route path="/unauthorized" element={<div className="p-10 text-center text-xl">Unauthorized Access</div>} />

          {/* Default Catch-all */}
          <Route path="/" element={<Navigate to="/sysadmin/login" replace />} />
          <Route path="*" element={<Navigate to="/sysadmin/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App