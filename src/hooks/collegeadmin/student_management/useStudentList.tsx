import { useState, useEffect, useCallback } from "react";
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
    passoutYear: number;
    status: string;
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
        passoutYear: options?.initialPassoutYear || new Date().getFullYear() + 1,
        status: options?.initialStatus || "active",
        page: 1,
        limit: 20,
    });

    // Fetch departments for the filter dropdown
    const fetchDepartments = useCallback(async () => {
        try {
            const apiData = await CollegeAdminService.getDepartments();
            setDepartments(
                Array.isArray(apiData)
                    ? apiData
                    : Array.isArray(apiData?.departments)
                        ? apiData.departments
                        : []
            );
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
    }, [filters]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const updateFilters = (partial: Partial<StudentFilters>) => {
        setFilters((prev) => ({
            ...prev,
            ...partial,
            // Reset to page 1 when filters change (unless page is being set)
            page: partial.page !== undefined ? partial.page : 1,
        }));
    };

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
        updateStudentStatus,
        refresh: fetchStudents,
    };
};
