import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import type { ApplicationDetailResponse } from "@/services/student/jobBrowsing.service"

export function useApplicationDetail(applicationId: string | undefined) {
  const query = useQuery<ApplicationDetailResponse>({
    queryKey: queryKeys.studentPortal.applicationDetail(applicationId!),
    queryFn: () => JobBrowsingService.getApplicationDetail(applicationId!),
    enabled: !!applicationId,
    staleTime: 2 * 60 * 1000,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
