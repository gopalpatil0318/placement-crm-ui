import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import type { ApplyPayload, ApplyResponse } from "@/services/student/jobBrowsing.service"

export function useApplyJob(jobId: string) {
  const queryClient = useQueryClient()

  return useMutation<ApplyResponse, Error, ApplyPayload>({
    mutationFn: (payload) => JobBrowsingService.applyForJob(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.jobDetail(jobId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.eligibility(jobId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.availableJobs() })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.myApplications() })
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Application Failed",
        description: error instanceof ApiError ? error.message : "Something went wrong",
      })
    },
  })
}
