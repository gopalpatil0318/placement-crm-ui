import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { PublicRoute } from "@/components/routes/PublicRoute";
import { COLLEGE_ROLES } from "@/types/auth";
import CollegeAdminLayout from "@/components/collegeadmin/CollegeAdminLayout";
import SmartRedirect from "@/components/routes/SmartRedirect";

// Public pages (combined login)
const CollegeLogin = lazy(() => import("@/pages/login/CollegeLogin"));
const LoginForgotPassword = lazy(() => import("@/pages/login/ForgotPassword"));
const LoginResetPassword = lazy(() => import("@/pages/login/ResetPassword"));

// Dashboard & Settings
const CollegeDashboard = lazy(() => import("@/pages/collegeadmin/Dashboard"));
const ChangePassword = lazy(() => import("@/pages/collegeadmin/ChangePassword"));
const VerificationSettingsPage = lazy(() => import("@/pages/collegeadmin/settings/VerificationSettings"));
const CompanyTierManager = lazy(() => import("@/pages/collegeadmin/settings/CompanyTierManager"));
const PlacementSettingsPage = lazy(() => import("@/pages/collegeadmin/settings/PlacementSettingsPage"));

// User Management
const ViewUser = lazy(() => import("@/pages/collegeadmin/user_management/ViewUser"));
const CreateUser = lazy(() => import("@/pages/collegeadmin/user_management/CreateUser"));
const UpdateUser = lazy(() => import("@/pages/collegeadmin/user_management/UpdateUser"));
const UserDetail = lazy(() => import("@/pages/collegeadmin/user_management/UserDetail"));

// Student Management
const DepartmentCards = lazy(() => import("@/pages/collegeadmin/student_management/DepartmentCards"));
const StudentList = lazy(() => import("@/pages/collegeadmin/student_management/StudentList"));
const StudentDetail = lazy(() => import("@/pages/collegeadmin/student_management/StudentDetail"));
const EditStudent = lazy(() => import("@/pages/collegeadmin/student_management/EditStudent"));
const BulkRegister = lazy(() => import("@/pages/collegeadmin/student_management/BulkRegister"));
const StudentRegister = lazy(() => import("@/pages/collegeadmin/student_management/StudentRegister"));

// Department Management
const ViewDepartments = lazy(() => import("@/pages/collegeadmin/ViewDepartments"));
const CreateDepartment = lazy(() => import("@/pages/collegeadmin/CreateDepartment"));
const UpdateDepartment = lazy(() => import("@/pages/collegeadmin/UpdateDepartment"));
const ViewDepartment = lazy(() => import("@/pages/collegeadmin/departmentManagement/ViewDepartment"));

// Company Management
const ViewCompanies = lazy(() => import("@/pages/collegeadmin/company_management/ViewCompanies"));
const CreateCompany = lazy(() => import("@/pages/collegeadmin/company_management/CreateCompany"));
const UpdateCompany = lazy(() => import("@/pages/collegeadmin/company_management/UpdateCompany"));
const CompanyDetail = lazy(() => import("@/pages/collegeadmin/company_management/CompanyDetail"));

// Job Postings
const ViewJobs = lazy(() => import("@/pages/collegeadmin/company_management/job_postings/ViewJobs"));
const CreateJob = lazy(() => import("@/pages/collegeadmin/company_management/job_postings/CreateJob"));
const JobDetail = lazy(() => import("@/pages/collegeadmin/company_management/job_postings/JobDetail"));
const UpdateJob = lazy(() => import("@/pages/collegeadmin/company_management/job_postings/UpdateJob"));
const RoundResults = lazy(() => import("@/pages/collegeadmin/company_management/job_postings/RoundResults"));
const ApplicationDetail = lazy(() => import("@/pages/collegeadmin/company_management/applications/ApplicationDetail"));

// Skills
const ViewSkills = lazy(() => import("@/pages/collegeadmin/skills/ViewSkills"));

// Verification Center
const ViewVerifications = lazy(() => import("@/pages/collegeadmin/verification/ViewVerifications"));

// Training Programs
const ViewTrainingPrograms = lazy(() => import("@/pages/collegeadmin/training_programs/ViewTrainingPrograms"));
const CreateTrainingProgram = lazy(() => import("@/pages/collegeadmin/training_programs/CreateTrainingProgram"));
const TrainingProgramDetail = lazy(() => import("@/pages/collegeadmin/training_programs/TrainingProgramDetail"));
const UpdateTrainingProgram = lazy(() => import("@/pages/collegeadmin/training_programs/UpdateTrainingProgram"));
const TrainingEnrollments = lazy(() => import("@/pages/collegeadmin/training_programs/TrainingEnrollments"));
const TrainingSessions = lazy(() => import("@/pages/collegeadmin/training_programs/TrainingSessions"));
const StudentTrainingReport = lazy(() => import("@/pages/collegeadmin/training_programs/StudentTrainingReport"));

// Feedback & Interview Questions
const ViewFeedback = lazy(() => import("@/pages/collegeadmin/feedback/ViewFeedback"));
const ViewInterviewQuestions = lazy(() => import("@/pages/collegeadmin/feedback/ViewInterviewQuestions"));

// Notifications
const SendNotification = lazy(() => import("@/pages/collegeadmin/notifications/SendNotification"));
const NotificationHistory = lazy(() => import("@/pages/collegeadmin/notifications/NotificationHistory"));

// Student Restrictions
const ViewRestrictions = lazy(() => import("@/pages/collegeadmin/student_management/ViewRestrictions"));

// Overrides & Placements
const ViewOverrides = lazy(() => import("@/pages/collegeadmin/job_overrides/ViewOverrides"));
const ViewPlacements = lazy(() => import("@/pages/collegeadmin/placements/ViewPlacements"));
const ViewPlacementPolicies = lazy(() => import("@/pages/collegeadmin/placements/ViewPlacementPolicies"));
const SelfReportReview = lazy(() => import("@/pages/collegeadmin/placements/SelfReportReview"));

// Audit Trail
const ViewAuditLogs = lazy(() => import("@/pages/collegeadmin/ViewAuditLogs"));

// Permission Manager
const PermissionManager = lazy(() => import("@/pages/collegeadmin/permissions/PermissionManager"));

// Profile
const MyProfile = lazy(() => import("@/pages/collegeadmin/profile/MyProfile"));

export const collegeAdminRoutes = (
    <>
        {/* Public — combined login page */}
        <Route path="/login" element={<PublicRoute><CollegeLogin /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><LoginForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><LoginResetPassword /></PublicRoute>} />

        {/* Legacy paths — redirect to new unified routes */}
        <Route path="/college/login" element={<Navigate to="/login" replace />} />
        <Route path="/college/forgot-password" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/college/reset-password" element={<Navigate to="/reset-password" replace />} />

        {/* Protected (shared DashboardLayout via CollegeAdminLayout) */}
        <Route element={<ProtectedRoute allowedRoles={COLLEGE_ROLES}><CollegeAdminLayout /></ProtectedRoute>}>
            <Route path="/college" element={<SmartRedirect />} />
            <Route path="/college/dashboard" element={<CollegeDashboard />} />
            <Route path="/college/change-password" element={<ChangePassword />} />
            <Route path="/college/verification-settings" element={<VerificationSettingsPage />} />
            <Route path="/college/company-tiers" element={<CompanyTierManager />} />
            <Route path="/college/placement-settings" element={<PlacementSettingsPage />} />

            {/* Users */}
            <Route path="/college/view-users" element={<ViewUser />} />
            <Route path="/college/create-user" element={<CreateUser />} />
            <Route path="/college/update-user/:userId" element={<UpdateUser />} />
            <Route path="/college/user/:userId" element={<UserDetail />} />

            {/* Students */}
            <Route path="/college/students" element={<DepartmentCards />} />
            <Route path="/college/students/:deptId" element={<StudentList />} />
            <Route path="/college/student/:studentId" element={<StudentDetail />} />
            <Route path="/college/student/:studentId/edit" element={<EditStudent />} />
            <Route path="/college/bulk-register" element={<BulkRegister />} />
            <Route path="/college/create-student" element={<StudentRegister />} />

            {/* Departments */}
            <Route path="/college/departments" element={<ViewDepartments />} />
            <Route path="/college/create-department" element={<CreateDepartment />} />
            <Route path="/college/update-department/:deptId" element={<UpdateDepartment />} />
            <Route path="/college/department/:deptId" element={<ViewDepartment />} />

            {/* Skills */}
            <Route path="/college/skills" element={<ViewSkills />} />

            {/* Verification Center */}
            <Route path="/college/verifications" element={<ViewVerifications />} />

            {/* Student Restrictions */}
            <Route path="/college/restrictions" element={<ViewRestrictions />} />

            {/* Companies */}
            <Route path="/college/companies" element={<ViewCompanies />} />
            <Route path="/college/create-company" element={<CreateCompany />} />
            <Route path="/college/update-company/:companyId" element={<UpdateCompany />} />
            <Route path="/college/company/:companyId" element={<CompanyDetail />} />

            {/* Jobs */}
            <Route path="/college/jobs" element={<ViewJobs />} />
            <Route path="/college/create-job" element={<CreateJob />} />
            <Route path="/college/job/:jobId" element={<JobDetail />} />
            <Route path="/college/job/:jobId/edit" element={<UpdateJob />} />
            <Route path="/college/job/:jobId/application/:applicationId" element={<ApplicationDetail />} />
            <Route path="/college/job/:jobId/round/:roundId/results" element={<RoundResults />} />

            {/* Training Programs */}
            <Route path="/college/training-programs" element={<ViewTrainingPrograms />} />
            <Route path="/college/create-training-program" element={<CreateTrainingProgram />} />
            <Route path="/college/training-program/:programId" element={<TrainingProgramDetail />} />
            <Route path="/college/training-program/:programId/edit" element={<UpdateTrainingProgram />} />
            <Route path="/college/training-program/:programId/enrollments" element={<TrainingEnrollments />} />
            <Route path="/college/training-program/:programId/sessions" element={<TrainingSessions />} />
            <Route path="/college/student/:studentId/training-report" element={<StudentTrainingReport />} />

            {/* Feedback & Interview Questions */}
            <Route path="/college/feedback" element={<ViewFeedback />} />
            <Route path="/college/interview-questions" element={<ViewInterviewQuestions />} />

            {/* Notifications */}
            <Route path="/college/send-notification" element={<SendNotification />} />
            <Route path="/college/notification-history" element={<NotificationHistory />} />

            {/* Overrides & Placements */}
            <Route path="/college/overrides" element={<ViewOverrides />} />
            <Route path="/college/placements" element={<ViewPlacements />} />
            <Route path="/college/placement-policies" element={<ViewPlacementPolicies />} />
            <Route path="/college/self-reports" element={<SelfReportReview />} />

            {/* Audit Trail */}
            <Route path="/college/audit-logs" element={<ViewAuditLogs />} />

            {/* Permission Manager */}
            <Route path="/college/permissions" element={<PermissionManager />} />

            {/* Profile — any college user */}
            <Route path="/college/my-profile" element={<MyProfile />} />
        </Route>
    </>
);
