import { useCallback, useContext, useMemo } from "react"
import { CollegeAuthContext } from "@/context/CollegeAuthContext"
import type { ConfigurableRole } from "@/types/auth"
import { CONFIGURABLE_ROLES } from "@/types/auth"

/**
 * Hook for checking dynamic permissions in the college admin portal.
 *
 * Bypass rules (mirrors backend):
 *   - sysadmin + collegeadmin → always returns true (full access)
 *   - student → always returns false (not in this permission system)
 *   - tpo/tpc/hod/teacher → checks against user.permissions array
 */
export function usePermissions() {
  const context = useContext(CollegeAuthContext)

  if (context === undefined) {
    throw new Error("usePermissions must be used within a CollegeAuthProvider")
  }

  const { user, refreshPermissions } = context
  const role = user?.role
  const permissions = user?.permissions

  // sysadmin and collegeadmin always bypass permission checks
  const isBypassRole = role === "sysadmin" || role === "collegeadmin"
  const isConfigurableRole = !!role && CONFIGURABLE_ROLES.includes(role as ConfigurableRole)

  const hasPermission = useCallback(
    (permissionKey: string): boolean => {
      if (!user) return false
      if (isBypassRole) return true
      if (!isConfigurableRole) return false
      return permissions?.includes(permissionKey) ?? false
    },
    [user, isBypassRole, isConfigurableRole, permissions],
  )

  const hasAnyPermission = useCallback(
    (...keys: string[]): boolean => {
      if (!user) return false
      if (isBypassRole) return true
      if (!isConfigurableRole) return false
      return keys.some((k) => permissions?.includes(k) ?? false)
    },
    [user, isBypassRole, isConfigurableRole, permissions],
  )

  const hasAllPermissions = useCallback(
    (...keys: string[]): boolean => {
      if (!user) return false
      if (isBypassRole) return true
      if (!isConfigurableRole) return false
      return keys.every((k) => permissions?.includes(k) ?? false)
    },
    [user, isBypassRole, isConfigurableRole, permissions],
  )

  const deptIds = user?.deptIds ?? []
  const deptScoped = deptIds.length > 0

  return useMemo(
    () => ({
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      permissions: permissions ?? [],
      deptScoped,
      deptIds,
      isBypassRole,
      isConfigurableRole,
      refreshPermissions,
    }),
    [hasPermission, hasAnyPermission, hasAllPermissions, permissions, deptScoped, deptIds, isBypassRole, isConfigurableRole, refreshPermissions],
  )
}
