import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { bulkAddRoundResultsSchema } from "@/validators/RoundResultSchema";

// ========================
// TYPES
// ========================

export interface BulkResultItem {
    application_id: string;
    result_status?: string;
    score?: number;
    remarks?: string;
    attended?: boolean;
    scheduled_at?: string;
    completed_at?: string;
}

interface BulkCreatedItem {
    result_id: string;
    application_id: string;
    student_name: string;
    result_status: string;
}

interface BulkSkippedItem {
    application_id: string;
    student_name: string;
    reason: string;
}

interface BulkErrorItem {
    application_id: string;
    error: string;
}

export interface BulkAddResult {
    round_name: string;
    round_number: number;
    job_title: string;
    company_name: string;
    summary: {
        total_requested: number;
        created: number;
        skipped: number;
        errors: number;
    };
    created: BulkCreatedItem[];
    skipped: BulkSkippedItem[];
    errors: BulkErrorItem[];
}

// ========================
// HOOK
// ========================

export const useBulkAddRoundResults = (roundId: string, onSuccess?: () => void) => {
    const [bulkResult, setBulkResult] = useState<BulkAddResult | null>(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (payload: { results: Record<string, unknown>[] }) =>
            CollegeAdminService.bulkAddRoundResults(roundId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.roundResults(roundId) });

            const data = response.data || response;

            const result: BulkAddResult = {
                round_name: data.round_name || "",
                round_number: data.round_number ?? 0,
                job_title: data.job_title || "",
                company_name: data.company_name || "",
                summary: {
                    total_requested: data.summary?.total_requested ?? 0,
                    created: data.summary?.created ?? 0,
                    skipped: data.summary?.skipped ?? 0,
                    errors: data.summary?.errors ?? 0,
                },
                created: Array.isArray(data.created) ? data.created : [],
                skipped: Array.isArray(data.skipped) ? data.skipped : [],
                errors: Array.isArray(data.errors) ? data.errors : [],
            };

            setBulkResult(result);

            const parts: string[] = [];
            if (result.summary.created > 0) parts.push(`${result.summary.created} created`);
            if (result.summary.skipped > 0) parts.push(`${result.summary.skipped} skipped`);
            if (result.summary.errors > 0) parts.push(`${result.summary.errors} errors`);

            showToast({
                type: result.summary.errors > 0 ? "warning" : "success",
                title: "Bulk Add Complete",
                description: parts.join(", ") || "Bulk add processed",
            });

            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            showToast({
                type: "error",
                title: status === 400 ? "Invalid Action" : status === 404 ? "Not Found" : "Error",
                description: message,
            });
        },
    });

    const handleSubmit = useCallback(
        (items: BulkResultItem[]) => {
            if (mutation.isPending) return;

            if (items.length === 0) {
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: "At least one result is required",
                });
                return;
            }

            if (items.length > 200) {
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: "Cannot add more than 200 results at once",
                });
                return;
            }

            // Zod validation
            const parseResult = bulkAddRoundResultsSchema.safeParse({
                results: items.map((item) => ({
                    application_id: item.application_id,
                    result_status: item.result_status || undefined,
                    score: item.score ?? undefined,
                    remarks: item.remarks || undefined,
                    attended: item.attended,
                    scheduled_at: item.scheduled_at || undefined,
                    completed_at: item.completed_at || undefined,
                })),
            });
            if (!parseResult.success) {
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: parseResult.error.issues[0].message,
                });
                return;
            }

            setBulkResult(null);

            // Build clean payload — strip undefined/empty fields per item
            const results = items.map((item) => {
                const entry: Record<string, unknown> = {
                    application_id: item.application_id,
                };
                if (item.result_status) entry.result_status = item.result_status;
                if (item.score !== undefined && item.score !== null) entry.score = item.score;
                if (item.remarks?.trim()) entry.remarks = item.remarks.trim();
                if (item.attended !== undefined) entry.attended = item.attended;
                if (item.scheduled_at) entry.scheduled_at = item.scheduled_at;
                if (item.completed_at) entry.completed_at = item.completed_at;
                return entry;
            });

            mutation.mutate({ results });
        },
        [mutation],
    );

    const resetResult = useCallback(() => {
        setBulkResult(null);
    }, []);

    return {
        loading: mutation.isPending,
        bulkResult,
        handleSubmit,
        resetResult,
    };
};
