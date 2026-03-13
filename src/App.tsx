import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { SysAdminAuthProvider } from "./context/SysAdminAuthContext"
import { CollegeAuthProvider } from "./context/CollegeAuthContext"
import { StudentAuthProvider } from "./context/students/StudentAuthContext"
import { ProtectedRoute } from "./components/routes/ProtectedRoute"
import { PublicRoute } from "./components/routes/PublicRoute"
import StudentPublicRoute from "./components/routes/StudentPublicRoute"
import StudentProtectedRoute from "./components/routes/StudentProtectedRoute"
import { COLLEGE_ROLES } from "./types/auth"

const SuperAdminLogin = lazy(() => import('./pages/SuperAdmin/SuperAdminLogin'))
const Dashboard = lazy(() => import('./pages/SuperAdmin/Dashboard'))
const CreateCollege = lazy(() => import('./pages/SuperAdmin/CreateCollege'))
const ViewColleges = lazy(() => import('./pages/SuperAdmin/ViewColleges'))
const College = lazy(() => import('./pages/SuperAdmin/College'))
const EditCollege = lazy(() => import('./pages/SuperAdmin/EditCollege'))

// College Admin
const CollegeAdminLogin = lazy(() => import('./pages/collegeadmin/CollegeAdminLogin'))
const CollegeDashboard = lazy(() => import('./pages/collegeadmin/Dashboard'))
const ForgotPassword = lazy(() => import('./pages/collegeadmin/ForgotPassword'))
const ChangePassword = lazy(() => import('./pages/collegeadmin/ChangePassword'))

// College Admin - User Management
const ViewUser = lazy(() => import('./pages/collegeadmin/user_management/ViewUser'))
const CreateUser = lazy(() => import('./pages/collegeadmin/user_management/CreateUser'))
const UpdateUser = lazy(() => import('./pages/collegeadmin/user_management/UpdateUser'))
const UserDetail = lazy(() => import('./pages/collegeadmin/user_management/UserDetail'))

// College Admin - Student Management
const BulkRegister = lazy(() => import('./pages/collegeadmin/student_management/BulkRegister'))
const StudentList = lazy(() => import('./pages/collegeadmin/student_management/StudentList'))
const DepartmentCards = lazy(() => import('./pages/collegeadmin/student_management/DepartmentCards'))
const StudentRegister = lazy(() => import('./pages/collegeadmin/student_management/StudentRegister'))
const StudentDetail = lazy(() => import('./pages/collegeadmin/student_management/StudentDetail'))
const EditStudent = lazy(() => import('./pages/collegeadmin/student_management/EditStudent'))

// College Admin - Department Management
const ViewDepartments = lazy(() => import('./pages/collegeadmin/ViewDepartments'))
const CreateDepartment = lazy(() => import('./pages/collegeadmin/CreateDepartment'))
const UpdateDepartment = lazy(() => import('./pages/collegeadmin/UpdateDepartment'))
const ViewDepartment = lazy(() => import('./pages/collegeadmin/departmentManagement/ViewDepartment'))

// College Admin - Company Management
const ViewCompanies = lazy(() => import('./pages/collegeadmin/company_management/ViewCompanies'))
const CreateCompany = lazy(() => import('./pages/collegeadmin/company_management/CreateCompany'))
const UpdateCompany = lazy(() => import('./pages/collegeadmin/company_management/UpdateCompany'))
const CompanyDetail = lazy(() => import('./pages/collegeadmin/company_management/CompanyDetail'))

// College Admin - Job Postings
const CreateJob = lazy(() => import('./pages/collegeadmin/company_management/job_postings/CreateJob'))
const ViewJobs = lazy(() => import('./pages/collegeadmin/company_management/job_postings/ViewJobs'))
const JobDetail = lazy(() => import('./pages/collegeadmin/company_management/job_postings/JobDetail'))
const UpdateJob = lazy(() => import('./pages/collegeadmin/company_management/job_postings/UpdateJob'))

// College Admin - Job Positions
const ManagePositions = lazy(() => import('./pages/collegeadmin/company_management/job_positions/ManagePositions'))
const ViewJobPositions = lazy(() => import('./pages/collegeadmin/company_management/job_positions/ViewJobPositions'))
const AddJobPosition = lazy(() => import('./pages/collegeadmin/company_management/job_positions/AddJobPosition'))

// College Admin - Job Eligibility Criteria
const ViewJobCriteria = lazy(() => import('./pages/collegeadmin/company_management/job_eligibility_criteria/ViewJobCriteria'))
const SetJobCriteria = lazy(() => import('./pages/collegeadmin/company_management/job_eligibility_criteria/SetJobCriteria'))
const ViewEligibleStudents = lazy(() => import('./pages/collegeadmin/company_management/job_eligibility_criteria/ViewEligibleStudents'))

// Students
const StudentLogin = lazy(() => import('./pages/Students/StudentLogin'))
const StudentDashboard = lazy(() => import('./pages/Students/StudentDashboard'))
const StudentProfile = lazy(() => import('./pages/Students/StudentProfile'))
const StudentForgotPassword = lazy(() => import('./pages/Students/StudentForgotPassword'))
const StudentChangePassword = lazy(() => import('./pages/Students/StudentChangePassword'))

// Student Form Pages
const PersonalInfo = lazy(() => import('./pages/student/PersonalInfo'))
const AcademicInfo = lazy(() => import('./pages/student/AcademicInfo'))
const SemInfo = lazy(() => import('./pages/student/SemInfo'))
const Skills = lazy(() => import('./pages/student/Skills'))
const Experience = lazy(() => import('./pages/student/Experience'))
const Projects = lazy(() => import('./pages/student/Projects'))
const Certificates = lazy(() => import('./pages/student/Certificates'))
const Achievements = lazy(() => import('./pages/student/Achievements'))
const Activities = lazy(() => import('./pages/student/Activities'))
const ProfileLinks = lazy(() => import('./pages/student/ProfileLinks'))

import './App.css'

function App() {
  return (
    <SysAdminAuthProvider>
      <CollegeAuthProvider>
        <StudentAuthProvider>
          <Router>
            <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>}>
              <Routes>
                {/* SysAdmin Routes */}
                <Route
                  path="/sysadmin/login"
                  element={
                    <PublicRoute>
                      <SuperAdminLogin />
                    </PublicRoute>
                  }
                />
                <Route path="/login" element={<Navigate to="/sysadmin/login" replace />} />
                <Route path="/sysadmin/dashboard" element={<ProtectedRoute allowedRoles={["sysadmin"]}><Dashboard /></ProtectedRoute>} />
                <Route path="/sysadmin/colleges/create" element={<ProtectedRoute allowedRoles={["sysadmin"]}><CreateCollege /></ProtectedRoute>} />
                <Route path="/sysadmin/colleges/:collegeId/edit" element={<ProtectedRoute allowedRoles={["sysadmin"]}><EditCollege /></ProtectedRoute>} />
                <Route path="/sysadmin/colleges" element={<ProtectedRoute allowedRoles={["sysadmin"]}><ViewColleges /></ProtectedRoute>} />
                <Route path="/sysadmin/colleges/:collegeId" element={<ProtectedRoute allowedRoles={["sysadmin"]}><College /></ProtectedRoute>} />

                {/* College Admin Routes */}
                <Route
                  path="/college/login"
                  element={
                    <PublicRoute>
                      <CollegeAdminLogin />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/college/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/college/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <CollegeDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/change-password"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <ChangePassword />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/view-users"
                  element={
                    <ProtectedRoute allowedRoles={["collegeadmin"]}>
                      <ViewUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/create-user"
                  element={
                    <ProtectedRoute allowedRoles={["collegeadmin"]}>
                      <CreateUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/update-user/:userId"
                  element={
                    <ProtectedRoute allowedRoles={["collegeadmin"]}>
                      <UpdateUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/user/:userId"
                  element={
                    <ProtectedRoute allowedRoles={["collegeadmin"]}>
                      <UserDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/department/:deptId"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <ViewDepartment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/students"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <DepartmentCards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/students/:deptId"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <StudentList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/student/:studentId"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <StudentDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/student/:studentId/edit"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <EditStudent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/bulk-register"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <BulkRegister />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/create-student"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <StudentRegister />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/departments"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <ViewDepartments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/create-department"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <CreateDepartment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/update-department/:deptId"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <UpdateDepartment />
                    </ProtectedRoute>
                  }
                />

                {/* Company Management Routes */}
                <Route
                  path="/college/companies"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <ViewCompanies />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/create-company"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <CreateCompany />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/update-company/:companyId"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <UpdateCompany />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/company/:companyId"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <CompanyDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Job Posting Routes */}
                <Route
                  path="/college/jobs"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <ViewJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/company/:companyId/create-job"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <CreateJob />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/job/:jobId"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <JobDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/job/:jobId/edit"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <UpdateJob />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/job/:jobId/positions"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <ManagePositions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/job-positions"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <ViewJobPositions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/add-job-position"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <AddJobPosition />
                    </ProtectedRoute>
                  }
                />

                {/* Job Eligibility Criteria Routes */}
                <Route
                  path="/college/job-criteria"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <ViewJobCriteria />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/job/:jobId/criteria"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <SetJobCriteria />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/college/job/:jobId/eligible-students"
                  element={
                    <ProtectedRoute allowedRoles={COLLEGE_ROLES}>
                      <ViewEligibleStudents />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/student/login"
                  element={
                    <StudentPublicRoute>
                      <StudentLogin />
                    </StudentPublicRoute>
                  }
                />
                <Route
                  path="/student/forgot-password"
                  element={
                    <StudentPublicRoute>
                      <StudentForgotPassword />
                    </StudentPublicRoute>
                  }
                />
                <Route
                  path="/student/dashboard"
                  element={
                    <StudentProtectedRoute>
                      <StudentDashboard />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <StudentProtectedRoute>
                      <StudentProfile />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/change-password"
                  element={
                    <StudentProtectedRoute>
                      <StudentChangePassword />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/personal-info"
                  element={
                    <StudentProtectedRoute>
                      <PersonalInfo />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/academic-info"
                  element={
                    <StudentProtectedRoute>
                      <AcademicInfo />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/sem-info"
                  element={
                    <StudentProtectedRoute>
                      <SemInfo />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/skills"
                  element={
                    <StudentProtectedRoute>
                      <Skills />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/experience"
                  element={
                    <StudentProtectedRoute>
                      <Experience />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/projects"
                  element={
                    <StudentProtectedRoute>
                      <Projects />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/certificates"
                  element={
                    <StudentProtectedRoute>
                      <Certificates />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/achievements"
                  element={
                    <StudentProtectedRoute>
                      <Achievements />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/activities"
                  element={
                    <StudentProtectedRoute>
                      <Activities />
                    </StudentProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile-links"
                  element={
                    <StudentProtectedRoute>
                      <ProfileLinks />
                    </StudentProtectedRoute>
                  }
                />

                {/* --- Common Routes --- */}
                <Route path="/unauthorized" element={<div className="p-10 text-center text-xl">Unauthorized Access</div>} />

                <Route path="/" element={<Navigate to="/sysadmin/login" replace />} />
                <Route path="*" element={<Navigate to="/sysadmin/login" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </StudentAuthProvider>
      </CollegeAuthProvider>
    </SysAdminAuthProvider>
  )
}

export default App