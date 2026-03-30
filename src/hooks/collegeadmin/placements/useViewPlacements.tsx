import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { useYearFilter } from "@/context/YearFilterContext";

// ========================
// TYPES
// ========================

export interface PlacementListItem {
    placement_id: string;
    application_id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    dept_name: string;
    enrollment_number: string;
    company_id: string;
    company_name: string;
    job_id: string;
    job_title: string;
    position_id: string | null;
    position_name: string | null;
    passout_year: number;
    placement_type: string;
    placement_status: string;
    acceptance_status: string;
    fulltime_package: number | null;
    fulltime_designation: string | null;
    fulltime_joining_date: string | null;
    internship_stipend: number | null;
    internship_duration: string | null;
    internship_start_date: string | null;
    offer_letter_url: string | null;
    offer_letter_verified: boolean;
    verified_by: string | null;
    verified_at: string | null;
    remarks: string | null;
    created_at: string;
    updated_at: string;
}

export interface PlacementStats {
    total_placements: number;
    unique_students: number;
    unique_companies: number;
    avg_package: number | null;
    highest_package: number | null;
    lowest_package: number | null;
    offered_count: number;
    accepted_count: number;
    joined_count: number;
    rejected_count: number;
    cancelled_count: number;
    verified_offers: number;
}

// ========================
// HOOK
// ========================

export const useViewPlacements = (jobId?: string) => {
    const { selectedYear } = useYearFilter();
    // ── Local filter / pagination state ──
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [placementStatus, setPlacementStatus] = useState("");
    const [placementType, setPlacementType] = useState("");
    const [acceptanceStatus, setAcceptanceStatus] = useState("");
    const [offerLetterVerified, setOfferLetterVerified] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── React Query ──
    const queryClient = useQueryClient();
    const queryFilters = useMemo(() => ({
        page,
        limit,
        search: debouncedSearch || undefined,
        passout_year: selectedYear,
        company_id: companyId || undefined,
        job_id: jobId || undefined,
        placement_status: placementStatus || undefined,
        placement_type: placementType || undefined,
        acceptance_status: acceptanceStatus || undefined,
        offer_letter_verified: offerLetterVerified || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
    }), [page, limit, debouncedSearch, selectedYear, companyId, jobId, placementStatus, placementType, acceptanceStatus, offerLetterVerified, sortBy, sortOrder]);

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.placements.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllPlacements(queryFilters),
        placeholderData: keepPreviousData,
    });

    // ── Derive data from response ──
    const responseData = data?.data || data;
    const placements: PlacementListItem[] = responseData?.placements || [];
    const stats: PlacementStats | null = responseData?.stats || null;
    const pagination = responseData?.pagination || data?.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 0,
    };
    const loading = isLoading || isFetching;
    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof Error ? queryError.message : "Failed to load placements";
    }

    // ── Next-page prefetching ──
    useEffect(() => {
        if (pagination.page < pagination.totalPages) {
            const nextFilters = { ...queryFilters, page: pagination.page + 1 };
            void queryClient.prefetchQuery({
                queryKey: queryKeys.placements.all(nextFilters),
                queryFn: () => CollegeAdminService.getAllPlacements(nextFilters),
            });
        }
    }, [pagination.page, pagination.totalPages, queryFilters, queryClient]);

    // ── Handlers ──

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSortBy((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
            } else {
                setSortOrder("asc");
            }
            return field;
        });
        setPage(1);
    }, []);

    const handleStatusFilterChange = useCallback((status: string) => {
        setPlacementStatus(status);
        setPage(1);
    }, []);

    const handleTypeFilterChange = useCallback((type: string) => {
        setPlacementType(type);
        setPage(1);
    }, []);

    const handleAcceptanceFilterChange = useCallback((status: string) => {
        setAcceptanceStatus(status);
        setPage(1);
    }, []);

    const handleVerifiedFilterChange = useCallback((verified: string) => {
        setOfferLetterVerified(verified);
        setPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setSearch("");
        setDebouncedSearch("");
        setCompanyId("");
        setPlacementStatus("");
        setPlacementType("");
        setAcceptanceStatus("");
        setOfferLetterVerified("");
        setSortBy("created_at");
        setSortOrder("desc");
        setPage(1);
    }, []);

    return {
        placements,
        stats,
        loading,
        error,
        pagination,
        search,
        companyId,
        placementStatus,
        placementType,
        acceptanceStatus,
        offerLetterVerified,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleSortChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        handleAcceptanceFilterChange,
        handleVerifiedFilterChange,
        clearFilters,
        refresh: refetch,
    };
};
