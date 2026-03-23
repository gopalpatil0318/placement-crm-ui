import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { OverridesService } from "@/services/student/overrides.service"
import type { OverrideEligibility } from "@/validators/OverrideSchema"

export function useCheckOverrideEligibility(
  jobId: string | undefined,
  enabled = false,
) {
  const query = useQuery<OverrideEligibility>({
    queryKey: queryKeys.studentPortal.overrideEligibility(jobId!),
    queryFn: () => OverridesService.checkOverrideEligibility(jobId!),
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
