import { useState, useEffect, useCallback, useRef } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

export interface EligibleStudent {
    student_id: string;
    student_name: string;
    student_email: string;
    dept_name: string;
    overall_cgpa: number;
    total_live_kts: number;
    tenth_percentage: number;
    twelfth_or_diploma: string;
    twelfth_percentage: number | null;
    diploma_percentage?: number | null;
    gender: string;
    profile_complete: boolean;
}

export interface EligibilityJob {
    job_id: string;
    job_title: string;
    company_name: string;
    passout_year: number;
}

export interface EligibilityCriteria {
    min_overall_cgpa: number | null;
    max_live_kts: number | null;
    min_tenth_percentage: number | null;
    min_twelfth_percentage: number | null;
    min_diploma_percentage: number | null;
    allowed_genders: string[] | null;
    allowed_departments: string[] | null;
    allowed_gap_statuses: string[] | null;
    exclude_already_placed: boolean;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ========================
// HOOK
// ========================

export const useEligibleStudents = (jobId: string | undefined) => {
    const [students, setStudents] = useState<EligibleStudent[]>([]);
    const [job, setJob] = useState<EligibilityJob | null>(null);
    const [criteria, setCriteria] = useState<EligibilityCriteria | null>(null);
    const [eligibleCount, setEligibleCount] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const [eligibilityPercentage, setEligibilityPercentage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    });

    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchEligibleStudents = useCallback(
        async (page: number, limit: number, searchTerm: string, dept: string) => {
            if (!jobId) return;
            setLoading(true);
            setError(null);

            try {
                const response = await CollegeAdminService.getEligibleStudents(jobId, {
                    page,
                    limit,
                    search: searchTerm || undefined,
                    dept_name: dept || undefined,
                });

                const data = response.data || response;

                setJob(data.job || null);
                setCriteria(data.criteria || null);
                setEligibleCount(data.eligible_count || 0);
                setTotalStudents(data.total_students || 0);
                setEligibilityPercentage(data.eligibility_percentage || 0);
                setStudents(Array.isArray(data.students) ? data.students : []);

                if (response.pagination) {
                    setPagination(response.pagination);
                } else {
                    setPagination((prev) => ({
                        ...prev,
                        total: data.eligible_count || 0,
                        totalPages: Math.ceil((data.eligible_count || 0) / limit),
                    }));
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Failed to fetch eligible students";
                setError(msg);
                showToast({ type: "error", title: "Error", description: msg });
            } finally {
                setLoading(false);
            }
        },
        [jobId]
    );

    useEffect(() => {
        fetchEligibleStudents(pagination.page, pagination.limit, search, deptFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, deptFilter, fetchEligibleStudents]);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearch(value);
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
            searchTimerRef.current = setTimeout(() => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchEligibleStudents(1, pagination.limit, value, deptFilter);
            }, 300);
        },
        [fetchEligibleStudents, pagination.limit, deptFilter]
    );

    const handleDeptFilterChange = useCallback((value: string) => {
        setDeptFilter(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
    }, []);

    const refresh = useCallback(() => {
        fetchEligibleStudents(pagination.page, pagination.limit, search, deptFilter);
    }, [fetchEligibleStudents, pagination.page, pagination.limit, search, deptFilter]);

    return {
        students,
        job,
        criteria,
        eligibleCount,
        totalStudents,
        eligibilityPercentage,
        loading,
        error,
        pagination,
        search,
        deptFilter,
        handleSearchChange,
        handleDeptFilterChange,
        handlePageChange,
        handleLimitChange,
        refresh,
    };
};
