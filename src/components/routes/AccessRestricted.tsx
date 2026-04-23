import { useNavigate } from "react-router-dom"
import { Lock, ArrowRight } from "lucide-react"
import { getFirstAccessiblePath } from "@/constants/permissionMap"
import { useContext } from "react"
import { CollegeAuthContext } from "@/context/CollegeAuthContext"

/**
 * Inline "access restricted" page rendered INSIDE the dashboard layout
 * (sidebar + header stay visible). Shown when a user navigates to a page
 * their role does not have permission for.
 */
export default function AccessRestricted() {
  const navigate = useNavigate()
  const context = useContext(CollegeAuthContext)
  const user = context?.user ?? null

  const targetPath = getFirstAccessiblePath(
    user?.permissions ?? null,
    user?.role ?? null,
  )

  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
          <Lock className="h-7 w-7 text-gray-400 dark:text-gray-500" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Access Restricted
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            You don&apos;t have permission to view this page.
            <br />
            Contact your college admin to update your access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(targetPath, { replace: true })}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm mt-1"
        >
          Go to accessible page
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
