import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import type { JobListFilters, JobListResponse } from "@/services/student/jobBrowsing.service"

export function useJobList(filters: JobListFilters = {}) {
  const query = useQuery<JobListResponse>({
    queryKey: queryKeys.studentPortal.availableJobs(filters as Record<string, unknown>),
    queryFn: () => JobBrowsingService.getAvailableJobs(filters),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  return {
    jobs: query.data?.jobs ?? [],
    pagination: query.data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  }
}
