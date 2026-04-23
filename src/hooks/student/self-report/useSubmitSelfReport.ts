import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { ApiError } from "@/lib/api"
import { showToast, getErrorTitle } from "@/utils/ToastUtils"
import { SelfReportService } from "@/services/student/selfReport.service"
import type { SelfReportFormData } from "@/services/student/selfReport.service"

export function useSubmitSelfReport() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: SelfReportFormData) =>
      SelfReportService.submitSelfReport(data),
    onSuccess: (report) => {
      showToast({
        type: "success",
        title: "Self-Report Submitted",
        description: `Your placement at ${report.form_data.company_name} is now pending review.`,
      })

      // Invalidate the self-reports list
      void queryClient.invalidateQueries({
        queryKey: queryKeys.studentPortal.mySelfReports(),
      })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to submit self-report"
      const status = error instanceof ApiError ? error.status : undefined
      showToast({
        type: "error",
        title: getErrorTitle(status),
        description: message,
      })
    },
  })

  return {
    submitSelfReport: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  }
}
