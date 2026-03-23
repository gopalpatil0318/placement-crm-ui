import { Loader2, XCircle, AlertTriangle } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useRejectPlacement } from "@/hooks/student/placements/useRejectPlacement"
import type { StudentPlacement } from "@/validators/PlacementSchema"

// ─── Component ──────────────────────────────────────────────────────────────────

interface RejectPlacementModalProps {
  placement: StudentPlacement | null
  isOpen: boolean
  onClose: () => void
}

export default function RejectPlacementModal({
  placement,
  isOpen,
  onClose,
}: RejectPlacementModalProps) {
  const { formData, errors, handleChange, validate, rejectPlacement, resetForm, isRejecting } =
    useRejectPlacement()

  if (!placement) return null

  const handleClose = () => {
    if (!isRejecting) {
      resetForm()
      onClose()
    }
  }

  const handleConfirmClick = () => {
    const payload = validate()
    if (!payload) return
    rejectPlacement(
      { placementId: placement.placement_id, payload },
      {
        onSuccess: () => {
          resetForm()
          onClose()
        },
      },
    )
  }

  const charCount = formData.rejection_reason.length
  const isValid = charCount >= 3 && charCount <= 1000

  const footer = (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <button
        type="button"
        onClick={handleClose}
        disabled={isRejecting}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleConfirmClick}
        disabled={isRejecting || !isValid}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isRejecting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <XCircle size={16} />
        )}
        {isRejecting ? "Rejecting…" : "Decline Offer"}
      </button>
    </div>
  )

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      disabled={isRejecting}
      size="md"
      title="Decline Placement Offer"
      titleIcon={
        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <XCircle size={18} className="text-red-600 dark:text-red-400" />
        </div>
      }
      footer={footer}
    >
      <div className="p-6 space-y-5">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to decline the offer for{" "}
          <span className="font-semibold">{placement.job_title}</span> at{" "}
          <span className="font-semibold">{placement.company_name}</span>?
        </p>

        {/* Warning */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30">
          <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Once rejected, this offer cannot be accepted later. This action is irreversible.
          </p>
        </div>

        {/* Rejection Reason */}
        <div className="space-y-2">
          <label
            htmlFor="rejection-reason"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Reason for declining <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejection-reason"
            value={formData.rejection_reason}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Please explain why you are declining this offer…"
            rows={4}
            maxLength={1000}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
              errors.rejection_reason
                ? "border-red-300 dark:border-red-700 focus:ring-red-500/30"
                : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500/30"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none`}
          />
          <div className="flex items-center justify-between">
            {errors.rejection_reason ? (
              <p className="text-xs text-red-500 dark:text-red-400">
                {errors.rejection_reason}
              </p>
            ) : (
              <span />
            )}
            <p
              className={`text-xs ${
                charCount > 1000
                  ? "text-red-500"
                  : charCount > 900
                    ? "text-amber-500"
                    : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {charCount}/1000
            </p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
