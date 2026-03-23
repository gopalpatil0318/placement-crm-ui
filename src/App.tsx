import { Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import { SysAdminAuthProvider } from "./context/SysAdminAuthContext"
import { CollegeAuthProvider } from "./context/CollegeAuthContext"
import { StudentAuthProvider } from "./context/students/StudentAuthContext"
import ErrorBoundary from "./components/ui/ErrorBoundary"
import PageLoadingSkeleton from "./components/ui/PageLoadingSkeleton"
import SmartRedirect from "./components/routes/SmartRedirect"
import { sysadminRoutes } from "./routes/sysadminRoutes"
import { collegeAdminRoutes } from "./routes/collegeAdminRoutes"
import { studentRoutes } from "./routes/studentRoutes"
import './App.css'

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">403</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <SysAdminAuthProvider>
      <CollegeAuthProvider>
        <StudentAuthProvider>
          <Router>
            <Suspense fallback={<PageLoadingSkeleton />}>
              <ErrorBoundary>
                <Routes>
                  {sysadminRoutes}
                  {collegeAdminRoutes}
                  {studentRoutes}

                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route path="/" element={<SmartRedirect />} />
                  <Route path="*" element={<SmartRedirect />} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
          </Router>
        </StudentAuthProvider>
      </CollegeAuthProvider>
    </SysAdminAuthProvider>
  )
}

export default App