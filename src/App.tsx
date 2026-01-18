import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { useAuth } from "./hooks/useAuth"

import './App.css'
import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin'
import Dashboard from './pages/SuperAdmin/Dashboard'
import CreateCollege from './pages/SuperAdmin/CreateCollege'

function App() {

  return (
 <Router>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/sysadmin/login" element={<SuperAdminLogin />} />

        {/* Super Admin Routes */}
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


        {/* Unauthorized */}
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/sysadmin/login" replace />} />
        <Route path="/login" element={<Navigate to="/sysadmin/login" replace />} />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/sysadmin/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
