import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { SelfReportService } from "@/services/student/selfReport.service"

export function useCompanyJobs(companyId: string | null | undefined) {
  const id = companyId ?? ""

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.studentPortal.companyJobs(id),
    queryFn: () => SelfReportService.getCompanyJobs(id),
    enabled: !!companyId,
    staleTime: 60_000,
  })

  return {
    jobs: data ?? [],
    isLoadingJobs: isLoading && !!companyId,
  }
}
