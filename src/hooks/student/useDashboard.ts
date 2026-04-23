import { useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { DashboardService } from "@/services/student/dashboard.service"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import type { DashboardOverviewResponse } from "@/services/student/dashboard.service"

export function useDashboard() {
  const { user, refreshUser } = useStudentAuth()

  const dashboardQuery = useQuery<DashboardOverviewResponse>({
    queryKey: queryKeys.studentPortal.dashboardOverview(),
    queryFn: () => DashboardService.getDashboardOverview(),
    staleTime: 2 * 60 * 1000,
  })

  // Sync approval status to auth context when profile data arrives.
  const lastSyncedApproved = useRef<boolean | undefined>(undefined)
  const apiApproved = dashboardQuery.data?.profile.is_approved
  useEffect(() => {
    if (apiApproved === undefined) return
    if (apiApproved === lastSyncedApproved.current) return
    if (apiApproved !== user?.profileIsApproved) {
      lastSyncedApproved.current = apiApproved
      refreshUser()
    }
  }, [apiApproved, user?.profileIsApproved, refreshUser])

  const data = dashboardQuery.data

  return {
    journeyStage: data?.journey_stage ?? "onboarding",
    profile: data?.profile ?? null,
    actions: data?.actions ?? [],
    funnel: data?.funnel ?? null,
    schedule: data?.schedule ?? [],
    placementContext: data?.placement_context ?? null,
    quickStats: data?.quick_stats ?? null,
    waitlistRanks: data?.waitlist_ranks ?? [],
    enabledFeatures: data?.enabled_features ?? ["core"],
    isLoading: dashboardQuery.isLoading,
    hasError: dashboardQuery.isError,
    refetch: () => dashboardQuery.refetch(),
  }
}
