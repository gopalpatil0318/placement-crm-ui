import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { useYearFilter } from "@/context/YearFilterContext";

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
    const { selectedYear } = useYearFilter();

    const { data, isLoading, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.departments.detail(deptId ?? "", selectedYear),
        queryFn: () => CollegeAdminService.getDepartment(deptId!, { passout_year: selectedYear }),
        enabled: !!deptId,
    });

    const department: DepartmentDetail | null = data?.data ?? data ?? null;
    const loading = isLoading;
    const errorMessage = queryError instanceof Error ? queryError.message : "Failed to fetch department";
    const error = queryError ? errorMessage : null;

    return { department, loading, error, refresh: refetch };
};
