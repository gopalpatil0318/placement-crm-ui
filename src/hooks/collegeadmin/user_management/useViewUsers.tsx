import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

export interface User {
    user_id: string;
    user_name: string;
    user_email: string;
    user_role: string;
    user_status: string;
    dept_id: string | null;
    dept_name: string | null;
    created_at: string;
    updated_at: string;
}

export const useViewUsers = () => {
    // ── Local filter / pagination state ──
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── React Query ──
    const queryFilters = {
        page,
        limit,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
    };

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.users.all(queryFilters),
        queryFn: () => CollegeAdminService.getUsers(queryFilters),
        placeholderData: keepPreviousData,
    });

    // ── Derive data from response ──
    const users: User[] = Array.isArray(data?.data) ? data.data : [];
    const pagination = data?.pagination || { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading;
    const error = queryError
        ? (queryError instanceof Error ? queryError.message : "Failed to fetch users")
        : null;

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
        setPage(1);
        setLimit(newLimit);
    }, []);

    const handleRoleFilterChange = useCallback((role: string) => {
        setRoleFilter(role);
        setPage(1);
    }, []);

    const handleStatusFilterChange = useCallback((status: string) => {
        setStatusFilter(status);
        setPage(1);
    }, []);

    return {
        users,
        loading,
        isFetching,
        error,
        pagination,
        search,
        roleFilter,
        statusFilter,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleRoleFilterChange,
        handleStatusFilterChange,
        refresh: refetch,
    };
};
