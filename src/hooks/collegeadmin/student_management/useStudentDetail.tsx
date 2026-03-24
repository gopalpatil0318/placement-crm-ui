import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

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
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.students.detail(studentId!),
        queryFn: async () => {
            const response = await CollegeAdminService.getStudent(studentId);
            return (response.data || response) as StudentDetail;
        },
        enabled: !!studentId,
    });

    return {
        student: data ?? null,
        loading: isLoading,
        error: error
            ? (error instanceof ApiError ? error.message : "Failed to fetch student details")
            : null,
        refresh: refetch,
    };
};
