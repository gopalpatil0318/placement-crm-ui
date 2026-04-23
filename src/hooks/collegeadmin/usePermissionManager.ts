import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { PermissionService } from "@/services/collegeadmin/permission.services"
import { showToast } from "@/utils/ToastUtils"
import type {
  UpdateRolePermissionsPayload,
  CopyPermissionsPayload,
  UpdateUserPermissionsPayload,
  CopyUserPermissionsPayload,
} from "@/types/permission"
import { AxiosError } from "axios"

// ── Role Template Manager ───────────────────────────────────────────────────

export function usePermissionManager() {
  const queryClient = useQueryClient()

  const rolesQuery = useQuery({
    queryKey: queryKeys.permissions.roles(),
    queryFn: PermissionService.getAllRolePermissions,
  })

  const modulesQuery = useQuery({
    queryKey: queryKeys.permissions.available(),
    queryFn: PermissionService.getAvailablePermissions,
    staleTime: Infinity, // Static metadata — never changes at runtime
  })

  const updateMutation = useMutation({
    mutationFn: ({ role, payload }: { role: string; payload: UpdateRolePermissionsPayload }) =>
      PermissionService.updateRolePermissions(role, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles() })
      showToast({ type: "success", title: "Permissions Updated", description: "Role permissions have been saved." })
    },
    onError: (error: Error) => {
      showToast({ type: "error", title: "Update Failed", description: error.message })
    },
  })

  const resetMutation = useMutation({
    mutationFn: (role: string) => PermissionService.resetRoleToDefault(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles() })
      showToast({ type: "success", title: "Reset Complete", description: "Role has been reset to default permissions." })
    },
    onError: (error: Error) => {
      showToast({ type: "error", title: "Reset Failed", description: error.message })
    },
  })

  const copyMutation = useMutation({
    mutationFn: (payload: CopyPermissionsPayload) => PermissionService.copyPermissions(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles() })
      showToast({ type: "success", title: "Permissions Copied", description: "Permissions have been copied successfully." })
    },
    onError: (error: Error) => {
      showToast({ type: "error", title: "Copy Failed", description: error.message })
    },
  })

  return {
    roles: rolesQuery.data ?? [],
    modules: modulesQuery.data ?? [],
    isLoading: rolesQuery.isLoading || modulesQuery.isLoading,
    isError: rolesQuery.isError || modulesQuery.isError,
    error: rolesQuery.error || modulesQuery.error,
    updatePermissions: updateMutation.mutate,
    resetToDefault: resetMutation.mutate,
    copyPermissions: copyMutation.mutate,
    isSaving: updateMutation.isPending || resetMutation.isPending || copyMutation.isPending,
  }
}

// ── Per-User Permission Manager ─────────────────────────────────────────────

export function useUserPermissionManager(filters?: Record<string, unknown>) {
  const queryClient = useQueryClient()

  const usersQuery = useQuery({
    queryKey: queryKeys.permissions.users(filters),
    queryFn: () => PermissionService.getUsersWithPermissions(filters),
  })

  const modulesQuery = useQuery({
    queryKey: queryKeys.permissions.available(),
    queryFn: PermissionService.getAvailablePermissions,
    staleTime: Infinity,
  })

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPermissionsPayload }) =>
      PermissionService.updateUserPermissions(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "users"] })
      showToast({ type: "success", title: "Permissions Updated", description: "User permissions have been saved." })
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      if (error.response?.status === 409) {
        showToast({
          type: "error",
          title: "Conflict",
          description: "Permissions were modified by someone else. Please refresh and try again.",
        })
        queryClient.invalidateQueries({ queryKey: ["permissions", "users"] })
        return
      }
      showToast({ type: "error", title: "Update Failed", description: error.response?.data?.message ?? error.message })
    },
  })

  const resetMutation = useMutation({
    mutationFn: (userId: string) => PermissionService.resetUserToRoleDefault(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "users"] })
      showToast({ type: "success", title: "Reset Complete", description: "User has been reset to role default permissions." })
    },
    onError: (error: Error) => {
      showToast({ type: "error", title: "Reset Failed", description: error.message })
    },
  })

  const copyMutation = useMutation({
    mutationFn: (payload: CopyUserPermissionsPayload) => PermissionService.copyUserPermissions(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "users"] })
      showToast({ type: "success", title: "Permissions Copied", description: "User permissions have been copied successfully." })
    },
    onError: (error: Error) => {
      showToast({ type: "error", title: "Copy Failed", description: error.message })
    },
  })

  return {
    users: usersQuery.data?.users ?? [],
    total: usersQuery.data?.total ?? 0,
    page: usersQuery.data?.page ?? 1,
    limit: usersQuery.data?.limit ?? 25,
    modules: modulesQuery.data ?? [],
    isLoading: usersQuery.isLoading || modulesQuery.isLoading,
    isError: usersQuery.isError || modulesQuery.isError,
    error: usersQuery.error || modulesQuery.error,
    updateUserPermissions: updateMutation.mutate,
    resetUserToDefault: resetMutation.mutate,
    copyUserPermissions: copyMutation.mutate,
    isSaving: updateMutation.isPending || resetMutation.isPending || copyMutation.isPending,
  }
}

/** Hook to fetch a single user's permission detail (permissions + departments) */
export function useUserPermissionDetail(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.permissions.user(userId!),
    queryFn: () => PermissionService.getUserPermissions(userId!),
    enabled: !!userId,
  })
}
