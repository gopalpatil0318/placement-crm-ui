import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// HOOK
// ========================

export const useUpdatePositionStatus = (onSuccess?: () => void) => {
    const [loading, setLoading] = useState(false);

    const updateStatus = useCallback(
        async (positionId: string, newStatus: string) => {
            setLoading(true);
            try {
                const response = await CollegeAdminService.updatePositionStatus(positionId, newStatus);
                showToast({
                    type: "success",
                    title: "Status Updated",
                    description: response?.message || `Position status changed to ${newStatus}`,
                });
                onSuccess?.();
            } catch (error: unknown) {
                const axiosErr = error as AxiosError<{ error?: string; message?: string }>;
                const errorMsg =
                    axiosErr?.response?.data?.error ||
                    axiosErr?.response?.data?.message ||
                    (error instanceof Error ? error.message : "Failed to update status");
                showToast({ type: "error", title: "Status Change Failed", description: errorMsg });
            } finally {
                setLoading(false);
            }
        },
        [onSuccess]
    );

    return { updateStatus, loading };
};
