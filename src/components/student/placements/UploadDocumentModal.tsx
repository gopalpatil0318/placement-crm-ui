import { useState, useEffect } from "react"
import { Loader2, Upload, FileText, Link2 } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useUploadPlacementDocuments } from "@/hooks/student/placements/useUploadPlacementDocuments"
import type { StudentPlacement } from "@/validators/PlacementSchema"

// ─── Component ──────────────────────────────────────────────────────────────────

interface UploadDocumentModalProps {
  placement: StudentPlacement | null
  isOpen: boolean
  onClose: () => void
}

export default function UploadDocumentModal({
  placement,
  isOpen,
  onClose,
}: Readonly<UploadDocumentModalProps>) {
  const { loading, uploadDocuments } = useUploadPlacementDocuments(onClose)

  const [offerUrl, setOfferUrl] = useState("")
  const [joiningUrl, setJoiningUrl] = useState("")

  // Pre-fill existing URLs when modal opens
  useEffect(() => {
    if (isOpen && placement) {
      setOfferUrl(placement.offer_letter_url ?? "")
      setJoiningUrl(placement.joining_letter_url ?? "")
    }
  }, [isOpen, placement])

  if (!placement) return null

  const canUploadJoining = ["accepted", "joined"].includes(placement.placement_status)
  const hasChanges =
    (offerUrl.trim() && offerUrl.trim() !== (placement.offer_letter_url ?? "")) ||
    (canUploadJoining && joiningUrl.trim() && joiningUrl.trim() !== (placement.joining_letter_url ?? ""))

  const handleSubmit = () => {
    if (loading || !hasChanges) return
    const payload: { offer_letter_url?: string; joining_letter_url?: string } = {}
    if (offerUrl.trim() && offerUrl.trim() !== (placement.offer_letter_url ?? "")) {
      payload.offer_letter_url = offerUrl.trim()
    }
    if (canUploadJoining && joiningUrl.trim() && joiningUrl.trim() !== (placement.joining_letter_url ?? "")) {
      payload.joining_letter_url = joiningUrl.trim()
    }
    uploadDocuments(placement.placement_id, payload)
  }

  const handleClose = () => {
    if (!loading) onClose()
  }

  const footer = (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <button
        type="button"
        onClick={handleClose}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !hasChanges}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Upload size={16} />
        )}
        {loading ? "Uploading…" : "Upload"}
      </button>
    </div>
  )

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      disabled={loading}
      size="md"
      title="Upload Documents"
      titleIcon={
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      }
      footer={footer}
    >
      <div className="p-6 space-y-5">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Paste the URL of your offer letter or joining letter for{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {placement.job_title}
          </span>{" "}
          at{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {placement.company_name}
          </span>
          .
        </p>

        {/* Offer Letter URL */}
        <div className="space-y-1.5">
          <label
            htmlFor="offer-letter-url"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Offer Letter URL
          </label>
          <div className="relative">
            <Link2
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="offer-letter-url"
              type="url"
              value={offerUrl}
              onChange={(e) => setOfferUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              disabled={loading}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:opacity-50 transition-colors"
            />
          </div>
          {placement.offer_letter_verified && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Currently verified. Re-uploading will reset verification.
            </p>
          )}
          {placement.offer_letter_rejection_reason && !placement.offer_letter_verified && (
            <p className="text-xs text-red-500 dark:text-red-400">
              Rejected: {placement.offer_letter_rejection_reason}
            </p>
          )}
        </div>

        {/* Joining Letter URL */}
        {canUploadJoining && (
          <div className="space-y-1.5">
            <label
              htmlFor="joining-letter-url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Joining Letter URL
            </label>
            <div className="relative">
              <Link2
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="joining-letter-url"
                type="url"
                value={joiningUrl}
                onChange={(e) => setJoiningUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                disabled={loading}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:opacity-50 transition-colors"
              />
            </div>
            {placement.joining_letter_verified && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Currently verified. Re-uploading will reset verification.
              </p>
            )}
            {placement.joining_letter_rejection_reason && !placement.joining_letter_verified && (
              <p className="text-xs text-red-500 dark:text-red-400">
                Rejected: {placement.joining_letter_rejection_reason}
              </p>
            )}
          </div>
        )}

        {!canUploadJoining && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            Joining letter upload is available after accepting the offer.
          </p>
        )}
      </div>
    </ModalWrapper>
  )
}
