import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";

// ========================
// HOOK
// ========================

export const useDeleteSkill = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (skillId: string) => CollegeAdminService.deleteSkill(skillId),
        onMutate: async (skillId: string) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.skills.all() });

            const queries = queryClient.getQueriesData<unknown>({
                queryKey: queryKeys.skills.all(),
            });

            const snapshots = new Map<readonly unknown[], unknown>();
            for (const [key, data] of queries) {
                snapshots.set(key, data);
                queryClient.setQueryData(key, (old: unknown) => {
                    if (!old || typeof old !== "object") return old;
                    const d = old as {
                        data?: { skills?: { skill_id: string }[]; categories?: unknown[] };
                        pagination?: { total?: number };
                    };
                    if (!d.data?.skills) return old;
                    const filtered = d.data.skills.filter((s) => s.skill_id !== skillId);
                    return {
                        ...d,
                        data: { ...d.data, skills: filtered },
                        pagination: d.pagination
                            ? { ...d.pagination, total: (d.pagination.total ?? 0) - 1 }
                            : d.pagination,
                    };
                });
            }
            return { snapshots };
        },
        onError: (
            error: unknown,
            _skillId: string,
            context?: { snapshots: Map<readonly unknown[], unknown> },
        ) => {
            if (context?.snapshots) {
                for (const [key, data] of context.snapshots) {
                    queryClient.setQueryData(key, data);
                }
            }
            const message =
                error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            showToast({
                type: "error",
                title: getErrorTitle(status),
                description: message,
            });
        },
        onSuccess: (response) => {
            showToast({
                type: "success",
                title: "Skill Deleted",
                description: response?.message || "Skill deleted successfully",
            });
            onSuccess?.();
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.skills.all() });
        },
    });

    const deleteSkill = useCallback(
        (skillId: string) => {
            mutation.mutate(skillId);
        },
        [mutation],
    );

    return {
        deleteSkill,
        loading: mutation.isPending,
    };
};
