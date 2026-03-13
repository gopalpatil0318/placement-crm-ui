import { useState, useEffect, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

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
    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJob = useCallback(async () => {
        if (!jobId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await CollegeAdminService.getJob(jobId);
            setJob(response.data || response);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to fetch job";
            setError(msg);
            showToast({ type: "error", title: "Error", description: msg });
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    return { job, loading, error, refresh: fetchJob };
};
