import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import {
    verifyItemSchema,
    type VerificationCategory,
    CATEGORY_LABELS,
} from "@/validators/VerificationSchema";

// ========================
// SERVICE MAPPING
// ========================

const VERIFY_MAP: Record<
    VerificationCategory,
    (id: string, data: { action: string; rejection_reason?: string }) => Promise<unknown>
> = {
    profiles: (id, d) => CollegeAdminService.verifyStudentProfile(id, d),
    experiences: (id, d) => CollegeAdminService.verifyExperience(id, d),
    achievements: (id, d) => CollegeAdminService.verifyAchievement(id, d),
    certificates: (id, d) => CollegeAdminService.verifyCertificate(id, d),
};

// ========================
// HOOK
// ========================

export function useVerifyItem(category: VerificationCategory) {
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const invalidateCache = useCallback(() => {
        // Invalidate all verification-related queries: counts, category lists,
        // and embedded student profile data so changes reflect everywhere
        queryClient.invalidateQueries({ queryKey: ["verifications"] });
    }, [queryClient]);

    const approveMutation = useMutation({
        mutationFn: (itemId: string) =>
            VERIFY_MAP[category](itemId, { action: "approved" }),
        onSuccess: (response: unknown) => {
            invalidateCache();
            const msg =
                (response as { message?: string })?.message || "Item approved";
            showToast({ type: "success", title: "Approved", description: msg });
            setProcessingId(null);
        },
        onError: (error: unknown) => {
            const message =
                error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: message });
            setProcessingId(null);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({
            itemId,
            rejection_reason,
        }: {
            itemId: string;
            rejection_reason: string;
        }) =>
            VERIFY_MAP[category](itemId, {
                action: "rejected",
                rejection_reason: rejection_reason.trim(),
            }),
        onSuccess: (response: unknown) => {
            invalidateCache();
            const msg =
                (response as { message?: string })?.message ||
                `${CATEGORY_LABELS[category].slice(0, -1)} sent back for corrections`;
            showToast({ type: "success", title: "Rejected", description: msg });
            setProcessingId(null);
        },
        onError: (error: unknown) => {
            const message =
                error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: message });
            setProcessingId(null);
        },
    });

    const approve = useCallback(
        (itemId: string) => {
            setProcessingId(itemId);
            approveMutation.mutate(itemId);
        },
        [approveMutation],
    );

    const reject = useCallback(
        (itemId: string, rejection_reason: string) => {
            const result = verifyItemSchema.safeParse({
                action: "rejected",
                rejection_reason,
            });
            if (!result.success) {
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: result.error.issues[0].message,
                });
                return;
            }
            setProcessingId(itemId);
            rejectMutation.mutate({ itemId, rejection_reason });
        },
        [rejectMutation],
    );

    return {
        approve,
        reject,
        isApproving: approveMutation.isPending,
        isRejecting: rejectMutation.isPending,
        processingId,
    };
}
