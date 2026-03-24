import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { type VerificationCategory } from "@/validators/VerificationSchema";

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
    company_name: string;
    position_title: string;
    employment_type: string;
    start_date: string;
    end_date: string | null;
    verification_status: string;
    first_name: string;
    last_name: string;
    student_email: string;
    dept_name: string;
}

export interface PendingAchievement {
    achievement_id: string;
    student_id: string;
    achievement_title: string;
    achievement_type: string;
    achievement_level: string;
    achievement_date: string;
    verification_status: string;
    first_name: string;
    last_name: string;
    student_email: string;
    dept_name: string;
}

export interface PendingCertificate {
    certificate_id: string;
    student_id: string;
    certificate_name: string;
    issuing_organization: string;
    certificate_type: string;
    issue_date: string;
    verification_status: string;
    first_name: string;
    last_name: string;
    student_email: string;
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
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [deptId, setDeptId] = useState("");
    const [passoutYear, setPassoutYear] = useState<number | undefined>();
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

    const handlePassoutYearChange = useCallback((value: number | undefined) => {
        setPassoutYear(value);
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

    const queryFilters: Record<string, unknown> = {
        page,
        limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(deptId && { dept_id: deptId }),
        ...(passoutYear && { student_passout_year: passoutYear }),
        sort_by: sortBy,
        sort_order: sortOrder,
    };

    const apiParams: PendingFilters = {
        page,
        limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(deptId && { dept_id: deptId }),
        ...(passoutYear && { student_passout_year: passoutYear }),
        sort_by: sortBy,
        sort_order: sortOrder,
    };

    const { data, isLoading, isFetching } = useQuery({
        queryKey: QUERY_KEY_MAP[category](queryFilters),
        queryFn: () => SERVICE_MAP[category](apiParams),
        placeholderData: keepPreviousData,
    });

    const response = data as
        | { data: PendingItem[]; pagination: Pagination }
        | undefined;

    return {
        items: (response?.data ?? []) as PendingItem[],
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
        passoutYear,
        sortBy,
        sortOrder,
        page,
        limit,
        // Setters
        setPage,
        handleSearchChange,
        handleDeptChange,
        handlePassoutYearChange,
        handleSortChange,
        handleLimitChange,
    };
}
