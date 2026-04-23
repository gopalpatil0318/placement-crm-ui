/**
 * ============================================================================
 * PERMISSION MAP — Maps frontend paths to backend permission keys.
 *
 * Used by: Sidebar, ProtectedRoute, CommandPalette to filter navigation
 * and guard routes based on the user's dynamic permissions.
 *
 * Paths not listed here are accessible to any authenticated college user.
 * Paths with `null` require the admin-only role check (not permission-based).
 * ============================================================================
 */

// ─── Path → Permission(s) mapping ───────────────────────────────────────────────

export const PATH_PERMISSIONS: Record<string, string | string[]> = {
  // Dashboard
  "/college/dashboard": "dashboard.view",

  // Companies
  "/college/companies": "companies.view",
  "/college/create-company": "companies.create",
  "/college/update-company": "companies.update",
  "/college/company": "companies.view",

  // Jobs
  "/college/jobs": "jobs.view",
  "/college/create-job": "jobs.create",
  "/college/job": "jobs.view",
  "/college/overrides": "overrides.view",

  // Placements
  "/college/placements": "placements.view",
  "/college/placement-policies": "policies.view",
  "/college/self-reports": "self_reports.view",

  // Students
  "/college/students": "students.view",
  "/college/create-student": "students.create",
  "/college/bulk-register": "students.create",
  "/college/student": "students.view",

  // Verification
  "/college/verifications": "verification.view",

  // Restrictions
  "/college/restrictions": "restrictions.view",

  // Departments
  "/college/departments": "departments.view",
  "/college/create-department": "departments.manage",
  "/college/update-department": "departments.manage",
  "/college/department": "departments.view",

  // Skills
  "/college/skills": "skills.view",

  // Training
  "/college/training-programs": "training.view",
  "/college/create-training-program": "training.manage",
  "/college/training-program": "training.view",

  // Feedback
  "/college/feedback": "feedback.view",
  "/college/interview-questions": "feedback.view",

  // Notifications
  "/college/send-notification": "notifications.send",
  "/college/notification-history": "notifications.view",

  // Settings
  "/college/company-tiers": "settings.view",
  "/college/placement-settings": "settings.view",
  "/college/verification-settings": "settings.view",

  // Users (admin only — bypassed by isBypassRole)
  "/college/view-users": "users.view",
  "/college/create-user": "users.manage",
  "/college/update-user": "users.manage",
  "/college/user": "users.view",

  // Audit (admin only — bypassed by isBypassRole)
  "/college/audit-logs": "audit.view",

  // Permission Manager (admin only — bypassed by isBypassRole)
  "/college/permissions": "users.manage",
}

// ─── Nav item label → permission(s) mapping ─────────────────────────────────────
// Used by the sidebar to filter entire nav groups by permission.
// Keys are nav item labels (from the sidebar navItems array).

export const NAV_PERMISSIONS: Record<string, string | string[]> = {
  Dashboard: "dashboard.view",
  Companies: "companies.view",
  "Job Postings": ["jobs.view", "applications.view", "overrides.view"],
  Placements: ["placements.view", "self_reports.view"],
  Students: "students.view",
  "Verification Center": "verification.view",
  "Student Restrictions": "restrictions.view",
  Departments: "departments.view",
  "Skills Master": "skills.view",
  "Training Programs": "training.view",
  Policies: "policies.view",
  "Feedback & Reviews": "feedback.view",
  Notifications: ["notifications.view", "notifications.send"],
  Settings: ["settings.view", "settings.manage"],
}

// ─── Sub-item path → permission mapping ─────────────────────────────────────────
// Used for filtering individual sub-items within a nav group.

export const SUB_ITEM_PERMISSIONS: Record<string, string> = {
  "/college/companies": "companies.view",
  "/college/create-company": "companies.create",
  "/college/jobs": "jobs.view",
  "/college/create-job": "jobs.create",
  "/college/overrides": "overrides.view",
  "/college/placements": "placements.view",
  "/college/placements/stats": "placements.view",
  "/college/self-reports": "self_reports.view",
  "/college/students": "students.view",
  "/college/create-student": "students.create",
  "/college/bulk-register": "students.create",
  "/college/departments": "departments.view",
  "/college/create-department": "departments.manage",
  "/college/training-programs": "training.view",
  "/college/create-training-program": "training.manage",
  "/college/placement-policies": "policies.view",
  "/college/feedback": "feedback.view",
  "/college/interview-questions": "feedback.view",
  "/college/send-notification": "notifications.send",
  "/college/notification-history": "notifications.view",
  "/college/company-tiers": "settings.view",
  "/college/placement-settings": "settings.view",
  "/college/verification-settings": "settings.view",
  "/college/change-password": "",  // Always visible
  "/college/view-users": "users.view",
  "/college/create-user": "users.manage",
}

// ─── Edit-page mutation permissions ──────────────────────────────────────────
// When a path ends with /edit, the user needs the mutation permission, not just .view.
// Keys are the base path (before /:id/edit).

const EDIT_PERMISSIONS: Record<string, string> = {
  "/college/job": "jobs.update",
  "/college/student": "students.update",
  "/college/training-program": "training.manage",
}

// ─── Smart redirect priority chain ──────────────────────────────────────────────

const REDIRECT_CHAIN: Array<{ path: string; permission: string }> = [
  { path: "/college/dashboard", permission: "dashboard.view" },
  { path: "/college/students", permission: "students.view" },
  { path: "/college/jobs", permission: "jobs.view" },
  { path: "/college/companies", permission: "companies.view" },
  { path: "/college/training-programs", permission: "training.view" },
]

/**
 * Return the first path the user is permitted to access.
 * Bypass roles (sysadmin, collegeadmin) always get /college/dashboard.
 * Falls back to /college/my-profile (no permission required).
 */
export function getFirstAccessiblePath(
  permissions: string[] | null | undefined,
  role: string | null | undefined,
): string {
  // Bypass roles always go to dashboard
  if (role === "sysadmin" || role === "collegeadmin") {
    return "/college/dashboard"
  }

  const perms = permissions ?? []
  for (const { path, permission } of REDIRECT_CHAIN) {
    if (perms.includes(permission)) return path
  }

  // Ultimate fallback — always accessible (not in PATH_PERMISSIONS)
  return "/college/my-profile"
}

/**
 * Check if a user with given permissions can access a specific path.
 * Returns true for bypass roles (sysadmin, collegeadmin).
 */
export function canAccessPath(
  path: string,
  hasPermission: (key: string) => boolean,
  hasAnyPermission: (...keys: string[]) => boolean,
): boolean {
  // Find matching path key (handle dynamic segments like /college/job/:jobId)
  const permKey = findPathPermission(path)
  if (permKey === undefined) return true // No permission required

  if (Array.isArray(permKey)) {
    return hasAnyPermission(...permKey)
  }
  return hasPermission(permKey)
}

/** Find the permission key for a path, handling dynamic segments */
function findPathPermission(path: string): string | string[] | undefined {
  // Direct match
  if (PATH_PERMISSIONS[path] !== undefined) return PATH_PERMISSIONS[path]

  // Edit-suffix check (before prefix match) — /college/job/:id/edit → jobs.update
  if (path.endsWith("/edit")) {
    const basePath = path.replace(/\/[^/]+\/edit$/, "")
    const editPerm = EDIT_PERMISSIONS[basePath]
    if (editPerm) return editPerm
  }

  // Prefix match (for paths with dynamic params like /college/job/:jobId)
  for (const [prefix, perm] of Object.entries(PATH_PERMISSIONS)) {
    if (path.startsWith(prefix + "/")) return perm
  }

  return undefined
}
