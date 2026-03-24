import { useState } from "react"
import { AlertTriangle, Building2, Loader2, ShieldCheck, XCircle } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useRequestOverride } from "@/hooks/student/overrides/useRequestOverride"

// ─── Component ──────────────────────────────────────────────────────────────────

interface OverrideRequestModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  jobTitle: string
  companyName: string
  ineligibilityReasons: string[]
}

export default function OverrideRequestModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
  ineligibilityReasons,
}: OverrideRequestModalProps) {
  const {
    requestReason,
    errors,
    handleChange,
    validate,
    submitRequest,
    resetForm,
    isSubmitting,
  } = useRequestOverride(jobId)

  const [showConfirm, setShowConfirm] = useState(false)

  const handleClose = () => {
    if (!isSubmitting) {
      setShowConfirm(false)
      resetForm()
      onClose()
    }
  }

  const handleConfirmClick = () => {
    const payload = validate()
    if (!payload) return
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }
    submitRequest(payload, {
      onSuccess: () => {
        setShowConfirm(false)
        resetForm()
        onClose()
      },
    })
  }

  const charCount = requestReason.length
  const isValid = charCount >= 20 && charCount <= 2000

  const footer = (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <button
        type="button"
        onClick={showConfirm ? () => setShowConfirm(false) : handleClose}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
      >
        {showConfirm ? "Go Back" : "Cancel"}
      </button>
      <button
        type="button"
        onClick={handleConfirmClick}
        disabled={isSubmitting || !isValid}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ShieldCheck size={16} />
        )}
        {isSubmitting ? "Submitting…" : showConfirm ? "Yes, Submit Request" : "Submit Override Request"}
      </button>
    </div>
  )

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      disabled={isSubmitting}
      size="md"
      title="Request Eligibility Override"
      titleIcon={
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      }
      footer={footer}
    >
      <div className="p-6 space-y-5">
        {/* Job Context (read-only) */}
        <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <Building2 size={18} className="mt-0.5 shrink-0 text-gray-500 dark:text-gray-400" />
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {jobTitle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {companyName}
              </p>
              {ineligibilityReasons.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    Ineligibility reasons:
                  </p>
                  {ineligibilityReasons.map((reason, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <XCircle size={12} className="shrink-0" />
                      {reason}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30">
          <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Your request will be reviewed by college placement staff.
            You can only submit one override request per job. Once rejected, you cannot re-request.
          </p>
        </div>

        {/* Request Reason Textarea */}
        <div className="space-y-2">
          <label
            htmlFor="request-reason"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Why should you be considered? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="request-reason"
            value={requestReason}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Explain your relevant skills, experience, certifications, or other reasons why you should be considered despite not meeting the standard criteria…"
            rows={5}
            maxLength={2000}
            aria-required="true"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
              errors.request_reason
                ? "border-red-300 dark:border-red-700 focus:ring-red-500/30"
                : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500/30"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none`}
          />
          <div className="flex items-center justify-between">
            {errors.request_reason ? (
              <p className="text-xs text-red-500 dark:text-red-400">
                {errors.request_reason}
              </p>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Minimum 20 characters
              </p>
            )}
            <p
              aria-live="polite"
              className={`text-xs ${
                charCount > 2000
                  ? "text-red-500"
                  : charCount > 1800
                    ? "text-amber-500"
                    : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {charCount}/2000
            </p>
          </div>
        </div>

        {/* Confirmation Banner */}
        {showConfirm && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200/60 dark:border-red-800/30">
            <AlertTriangle size={16} className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-300">
              Are you sure? This action is irrevocable. You can only submit one override request per job — once submitted, it cannot be edited or withdrawn.
            </p>
          </div>
        )}
      </div>
    </ModalWrapper>
  )
}
