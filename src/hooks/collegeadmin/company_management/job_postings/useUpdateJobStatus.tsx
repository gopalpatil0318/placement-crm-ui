import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// HOOK
// ========================

export const useUpdateJobStatus = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ jobId, newStatus }: { jobId: string; newStatus: string }) =>
            CollegeAdminService.updateJobStatus(jobId, newStatus),
        onMutate: async ({ jobId, newStatus }) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            // Snapshot previous value
            const previousJob = queryClient.getQueryData(queryKeys.jobs.detail(jobId));
            // Optimistically update the cache
            if (previousJob && typeof previousJob === "object") {
                queryClient.setQueryData(queryKeys.jobs.detail(jobId), {
                    ...previousJob,
                    job_status: newStatus,
                    allow_applications: newStatus === "published",
                });
            }
            return { previousJob, jobId };
        },
        onSuccess: (response, { jobId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
            showToast({
                type: "success",
                title: "Status Updated",
                description: response?.message || "Job status updated successfully",
            });
            onSuccess?.();
        },
        onError: (error: unknown, _variables, context) => {
            // Rollback on error
            if (context?.previousJob && context?.jobId) {
                queryClient.setQueryData(queryKeys.jobs.detail(context.jobId), context.previousJob);
            }
            const message = error instanceof ApiError ? error.message : "Failed to update status";
            showToast({
                type: "error",
                title: "Status Change Failed",
                description: message,
            });
        },
    });

    const updateStatus = (jobId: string, newStatus: string) => {
        mutation.mutate({ jobId, newStatus });
    };

    return { updateStatus, loading: mutation.isPending };
};
