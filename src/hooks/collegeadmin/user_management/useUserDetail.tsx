import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

export interface UserDetail {
    user_id: string;
    user_name: string;
    user_email: string;
    user_role: string;
    user_status: string;
    dept_id: string | null;
    dept_name: string | null;
    college_id: string;
    college_name: string;
    created_at: string;
    updated_at: string;
}

export const useUserDetail = (userId: string) => {
    const { data, isLoading, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.users.detail(userId!),
        queryFn: async () => {
            const response = await CollegeAdminService.getUser(userId);
            return (response.data || response) as UserDetail;
        },
        enabled: !!userId,
    });

    const error = queryError
        ? (queryError instanceof Error ? queryError.message : "Failed to fetch user details")
        : null;

    return { user: data ?? null, loading: isLoading, error, refresh: refetch };
};
