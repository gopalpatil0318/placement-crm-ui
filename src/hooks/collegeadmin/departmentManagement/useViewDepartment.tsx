import { useState, useEffect, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

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
    const [department, setDepartment] = useState<DepartmentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDepartment = useCallback(async () => {
        if (!deptId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await CollegeAdminService.getDepartment(deptId);
            // Response is { success, data }, extract data
            setDepartment(response.data || response);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Failed to fetch department";
            setError(msg);
            showToast({ type: "error", title: "Error", description: msg });
        } finally {
            setLoading(false);
        }
    }, [deptId]);

    useEffect(() => {
        fetchDepartment();
    }, [fetchDepartment]);

    return { department, loading, error, refresh: fetchDepartment };
};
