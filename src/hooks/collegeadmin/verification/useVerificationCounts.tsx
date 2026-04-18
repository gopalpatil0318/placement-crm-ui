import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { useYearFilter } from "@/context/YearFilterContext";

export interface VerificationCounts {
    profiles: number;
    experiences: number;
    achievements: number;
    certificates: number;
    total: number;
}

export function useVerificationCounts() {
    const { selectedYear } = useYearFilter();

    const { data, isLoading, isFetching } = useQuery({
        queryKey: queryKeys.verifications.counts(selectedYear),
        queryFn: () => CollegeAdminService.getPendingVerificationCounts({ student_passout_year: selectedYear }),
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
