import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface JobPosition {
    position_id: string;
    job_id: string;
    position_name: string;
    position_description: string | null;
    vacancies: number;
    position_status: string;
    created_at: string;
}

export interface JobEligibilityCriteria {
    criteria_id: string;
    job_id: string;
    min_overall_cgpa: string | null;
    max_live_kts: number | null;
    min_tenth_percentage: string | null;
    min_twelfth_percentage: string | null;
    min_diploma_percentage: string | null;
    allowed_genders: string[] | null;
    allowed_departments: string[] | null;
    allowed_gap_statuses: string[] | null;
    min_existing_package: string | null;
    max_existing_package: string | null;
    exclude_already_placed: boolean;
    passout_years: number[] | null;
    created_at: string;
}

export interface JobRound {
    round_id: string;
    job_id: string;
    round_number: number;
    round_name: string;
    round_description: string | null;
    round_type: string | null;
    round_date: string | null;
    round_venue: string | null;
    round_status: string;
    created_at: string;
}

export interface JobQuestion {
    question_id: string;
    job_id: string;
    question_text: string;
    question_type: string;
    question_options: string[] | null;
    is_required: boolean;
    question_order: number;
    created_at: string;
}

export interface JobDetail {
    job_id: string;
    college_id: string;
    company_id: string;
    job_title: string;
    job_description: string | null;
    job_location: string;
    salary_package: string | null;
    salary_min: string | null;
    salary_max: string | null;
    bond_duration: string | null;
    bond_details: string | null;
    job_type: string;
    internship_duration: string | null;
    internship_stipend: string | null;
    application_deadline: string;
    job_status: string;
    allow_applications: boolean;
    tier_id: string | null;
    tier_name: string | null;
    tier_level: number | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    passout_years: number[];
    company_name: string;
    positions: JobPosition[];
    eligibility_criteria: JobEligibilityCriteria | null;
    rounds: JobRound[];
    questions: JobQuestion[];
    application_stats?: {
        total: number;
        pending: number;
        shortlisted: number;
        selected: number;
        rejected: number;
    };
}

// ========================
// HOOK
// ========================

export const useViewJob = (jobId: string | undefined) => {
    const { data, isLoading, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.jobs.detail(jobId!),
        queryFn: async () => {
            const response = await CollegeAdminService.getJob(jobId!);
            return response.data || response;
        },
        enabled: !!jobId,
    });

    const job: JobDetail | null = data ?? null;
    const loading = isLoading;

    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof Error ? queryError.message : "Failed to fetch job";
    }

    return { job, loading, error, refresh: refetch };
};
