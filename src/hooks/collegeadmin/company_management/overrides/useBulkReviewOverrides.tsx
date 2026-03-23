import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { bulkReviewOverrideSchema } from "@/validators/OverrideSchema";

// ========================
// TYPES
// ========================

interface BulkReviewFormErrors {
    override_ids?: string;
    action?: string;
    review_notes?: string;
    rejection_reason?: string;
}

interface BulkReviewResult {
    action: string;
    processed: number;
    skipped: number;
    skipped_ids: string[];
}

// ========================
// HOOK
// ========================

export const useBulkReviewOverrides = (jobId?: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    const [action, setAction] = useState<"approve" | "reject" | "">("");
    const [reviewNotes, setReviewNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [errors, setErrors] = useState<BulkReviewFormErrors>({});
    const [bulkResult, setBulkResult] = useState<BulkReviewResult | null>(null);

    // Refs to avoid deps bloat on handleSubmit
    const actionRef = useRef<"approve" | "reject" | "">("");
    const reviewNotesRef = useRef("");
    const rejectionReasonRef = useRef("");

    const mutation = useMutation({
        mutationFn: (payload: { override_ids: string[]; action: string; review_notes?: string; rejection_reason?: string }) =>
            CollegeAdminService.bulkReviewOverrides(payload),
        onSuccess: (response) => {
            const currentAction = actionRef.current;
            const data = response.data || response;
            const processed = data.processed ?? 0;
            const skipped = data.skipped ?? 0;

            setBulkResult({
                action: currentAction,
                processed,
                skipped,
                skipped_ids: Array.isArray(data.skipped_ids) ? data.skipped_ids : [],
            });

            const parts: string[] = [];
            if (processed > 0) parts.push(`${processed} ${currentAction}d`);
            if (skipped > 0) parts.push(`${skipped} skipped (already reviewed)`);

            queryClient.invalidateQueries({ queryKey: queryKeys.overrides.all() });
            if (jobId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.jobs.overrides(jobId) });
                queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            }
            showToast({
                type: "success",
                title: "Bulk Review Complete",
                description: parts.join(", ") || "Bulk review processed",
            });

            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            showToast({ type: "error", title: "Error", description: message });
        },
    });

    const handleActionChange = useCallback((value: "approve" | "reject") => {
        setAction(value);
        actionRef.current = value;
        setErrors((prev) => {
            if (!prev.action) return prev;
            return { ...prev, action: undefined };
        });
        if (value === "approve") {
            setErrors((prev) => {
                if (!prev.rejection_reason) return prev;
                return { ...prev, rejection_reason: undefined };
            });
        }
    }, []);

    const handleReviewNotesChange = useCallback((value: string) => {
        setReviewNotes(value);
        reviewNotesRef.current = value;
        setErrors((prev) => {
            if (!prev.review_notes) return prev;
            return { ...prev, review_notes: undefined };
        });
    }, []);

    const handleRejectionReasonChange = useCallback((value: string) => {
        setRejectionReason(value);
        rejectionReasonRef.current = value;
        setErrors((prev) => {
            if (!prev.rejection_reason) return prev;
            return { ...prev, rejection_reason: undefined };
        });
    }, []);

    const handleSubmit = useCallback(
        (overrideIds: string[]) => {
            if (mutation.isPending) return;

            const currentAction = actionRef.current;
            const currentNotes = reviewNotesRef.current;
            const currentReason = rejectionReasonRef.current;

            if (!currentAction) {
                setErrors({ action: "Please select an action" });
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: "Please select approve or reject",
                });
                return;
            }

            const payload = {
                override_ids: overrideIds,
                action: currentAction as "approve" | "reject",
                review_notes: currentNotes || undefined,
                rejection_reason: currentAction === "reject" ? currentReason : undefined,
            };

            // Zod validation
            const result = bulkReviewOverrideSchema.safeParse(payload);
            if (!result.success) {
                const fieldErrors: BulkReviewFormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof BulkReviewFormErrors;
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
            setBulkResult(null);

            const apiPayload: Record<string, unknown> = {
                override_ids: overrideIds,
                action: currentAction,
            };
            if (currentNotes.trim()) {
                apiPayload.review_notes = currentNotes.trim();
            }
            if (currentAction === "reject" && currentReason.trim()) {
                apiPayload.rejection_reason = currentReason.trim();
            }

            mutation.mutate(
                apiPayload as { override_ids: string[]; action: string; review_notes?: string; rejection_reason?: string },
            );
        },
        [mutation],
    );

    const reset = useCallback(() => {
        setAction("");
        setReviewNotes("");
        setRejectionReason("");
        actionRef.current = "";
        reviewNotesRef.current = "";
        rejectionReasonRef.current = "";
        setErrors({});
        setBulkResult(null);
    }, []);

    return {
        action,
        reviewNotes,
        rejectionReason,
        errors,
        loading: mutation.isPending,
        bulkResult,
        handleActionChange,
        handleReviewNotesChange,
        handleRejectionReasonChange,
        handleSubmit,
        reset,
    };
};
