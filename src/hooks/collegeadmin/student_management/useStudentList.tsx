import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { showToast } from "@/utils/ToastUtils";
import { useYearFilter } from "@/context/YearFilterContext";

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface StudentFilters {
    deptId: string;
    status: string;            // "" = all statuses
    search: string;
    profileComplete: string;   // "" | "true" | "false"
    profileApproved: string;   // "" | "true" | "false"
    page: number;
    limit: number;
}

interface UseStudentListOptions {
    initialDeptId?: string;
    initialStatus?: string;
}

export const useStudentList = (options?: UseStudentListOptions) => {
    const queryClient = useQueryClient();
    const { selectedYear } = useYearFilter();

    const [filters, setFilters] = useState<StudentFilters>({
        deptId: options?.initialDeptId || "",
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
        selectedYear,
        status: filters.status,
        search: debouncedSearch,
        profileComplete: filters.profileComplete,
        profileApproved: filters.profileApproved,
        page: filters.page,
        limit: filters.limit,
    }), [filters.deptId, selectedYear, filters.status, debouncedSearch, filters.profileComplete, filters.profileApproved, filters.page, filters.limit]);

    // Build query params helper
    const buildQueryParams = useCallback((page: number) => ({
        dept_id: filters.deptId || undefined,
        student_passout_year: selectedYear,
        student_status: filters.status || undefined,
        search: debouncedSearch || undefined,
        profile_complete: filters.profileComplete ? filters.profileComplete === "true" : undefined,
        profile_is_approved: filters.profileApproved ? filters.profileApproved === "true" : undefined,
        page,
        limit: filters.limit,
    }), [filters.deptId, selectedYear, filters.status, debouncedSearch, filters.profileComplete, filters.profileApproved, filters.limit]);

    // Fetch students via React Query
    const studentsQuery = useQuery({
        queryKey: queryKeys.students.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllStudents(buildQueryParams(filters.page)),
        placeholderData: keepPreviousData,
    });

    // Prefetch next page
    const totalPages = studentsQuery.data?.pagination?.totalPages ?? 0;
    useEffect(() => {
        if (filters.page < totalPages) {
            const nextPageFilters = { ...queryFilters, page: filters.page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.students.all(nextPageFilters),
                queryFn: () => CollegeAdminService.getAllStudents(buildQueryParams(filters.page + 1)),
            });
        }
    }, [filters.page, totalPages, queryFilters, buildQueryParams, queryClient]);

    // Fetch departments for filter dropdown
    const departmentsQuery = useQuery({
        queryKey: queryKeys.departments.all({ is_active: true, limit: 100 }),
        queryFn: () => CollegeAdminService.getDepartments({ is_active: true, limit: 100 }),
    });

    // Status toggle mutation with optimistic update
    const statusMutation = useMutation({
        mutationFn: ({ studentId, status }: { studentId: string; status: string }) =>
            CollegeAdminService.updateStudentStatus(studentId, status),
        onMutate: async ({ studentId, status }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.students.all(queryFilters) });
            const previousData = queryClient.getQueryData(queryKeys.students.all(queryFilters));
            queryClient.setQueryData(queryKeys.students.all(queryFilters), (old: Record<string, unknown> | undefined) => {
                if (!old || !Array.isArray((old as { data?: unknown[] }).data)) return old;
                return {
                    ...old,
                    data: ((old as { data: Array<{ student_id: string; student_status: string }> }).data).map((s) =>
                        s.student_id === studentId ? { ...s, student_status: status } : s
                    ),
                };
            });
            return { previousData };
        },
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(variables.studentId) });
            const message = (response as { message?: string })?.message || `Student status changed to ${variables.status}`;
            showToast({
                type: "success",
                title: "Status Updated",
                description: message,
            });
        },
        onError: (error: unknown, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKeys.students.all(queryFilters), context.previousData);
            }
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
    let departments: unknown[];
    if (Array.isArray(deptData?.data)) {
        departments = deptData.data;
    } else if (Array.isArray(deptData)) {
        departments = deptData;
    } else {
        departments = [];
    }
    const loading = studentsQuery.isLoading;
    const isFetching = studentsQuery.isFetching;
    let error: string | null = null;
    if (studentsQuery.error) {
        error = studentsQuery.error instanceof ApiError ? studentsQuery.error.message : "Failed to fetch students";
    }

    const updateFilters = useCallback((partial: Partial<StudentFilters>) => {
        setFilters((prev) => ({
            ...prev,
            ...partial,
            page: partial.page ?? 1,
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
