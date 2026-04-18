import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import type { DenyPayload, DenyResponse } from "@/services/student/jobBrowsing.service"

export function useDenyJob(jobId: string) {
  const queryClient = useQueryClient()

  return useMutation<DenyResponse, Error, DenyPayload>({
    mutationFn: (payload) => JobBrowsingService.denyJob(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.jobDetail(jobId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.eligibility(jobId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.availableJobs() })
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Denial Failed",
        description: error instanceof ApiError ? error.message : "Something went wrong",
      })
    },
  })
}
