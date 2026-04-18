import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { type VerificationCategory } from "@/validators/VerificationSchema";
import { useYearFilter } from "@/context/YearFilterContext";

// ========================
// TYPES
// ========================

export interface PendingProfile {
    student_id: string;
    first_name: string;
    last_name: string;
    student_email: string;
    dept_id: string;
    student_passout_year: number;
    profile_complete: boolean;
    profile_is_approved: boolean;
    profile_approval_status: string;
    profile_rejection_reason: string | null;
    rejected_at: string | null;
    dept_name: string;
    created_at: string;
    updated_at: string;
}

export interface PendingExperience {
    experience_id: string;
    student_id: string;
    college_id: string;
    company_name: string;
    company_website: string | null;
    position_title: string;
    employment_type: string;
    job_description: string | null;
    responsibilities: string | null;
    technologies_used: string[] | null;
    work_location: string | null;
    work_mode: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    duration_months: number | null;
    offer_letter_url: string | null;
    completion_certificate_url: string | null;
    is_verified: boolean;
    verification_status: string;
    verified_by: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    rejected_at: string | null;
    created_at: string;
    updated_at: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    student_email: string;
    student_passout_year: number;
    dept_name: string;
}

export interface PendingAchievement {
    achievement_id: string;
    student_id: string;
    college_id: string;
    achievement_title: string;
    achievement_description: string | null;
    achievement_type: string;
    issuing_organization: string | null;
    event_name: string | null;
    achievement_level: string;
    position_rank: string | null;
    participants_count: number | null;
    achievement_date: string;
    certificate_url: string | null;
    proof_url: string | null;
    is_verified: boolean;
    verification_status: string;
    verified_by: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    rejected_at: string | null;
    is_featured: boolean;
    display_order: number | null;
    created_at: string;
    updated_at: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    student_email: string;
    student_passout_year: number;
    dept_name: string;
}

export interface PendingCertificate {
    certificate_id: string;
    student_id: string;
    college_id: string;
    certificate_name: string;
    certificate_description: string | null;
    certificate_type: string;
    issuing_organization: string;
    issuing_platform: string | null;
    credential_id: string | null;
    credential_url: string | null;
    issue_date: string;
    expiry_date: string | null;
    does_not_expire: boolean;
    skills_covered: string[] | null;
    certificate_url: string | null;
    is_verified: boolean;
    verification_status: string;
    verified_by: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    rejected_at: string | null;
    created_at: string;
    updated_at: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    student_email: string;
    student_passout_year: number;
    dept_name: string;
}

export type PendingItem =
    | PendingProfile
    | PendingExperience
    | PendingAchievement
    | PendingCertificate;

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface PendingFilters {
    page: number;
    limit: number;
    search?: string;
    dept_id?: string;
    student_passout_year?: number;
    sort_by?: string;
    sort_order?: string;
}

// ========================
// SERVICE MAPPING
// ========================

const SERVICE_MAP: Record<
    VerificationCategory,
    (params: PendingFilters) => Promise<unknown>
> = {
    profiles: (p) => CollegeAdminService.getPendingProfiles(p),
    experiences: (p) => CollegeAdminService.getPendingExperiences(p),
    achievements: (p) => CollegeAdminService.getPendingAchievements(p),
    certificates: (p) => CollegeAdminService.getPendingCertificates(p),
};

const QUERY_KEY_MAP: Record<
    VerificationCategory,
    (filters: Record<string, unknown>) => readonly unknown[]
> = {
    profiles: (f) => queryKeys.verifications.profiles(f),
    experiences: (f) => queryKeys.verifications.experiences(f),
    achievements: (f) => queryKeys.verifications.achievements(f),
    certificates: (f) => queryKeys.verifications.certificates(f),
};

// ========================
// HOOK
// ========================

export function useViewPendingItems(category: VerificationCategory) {
    const { selectedYear } = useYearFilter();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [deptId, setDeptId] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("DESC");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
    }, []);

    const handleDeptChange = useCallback((value: string) => {
        setDeptId(value);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSortBy((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
            } else {
                setSortOrder("DESC");
            }
            return field;
        });
        setPage(1);
    }, []);

    const handleLimitChange = useCallback((value: number) => {
        setLimit(value);
        setPage(1);
    }, []);

    const queryClient = useQueryClient();

    const filters = useMemo<PendingFilters>(() => ({
        page,
        limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(deptId && { dept_id: deptId }),
        student_passout_year: selectedYear,
        sort_by: sortBy,
        sort_order: sortOrder,
    }), [page, limit, debouncedSearch, deptId, selectedYear, sortBy, sortOrder]);

    const queryKey = QUERY_KEY_MAP[category]({ ...filters });

    const { data, isLoading, isFetching } = useQuery({
        queryKey,
        queryFn: () => SERVICE_MAP[category](filters),
        placeholderData: keepPreviousData,
    });

    const response = data as
        | { data: PendingItem[]; pagination: Pagination }
        | undefined;

    // Prefetch next page for snappy pagination at scale
    const totalPages = response?.pagination?.totalPages ?? 0;
    useEffect(() => {
        if (page < totalPages) {
            const nextFilters = { ...filters, page: page + 1 };
            queryClient.prefetchQuery({
                queryKey: QUERY_KEY_MAP[category]({ ...nextFilters }),
                queryFn: () => SERVICE_MAP[category](nextFilters),
            });
        }
    }, [category, filters, page, totalPages, queryClient]);

    return {
        items: response?.data ?? [],
        pagination: response?.pagination ?? {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
        },
        isLoading,
        isFetching,
        // Filter state
        search,
        deptId,
        sortBy,
        sortOrder,
        page,
        limit,
        // Setters
        setPage,
        handleSearchChange,
        handleDeptChange,
        handleSortChange,
        handleLimitChange,
    };
}
