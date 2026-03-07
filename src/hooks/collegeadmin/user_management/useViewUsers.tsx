import { useState, useEffect, useCallback, useRef } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

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

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const useViewUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchUsers = useCallback(async (
        page: number,
        limit: number,
        searchTerm: string,
        role: string,
        status: string
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response = await CollegeAdminService.getUsers({
                page,
                limit,
                search: searchTerm || undefined,
                role: role || undefined,
                status: status || undefined,
            });

            setUsers(Array.isArray(response.data) ? response.data : []);

            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error
                ? err.message
                : "Failed to fetch users";

            setError(errorMessage);

            showToast({
                type: "error",
                title: "Fetch Error",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch + refetch when filters change (except search which is debounced)
    useEffect(() => {
        fetchUsers(pagination.page, pagination.limit, search, roleFilter, statusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, roleFilter, statusFilter, fetchUsers]);

    // Debounced search - 300ms
    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        searchTimerRef.current = setTimeout(() => {
            setPagination((prev) => ({ ...prev, page: 1 }));
            fetchUsers(1, pagination.limit, value, roleFilter, statusFilter);
        }, 300);
    }, [fetchUsers, pagination.limit, roleFilter, statusFilter]);

    const handlePageChange = useCallback((newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
    }, []);

    const handleRoleFilterChange = useCallback((role: string) => {
        setRoleFilter(role);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const handleStatusFilterChange = useCallback((status: string) => {
        setStatusFilter(status);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const refresh = useCallback(() => {
        fetchUsers(pagination.page, pagination.limit, search, roleFilter, statusFilter);
    }, [fetchUsers, pagination.page, pagination.limit, search, roleFilter, statusFilter]);

    return {
        users,
        loading,
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
        refresh,
    };
};
