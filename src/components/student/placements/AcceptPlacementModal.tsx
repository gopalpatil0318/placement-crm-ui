import { useState, useEffect, useRef } from "react"
import { Loader2, CheckCircle } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useAcceptPlacement } from "@/hooks/student/placements/useAcceptPlacement"
import {
  formatPackage,
  formatStipend,
  type StudentPlacement,
} from "@/validators/PlacementSchema"

// ─── Component ──────────────────────────────────────────────────────────────────

interface AcceptPlacementModalProps {
  placement: StudentPlacement | null
  isOpen: boolean
  onClose: () => void
}

export default function AcceptPlacementModal({
  placement,
  isOpen,
  onClose,
}: Readonly<AcceptPlacementModalProps>) {
  const { acceptPlacement, isAccepting } = useAcceptPlacement()
  const [accepted, setAccepted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Reset state when opening for a different placement
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on modal open
    if (isOpen) setAccepted(false)
  }, [isOpen, placement?.placement_id])

  // Auto-close celebration after 2s with cleanup
  useEffect(() => {
    if (!accepted) return
    timerRef.current = setTimeout(() => {
      setAccepted(false)
      onClose()
    }, 2000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [accepted, onClose])

  if (!placement) return null

  const handleConfirm = () => {
    acceptPlacement(placement.placement_id, {
      onSuccess: () => setAccepted(true),
    })
  }

  const handleClose = () => {
    if (!isAccepting) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setAccepted(false)
      onClose()
    }
  }

  const isFullTime = placement.placement_type === "full-time" || placement.placement_type === "both"
  const isInternship = placement.placement_type === "internship" || placement.placement_type === "both"

  const footer = !accepted ? (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <button
        type="button"
        onClick={handleClose}
        disabled={isAccepting}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isAccepting}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isAccepting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <CheckCircle size={16} />
        )}
        {isAccepting ? "Accepting…" : "Accept Offer"}
      </button>
    </div>
  ) : null

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      disabled={isAccepting}
      size="md"
      title={accepted ? undefined : "Accept Placement Offer"}
      titleIcon={
        !accepted ? (
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        ) : undefined
      }
      footer={footer}
    >
      {accepted ? (
        /* ── Celebration State ── */
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Congratulations!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center max-w-xs">
            You have accepted the offer for{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {placement.job_title}
            </span>{" "}
            at{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {placement.company_name}
            </span>
            .
          </p>
        </div>
      ) : (
        /* ── Confirmation State ── */
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to accept the offer for{" "}
            <span className="font-semibold">{placement.job_title}</span> at{" "}
            <span className="font-semibold">{placement.company_name}</span>?
          </p>

          {/* Offer Summary */}
          <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/60 dark:border-emerald-800/30 p-4 space-y-2.5">
            {placement.position_name && (
              <DetailRow label="Position" value={placement.position_name} />
            )}
            {isFullTime && (
              <>
                <DetailRow label="Package" value={formatPackage(placement.fulltime_package)} highlight />
                {placement.fulltime_designation && (
                  <DetailRow label="Designation" value={placement.fulltime_designation} />
                )}
                {placement.fulltime_joining_date && (
                  <DetailRow
                    label="Joining Date"
                    value={new Date(placement.fulltime_joining_date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  />
                )}
              </>
            )}
            {isInternship && (
              <>
                <DetailRow label="Stipend" value={formatStipend(placement.internship_stipend)} highlight />
                {placement.internship_duration && (
                  <DetailRow label="Duration" value={placement.internship_duration} />
                )}
                {placement.internship_start_date && (
                  <DetailRow
                    label="Start Date"
                    value={new Date(placement.internship_start_date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  />
                )}
              </>
            )}
          </div>

          {/* Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200/60 dark:border-blue-800/30">
            <span className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0 text-sm">ℹ️</span>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              By accepting this offer, you confirm your intent to join. This action cannot be undone.
            </p>
          </div>
        </div>
      )}
    </ModalWrapper>
  )
}

// ─── Detail Row ─────────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight = false,
}: Readonly<{
  label: string
  value: string
  highlight?: boolean
}>) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={
          highlight
            ? "font-bold text-emerald-700 dark:text-emerald-400"
            : "font-medium text-gray-900 dark:text-gray-100"
        }
      >
        {value}
      </span>
    </div>
  )
}
