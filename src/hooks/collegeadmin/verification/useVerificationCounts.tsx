import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";

export interface VerificationCounts {
    profiles: number;
    experiences: number;
    achievements: number;
    certificates: number;
    total: number;
}

export function useVerificationCounts() {
    const { data, isLoading, isFetching } = useQuery({
        queryKey: queryKeys.verifications.counts(),
        queryFn: () => CollegeAdminService.getPendingVerificationCounts(),
    });

    const counts: VerificationCounts = data?.data ?? {
        profiles: 0,
        experiences: 0,
        achievements: 0,
        certificates: 0,
        total: 0,
    };

    return { counts, isLoading, isFetching };
}
