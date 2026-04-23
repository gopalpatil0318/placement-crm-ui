import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { SelfReportService } from "@/services/student/selfReport.service"

export function useCompanySearch(search: string) {
  const trimmed = search.trim()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.studentPortal.companySearch(trimmed),
    queryFn: () => SelfReportService.searchCompanies(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
  })

  return {
    companies: data ?? [],
    isSearching: isLoading && trimmed.length >= 2,
  }
}
