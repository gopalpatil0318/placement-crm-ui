import { Suspense, useMemo, type ReactNode } from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import { CollegeTenantProvider } from "./context/CollegeTenantContext"
import { SysAdminAuthProvider } from "./context/SysAdminAuthContext"
import { CollegeAuthProvider } from "./context/CollegeAuthContext"
import { StudentAuthProvider } from "./context/students/StudentAuthContext"
import { getSubdomain } from "./lib/subdomain"
import ErrorBoundary from "./components/ui/ErrorBoundary"
import PageLoadingSkeleton from "./components/ui/PageLoadingSkeleton"
import SmartRedirect from "./components/routes/SmartRedirect"
import { useOnlineStatus } from "./hooks/useOnlineStatus"
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

// ── Conditional auth provider wrapper ──────────────────────────────────
// Only mount the auth providers relevant to the current subdomain.
// "admin" subdomain → SysAdminAuthProvider only
// College subdomain → CollegeAuthProvider + StudentAuthProvider only
// This eliminates redundant localStorage reads, JSON parsing, and
// context re-renders from the 2 unused auth providers per session.
function AuthProviders({ children }: Readonly<{ children: ReactNode }>) {
  const subdomain = useMemo(() => getSubdomain(), [])

  if (subdomain === "admin") {
    return <SysAdminAuthProvider>{children}</SysAdminAuthProvider>
  }

  // College subdomain (or dev localhost) — students belong to colleges
  return (
    <CollegeAuthProvider>
      <StudentAuthProvider>{children}</StudentAuthProvider>
    </CollegeAuthProvider>
  )
}

function App() {
  useOnlineStatus()

  // Detect subdomain once — determines which routes to mount.
  // Admin subdomain only registers sysadmin routes; college subdomains
  // only register college + student routes. This prevents auth hooks
  // from throwing when their provider isn't in the tree.
  const subdomain = useMemo(() => getSubdomain(), [])
  const isAdmin = subdomain === "admin"

  return (
    <ErrorBoundary>
      <CollegeTenantProvider>
        <AuthProviders>
          <Router>
            <Suspense fallback={<PageLoadingSkeleton />}>
              <Routes>
                {isAdmin ? sysadminRoutes : (
                  <>
                    {collegeAdminRoutes}
                    {studentRoutes}
                  </>
                )}

                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/" element={<SmartRedirect />} />
                <Route path="*" element={<SmartRedirect />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProviders>
      </CollegeTenantProvider>
    </ErrorBoundary>
  )
}

export default App