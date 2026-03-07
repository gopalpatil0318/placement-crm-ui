import { useState, useEffect, useCallback, useRef } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

export interface Department {
    dept_id: string;
    dept_name: string;
    dept_code: string | null;
    dept_type: string | null;
    program_duration_years: number;
    total_semesters: number;
    is_active: boolean;
    created_at: string;
    user_count: number;
    student_count: number;
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

export const useViewDepartments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
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
    const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchDepartments = useCallback(
        async (
            page: number,
            limit: number,
            searchTerm: string,
            isActive: "" | "true" | "false"
        ) => {
            setLoading(true);
            setError(null);

            try {
                const response = await CollegeAdminService.getDepartments({
                    page,
                    limit,
                    search: searchTerm || undefined,
                    is_active:
                        isActive === "true"
                            ? true
                            : isActive === "false"
                                ? false
                                : undefined,
                });

                setDepartments(Array.isArray(response.data) ? response.data : []);

                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } catch (err: unknown) {
                const msg =
                    err instanceof Error ? err.message : "Failed to fetch departments";
                setError(msg);
                showToast({ type: "error", title: "Fetch Error", description: msg });
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Refetch when pagination or status filter changes
    useEffect(() => {
        fetchDepartments(
            pagination.page,
            pagination.limit,
            search,
            statusFilter
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, statusFilter, fetchDepartments]);

    // Debounced search — 300ms
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearch(value);

            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }

            searchTimerRef.current = setTimeout(() => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchDepartments(1, pagination.limit, value, statusFilter);
            }, 300);
        },
        [fetchDepartments, pagination.limit, statusFilter]
    );

    const handlePageChange = useCallback((newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
    }, []);

    const handleStatusFilterChange = useCallback((value: "" | "true" | "false") => {
        setStatusFilter(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const refresh = useCallback(() => {
        fetchDepartments(pagination.page, pagination.limit, search, statusFilter);
    }, [fetchDepartments, pagination.page, pagination.limit, search, statusFilter]);

    return {
        departments,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        refresh,
    };
};
