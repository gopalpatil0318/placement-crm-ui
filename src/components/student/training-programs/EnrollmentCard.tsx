import { memo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Award,
  Calendar,
  CheckCircle,
  Download,
  MessageSquare,
  Star,
  User,
} from "lucide-react"
import { staggerItem } from "@/lib/animations"
import {
  PROGRAM_TYPE_LABELS,
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_STATUS_COLORS,
  type StudentEnrollment,
} from "@/validators/TrainingProgramSchema"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function progressColor(pct: number): string {
  if (pct >= 70) return "bg-emerald-500"
  if (pct >= 30) return "bg-amber-500"
  return "bg-red-500"
}

function formatDate(d: string | null): string {
  if (!d) return "TBD"
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

function canSubmitFeedback(e: StudentEnrollment): boolean {
  return (
    !e.has_submitted_feedback &&
    (e.program_status === "in_progress" || e.program_status === "completed") &&
    e.completion_status !== "dropped"
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface EnrollmentCardProps {
  enrollment: StudentEnrollment
  onFeedback: (enrollment: StudentEnrollment) => void
}

function CertificateSection({ enrollment }: Readonly<{ enrollment: StudentEnrollment }>) {
  if (enrollment.certificate_issued && enrollment.certificate_url) {
    return (
      <a
        href={enrollment.certificate_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        <Download size={13} />
        Certificate
      </a>
    )
  }
  if (enrollment.certificate_issued) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <Award size={13} />
        Certificate Earned
      </span>
    )
  }
  return <span />
}

function FeedbackSection({ enrollment, onFeedback }: Readonly<{ enrollment: StudentEnrollment; onFeedback: (e: StudentEnrollment) => void }>) {
  if (canSubmitFeedback(enrollment)) {
    return (
      <button
        type="button"
        onClick={() => onFeedback(enrollment)}
        className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
      >
        <MessageSquare size={13} />
        Submit Feedback
      </button>
    )
  }
  if (enrollment.has_submitted_feedback) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle size={13} />
        Feedback Submitted
      </span>
    )
  }
  return null
}

export default memo(function EnrollmentCard({ enrollment, onFeedback }: Readonly<EnrollmentCardProps>) {
  const shouldReduce = useReducedMotion()
  const statusColor = ENROLLMENT_STATUS_COLORS[enrollment.completion_status]

  return (
    <motion.div
      variants={shouldReduce ? undefined : staggerItem}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {enrollment.program_name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
              {PROGRAM_TYPE_LABELS[enrollment.program_type] ?? enrollment.program_type}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />
              {ENROLLMENT_STATUS_LABELS[enrollment.completion_status]}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
        {enrollment.trainer_name && (
          <div className="flex items-center gap-2">
            <User size={14} className="shrink-0 text-gray-400" />
            <span className="truncate">
              {enrollment.trainer_name}
              {enrollment.trainer_organization && (
                <span className="text-gray-400 dark:text-gray-500"> · {enrollment.trainer_organization}</span>
              )}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="shrink-0 text-gray-400" />
          <span>{formatDate(enrollment.start_date)} — {formatDate(enrollment.end_date)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400">Completion</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{enrollment.completion_percentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor(enrollment.completion_percentage)}`}
            style={{ width: `${Math.min(100, enrollment.completion_percentage)}%` }}
          />
        </div>
      </div>

      {/* Attendance */}
      {enrollment.attendance_percentage !== null && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400">Attendance</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {enrollment.sessions_attended}/{enrollment.total_sessions ?? "?"} sessions
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, enrollment.attendance_percentage)}%` }}
            />
          </div>
        </div>
      )}

      {/* Rating (read-only) */}
      {enrollment.student_rating !== null && (
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={`star-${String(i)}`}
              size={14}
              className={i < enrollment.student_rating! ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}
            />
          ))}
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">Your rating</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 gap-2 flex-wrap">
        <CertificateSection enrollment={enrollment} />
        <FeedbackSection enrollment={enrollment} onFeedback={onFeedback} />
      </div>
    </motion.div>
  )
})
