import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface BulkPlacementItem {
    application_id: string;
    placement_type: string;
    fulltime_package: string;
    fulltime_designation: string;
    fulltime_joining_date: string;
    internship_stipend: string;
    internship_duration: string;
    internship_start_date: string;
    offer_letter_url: string;
    joining_letter_url: string;
}

interface BulkCreatedEntry {
    placement_id: string;
    application_id: string;
    student_id: string;
    student_name: string;
    job_title: string;
    company_name: string;
}

interface BulkSkippedEntry {
    application_id: string;
    reason: string;
}

export interface BulkCreateResult {
    created_count: number;
    skipped_count: number;
    created: BulkCreatedEntry[];
    skipped: BulkSkippedEntry[];
}

// ========================
// HELPERS
// ========================

function buildBulkPayload(items: BulkPlacementItem[]): Record<string, unknown>[] {
    return items.map((item) => {
        const payload: Record<string, unknown> = {
            application_id: item.application_id,
            placement_type: item.placement_type,
        };

        const isFullTime = item.placement_type === "full-time" || item.placement_type === "both";
        const isInternship = item.placement_type === "internship" || item.placement_type === "both";

        if (isFullTime) {
            if (item.fulltime_package) payload.fulltime_package = Number(item.fulltime_package);
            if (item.fulltime_designation) payload.fulltime_designation = item.fulltime_designation.trim();
            if (item.fulltime_joining_date) payload.fulltime_joining_date = item.fulltime_joining_date;
        }

        if (isInternship) {
            if (item.internship_stipend) payload.internship_stipend = Number(item.internship_stipend);
            if (item.internship_duration) payload.internship_duration = item.internship_duration.trim();
            if (item.internship_start_date) payload.internship_start_date = item.internship_start_date;
        }

        if (item.offer_letter_url) payload.offer_letter_url = item.offer_letter_url.trim();

        return payload;
    });
}

// ========================
// HOOK
// ========================

export const useBulkCreatePlacements = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [result, setResult] = useState<BulkCreateResult | null>(null);

    const mutation = useMutation({
        mutationFn: (items: BulkPlacementItem[]) =>
            CollegeAdminService.bulkCreatePlacements(buildBulkPayload(items)),
        onSuccess: (response: BulkCreateResult) => {
            setResult(response);
            queryClient.invalidateQueries({ queryKey: queryKeys.placements.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.applications(jobId) });

            if (response.created_count > 0) {
                const skipMsg = response.skipped_count > 0 ? `, ${response.skipped_count} skipped` : "";
                showToast({
                    type: "success",
                    title: "Placements Created",
                    description: `${response.created_count} offer(s) created${skipMsg}`,
                });
            }
            if (response.created_count === 0 && response.skipped_count > 0) {
                showToast({
                    type: "error",
                    title: "All Skipped",
                    description: `${response.skipped_count} item(s) could not be processed`,
                });
            }
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Failed to create placements";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({
                type: "error",
                title: getErrorTitle(status),
                description: message,
            });
        },
    });

    const submit = useCallback(
        (items: BulkPlacementItem[]) => mutation.mutate(items),
        [mutation],
    );

    const reset = useCallback(() => {
        mutation.reset();
        setResult(null);
    }, [mutation]);

    return {
        submit,
        loading: mutation.isPending,
        result,
        reset,
    };
};
