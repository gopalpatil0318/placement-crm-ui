import { AlertCircle, Loader2 } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useCancelSelfReport } from "@/hooks/student/self-report/useCancelSelfReport"
import type { SelfReport } from "@/services/student/selfReport.service"

interface CancelSelfReportModalProps {
  report: SelfReport | null
  onClose: () => void
  onSuccess: () => void
}

export default function CancelSelfReportModal({
  report,
  onClose,
  onSuccess,
}: CancelSelfReportModalProps) {
  const { cancelSelfReport, isCancelling } = useCancelSelfReport()

  if (!report) return null

  const handleConfirm = () => {
    cancelSelfReport(report.report_id, {
      onSuccess: () => {
        onSuccess()
      },
    })
  }

  return (
    <ModalWrapper
      isOpen={!!report}
      onClose={onClose}
      disabled={isCancelling}
      size="sm"
      title="Cancel Self-Report"
      titleIcon={<AlertCircle className="h-5 w-5 text-red-500" />}
    >
      <div className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to cancel your self-report for{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {report.form_data.job_title}
          </span>{" "}
          at{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {report.form_data.company_name}
          </span>
          ?
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          This action cannot be undone. You can submit a new report later.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Keep It
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isCancelling}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}
            Yes, Cancel Report
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
