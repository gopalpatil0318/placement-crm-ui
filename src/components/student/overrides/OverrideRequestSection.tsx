import { memo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  XCircle,
} from "lucide-react"
import { fadeInUp } from "@/lib/animations"
import { useCheckOverrideEligibility } from "@/hooks/student/overrides/useCheckOverrideEligibility"
import OverrideRequestModal from "@/components/student/overrides/OverrideRequestModal"
import type { OverrideRequestInfo } from "@/validators/OverrideSchema"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ─── Sub-components for each override state ─────────────────────────────────────

function PendingOverrideCard({ overrideRequest }: { overrideRequest: OverrideRequestInfo }) {
  return (
    <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Override Request Pending
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Your request is being reviewed by college placement staff.
            You'll be notified when a decision is made.
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/60 flex items-center gap-1.5 mt-1">
            <Calendar size={12} />
            Submitted: {formatDate(overrideRequest.requested_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

function ApprovedOverrideCard({
  overrideRequest,
  onApplyClick,
  deadlineExpired,
}: {
  overrideRequest: OverrideRequestInfo
  onApplyClick: () => void
  deadlineExpired: boolean
}) {
  return (
    <div className="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="min-w-0 space-y-1 flex-1">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Override Approved!
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Your eligibility override has been approved. You can now apply for this job.
          </p>
          {overrideRequest.review_notes && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-1">
              <span className="font-medium">Reviewer notes:</span> {overrideRequest.review_notes}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {deadlineExpired ? (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Override Approved — Deadline has passed
              </span>
            ) : (
              <button
                type="button"
                onClick={onApplyClick}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
              >
                <ExternalLink size={13} />
                Apply Now
              </button>
            )}
            <span className="text-xs text-emerald-600/60 dark:text-emerald-400/50 flex items-center gap-1">
              <Calendar size={12} />
              Approved: {formatDate(overrideRequest.reviewed_at!)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RejectedOverrideCard({ overrideRequest }: { overrideRequest: OverrideRequestInfo }) {
  return (
    <div className="rounded-xl p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
      <div className="flex items-start gap-3">
        <ShieldX className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            Override Rejected
          </p>
          {overrideRequest.rejection_reason && (
            <p className="text-xs text-red-700 dark:text-red-400">
              <span className="font-medium">Reason:</span> {overrideRequest.rejection_reason}
            </p>
          )}
          {overrideRequest.review_notes && (
            <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5">
              <span className="font-medium">Notes:</span> {overrideRequest.review_notes}
            </p>
          )}
          <p className="text-xs text-red-600/60 dark:text-red-400/50 mt-1">
            No further action is available for this job.
          </p>
          {overrideRequest.reviewed_at && (
            <p className="text-xs text-red-500/50 dark:text-red-400/40 flex items-center gap-1 mt-0.5">
              <Calendar size={12} />
              Reviewed: {formatDate(overrideRequest.reviewed_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function YearMismatchCard() {
  return (
    <div className="rounded-xl p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            Passout Year Mismatch
          </p>
          <p className="text-xs text-red-700 dark:text-red-400">
            Your passout year does not match the job's target years.
            This cannot be overridden — eligibility override requests are not available for year mismatches.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ───────────────────────────────────────────────────────────────────

function OverrideSectionSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 motion-safe:animate-pulse space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700/60" />
      <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-700/60" />
      <div className="h-8 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

interface OverrideRequestSectionProps {
  jobId: string
  isIneligible: boolean
  onSwitchToApplyTab?: () => void
  deadlineExpired?: boolean
}

export default memo(function OverrideRequestSection({
  jobId,
  isIneligible,
  onSwitchToApplyTab,
  deadlineExpired = false,
}: OverrideRequestSectionProps) {
  const shouldReduce = useReducedMotion()
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading, isError } = useCheckOverrideEligibility(jobId, isIneligible)

  // Don't render if student isn't ineligible or data isn't ready
  if (!isIneligible) return null
  if (isLoading) return <OverrideSectionSkeleton />
  if (isError || !data) return null

  // Already fully eligible or already applied — no override section
  if (data.is_fully_eligible || data.application) return null

  // Year mismatch — hard block with info
  if (!data.year_eligible) return <YearMismatchCard />

  // Existing override request — show status
  if (data.override_request) {
    const { override_status } = data.override_request
    if (override_status === "pending") {
      return <PendingOverrideCard overrideRequest={data.override_request} />
    }
    if (override_status === "approved") {
      return (
        <ApprovedOverrideCard
          overrideRequest={data.override_request}
          onApplyClick={() => onSwitchToApplyTab?.()}
          deadlineExpired={deadlineExpired}
        />
      )
    }
    if (override_status === "rejected") {
      return <RejectedOverrideCard overrideRequest={data.override_request} />
    }
  }

  // Can request override — show CTA
  if (data.can_request_override) {
    const Wrapper = shouldReduce ? "div" : motion.div

    return (
      <>
        <Wrapper
          {...(!shouldReduce && { variants: fadeInUp, initial: "initial", animate: "animate" })}
          className="rounded-xl p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-2 flex-1">
              <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
                Request an Eligibility Override
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400">
                You don't meet the standard criteria, but you can request an eligibility override.
                College placement staff will review your request.
              </p>
              {data.ineligibility_reasons.length > 0 && (
                <div className="space-y-1 mt-1">
                  {data.ineligibility_reasons.map((reason, i) => (
                    <p key={i} className="text-xs text-indigo-600 dark:text-indigo-400/80 flex items-center gap-1.5">
                      <XCircle size={12} className="shrink-0 text-indigo-400 dark:text-indigo-500" />
                      {reason}
                    </p>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer mt-1"
              >
                <ShieldCheck size={13} />
                Submit Override Request
              </button>
            </div>
          </div>
        </Wrapper>

        <OverrideRequestModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          jobId={jobId}
          jobTitle={data.job_title}
          companyName={data.company_name}
          ineligibilityReasons={data.ineligibility_reasons}
        />
      </>
    )
  }

  // can_request_override=false but no override_request — some other blocker
  return null
})
