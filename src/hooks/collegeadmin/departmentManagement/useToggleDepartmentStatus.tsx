import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import type { Department } from "./useViewDepartments";

interface ToggleContext {
    previousList: unknown;
    previousDetail: unknown;
}

export const useToggleDepartmentStatus = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<unknown, unknown, { deptId: string; newStatus: boolean }, ToggleContext>({
        mutationFn: ({ deptId, newStatus }) =>
            CollegeAdminService.toggleDepartmentStatus(deptId, newStatus),

        // Optimistic update — flip status badge instantly
        onMutate: async ({ deptId, newStatus }) => {
            // Cancel in-flight refetches so they don't overwrite optimistic data
            await queryClient.cancelQueries({ queryKey: queryKeys.departments.all() });
            await queryClient.cancelQueries({ queryKey: queryKeys.departments.detail(deptId) });

            // Snapshot previous cache for rollback
            const previousList = queryClient.getQueriesData({ queryKey: queryKeys.departments.all() });
            const previousDetail = queryClient.getQueryData(queryKeys.departments.detail(deptId));

            // Optimistically update all matching list caches
            queryClient.setQueriesData<{ data?: Department[]; pagination?: unknown }>(
                { queryKey: queryKeys.departments.all() },
                (old) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: old.data.map((d) =>
                            d.dept_id === deptId ? { ...d, is_active: newStatus } : d
                        ),
                    };
                }
            );

            // Optimistically update detail cache
            queryClient.setQueryData(
                queryKeys.departments.detail(deptId),
                (old: { data?: Department } | undefined) => {
                    if (!old?.data) return old;
                    return { ...old, data: { ...old.data, is_active: newStatus } };
                }
            );

            return { previousList, previousDetail };
        },

        onSuccess: (response, { deptId, newStatus }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(deptId) });
            showToast({
                type: "success",
                title: "Status Updated",
                description:
                    (response as { message?: string })?.message ||
                    `Department ${newStatus ? "activated" : "deactivated"} successfully`,
            });
        },

        // Rollback on error
        onError: (error, { deptId }, context) => {
            if (context?.previousList) {
                for (const [key, data] of context.previousList as [unknown[], unknown][]) {
                    queryClient.setQueryData(key, data);
                }
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(queryKeys.departments.detail(deptId), context.previousDetail);
            }
            const message = error instanceof ApiError ? error.message : "Failed to toggle department status";
            showToast({ type: "error", title: "Error", description: message });
        },
    });

    const toggleStatus = (
        deptId: string,
        currentStatus: boolean,
        onSuccess?: () => void
    ) => {
        mutation.mutate(
            { deptId, newStatus: !currentStatus },
            { onSuccess: () => onSuccess?.() }
        );
    };

    return {
        toggleStatus,
        loading: mutation.isPending,
    };
};
