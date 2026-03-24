import { Link, useLocation } from "react-router-dom"
import { Home } from "lucide-react"

export default function NotFound() {
  const { pathname } = useLocation()
  const homeRoute = pathname.startsWith("/student") ? "/student/dashboard" : "/"

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-700">404</h1>
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
        Page not found
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to={homeRoute}
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        <Home size={16} />
        Go Home
      </Link>
    </div>
  )
}
