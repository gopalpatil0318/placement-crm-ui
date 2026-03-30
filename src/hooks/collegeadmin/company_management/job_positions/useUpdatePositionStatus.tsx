import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// HOOK
// ========================

export const useUpdatePositionStatus = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ positionId, newStatus }: { positionId: string; newStatus: string }) =>
            CollegeAdminService.updatePositionStatus(positionId, newStatus),
        onMutate: async ({ positionId, newStatus }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            const previousJob = queryClient.getQueryData(queryKeys.jobs.detail(jobId));
            // Optimistically update position_status within the job's positions array
            if (previousJob && typeof previousJob === "object" && "positions" in previousJob && Array.isArray((previousJob as Record<string, unknown>).positions)) {
                const jobData = previousJob as Record<string, unknown>;
                const positions = (jobData.positions as Array<Record<string, unknown>>).map((p) =>
                    p.position_id === positionId ? { ...p, position_status: newStatus } : p
                );
                queryClient.setQueryData(queryKeys.jobs.detail(jobId), { ...jobData, positions });
            }
            return { previousJob };
        },
        onSuccess: (response, { newStatus }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.positions(jobId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            showToast({
                type: "success",
                title: "Status Updated",
                description: response?.message || `Position status changed to ${newStatus}`,
            });
            onSuccess?.();
        },
        onError: (error: unknown, _variables, context) => {
            if (context?.previousJob) {
                queryClient.setQueryData(queryKeys.jobs.detail(jobId), context.previousJob);
            }
            const message = error instanceof ApiError ? error.message : "Failed to update status";
            showToast({ type: "error", title: "Status Change Failed", description: message });
        },
    });

    const updateStatus = useCallback(
        (positionId: string, newStatus: string) => {
            mutation.mutate({ positionId, newStatus });
        },
        [mutation]
    );

    return { updateStatus, loading: mutation.isPending };
};
