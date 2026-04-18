import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

interface PreviewRound {
    round_id: string;
    round_name: string;
    round_number: number;
    round_type: string;
    is_final_round: boolean;
    job_title: string;
    company_name: string;
}

interface PreviewSummary {
    total_applications: number;
    will_select: number;
    will_advance: number;
    will_reject: number;
    will_mark_absent: number;
    on_hold: number;
    skipped: number;
}

interface PreviewStudent {
    application_id: string;
    student_name: string;
    current_status: string;
}

export interface PreviewData {
    round: PreviewRound;
    settings: { auto_reject_on_round_fail: boolean };
    summary: PreviewSummary;
    details: {
        selecting: (PreviewStudent & { new_status: string })[];
        advancing: (PreviewStudent & { action: string })[];
        rejecting: (PreviewStudent & { new_status: string; reason: string })[];
        marking_absent: Pick<PreviewStudent, "application_id" | "student_name">[];
        on_hold: Pick<PreviewStudent, "application_id" | "student_name">[];
        skipped: (Pick<PreviewStudent, "application_id" | "student_name"> & { reason: string })[];
    };
}

export interface ProcessResult {
    round: {
        round_id: string;
        round_name: string;
        round_number: number;
        is_final_round: boolean;
        job_title: string;
        company_name: string;
    };
    processed: {
        selected: number;
        advanced: number;
        rejected: number;
        absent_marked: number;
        on_hold: number;
        skipped: number;
        notifications_sent: number;
    };
}

// ========================
// HOOK
// ========================

export const useProcessRoundResults = (
    roundId: string,
    onProcessed?: () => void,
) => {
    const queryClient = useQueryClient();

    // Preview mutation (fetches what WILL happen)
    const previewMutation = useMutation({
        mutationFn: () => CollegeAdminService.previewRoundProcessing(roundId),
        onError: (error: unknown) => {
            const message =
                error instanceof ApiError ? error.message : "Failed to load preview";
            const status = error instanceof ApiError ? error.status : undefined;

            showToast({
                type: "error",
                title: getErrorTitle(status),
                description: message,
            });
        },
    });

    // Process mutation (executes transitions)
    const processMutation = useMutation({
        mutationFn: () => CollegeAdminService.processRound(roundId),
        onSuccess: (response: ProcessResult) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.jobs.roundResults(roundId),
            });
            queryClient.removeQueries({
                queryKey: queryKeys.jobs.roundProcessing(roundId),
            });

            showToast({
                type: "success",
                title: "Round Processed",
                description: `${response.processed.selected} selected, ${response.processed.rejected} rejected, ${response.processed.advanced} advanced`,
            });

            onProcessed?.();
        },
        onError: (error: unknown) => {
            const message =
                error instanceof ApiError ? error.message : "Failed to process round";
            const status = error instanceof ApiError ? error.status : undefined;

            showToast({
                type: "error",
                title: getErrorTitle(status),
                description: message,
            });
        },
    });

    return {
        // Preview
        previewLoading: previewMutation.isPending,
        preview: previewMutation.data as PreviewData | undefined,
        loadPreview: () => previewMutation.mutate(),

        // Process
        processLoading: processMutation.isPending,
        processResult: processMutation.data,
        executeProcess: () => processMutation.mutate(),

        // Reset
        reset: () => {
            previewMutation.reset();
            processMutation.reset();
        },
    };
};
