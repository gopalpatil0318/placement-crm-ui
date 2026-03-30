import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface AcademicInfo {
    overall_cgpa: number | null;
    live_kts: number | null;
    tenth_percentage: number | null;
    twelfth_percentage: number | null;
}

export interface ApplicationAnswer {
    answer_id: string;
    question_id: string;
    question_text: string;
    question_type: string;
    answer_text: string | null;
    selected_options: string[] | null;
}

export interface ApplicationRoundResult {
    result_id: string;
    round_id: string;
    round_name: string;
    round_number: number;
    result_status: string;
    remarks: string | null;
}

export interface ApplicationDetail {
    application_id: string;
    application_status: string;
    is_eligible: boolean;
    eligibility_remarks: string | null;
    applied_at: string;
    last_updated_at: string;
    student_id: string;
    student_name: string;
    student_email: string;
    prn_no: string | null;
    roll_no: string | null;
    dept_name: string | null;
    job_id: string;
    job_title: string;
    company_name: string;
    position_name: string | null;
    academic_info: AcademicInfo | null;
    answers: ApplicationAnswer[];
    round_results: ApplicationRoundResult[];
}

// ========================
// HOOK
// ========================

export const useViewApplication = (applicationId: string | undefined) => {
    const { data, isLoading, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.jobs.application(applicationId!),
        queryFn: async () => {
            const response = await CollegeAdminService.getApplication(applicationId!);
            return (response.data || response) as ApplicationDetail;
        },
        enabled: !!applicationId,
    });

    return {
        application: data ?? null,
        loading: isLoading,
        error: queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch application") : null,
        refresh: refetch,
    };
};
