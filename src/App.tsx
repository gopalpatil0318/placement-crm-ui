
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { SysAdminAuthProvider } from "./context/SysAdminAuthContext"
import { CollegeAuthProvider } from "./context/CollegeAuthContext"
import { ProtectedRoute } from "./components/routes/ProtectedRoute"
import { PublicRoute } from "./components/routes/PublicRoute"
import { COLLEGE_ROLES } from "./types/auth"

import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin'
import Dashboard from './pages/SuperAdmin/Dashboard'
import CreateCollege from './pages/SuperAdmin/CreateCollege'
import ViewColleges from './pages/SuperAdmin/ViewColleges'
import College from './pages/SuperAdmin/College'
import EditCollege from './pages/SuperAdmin/EditCollege'

import CollegeAdminLogin from './pages/collegeadmin/CollegeAdminLogin'
import CollegeDashboard from './pages/collegeadmin/Dashboard'
import ViewUser from './pages/collegeadmin/user_management/ViewUser'


import './App.css'
import CreateUser from "./pages/collegeadmin/user_management/CreateUser"
import UpdateUser from "./pages/collegeadmin/user_management/UpdateUser"
import BulkRegister from "./pages/collegeadmin/student_management/BulkRegister"
import StudentList from "./pages/collegeadmin/student_management/StudentList"
import DepartmentCards from "./pages/collegeadmin/student_management/DepartmentCards"
import ViewDepartments from "./pages/collegeadmin/ViewDepartments"
import CreateDepartment from "./pages/collegeadmin/CreateDepartment"
import UpdateDepartment from "./pages/collegeadmin/UpdateDepartment"
import ViewDepartment from "./pages/collegeadmin/departmentManagement/ViewDepartment"

function App() {
  return (
    <SysAdminAuthProvider>
      <CollegeAuthProvider>
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
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <CollegeDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/collegeadmin/view-users"
              element={
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
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
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <CreateUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collegeadmin/update-user/:userId"
              element={
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <UpdateUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collegeadmin/department/:deptId"
              element={
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <ViewDepartment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collegeadmin/students"
              element={
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <DepartmentCards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collegeadmin/students/:deptId"
              element={
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <StudentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collegeadmin/bulk-register"
              element={
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <BulkRegister />
                </ProtectedRoute>
              }
            />

            <Route
              path="/collegeadmin/departments"
              element={
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <ViewDepartments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collegeadmin/create-department"
              element={
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <CreateDepartment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collegeadmin/update-department/:deptId"
              element={
                <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                  <UpdateDepartment />
                </ProtectedRoute>
              }
            />


            {/* --- Common Routes --- */}
            <Route path="/unauthorized" element={<div className="p-10 text-center text-xl">Unauthorized Access</div>} />

            <Route path="/" element={<Navigate to="/sysadmin/login" replace />} />
            <Route path="*" element={<Navigate to="/sysadmin/login" replace />} />
          </Routes>
        </Router>
      </CollegeAuthProvider>
    </SysAdminAuthProvider>
  )
}

export default App