import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { reviewOverrideSchema } from "@/validators/OverrideSchema";

// ========================
// TYPES
// ========================

interface ReviewFormErrors {
    action?: string;
    review_notes?: string;
    rejection_reason?: string;
}

// ========================
// HOOK
// ========================

export const useReviewOverride = (jobId?: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    const [action, setAction] = useState<"approve" | "reject" | "">("");
    const [reviewNotes, setReviewNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [errors, setErrors] = useState<ReviewFormErrors>({});

    // Refs to avoid deps bloat on handleSubmit
    const actionRef = useRef<"approve" | "reject" | "">("");
    const reviewNotesRef = useRef("");
    const rejectionReasonRef = useRef("");

    const mutation = useMutation({
        mutationFn: ({ overrideId, payload }: { overrideId: string; payload: { action: string; review_notes?: string; rejection_reason?: string } }) =>
            CollegeAdminService.reviewOverrideRequest(overrideId, payload),
        onSuccess: (response) => {
            const currentAction = actionRef.current;
            queryClient.invalidateQueries({ queryKey: queryKeys.overrides.all() });
            if (jobId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.jobs.overrides(jobId) });
                queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            }
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || `Override request ${currentAction}d successfully`,
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 404) {
                showToast({ type: "error", title: "Not Found", description: message });
            } else if (status === 409) {
                showToast({ type: "error", title: "Already Reviewed", description: message });
            } else {
                showToast({ type: "error", title: "Error", description: message });
            }
        },
    });

    const handleActionChange = useCallback((value: "approve" | "reject") => {
        setAction(value);
        actionRef.current = value;
        setErrors((prev) => {
            if (!prev.action) return prev;
            return { ...prev, action: undefined };
        });
        // Clear rejection reason error when switching to approve
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
        (overrideId: string) => {
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
                action: currentAction as "approve" | "reject",
                review_notes: currentNotes || undefined,
                rejection_reason: currentAction === "reject" ? currentReason : undefined,
            };

            // Zod validation
            const result = reviewOverrideSchema.safeParse(payload);
            if (!result.success) {
                const fieldErrors: ReviewFormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof ReviewFormErrors;
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

            const apiPayload: Record<string, unknown> = {
                action: currentAction,
            };
            if (currentNotes.trim()) {
                apiPayload.review_notes = currentNotes.trim();
            }
            if (currentAction === "reject" && currentReason.trim()) {
                apiPayload.rejection_reason = currentReason.trim();
            }

            mutation.mutate({
                overrideId,
                payload: apiPayload as { action: string; review_notes?: string; rejection_reason?: string },
            });
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
    }, []);

    return {
        action,
        reviewNotes,
        rejectionReason,
        errors,
        loading: mutation.isPending,
        handleActionChange,
        handleReviewNotesChange,
        handleRejectionReasonChange,
        handleSubmit,
        reset,
    };
};
