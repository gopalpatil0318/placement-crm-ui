import { memo, useState, useRef, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  User,
  XCircle,
} from "lucide-react"
import { staggerItem } from "@/lib/animations"
import {
  OVERRIDE_STATUS_COLORS,
  OVERRIDE_STATUS_LABELS,
  type MyOverrideRequest,
} from "@/validators/OverrideSchema"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

function getDeadlineInfo(deadline: string): { text: string; urgent: boolean; expired: boolean } {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return { text: "Deadline passed", urgent: true, expired: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 7) return { text: `${days}d left`, urgent: false, expired: false }
  if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days <= 3, expired: false }
  return { text: `${hours}h left`, urgent: true, expired: false }
}

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  internship: "Internship",
  both: "Both",
}

// ─── Expandable Text ────────────────────────────────────────────────────────────

function ExpandableText({ text, label }: Readonly<{ text: string; label: string }>) {
  const [expanded, setExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) setIsClamped(el.scrollHeight > el.clientHeight + 1)
  }, [text])

  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
        {label}
      </p>
      <p
        ref={ref}
        className={`text-xs text-gray-600 dark:text-gray-300 ${expanded ? "" : "line-clamp-2"}`}
      >
        {text}
      </p>
      {isClamped && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-0.5 mt-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
        >
          {expanded ? "Show less" : "Show more"}
          <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface OverrideRequestCardProps {
  override: MyOverrideRequest
}

const ACCENT_COLOR_MAP: Record<string, string> = {
  approved: "bg-emerald-500",
  rejected: "bg-red-400",
  pending: "bg-amber-500",
}

export default memo(function OverrideRequestCard({ override }: Readonly<OverrideRequestCardProps>) {
  const shouldReduce = useReducedMotion()
  const statusColor = OVERRIDE_STATUS_COLORS[override.override_status]
  const deadline = getDeadlineInfo(override.application_deadline)

  const accentColor = ACCENT_COLOR_MAP[override.override_status] ?? "bg-gray-400"

  return (
    <motion.div
      variants={shouldReduce ? undefined : staggerItem}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 overflow-hidden transition-shadow hover:shadow-md"
    >
      {/* Status Accent Strip */}
      <div className={`h-1 ${accentColor}`} />

      <div className="p-5 space-y-3">
        {/* Header: Job Title + Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              to={`/student/jobs/${override.job_id}`}
              className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
            >
              {override.job_title}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Building2 size={12} className="shrink-0" />
                {override.company_name}
              </span>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />
            {OVERRIDE_STATUS_LABELS[override.override_status]}
          </span>
          {(override.request_attempt ?? 1) >= 2 && (
            <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">
              Attempt 2/2
            </span>
          )}
        </div>

        {/* Job Meta Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/50">
            <Briefcase size={11} />
            {JOB_TYPE_LABELS[override.job_type] ?? override.job_type}
          </span>
          {override.industry_type && (
            <span className="text-[11px] text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/50">
              {override.industry_type}
            </span>
          )}
          {(() => {
            let deadlineClass = "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50"
            if (deadline.expired) deadlineClass = "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
            else if (deadline.urgent) deadlineClass = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
            return (
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md ${deadlineClass}`}>
                <Clock size={11} />
                {deadline.text}
              </span>
            )
          })()}
        </div>

        {/* Ineligibility Reasons */}
        {override.ineligibility_reasons && (
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              Ineligibility reasons
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
              <XCircle size={12} className="shrink-0 mt-0.5" />
              {override.ineligibility_reasons}
            </p>
          </div>
        )}

        {/* Request Reason (expandable) */}
        <ExpandableText text={override.request_reason} label="Your reason" />

        {/* Review Info (for approved/rejected) */}
        {override.override_status === "approved" && override.review_notes && (
          <div className="rounded-lg p-2.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Reviewer notes
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-0.5">
              {override.review_notes}
            </p>
          </div>
        )}
        {override.override_status === "rejected" && (
          <div className="rounded-lg p-2.5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 space-y-1">
            {override.rejection_reason && (
              <div>
                <p className="text-[11px] font-medium text-red-700 dark:text-red-400">
                  Rejection reason
                </p>
                <p className="text-xs text-red-600 dark:text-red-300">
                  {override.rejection_reason}
                </p>
              </div>
            )}
            {override.review_notes && (
              <div>
                <p className="text-[11px] font-medium text-red-700 dark:text-red-400">
                  Reviewer notes
                </p>
                <p className="text-xs text-red-600 dark:text-red-300">
                  {override.review_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer: Dates + Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 gap-2 flex-wrap">
          <div className="text-[11px] text-gray-400 dark:text-gray-500 space-y-0.5">
            <p className="flex items-center gap-1">
              <Calendar size={11} />
              Requested: {formatDate(override.requested_at)}
            </p>
            {override.reviewed_at && override.reviewed_by_name && (
              <p className="flex items-center gap-1">
                <User size={11} />
                {override.override_status === "approved" ? "Approved" : "Reviewed"} by {override.reviewed_by_name} · {formatDate(override.reviewed_at)}
              </p>
            )}
          </div>

          {/* Apply Now CTA for approved overrides */}
          {override.override_status === "approved" && !deadline.expired && (
            <Link
              to={`/student/jobs/${override.job_id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[44px] text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg transition-colors"
            >
              <ExternalLink size={13} />
              Apply Now
            </Link>
          )}
          {override.override_status === "approved" && deadline.expired && (
            <span className="text-[11px] text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
              <ShieldCheck size={12} />
              Approved — Deadline passed
            </span>
          )}
          {override.override_status === "rejected" && (
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
            <ShieldX size={12} />
            {(override.request_attempt ?? 1) >= 2
              ? "Maximum attempts reached"
              : "You can re-request once more"}
          </span>
          )}
        </div>
      </div>
    </motion.div>
  )
})
