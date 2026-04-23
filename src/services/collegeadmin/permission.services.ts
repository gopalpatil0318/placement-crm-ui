import api from "@/lib/api"
import type {
  PermissionGroup,
  RolePermissionConfig,
  UpdateRolePermissionsPayload,
  CopyPermissionsPayload,
  UserPermissionSummary,
  UserPermissionDetail,
  UpdateUserPermissionsPayload,
  CopyUserPermissionsPayload,
  UserPermissionUpdateResult,
} from "@/types/permission"

export const PermissionService = {
  // ── Role Templates ────────────────────────────────────────────────────────

  /** Get all role permissions for the current college */
  getAllRolePermissions: async (): Promise<RolePermissionConfig[]> => {
    const response = await api.get("/college/permissions/roles")
    return response.data.data.roles
  },

  /** Get available permission modules (UI metadata) */
  getAvailablePermissions: async (): Promise<PermissionGroup[]> => {
    const response = await api.get("/college/permissions/available")
    return response.data.data.modules
  },

  /** Update permissions for a specific role */
  updateRolePermissions: async (
    role: string,
    payload: UpdateRolePermissionsPayload,
  ): Promise<RolePermissionConfig> => {
    const response = await api.put(`/college/permissions/roles/${role}`, payload)
    return response.data.data.role
  },

  /** Reset a role back to its default permissions */
  resetRoleToDefault: async (role: string): Promise<RolePermissionConfig> => {
    const response = await api.post(`/college/permissions/reset/${role}`)
    return response.data.data.role
  },

  /** Copy permissions from one role to another */
  copyPermissions: async (payload: CopyPermissionsPayload): Promise<RolePermissionConfig> => {
    const response = await api.post("/college/permissions/copy", payload)
    return response.data.data.target
  },

  // ── Per-User Permissions ──────────────────────────────────────────────────

  /** Get paginated list of users with their permissions */
  getUsersWithPermissions: async (
    params?: Record<string, unknown>,
  ): Promise<{ users: UserPermissionSummary[]; total: number; page: number; limit: number }> => {
    const response = await api.get("/college/permissions/users", { params })
    return response.data.data
  },

  /** Get single user's permissions + all college departments */
  getUserPermissions: async (userId: string): Promise<UserPermissionDetail> => {
    const response = await api.get(`/college/permissions/users/${userId}`)
    return response.data.data
  },

  /** Update a user's permissions + department assignments */
  updateUserPermissions: async (
    userId: string,
    payload: UpdateUserPermissionsPayload,
  ): Promise<UserPermissionUpdateResult> => {
    const response = await api.put(`/college/permissions/users/${userId}`, payload)
    return response.data.data.config
  },

  /** Reset user to their role's default permissions */
  resetUserToRoleDefault: async (userId: string): Promise<UserPermissionUpdateResult> => {
    const response = await api.post(`/college/permissions/users/${userId}/reset`)
    return response.data.data.config
  },

  /** Copy permissions from one user to another */
  copyUserPermissions: async (
    payload: CopyUserPermissionsPayload,
  ): Promise<UserPermissionUpdateResult> => {
    const response = await api.post("/college/permissions/users/copy", payload)
    return response.data.data.config
  },
}
