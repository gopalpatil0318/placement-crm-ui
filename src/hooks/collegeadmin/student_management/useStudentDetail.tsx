import { useState, useEffect, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

export interface StudentDetail {
    student_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    student_email: string;
    dept_id: string;
    dept_name: string;
    student_passout_year: number;
    current_year: number;
    student_status: string;
    profile_complete: boolean;
    profile_is_approved: boolean;
    created_at: string;
    updated_at: string;
}

export const useStudentDetail = (studentId: string) => {
    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudent = useCallback(async () => {
        if (!studentId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await CollegeAdminService.getStudent(studentId);
            setStudent(response.data || response);
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || "Failed to fetch student details";
            setError(msg);
            showToast({ type: "error", title: "Error", description: msg });
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        fetchStudent();
    }, [fetchStudent]);

    return { student, loading, error, refresh: fetchStudent };
};
