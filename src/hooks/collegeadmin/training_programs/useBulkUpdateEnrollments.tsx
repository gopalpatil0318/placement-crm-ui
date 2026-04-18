import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import type { EnrollmentStatus, PaymentStatus } from "@/validators/TrainingProgramSchema";

// ========================
// TYPES
// ========================

export interface BulkAction {
    completion_status?: EnrollmentStatus;
    payment_status?: PaymentStatus;
    amount_paid?: number;
    certificate_issued?: boolean;
}

// ========================
// HOOK
// ========================

export const useBulkUpdateEnrollments = (programId: string) => {
    const queryClient = useQueryClient();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleId = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback((ids: string[]) => {
        setSelectedIds((prev) => {
            const allSelected = ids.every((id) => prev.has(id));
            if (allSelected) return new Set();
            return new Set(ids);
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const mutation = useMutation({
        mutationFn: (updates: { enrollment_id: string; completion_status?: string; payment_status?: string; certificate_issued?: boolean }[]) =>
            CollegeAdminService.bulkUpdateEnrollments(programId, updates),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.enrollments(programId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.detail(programId) });
            const data = response?.data ?? response;
            const updated = data?.updated ?? selectedIds.size;
            const failed = data?.failed ?? 0;
            showToast({
                type: failed > 0 ? "warning" : "success",
                title: "Bulk Update Complete",
                description: failed > 0 ? `${updated} updated, ${failed} failed` : `${updated} updated`,
            });
            clearSelection();
        },
        onError: (error: unknown) => {
            const msg = error instanceof ApiError ? error.message : "Bulk update failed";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: msg });
        },
    });

    const applyBulkAction = useCallback((action: BulkAction) => {
        const updates = Array.from(selectedIds).map((id) => ({
            enrollment_id: id,
            ...action,
        }));
        mutation.mutate(updates);
    }, [selectedIds, mutation]);

    return {
        selectedIds,
        toggleId,
        toggleAll,
        clearSelection,
        applyBulkAction,
        isBulkUpdating: mutation.isPending,
    };
};
