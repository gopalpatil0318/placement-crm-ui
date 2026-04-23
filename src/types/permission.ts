// Permission management types — matches backend PERMISSION_MODULES structure

export interface PermissionAction {
  key: string
  label: string
  description: string
}

export interface PermissionModule {
  key: string
  label: string
  description: string
  actions: PermissionAction[]
}

export interface PermissionGroup {
  group: string
  modules: PermissionModule[]
}

// ── Role Template Types ─────────────────────────────────────────────────────

export interface RolePermissionConfig {
  role: string
  permissions: string[]
  dept_scoped: boolean
  updated_at: string | null
}

export interface UpdateRolePermissionsPayload {
  permissions: string[]
  dept_scoped: boolean
}

export interface CopyPermissionsPayload {
  source_role: string
  target_role: string
}

// ── Per-User Permission Types ───────────────────────────────────────────────

export interface UserDepartment {
  dept_id: string
  dept_name: string
}

export interface CollegeDepartment {
  dept_id: string
  dept_name: string
  dept_code: string | null
}

/** Summary returned in the users list (GET /permissions/users) */
export interface UserPermissionSummary {
  user_id: string
  user_name: string
  user_email: string
  user_role: "tpo" | "tpc" | "hod" | "teacher"
  user_status: "active" | "inactive"
  permissions: string[]
  permissions_updated_at: string | null
  departments: UserDepartment[]
}

/** Detail returned for a single user (GET /permissions/users/:userId) */
export interface UserPermissionDetail {
  user: UserPermissionSummary
  allDepartments: CollegeDepartment[]
}

/** Payload for PUT /permissions/users/:userId */
export interface UpdateUserPermissionsPayload {
  permissions: string[]
  dept_ids: string[]
  expected_updated_at?: string
}

/** Payload for POST /permissions/users/copy */
export interface CopyUserPermissionsPayload {
  source_user_id: string
  target_user_id: string
}

/** Response from update/reset/copy user permissions */
export interface UserPermissionUpdateResult {
  permissions: string[]
  updated_at: string
  dept_ids: string[]
}
