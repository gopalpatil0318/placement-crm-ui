import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import {
    type StudentRestriction,
    type CollegeStudentRestrictionsResponse,
} from "@/validators/RestrictionSchema";

export const useViewStudentRestrictions = (
    studentId: string,
    isActiveFilter?: string,
) => {
    const filters = isActiveFilter ? { is_active: isActiveFilter } : {};

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.restrictions.student(studentId, filters),
        queryFn: () => CollegeAdminService.getStudentRestrictions(studentId, filters),
        enabled: !!studentId,
        staleTime: 30_000,
        retry: 2,
        refetchOnWindowFocus: false,
    });

    const responseData: CollegeStudentRestrictionsResponse | null = data?.data ?? data ?? null;

    const student = responseData?.student ?? null;
    const restrictions: StudentRestriction[] = responseData?.restrictions ?? [];
    const totalRestrictions = responseData?.total_restrictions ?? 0;
    const activeRestrictions = responseData?.active_restrictions ?? 0;

    const error = queryError
        ? queryError instanceof Error
            ? queryError.message
            : "Failed to fetch student restrictions"
        : null;

    return {
        student,
        restrictions,
        totalRestrictions,
        activeRestrictions,
        loading: isLoading,
        isFetching,
        error,
        refresh: refetch,
    };
};
