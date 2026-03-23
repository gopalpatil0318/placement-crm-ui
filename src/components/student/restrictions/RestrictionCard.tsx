import { memo, useState, useRef, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Info,
  MessageSquareText,
  Shield,
  User,
} from "lucide-react"
import { staggerItem } from "@/lib/animations"
import {
  RESTRICTION_TYPE_LABELS,
  RESTRICTION_TYPE_COLORS,
  RESTRICTION_SEVERITY,
  type StudentRestriction,
  type RestrictionType,
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

function getDaysUntilExpiry(validUntil: string | null): string | null {
  if (!validUntil) return null
  const diff = new Date(validUntil).getTime() - Date.now()
  if (diff <= 0) return "Expired"
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 1) return "1 day left"
  return `${days} days left`
}

function getStatusBadge(r: StudentRestriction) {
  // Bug #1 fix: check is_active first — admin resolution is authoritative over expiry
  if (!r.is_active) {
    return { label: "Resolved", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" }
  }
  // Bug #2 fix: Expired uses amber per API doc spec, not gray
  if (r.is_expired) {
    return { label: "Expired", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" }
  }
  return { label: "Active", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" }
}

function getAppealStatus(r: StudentRestriction) {
  if (!r.appeal_submitted) return null
  if (r.appeal_resolved_at) {
    // Bug #3 fix: if still active after review → admin rejected the appeal
    if (r.is_active) {
      return { label: "Appeal Reviewed — Not Resolved", icon: Info, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" }
    }
    return { label: "Appeal Reviewed", icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
  }
  return { label: "Appeal Pending", icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" }
}

function getSeverityIcon(type: RestrictionType) {
  const severity = RESTRICTION_SEVERITY[type]
  if (severity === "high") return { icon: Shield, color: "text-red-500 dark:text-red-400" }
  if (severity === "medium") return { icon: AlertTriangle, color: "text-amber-500 dark:text-amber-400" }
  return { icon: AlertTriangle, color: "text-yellow-500 dark:text-yellow-400" }
}

// ─── Expandable Details ─────────────────────────────────────────────────────────

function ExpandableDetails({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) setIsClamped(el.scrollHeight > el.clientHeight + 1)
  }, [text])

  return (
    <div className="mb-3">
      <p
        ref={ref}
        className={`text-xs text-gray-500 dark:text-gray-400 ${expanded ? "" : "line-clamp-2"}`}
      >
        {text}
      </p>
      {isClamped && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
        >
          {expanded ? "Show less" : "Show more"}
          <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface RestrictionCardProps {
  restriction: StudentRestriction
  onAppeal: (restriction: StudentRestriction) => void
}

export default memo(function RestrictionCard({ restriction, onAppeal }: RestrictionCardProps) {
  const shouldReduce = useReducedMotion()
  const typeColor = RESTRICTION_TYPE_COLORS[restriction.restriction_type]
  const statusBadge = getStatusBadge(restriction)
  const appealStatus = getAppealStatus(restriction)
  const severity = getSeverityIcon(restriction.restriction_type)
  const SeverityIcon = severity.icon

  return (
    <motion.div
      variants={shouldReduce ? undefined : staggerItem}
      className={`rounded-2xl border bg-white dark:bg-gray-800/60 overflow-hidden transition-shadow hover:shadow-md ${
        restriction.is_active && !restriction.is_expired
          ? `${typeColor.border}`
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Severity Accent Strip */}
      {restriction.is_active && !restriction.is_expired && (
        <div className={`h-1 ${RESTRICTION_TYPE_COLORS[restriction.restriction_type].dot}`} />
      )}

      <div className="p-5">
        {/* Header: Type Badge + Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${typeColor.bg}`}>
              <SeverityIcon size={16} className={severity.color} />
            </div>
            <div className="min-w-0">
              <span role="status" className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColor.bg} ${typeColor.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
                {RESTRICTION_TYPE_LABELS[restriction.restriction_type]}
              </span>
            </div>
          </div>
          <span role="status" className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusBadge.bg} ${statusBadge.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </span>
        </div>

        {/* Reason */}
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {restriction.reason}
        </p>

        {/* Details (optional, expandable) */}
        {restriction.details && (
          <ExpandableDetails text={restriction.details} />
        )}

        {/* Meta Info */}
        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
            <span>
              Applied: {formatDate(restriction.applied_on)}
              {restriction.valid_until && (
                <span className="text-gray-400 dark:text-gray-500">
                  {" "}· Until: {formatDate(restriction.valid_until)}
                  {restriction.is_active && getDaysUntilExpiry(restriction.valid_until) && (
                    <span className="ml-1 text-amber-500 dark:text-amber-400 font-medium">
                      ({getDaysUntilExpiry(restriction.valid_until)})
                    </span>
                  )}
                </span>
              )}
              {!restriction.valid_until && (
                <span className="text-gray-400 dark:text-gray-500"> · No expiry</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
            <span>By: {restriction.restricted_by_name}</span>
          </div>
          {restriction.resolved_by_name && (
            <div className="flex items-center gap-2">
              <CheckCircle size={13} className="shrink-0 text-emerald-500" />
              <span>Resolved by: {restriction.resolved_by_name}</span>
            </div>
          )}
        </div>

        {/* Footer: Appeal Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 gap-2 flex-wrap">
          {/* Appeal Status or Action */}
          {restriction.can_appeal ? (
            <button
              type="button"
              onClick={() => onAppeal(restriction)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquareText size={13} />
              Submit Appeal
            </button>
          ) : appealStatus ? (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${appealStatus.bg} ${appealStatus.color}`}>
              <appealStatus.icon size={13} />
              {appealStatus.label}
              {restriction.appeal_resolved_at && (
                <span className="text-gray-400 dark:text-gray-500 ml-1">
                  · {formatDate(restriction.appeal_resolved_at)}
                </span>
              )}
            </span>
          ) : (
            <span />
          )}

          {/* Expired indicator */}
          {restriction.is_expired && restriction.is_active && (
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
              Past valid date
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
})
