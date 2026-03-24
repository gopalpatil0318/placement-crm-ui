import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface Company {
    company_id: string;
    company_name: string;
    industry: string | null;
    company_status: string;
    company_website: string | null;
    company_logo: string | null;
    contacts_count: number;
    jobs_count: number;
    created_at: string;
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

export const useViewCompanies = (config?: { limit?: number; status?: "" | "active" | "inactive" }) => {
    // ── Local filter / pagination state ──
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(config?.limit ?? 20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(config?.status ?? "");
    const [industryFilter, setIndustryFilter] = useState("");
    const [sortBy, setSortBy] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<string>("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── React Query ──
    const queryFilters = {
        page,
        limit,
        search: debouncedSearch || undefined,
        company_status: statusFilter || undefined,
        industry: industryFilter || undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    };

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.companies.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllCompanies(queryFilters),
        placeholderData: keepPreviousData,
    });

    const companies: Company[] = Array.isArray(data?.data) ? data.data : [];
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading || isFetching;
    const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch companies") : null;

    // ── Handlers (same API surface as before) ──

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

    const handleStatusFilterChange = useCallback((value: "" | "active" | "inactive") => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    const handleIndustryFilterChange = useCallback((value: string) => {
        setIndustryFilter(value);
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

    const handleSortOrderToggle = useCallback(() => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        setPage(1);
    }, []);

    return {
        companies,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        industryFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleIndustryFilterChange,
        handleSortChange,
        handleSortOrderToggle,
        refresh: refetch,
    };
};
