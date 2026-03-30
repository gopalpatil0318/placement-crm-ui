import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { verifyItemSchema } from "@/validators/VerificationSchema";

// ========================
// TYPES
// ========================

interface ApproveResponse {
    message?: string;
    data?: {
        student_id: string;
        first_name: string;
        last_name: string;
        profile_approval_status: string;
        auto_approved?: {
            experiences: number;
            achievements: number;
            certificates: number;
        };
    };
}

// ========================
// HELPERS
// ========================

function buildAutoApprovedSuffix(auto?: NonNullable<ApproveResponse["data"]>["auto_approved"]): string {
    if (!auto) return "";
    const entries: Array<[number, string]> = [
        [auto.experiences, "experience"],
        [auto.achievements, "achievement"],
        [auto.certificates, "certificate"],
    ];
    const parts = entries
        .filter(([count]) => count > 0)
        .map(([count, label]) => `${count} ${label}${count > 1 ? "s" : ""}`);
    return parts.length > 0 ? `. Auto-approved ${parts.join(", ")}` : "";
}

// ========================
// HOOK
// ========================

export function useApproveStudentProfile(studentId: string) {
    const queryClient = useQueryClient();

    const invalidateCache = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.verifications.counts() });
        queryClient.invalidateQueries({ queryKey: queryKeys.verifications.profiles() });
        queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) });
        queryClient.invalidateQueries({
            queryKey: queryKeys.verifications.studentReview(studentId),
        });
    }, [queryClient, studentId]);

    const approveMutation = useMutation({
        mutationFn: () =>
            CollegeAdminService.approveStudentProfile(studentId, {
                action: "approved",
            }),
        onSuccess: (response: unknown) => {
            invalidateCache();
            const res = response as ApproveResponse;
            const description =
                (res.message || "Student profile approved") +
                buildAutoApprovedSuffix(res.data?.auto_approved);
            showToast({ type: "success", title: "Profile Approved", description });
        },
        onError: (error: unknown) => {
            const message =
                error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: message });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (rejection_reason: string) =>
            CollegeAdminService.approveStudentProfile(studentId, {
                action: "rejected",
                rejection_reason: rejection_reason.trim(),
            }),
        onSuccess: (response: unknown) => {
            invalidateCache();
            const msg =
                (response as ApproveResponse).message ||
                "Profile sent back for corrections";
            showToast({ type: "success", title: "Profile Rejected", description: msg });
        },
        onError: (error: unknown) => {
            const message =
                error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: message });
        },
    });

    const approve = useCallback(() => {
        approveMutation.mutate();
    }, [approveMutation]);

    const reject = useCallback(
        (rejection_reason: string) => {
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
            rejectMutation.mutate(rejection_reason);
        },
        [rejectMutation],
    );

    return {
        approve,
        reject,
        isApproving: approveMutation.isPending,
        isRejecting: rejectMutation.isPending,
    };
}
