import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"

export function useAvailableJobYears() {
  const { user } = useStudentAuth()

  const query = useQuery<number[]>({
    queryKey: queryKeys.studentPortal.availableJobYears(),
    queryFn: () => JobBrowsingService.getAvailableJobYears(),
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  })

  return {
    years: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
