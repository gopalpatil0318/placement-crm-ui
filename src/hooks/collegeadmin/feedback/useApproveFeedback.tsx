import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";

// ========================
// HOOK
// ========================

export function useApproveFeedback() {
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

    const invalidateCache = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all() });
    }, [queryClient]);

    const approveMutation = useMutation({
        mutationFn: ({ feedbackId, is_approved }: { feedbackId: string; is_approved: boolean }) =>
            CollegeAdminService.approveFeedback(feedbackId, is_approved),
        onSuccess: (response: unknown) => {
            invalidateCache();
            const msg = (response as { message?: string })?.message || "Feedback updated";
            showToast({ type: "success", title: "Success", description: msg });
            setProcessingId(null);
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;
            if (status === 404) {
                showToast({ type: "error", title: "Not Found", description: message });
            } else if (status === 429) {
                showToast({ type: "error", title: "Rate Limited", description: "Too many requests, please slow down" });
            } else {
                showToast({ type: "error", title: "Error", description: message });
            }
            setProcessingId(null);
        },
    });

    const approve = useCallback((feedbackId: string) => {
        setProcessingId(feedbackId);
        approveMutation.mutate({ feedbackId, is_approved: true });
    }, [approveMutation]);

    const reject = useCallback((feedbackId: string) => {
        setProcessingId(feedbackId);
        approveMutation.mutate({ feedbackId, is_approved: false });
    }, [approveMutation]);

    const bulkAction = useCallback(async (feedbackIds: string[], is_approved: boolean) => {
        setBulkProcessing(true);
        setBulkProgress({ done: 0, total: feedbackIds.length });
        let successCount = 0;
        let failCount = 0;

        for (const id of feedbackIds) {
            try {
                await CollegeAdminService.approveFeedback(id, is_approved);
                successCount++;
            } catch {
                failCount++;
            }
            setBulkProgress((prev) => ({ ...prev, done: prev.done + 1 }));
        }

        invalidateCache();
        setBulkProcessing(false);
        setBulkProgress({ done: 0, total: 0 });

        if (failCount === 0) {
            showToast({
                type: "success",
                title: "Bulk Update Complete",
                description: `${successCount} feedback item${successCount !== 1 ? "s" : ""} ${is_approved ? "approved" : "rejected"}`,
            });
        } else {
            showToast({
                type: "warning",
                title: "Partial Success",
                description: `${successCount} succeeded, ${failCount} failed`,
            });
        }
    }, [invalidateCache]);

    return {
        approve,
        reject,
        bulkAction,
        processingId,
        bulkProcessing,
        bulkProgress,
        isApproving: approveMutation.isPending,
    };
}
