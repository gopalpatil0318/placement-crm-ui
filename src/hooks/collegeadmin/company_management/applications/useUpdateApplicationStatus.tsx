import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { updateApplicationStatusSchema } from "@/validators/ApplicationSchema";
import { APPLICATION_STATUS_LABELS } from "@/validators/ApplicationSchema";

// ========================
// HOOK
// ========================

export const useUpdateApplicationStatus = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState("");
    const [remarks, setRemarks] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const reset = useCallback(() => {
        setStatus("");
        setRemarks("");
        setErrors({});
    }, []);

    const mutation = useMutation({
        mutationFn: (params: { applicationId: string; payload: { application_status: string; remarks?: string } }) =>
            CollegeAdminService.updateApplicationStatus(params.applicationId, params.payload),
        onSuccess: (response) => {
            showToast({
                type: "success",
                title: "Status Updated",
                description: response?.message || `Application marked as ${APPLICATION_STATUS_LABELS[status] || status}`,
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.applications(jobId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            reset();
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const apiStatus = error instanceof ApiError ? error.status : undefined;

            showToast({
                type: "error",
                title: apiStatus === 400 ? "Invalid Transition" : apiStatus === 404 ? "Not Found" : apiStatus === 409 ? "Conflict" : "Error",
                description: message,
            });
        },
    });

    const handleSubmit = useCallback(
        (applicationId: string) => {
            const payload: Record<string, unknown> = {
                application_status: status,
            };
            const trimmedRemarks = remarks.trim();
            if (trimmedRemarks) {
                payload.remarks = trimmedRemarks;
            }

            const result = updateApplicationStatusSchema.safeParse(payload);
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
            mutation.mutate({
                applicationId,
                payload: payload as { application_status: string; remarks?: string },
            });
        },
        [status, remarks, mutation],
    );

    return {
        status,
        remarks,
        errors,
        loading: mutation.isPending,
        setStatus,
        setRemarks,
        handleSubmit,
        reset,
    };
};
