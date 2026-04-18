import { useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { StudentProfileService } from "@/services/student/student.services"
import { DashboardService } from "@/services/student/dashboard.service"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import type { ProfileCompletion } from "@/types/student"
import type { ApplicationsResponse, JobsResponse } from "@/services/student/dashboard.service"

export function useDashboard() {
  const { user, refreshUser } = useStudentAuth()

  const profileQuery = useQuery<ProfileCompletion>({
    queryKey: queryKeys.studentPortal.profileCompletion(),
    queryFn: () => StudentProfileService.getProfileCompletion(),
    staleTime: 5 * 60 * 1000,
  })

  // Sync approval status to auth context when profile data arrives.
  // Use a ref to track the last synced value and avoid redundant calls.
  const lastSyncedApproved = useRef<boolean | undefined>(undefined)
  const apiApproved = profileQuery.data?.profile_is_approved
  useEffect(() => {
    if (apiApproved === undefined) return
    if (apiApproved === lastSyncedApproved.current) return
    if (apiApproved !== user?.profileIsApproved) {
      lastSyncedApproved.current = apiApproved
      refreshUser()
    }
  }, [apiApproved, user?.profileIsApproved, refreshUser])

  const jobsQuery = useQuery<JobsResponse>({
    queryKey: queryKeys.studentPortal.availableJobs({ dashboard: true }),
    queryFn: () => DashboardService.getAvailableJobs(5),
    staleTime: 2 * 60 * 1000,
  })

  const applicationsQuery = useQuery<ApplicationsResponse>({
    queryKey: queryKeys.studentPortal.myApplications({ dashboard: true }),
    queryFn: () => DashboardService.getMyApplications(5),
    staleTime: 2 * 60 * 1000,
  })

  const isLoading =
    profileQuery.isLoading || jobsQuery.isLoading || applicationsQuery.isLoading

  return {
    // Profile completion
    profileCompletion: profileQuery.data ?? null,
    profileLoading: profileQuery.isLoading,

    // Jobs
    availableJobs: jobsQuery.data?.data ?? [],
    totalJobs: jobsQuery.data?.pagination.total ?? 0,
    jobsLoading: jobsQuery.isLoading,

    // Applications
    recentApplications: applicationsQuery.data?.applications ?? [],
    statusSummary: applicationsQuery.data?.status_summary ?? null,
    applicationsLoading: applicationsQuery.isLoading,

    // Combined
    isLoading,
    hasError: profileQuery.isError || jobsQuery.isError || applicationsQuery.isError,
    refetch: () => {
      profileQuery.refetch();
      jobsQuery.refetch();
      applicationsQuery.refetch();
    },
  }
}
