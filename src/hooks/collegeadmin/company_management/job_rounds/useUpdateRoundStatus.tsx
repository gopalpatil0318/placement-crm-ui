import { useState, useCallback } from "react";
import { AxiosError } from "axios";
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

export const useUpdateRoundStatus = (onSuccess?: () => void) => {
    const [loading, setLoading] = useState(false);

    const updateStatus = useCallback(
        async (roundId: string, newStatus: string) => {
            setLoading(true);

            try {
                const response = await CollegeAdminService.updateRoundStatus(roundId, newStatus);

                showToast({
                    type: "success",
                    title: "Success",
                    description: response?.message || `Round is now ${STATUS_LABELS[newStatus] || newStatus}`,
                });
                onSuccess?.();
            } catch (error: unknown) {
                const axiosErr = error as AxiosError<{ error?: string; message?: string }>;
                const errorMsg =
                    axiosErr?.response?.data?.error ||
                    axiosErr?.response?.data?.message ||
                    (error instanceof Error ? error.message : "Something went wrong");
                showToast({ type: "error", title: "Error", description: errorMsg });
            } finally {
                setLoading(false);
            }
        },
        [onSuccess]
    );

    return {
        loading,
        updateStatus,
        ALLOWED_TRANSITIONS,
        STATUS_LABELS,
        TRANSITION_LABELS,
    };
};
