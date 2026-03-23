import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
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
            const auto = res.data?.auto_approved;
            let description = res.message || "Student profile approved";
            if (auto) {
                const parts: string[] = [];
                if (auto.experiences > 0)
                    parts.push(`${auto.experiences} experience${auto.experiences > 1 ? "s" : ""}`);
                if (auto.achievements > 0)
                    parts.push(`${auto.achievements} achievement${auto.achievements > 1 ? "s" : ""}`);
                if (auto.certificates > 0)
                    parts.push(`${auto.certificates} certificate${auto.certificates > 1 ? "s" : ""}`);
                if (parts.length > 0) {
                    description += `. Auto-approved ${parts.join(", ")}`;
                }
            }
            showToast({ type: "success", title: "Profile Approved", description });
        },
        onError: (error: unknown) => {
            const message =
                error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;
            if (status === 400) {
                showToast({
                    type: "error",
                    title: "Cannot Approve",
                    description: message,
                });
            } else {
                showToast({ type: "error", title: "Error", description: message });
            }
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
            showToast({ type: "error", title: "Error", description: message });
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
