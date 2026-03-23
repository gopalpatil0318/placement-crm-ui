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
        onError: (error: unknown) => {
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
