import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { StudentProfileService } from "@/services/student/student.services"
import { DashboardService } from "@/services/student/dashboard.service"
import type { ProfileCompletion } from "@/types/student"
import type { ApplicationsResponse, JobsResponse } from "@/services/student/dashboard.service"

export function useDashboard() {
  const profileQuery = useQuery<ProfileCompletion>({
    queryKey: queryKeys.studentPortal.profileCompletion(),
    queryFn: () => StudentProfileService.getProfileCompletion(),
    staleTime: 5 * 60 * 1000,
  })

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
