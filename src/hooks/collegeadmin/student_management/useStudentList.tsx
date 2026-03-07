import { useState, useEffect, useCallback, useRef } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
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
    const [students, setStudents] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
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

    // Fetch departments for filter dropdown
    const fetchDepartments = useCallback(async () => {
        try {
            const apiData = await CollegeAdminService.getDepartments({ is_active: true, limit: 100 });
            const deptList = Array.isArray(apiData?.data) ? apiData.data : Array.isArray(apiData) ? apiData : [];
            setDepartments(deptList);
        } catch {
            // Silently fail — departments dropdown will just be empty
        }
    }, []);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await CollegeAdminService.getAllStudents({
                dept_id: filters.deptId || undefined,
                student_passout_year: filters.passoutYear || undefined,
                student_status: filters.status || undefined,
                search: debouncedSearch || undefined,
                profile_complete: filters.profileComplete ? filters.profileComplete === "true" : undefined,
                profile_is_approved: filters.profileApproved ? filters.profileApproved === "true" : undefined,
                page: filters.page,
                limit: filters.limit,
            });

            setStudents(Array.isArray(response.data) ? response.data : []);
            setPagination(
                response.pagination || {
                    page: filters.page,
                    limit: filters.limit,
                    total: 0,
                    totalPages: 0,
                }
            );
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to fetch students";

            setError(errorMessage);
            setStudents([]);

            showToast({
                type: "error",
                title: "Fetch Error",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [filters.deptId, filters.passoutYear, filters.status, debouncedSearch, filters.profileComplete, filters.profileApproved, filters.page, filters.limit]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);

    const updateFilters = useCallback((partial: Partial<StudentFilters>) => {
        setFilters((prev) => ({
            ...prev,
            ...partial,
            // Reset to page 1 when filters change (unless page is being set)
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
        try {
            await CollegeAdminService.updateStudentStatus(studentId, status);
            showToast({
                type: "success",
                title: "Status Updated",
                description: `Student status changed to ${status}`,
            });
            fetchStudents();
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update student status";
            showToast({
                type: "error",
                title: "Update Error",
                description: errorMessage,
            });
        }
    };

    return {
        students,
        departments,
        loading,
        error,
        pagination,
        filters,
        updateFilters,
        handleSearchChange,
        handleLimitChange,
        handlePageChange,
        updateStudentStatus,
        refresh: fetchStudents,
    };
};
