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
import StudentPublicRoute from "./components/routes/StudentPublicRoute"
import StudentProtectedRoute from "./components/routes/StudentProtectedRoute"
import StudentLogin from "./pages/student/StudentLogin"
import StudentDashboard from "./pages/student/StudentDashboard"
import PersonalInfo from "./pages/student/PersonalInfo"
import SemInfo from "./pages/student/SemInfo"
import AcademicInfo from "./pages/student/AcademicInfo"
import Skills from "./pages/student/Skills"
import Projects from "./pages/student/Projects"
import Experience from "./pages/student/Experience"
import Achievements from "./pages/student/Achievements"
import Certificates from "./pages/student/Certificates"
import Activities from "./pages/student/Activities"
import ProfileLinks from "./pages/student/ProfileLinks"
import { StudentAuthProvider } from "./context/students/StudentAuthContext"
import { SidebarProvider } from "./context/SidebarContext"

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <Router>
          <SidebarProvider>
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
                path="/student/login"
                element={
                  <StudentPublicRoute>
                    <StudentLogin />
                  </StudentPublicRoute>


                }
              />

              <Route
                path="/student/dashboard"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/personal-info"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <PersonalInfo />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/sem-info"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <SemInfo />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/academic"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <AcademicInfo />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/skills"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <Skills />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/projects"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <Projects />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/experience"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <Experience />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/achievements"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <Achievements />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/certificates"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <Certificates />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/activities"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <Activities />
                  </StudentProtectedRoute>
                }
              />

              <Route
                path="/student/profile/profile-links"
                element={
                  <StudentProtectedRoute allowedRoles={["student"]}>
                    <ProfileLinks />
                  </StudentProtectedRoute>
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
          </SidebarProvider>
        </Router>
      </StudentAuthProvider>
    </AuthProvider>
  )
}

export default App