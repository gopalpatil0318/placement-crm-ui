import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface TrainingProgramDetail {
    program_id: string;
    program_name: string;
    program_description: string | null;
    program_type: string;
    trainer_name: string | null;
    trainer_organization: string | null;
    start_date: string | null;
    end_date: string | null;
    total_sessions: number | null;
    session_duration_hours: number | null;
    target_dept_ids: string[] | null;
    target_passout_year: number | null;
    max_enrollment: number | null;
    enrollment_deadline: string | null;
    program_status: string;
    created_by: string;
    created_by_name: string | null;
    target_dept_names: { dept_id: string; dept_name: string }[] | null;
    enrollment_stats: {
        enrolled_count: number;
        completed_count: number;
        in_progress_count: number;
        dropped_count: number;
        failed_count: number;
        avg_rating: number | null;
        avg_completion_percentage: number | null;
        avg_sessions_attended: number | null;
    } | null;
    created_at: string;
    updated_at: string;
}

// ========================
// HOOK
// ========================

export const useViewTrainingProgram = (programId: string | undefined) => {
    const { data, isLoading, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.trainingPrograms.detail(programId!),
        queryFn: () => CollegeAdminService.getTrainingProgram(programId!),
        enabled: !!programId,
    });

    const program: TrainingProgramDetail | null = data?.data ?? null;
    const loading = isLoading;
    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof Error ? queryError.message : "Failed to fetch training program";
    }

    useEffect(() => {
        if (error) showToast({ type: "error", title: "Fetch Error", description: error });
    }, [error]);

    return {
        program,
        loading,
        error,
        refetch,
    };
};
