import { useState } from "react"
import { AlertTriangle, Calendar, Loader2, MessageSquareText, Shield } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useAppealRestriction } from "@/hooks/student/restrictions/useAppealRestriction"
import {
  RESTRICTION_TYPE_LABELS,
  RESTRICTION_TYPE_COLORS,
  type StudentRestriction,
} from "@/validators/RestrictionSchema"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
  if (!d) return "No expiry"
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface AppealModalProps {
  restriction: StudentRestriction | null
  isOpen: boolean
  onClose: () => void
}

export default function AppealModal({ restriction, isOpen, onClose }: Readonly<AppealModalProps>) {
  const {
    appealNotes,
    errors,
    handleChange,
    validate,
    submitAppeal,
    resetForm,
    isSubmitting,
  } = useAppealRestriction()

  const [showConfirm, setShowConfirm] = useState(false)

  if (!restriction) return null

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
    submitAppeal(
      { restrictionId: restriction.restriction_id, data: payload },
      {
        onSuccess: () => {
          setShowConfirm(false)
          resetForm()
          onClose()
        },
      },
    )
  }

  const charCount = appealNotes.length
  const isValid = charCount >= 10 && charCount <= 2000
  const typeColor = RESTRICTION_TYPE_COLORS[restriction.restriction_type]

  let buttonText = "Submit Appeal"
  if (isSubmitting) buttonText = "Submitting\u2026"
  else if (showConfirm) buttonText = "Yes, Submit Appeal"

  let cancelText = "Cancel"
  let cancelHandler = handleClose
  if (showConfirm) {
    cancelText = "Go Back"
    cancelHandler = () => setShowConfirm(false)
  }
  const buttonIcon = isSubmitting
    ? <Loader2 size={16} className="animate-spin" />
    : <MessageSquareText size={16} />

  const footer = (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <button
        type="button"
        onClick={cancelHandler}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={handleConfirmClick}
        disabled={isSubmitting || !isValid}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
      >
        {buttonIcon}
        {buttonText}
      </button>
    </div>
  )

  let charCountColor = "text-gray-400 dark:text-gray-500"
  if (charCount > 2000) charCountColor = "text-red-500"
  else if (charCount > 1800) charCountColor = "text-amber-500"

  const textareaBorder = errors.appeal_notes
    ? "border-red-300 dark:border-red-700 focus:ring-red-500/30"
    : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500/30"

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      disabled={isSubmitting}
      size="md"
      title="Submit Appeal"
      titleIcon={
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <MessageSquareText size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      }
      footer={footer}
    >
      <div className="p-6 space-y-5">
        {/* Restriction Context (read-only) */}
        <div className={`rounded-xl p-4 ${typeColor.bg} ${typeColor.border} border`}>
          <div className="flex items-start gap-3">
            <Shield size={18} className={`mt-0.5 shrink-0 ${typeColor.text}`} />
            <div className="min-w-0 space-y-1.5">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 ${typeColor.text}`}>
                {RESTRICTION_TYPE_LABELS[restriction.restriction_type]}
              </span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {restriction.reason}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} />
                  Applied: {formatDate(restriction.applied_on)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} />
                  Until: {formatDate(restriction.valid_until)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning — One-time action */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30">
          <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            This is a one-time action. Once submitted, you cannot modify or resubmit your appeal.
            Please provide a clear and complete explanation.
          </p>
        </div>

        {/* Appeal Notes Textarea */}
        <div className="space-y-2">
          <label
            htmlFor="appeal-notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Explain your appeal <span className="text-red-500">*</span>
          </label>
          <textarea
            id="appeal-notes"
            value={appealNotes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Please provide a detailed explanation of why you believe this restriction should be reconsidered…"
            rows={5}
            maxLength={2000}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${textareaBorder} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none`}
          />
          <div className="flex items-center justify-between">
            {errors.appeal_notes ? (
              <p className="text-xs text-red-500 dark:text-red-400">
                {errors.appeal_notes}
              </p>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Minimum 10 characters
              </p>
            )}
            <p
              className={`text-xs ${charCountColor}`}
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
              Are you sure? Once submitted, you cannot modify or resubmit your appeal. This is a one-time action.
            </p>
          </div>
        )}
      </div>
    </ModalWrapper>
  )
}
