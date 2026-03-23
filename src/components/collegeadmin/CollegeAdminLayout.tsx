import { Outlet } from "react-router-dom"
import DashboardLayout from "./DashboardLayout"

/**
 * Shared layout route for all /college/* pages.
 * DashboardLayout (sidebar + header) stays mounted across navigations —
 * only the <Outlet /> content area re-renders when the route changes.
 */
export default function CollegeAdminLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
