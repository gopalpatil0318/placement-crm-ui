import { useState, useEffect } from "react"
import { Loader2, Upload, FileText } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useUploadPlacementDocuments } from "@/hooks/student/placements/useUploadPlacementDocuments"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { useFileUpload } from "@/hooks/useFileUpload"
import { FileUpload } from "@/components/ui/FileUpload"
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
  const { user } = useStudentAuth()
  const offerUpload = useFileUpload()
  const joiningUpload = useFileUpload()

  const [offerPath, setOfferPath] = useState("")
  const [joiningPath, setJoiningPath] = useState("")

  // Pre-fill existing paths when modal opens
  useEffect(() => {
    if (isOpen && placement) {
      setOfferPath(placement.offer_letter_url ?? "")
      setJoiningPath(placement.joining_letter_url ?? "")
    }
  }, [isOpen, placement])

  if (!placement) return null

  const canUploadJoining = ["accepted", "joined"].includes(placement.placement_status)
  const hasChanges =
    (offerPath.trim() && offerPath.trim() !== (placement.offer_letter_url ?? "")) ||
    (canUploadJoining && joiningPath.trim() && joiningPath.trim() !== (placement.joining_letter_url ?? ""))

  const handleOfferSelect = async (file: File | null) => {
    if (!file || !user) return
    try {
      const { storagePath } = await offerUpload.upload(file, {
        bucket: "placenex-private",
        category: "placement-docs",
        entityId: `pl_${placement.placement_id}`,
      })
      setOfferPath(storagePath)
    } catch { /* error in offerUpload.error */ }
  }

  const handleJoiningSelect = async (file: File | null) => {
    if (!file || !user) return
    try {
      const { storagePath } = await joiningUpload.upload(file, {
        bucket: "placenex-private",
        category: "placement-docs",
        entityId: `pl_${placement.placement_id}`,
      })
      setJoiningPath(storagePath)
    } catch { /* error in joiningUpload.error */ }
  }

  const handleSubmit = () => {
    if (loading || !hasChanges) return
    const payload: { offer_letter_url?: string; joining_letter_url?: string } = {}
    if (offerPath.trim() && offerPath.trim() !== (placement.offer_letter_url ?? "")) {
      payload.offer_letter_url = offerPath.trim()
    }
    if (canUploadJoining && joiningPath.trim() && joiningPath.trim() !== (placement.joining_letter_url ?? "")) {
      payload.joining_letter_url = joiningPath.trim()
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
          Upload your offer letter or joining letter for{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {placement.job_title}
          </span>
          {" "}at{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {placement.company_name}
          </span>.
        </p>

        {/* Offer Letter Upload */}
        <div className="space-y-1.5">
          <FileUpload
            value={offerPath || null}
            onFileSelect={handleOfferSelect}
            progress={offerUpload.progress}
            isUploading={offerUpload.isUploading}
            error={offerUpload.error}
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            maxSizeBytes={5 * 1024 * 1024}
            label="Offer Letter"
            hint="PDF or image, max 5 MB"
            disabled={loading}
          />
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

        {/* Joining Letter Upload */}
        {canUploadJoining && (
          <div className="space-y-1.5">
            <FileUpload
              value={joiningPath || null}
              onFileSelect={handleJoiningSelect}
              progress={joiningUpload.progress}
              isUploading={joiningUpload.isUploading}
              error={joiningUpload.error}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              maxSizeBytes={5 * 1024 * 1024}
              label="Joining Letter"
              hint="PDF or image, max 5 MB"
              disabled={loading}
            />
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
