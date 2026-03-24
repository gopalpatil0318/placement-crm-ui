import { useState } from "react"
import { AlertTriangle, Ban } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { toast } from "sonner"

interface DenyJobModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  companyName: string
  onConfirm: (data: { denial_reason: string; additional_comments?: string }) => Promise<void>
}

export default function DenyJobModal({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  onConfirm,
}: DenyJobModalProps) {
  const [reason, setReason] = useState("")
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = reason.trim().length >= 3

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    try {
      await onConfirm({
        denial_reason: reason.trim(),
        additional_comments: comments.trim() || undefined,
      })
      setReason("")
      setComments("")
      onClose()
    } catch {
      toast.error("Failed to opt out. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setReason("")
    setComments("")
    onClose()
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      disabled={isSubmitting}
      size="md"
      title="Opt Out of Job"
      titleIcon={<Ban className="h-5 w-5 text-amber-500" />}
    >
      <div className="p-6 space-y-5">
        {/* Warning banner */}
        <div className="flex gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-300">This action is irreversible</p>
            <p className="mt-1 text-amber-700 dark:text-amber-400">
              You are opting out of <span className="font-semibold">{jobTitle}</span> at{" "}
              <span className="font-semibold">{companyName}</span>. You will not be able to apply for this job later.
            </p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Reason for opting out <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you not interested in this position?"
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition resize-none"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-right">
            {reason.length}/500
          </p>
        </div>

        {/* Additional comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Additional comments <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Any additional feedback..."
            rows={2}
            maxLength={2000}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Confirm Opt Out"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
