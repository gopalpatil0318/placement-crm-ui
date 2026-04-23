import { Outlet, useLocation } from "react-router-dom"
import { useContext } from "react"
import DashboardLayout from "./DashboardLayout"
import { YearFilterProvider } from "@/context/YearFilterContext"
import { CollegeAuthContext } from "@/context/CollegeAuthContext"
import { canAccessPath } from "@/constants/permissionMap"
import { CONFIGURABLE_ROLES } from "@/types/auth"
import type { ConfigurableRole } from "@/types/auth"
import AccessRestricted from "@/components/routes/AccessRestricted"

/**
 * Shared layout route for all /college/* pages.
 * DashboardLayout (sidebar + header) stays mounted across navigations —
 * only the <Outlet /> content area re-renders when the route changes.
 *
 * Permission checks happen HERE so the sidebar + header always render,
 * and only the content area shows AccessRestricted when denied.
 */
export default function CollegeAdminLayout() {
  const location = useLocation()
  const auth = useContext(CollegeAuthContext)
  const user = auth?.user ?? null

  // Determine if current route is permission-blocked
  let blocked = false
  if (user) {
    const role = user.role
    const isBypass = role === "sysadmin" || role === "collegeadmin"
    const isConfigurable = CONFIGURABLE_ROLES.includes(role as ConfigurableRole)

    if (!isBypass && isConfigurable) {
      const perms = user.permissions ?? []
      const hasPermission = (key: string) => perms.includes(key)
      const hasAnyPermission = (...keys: string[]) => keys.some((k) => perms.includes(k))
      blocked = !canAccessPath(location.pathname, hasPermission, hasAnyPermission)
    }
  }

  return (
    <YearFilterProvider>
      <DashboardLayout>
        {blocked ? <AccessRestricted /> : <Outlet />}
      </DashboardLayout>
    </YearFilterProvider>
  )
}
