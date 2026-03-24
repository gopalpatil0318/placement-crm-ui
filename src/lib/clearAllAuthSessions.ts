const AUTH_STORAGE_KEYS = {
  student: "student_user",
  college: "college_user",
  sysadmin: "sysadmin_user",
} as const

type AuthRole = keyof typeof AUTH_STORAGE_KEYS

/**
 * Clears localStorage for all auth sessions EXCEPT the specified role.
 * Call this after a successful login to enforce single-session policy —
 * a user cannot be simultaneously logged in as student, college admin, and sysadmin.
 */
export function clearOtherSessions(keepRole: AuthRole): void {
  for (const [role, key] of Object.entries(AUTH_STORAGE_KEYS)) {
    if (role !== keepRole) {
      localStorage.removeItem(key)
    }
  }
}
