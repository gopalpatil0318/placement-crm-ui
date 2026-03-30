import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import {
    bulkVerifySchema,
    type VerificationCategory,
    CATEGORY_LABELS,
} from "@/validators/VerificationSchema";

// ========================
// SERVICE MAPPING
// ========================

const BULK_SERVICE_MAP: Record<
    VerificationCategory,
    (data: { ids: string[]; action: string; rejection_reason?: string }) => Promise<unknown>
> = {
    profiles: (d) => CollegeAdminService.bulkVerifyProfiles(d),
    experiences: (d) => CollegeAdminService.bulkVerifyExperiences(d),
    achievements: (d) => CollegeAdminService.bulkVerifyAchievements(d),
    certificates: (d) => CollegeAdminService.bulkVerifyCertificates(d),
};

// ========================
// TYPES
// ========================

interface BulkResponse {
    message?: string;
    data?: {
        requested: number;
        updated: number;
        updated_ids: string[];
    };
}

// ========================
// HOOK
// ========================

export function useBulkVerify(
    category: VerificationCategory,
    onComplete?: () => void,
) {
    const queryClient = useQueryClient();

    const invalidateCache = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.verifications.counts() });
        queryClient.invalidateQueries({
            queryKey: queryKeys.verifications[category](),
        });
    }, [queryClient, category]);

    const mutation = useMutation({
        mutationFn: (payload: {
            ids: string[];
            action: string;
            rejection_reason?: string;
        }) => BULK_SERVICE_MAP[category](payload),
        onSuccess: (response: unknown) => {
            invalidateCache();
            const res = response as BulkResponse;
            const updated = res.data?.updated ?? 0;
            const requested = res.data?.requested ?? 0;
            const label = CATEGORY_LABELS[category].toLowerCase();
            const msg =
                res.message ||
                `Updated ${updated} of ${requested} ${label}`;
            showToast({ type: "success", title: "Bulk Action Complete", description: msg });
            onComplete?.();
        },
        onError: (error: unknown) => {
            const message =
                error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: message });
        },
    });

    const bulkApprove = useCallback(
        (ids: string[]) => {
            const result = bulkVerifySchema.safeParse({ ids, action: "approved" });
            if (!result.success) {
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: result.error.issues[0].message,
                });
                return;
            }
            mutation.mutate({ ids, action: "approved" });
        },
        [mutation],
    );

    const bulkReject = useCallback(
        (ids: string[], rejection_reason: string) => {
            const result = bulkVerifySchema.safeParse({
                ids,
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
            mutation.mutate({
                ids,
                action: "rejected",
                rejection_reason: rejection_reason.trim(),
            });
        },
        [mutation],
    );

    return {
        bulkApprove,
        bulkReject,
        isProcessing: mutation.isPending,
    };
}
