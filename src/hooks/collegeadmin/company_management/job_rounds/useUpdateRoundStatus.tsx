import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// STATUS TRANSITIONS
// ========================

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    pending: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

export const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

export const TRANSITION_LABELS: Record<string, string> = {
    in_progress: "Start Round",
    completed: "Mark Complete",
    cancelled: "Cancel Round",
};

// ========================
// HOOK
// ========================

export const useUpdateRoundStatus = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (args: { roundId: string; newStatus: string }) =>
            CollegeAdminService.updateRoundStatus(args.roundId, args.newStatus),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.rounds(jobId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || `Round is now ${STATUS_LABELS[variables.newStatus] || variables.newStatus}`,
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            showToast({
                type: "error",
                title: status === 400 ? "Invalid Action" : status === 404 ? "Not Found" : "Error",
                description: message,
            });
        },
    });

    const updateStatus = useCallback(
        (roundId: string, newStatus: string) => {
            mutation.mutate({ roundId, newStatus });
        },
        [mutation]
    );

    return {
        loading: mutation.isPending,
        updateStatus,
        ALLOWED_TRANSITIONS,
        STATUS_LABELS,
        TRANSITION_LABELS,
    };
};
