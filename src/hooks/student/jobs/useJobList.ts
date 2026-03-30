import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useEffect } from "react"
import { queryKeys } from "@/lib/queryKeys"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import type { JobListFilters, JobListResponse } from "@/services/student/jobBrowsing.service"

export function useJobList(filters: JobListFilters = {}) {
  const queryClient = useQueryClient()

  const query = useQuery<JobListResponse>({
    queryKey: queryKeys.studentPortal.availableJobs(filters as Record<string, unknown>),
    queryFn: () => JobBrowsingService.getAvailableJobs(filters),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  // Prefetch next page for smoother pagination
  const currentPage = filters.page ?? 1
  const totalPages = query.data?.pagination?.totalPages ?? 0
  useEffect(() => {
    if (currentPage < totalPages) {
      const nextFilters = { ...filters, page: currentPage + 1 }
      queryClient.prefetchQuery({
        queryKey: queryKeys.studentPortal.availableJobs(nextFilters as Record<string, unknown>),
        queryFn: () => JobBrowsingService.getAvailableJobs(nextFilters),
        staleTime: 2 * 60 * 1000,
      })
    }
  }, [currentPage, totalPages, queryClient, filters])

  return {
    jobs: query.data?.jobs ?? [],
    pagination: query.data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  }
}
