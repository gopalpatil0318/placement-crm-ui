import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { showToast } from "@/utils/ToastUtils";

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface StudentFilters {
    deptId: string;
    passoutYear: number;       // 0 = all years
    status: string;            // "" = all statuses
    search: string;
    profileComplete: string;   // "" | "true" | "false"
    profileApproved: string;   // "" | "true" | "false"
    page: number;
    limit: number;
}

interface UseStudentListOptions {
    initialDeptId?: string;
    initialPassoutYear?: number;
    initialStatus?: string;
}

export const useStudentList = (options?: UseStudentListOptions) => {
    const queryClient = useQueryClient();

    const [filters, setFilters] = useState<StudentFilters>({
        deptId: options?.initialDeptId || "",
        passoutYear: options?.initialPassoutYear || 0,
        status: options?.initialStatus || "",
        search: "",
        profileComplete: "",
        profileApproved: "",
        page: 1,
        limit: 20,
    });

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = useCallback((value: string) => {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));

        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);
    }, []);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);

    // Query filters object for cache key (memoized for stable reference)
    const queryFilters = useMemo(() => ({
        deptId: filters.deptId,
        passoutYear: filters.passoutYear,
        status: filters.status,
        search: debouncedSearch,
        profileComplete: filters.profileComplete,
        profileApproved: filters.profileApproved,
        page: filters.page,
        limit: filters.limit,
    }), [filters.deptId, filters.passoutYear, filters.status, debouncedSearch, filters.profileComplete, filters.profileApproved, filters.page, filters.limit]);

    // Fetch students via React Query
    const studentsQuery = useQuery({
        queryKey: queryKeys.students.all(queryFilters),
        queryFn: () =>
            CollegeAdminService.getAllStudents({
                dept_id: filters.deptId || undefined,
                student_passout_year: filters.passoutYear || undefined,
                student_status: filters.status || undefined,
                search: debouncedSearch || undefined,
                profile_complete: filters.profileComplete ? filters.profileComplete === "true" : undefined,
                profile_is_approved: filters.profileApproved ? filters.profileApproved === "true" : undefined,
                page: filters.page,
                limit: filters.limit,
            }),
        placeholderData: keepPreviousData,
    });

    // Fetch departments for filter dropdown
    const departmentsQuery = useQuery({
        queryKey: queryKeys.departments.all({ is_active: true, limit: 100 }),
        queryFn: () => CollegeAdminService.getDepartments({ is_active: true, limit: 100 }),
    });

    // Status toggle mutation
    const statusMutation = useMutation({
        mutationFn: ({ studentId, status }: { studentId: string; status: string }) =>
            CollegeAdminService.updateStudentStatus(studentId, status),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(variables.studentId) });
            showToast({
                type: "success",
                title: "Status Updated",
                description: `Student status changed to ${variables.status}`,
            });
        },
        onError: (error: unknown) => {
            const errorMessage = error instanceof ApiError ? error.message : "Failed to update student status";
            showToast({
                type: "error",
                title: "Update Error",
                description: errorMessage,
            });
        },
    });

    // Derive data
    const students = Array.isArray(studentsQuery.data?.data) ? studentsQuery.data.data : [];
    const pagination: Pagination = studentsQuery.data?.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: 0,
        totalPages: 0,
    };
    const deptData = departmentsQuery.data;
    const departments = Array.isArray(deptData?.data) ? deptData.data : Array.isArray(deptData) ? deptData : [];
    const loading = studentsQuery.isLoading;
    const isFetching = studentsQuery.isFetching;
    const error = studentsQuery.error
        ? (studentsQuery.error instanceof ApiError ? studentsQuery.error.message : "Failed to fetch students")
        : null;

    const updateFilters = useCallback((partial: Partial<StudentFilters>) => {
        setFilters((prev) => ({
            ...prev,
            ...partial,
            page: partial.page !== undefined ? partial.page : 1,
        }));
    }, []);

    const handleLimitChange = useCallback((limit: number) => {
        updateFilters({ limit, page: 1 });
    }, [updateFilters]);

    const handlePageChange = useCallback((page: number) => {
        updateFilters({ page });
    }, [updateFilters]);

    const updateStudentStatus = async (studentId: string, status: string) => {
        statusMutation.mutate({ studentId, status });
    };

    return {
        students,
        departments,
        loading,
        isFetching,
        error,
        pagination,
        filters,
        updateFilters,
        handleSearchChange,
        handleLimitChange,
        handlePageChange,
        updateStudentStatus,
        refresh: () => { studentsQuery.refetch(); },
    };
};
