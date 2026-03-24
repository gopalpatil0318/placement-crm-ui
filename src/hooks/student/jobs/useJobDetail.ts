import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import type { JobDetailResponse } from "@/services/student/jobBrowsing.service"

export function useJobDetail(jobId: string | undefined) {
  const query = useQuery<JobDetailResponse>({
    queryKey: queryKeys.studentPortal.jobDetail(jobId!),
    queryFn: () => JobBrowsingService.getJobDetail(jobId!),
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
