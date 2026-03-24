import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import type { EligibilityResponse } from "@/services/student/jobBrowsing.service"

export function useJobEligibility(jobId: string | undefined, enabled = false) {
  const query = useQuery<EligibilityResponse>({
    queryKey: queryKeys.studentPortal.eligibility(jobId!),
    queryFn: () => JobBrowsingService.checkEligibility(jobId!),
    enabled: !!jobId && enabled,
    staleTime: 5 * 60 * 1000,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
