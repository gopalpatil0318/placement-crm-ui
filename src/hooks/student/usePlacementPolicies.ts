import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import {
  PlacementPolicyService,
  type PlacementPoliciesResponse,
} from "@/services/student/placementPolicy.service"

export function usePlacementPolicies() {
  const query = useQuery<PlacementPoliciesResponse>({
    queryKey: queryKeys.studentPortal.placementPolicies(),
    queryFn: PlacementPolicyService.getActivePolicies,
    staleTime: 5 * 60 * 1000,
  })

  return {
    policies: query.data?.policies ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
