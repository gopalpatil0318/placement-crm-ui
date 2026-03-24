import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import type { ApplicationsListFilters, ApplicationsListResponse } from "@/services/student/jobBrowsing.service"

export function useMyApplications(filters: ApplicationsListFilters = {}) {
  const query = useQuery<ApplicationsListResponse>({
    queryKey: queryKeys.studentPortal.myApplications(filters),
    queryFn: () => JobBrowsingService.getMyApplications(filters),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  return {
    applications: query.data?.applications ?? [],
    statusSummary: query.data?.status_summary ?? null,
    pagination: query.data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  }
}
