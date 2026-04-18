import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import type { WithdrawPayload, WithdrawResponse } from "@/services/student/jobBrowsing.service"

export function useWithdrawApplication(applicationId: string) {
  const queryClient = useQueryClient()

  return useMutation<WithdrawResponse, Error, WithdrawPayload>({
    mutationFn: (payload) => JobBrowsingService.withdrawApplication(applicationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.applicationDetail(applicationId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.myApplications() })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.availableJobs() })
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Withdrawal Failed",
        description: error instanceof ApiError ? error.message : "Something went wrong",
      })
    },
  })
}
