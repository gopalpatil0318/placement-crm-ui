import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { bulkUpdateStatusSchema } from "@/validators/ApplicationSchema";

// ========================
// TYPES
// ========================

export interface BulkUpdateResult {
    new_status: string;
    summary: {
        total_requested: number;
        updated: number;
        skipped: number;
        errors: number;
    };
    updated_ids: string[];
    skipped: Array<{
        application_id: string;
        student_name: string;
        current_status: string;
        reason: string;
    }>;
    errors: Array<{
        application_id: string;
        reason: string;
    }>;
}

// ========================
// HOOK
// ========================

export const useBulkUpdateStatus = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState("");
    const [remarks, setRemarks] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [bulkResult, setBulkResult] = useState<BulkUpdateResult | null>(null);

    const mutation = useMutation({
        mutationFn: (payload: { application_ids: string[]; application_status: string; remarks?: string }) =>
            CollegeAdminService.bulkUpdateApplicationStatus(payload),
        onSuccess: (response) => {
            const data: BulkUpdateResult = response.data || response;
            setBulkResult(data);

            const updated = data.summary?.updated ?? 0;
            const skipped = data.summary?.skipped ?? 0;

            showToast({
                type: skipped > 0 ? "warning" : "success",
                title: "Bulk Update Complete",
                description: response?.message || `${updated} updated, ${skipped} skipped`,
            });

            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.applications(jobId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const apiStatus = error instanceof ApiError ? error.status : undefined;

            showToast({
                type: "error",
                title: getErrorTitle(apiStatus),
                description: message,
            });
        },
    });

    const reset = useCallback(() => {
        setStatus("");
        setRemarks("");
        setErrors({});
        setBulkResult(null);
    }, []);

    const handleSubmit = useCallback(
        (selectedIds: string[]) => {
            const payload: Record<string, unknown> = {
                application_ids: selectedIds,
                application_status: status,
            };
            const trimmedRemarks = remarks.trim();
            if (trimmedRemarks) {
                payload.remarks = trimmedRemarks;
            }

            const result = bulkUpdateStatusSchema.safeParse(payload);
            if (!result.success) {
                const fieldErrors: Record<string, string> = {};
                for (const issue of result.error.issues) {
                    const field = String(issue.path[0]);
                    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
                }
                setErrors(fieldErrors);
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: result.error.issues[0].message,
                });
                return;
            }

            setErrors({});
            mutation.mutate(payload as { application_ids: string[]; application_status: string; remarks?: string });
        },
        [status, remarks, mutation],
    );

    return {
        status,
        remarks,
        errors,
        loading: mutation.isPending,
        bulkResult,
        setStatus,
        setRemarks,
        handleSubmit,
        reset,
    };
};
