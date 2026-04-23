import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { ApiError } from "@/lib/api"
import { showToast, getErrorTitle } from "@/utils/ToastUtils"
import { SelfReportService } from "@/services/student/selfReport.service"

export function useCancelSelfReport() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (reportId: string) =>
      SelfReportService.cancelSelfReport(reportId),
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Self-Report Cancelled",
        description: "Your self-report has been withdrawn.",
      })

      void queryClient.invalidateQueries({
        queryKey: queryKeys.studentPortal.mySelfReports(),
      })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to cancel self-report"
      const status = error instanceof ApiError ? error.status : undefined
      showToast({
        type: "error",
        title: getErrorTitle(status),
        description: message,
      })
    },
  })

  return {
    cancelSelfReport: mutation.mutate,
    isCancelling: mutation.isPending,
  }
}
