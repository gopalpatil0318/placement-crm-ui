import { lazy } from "react";
import { Route } from "react-router-dom";
import StudentPublicRoute from "@/components/routes/StudentPublicRoute";
import StudentProtectedRoute from "@/components/routes/StudentProtectedRoute";
import StudentLayout from "@/components/student/layout/StudentLayout";

// Auth pages (public — no layout)
const StudentLogin = lazy(() => import("@/pages/Students/StudentLogin"));
const StudentForgotPassword = lazy(() => import("@/pages/Students/StudentForgotPassword"));
const StudentResetPassword = lazy(() => import("@/pages/Students/StudentResetPassword"));

// Dashboard & Profile
const StudentDashboard = lazy(() => import("@/pages/Students/StudentDashboard"));
const StudentProfile = lazy(() => import("@/pages/Students/StudentProfile"));
const UpdateStudentProfile = lazy(() => import("@/pages/student/UpdateStudentProfile"));
const StudentChangePassword = lazy(() => import("@/pages/Students/StudentChangePassword"));

// Job browsing pages
const JobBrowse = lazy(() => import("@/pages/student/JobBrowse"));
const JobDetail = lazy(() => import("@/pages/student/JobDetail"));

// Application pages
const MyApplications = lazy(() => import("@/pages/student/MyApplications"));
const ApplicationDetail = lazy(() => import("@/pages/student/ApplicationDetail"));

// Notifications
const Notifications = lazy(() => import("@/pages/student/Notifications"));

// Placements
const MyPlacements = lazy(() => import("@/pages/student/MyPlacements"));

// Training Programs
const MyTrainings = lazy(() => import("@/pages/student/MyTrainings"));

// Restrictions
const MyRestrictions = lazy(() => import("@/pages/student/MyRestrictions"));

// Override Requests
const MyOverrides = lazy(() => import("@/pages/student/MyOverrides"));

// Feedback & Interview Questions
const MyFeedback = lazy(() => import("@/pages/student/MyFeedback"));
const InterviewQuestions = lazy(() => import("@/pages/student/InterviewQuestions"));

// Fallback
const NotFound = lazy(() => import("@/pages/NotFound"));

export const studentRoutes = (
    <>
        {/* Public (no layout) */}
        <Route path="/student/login" element={<StudentPublicRoute><StudentLogin /></StudentPublicRoute>} />
        <Route path="/student/forgot-password" element={<StudentPublicRoute><StudentForgotPassword /></StudentPublicRoute>} />
        <Route path="/student/reset-password" element={<StudentPublicRoute><StudentResetPassword /></StudentPublicRoute>} />

        {/* Protected (shared StudentLayout: sidebar + top bar) */}
        <Route element={<StudentProtectedRoute><StudentLayout /></StudentProtectedRoute>}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/update-profile" element={<UpdateStudentProfile />} />
            <Route path="/student/change-password" element={<StudentChangePassword />} />

            {/* Job browsing & applications */}
            <Route path="/student/jobs" element={<JobBrowse />} />
            <Route path="/student/jobs/:jobId" element={<JobDetail />} />
            <Route path="/student/applications" element={<MyApplications />} />
            <Route path="/student/applications/:appId" element={<ApplicationDetail />} />

            {/* Notifications */}
            <Route path="/student/notifications" element={<Notifications />} />

            {/* Placements */}
            <Route path="/student/placements" element={<MyPlacements />} />

            {/* Training Programs */}
            <Route path="/student/trainings" element={<MyTrainings />} />

            {/* Restrictions */}
            <Route path="/student/restrictions" element={<MyRestrictions />} />

            {/* Override Requests */}
            <Route path="/student/overrides" element={<MyOverrides />} />

            {/* Feedback & Interview Questions */}
            <Route path="/student/feedback" element={<MyFeedback />} />
            <Route path="/student/interview-questions" element={<InterviewQuestions />} />
            {/* <Route path="/student/settings" element={<Settings />} /> */}

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
        </Route>
    </>
);
