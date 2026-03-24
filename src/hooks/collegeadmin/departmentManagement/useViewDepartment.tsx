import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface DepartmentDetail {
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

// ========================
// HOOK
// ========================

export const useViewDepartment = (deptId: string | undefined) => {
    const { data, isLoading, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.departments.detail(deptId ?? ""),
        queryFn: () => CollegeAdminService.getDepartment(deptId!),
        enabled: !!deptId,
    });

    const department: DepartmentDetail | null = data?.data ?? data ?? null;
    const loading = isLoading;
    const error = queryError
        ? (queryError instanceof Error ? queryError.message : "Failed to fetch department")
        : null;

    return { department, loading, error, refresh: refetch };
};
