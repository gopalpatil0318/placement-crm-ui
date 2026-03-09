import { useState, useEffect, useCallback, useRef } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

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

export const useViewCompanies = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
    const [industryFilter, setIndustryFilter] = useState("");
    const [sortBy, setSortBy] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<string>("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchCompanies = useCallback(
        async (
            page: number,
            limit: number,
            searchTerm: string,
            status: "" | "active" | "inactive",
            industry: string,
            sort_by: string,
            sort_order: string
        ) => {
            setLoading(true);
            setError(null);

            try {
                const response = await CollegeAdminService.getAllCompanies({
                    page,
                    limit,
                    search: searchTerm || undefined,
                    company_status: status || undefined,
                    industry: industry || undefined,
                    sort_by: sort_by || undefined,
                    sort_order: sort_order || undefined,
                });

                setCompanies(Array.isArray(response.data) ? response.data : []);

                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } catch (err: unknown) {
                const msg =
                    err instanceof Error ? err.message : "Failed to fetch companies";
                setError(msg);
                showToast({ type: "error", title: "Fetch Error", description: msg });
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Refetch when pagination or filters change
    useEffect(() => {
        fetchCompanies(
            pagination.page,
            pagination.limit,
            search,
            statusFilter,
            industryFilter,
            sortBy,
            sortOrder
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, statusFilter, industryFilter, sortBy, sortOrder, fetchCompanies]);

    // Debounced search — 300ms
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearch(value);

            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }

            searchTimerRef.current = setTimeout(() => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchCompanies(1, pagination.limit, value, statusFilter, industryFilter, sortBy, sortOrder);
            }, 300);
        },
        [fetchCompanies, pagination.limit, statusFilter, industryFilter, sortBy, sortOrder]
    );

    const handlePageChange = useCallback((newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
    }, []);

    const handleStatusFilterChange = useCallback((value: "" | "active" | "inactive") => {
        setStatusFilter(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const handleIndustryFilterChange = useCallback((value: string) => {
        setIndustryFilter(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSortBy(field);
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const refresh = useCallback(() => {
        fetchCompanies(pagination.page, pagination.limit, search, statusFilter, industryFilter, sortBy, sortOrder);
    }, [fetchCompanies, pagination.page, pagination.limit, search, statusFilter, industryFilter, sortBy, sortOrder]);

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
        refresh,
    };
};
