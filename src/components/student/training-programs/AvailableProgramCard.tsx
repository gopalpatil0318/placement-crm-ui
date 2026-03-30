import { memo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Calendar,
  Clock,
  User,
  Users,
  AlertTriangle,
} from "lucide-react"
import { staggerItem } from "@/lib/animations"
import {
  PROGRAM_TYPE_LABELS,
  type StudentAvailableProgram,
} from "@/validators/TrainingProgramSchema"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getSpotsColor(spots: number | null): string {
  if (spots === null) return "text-gray-500 dark:text-gray-400"
  if (spots <= 0) return "text-red-600 dark:text-red-400"
  if (spots < 5) return "text-red-600 dark:text-red-400"
  if (spots < 20) return "text-amber-600 dark:text-amber-400"
  return "text-emerald-600 dark:text-emerald-400"
}

function getDeadlineInfo(deadline: string | null, isPassed: boolean) {
  if (!deadline) return null
  if (isPassed) return { text: "Deadline passed", urgent: true }
  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  )
  if (diff <= 0) return { text: "Deadline passed", urgent: true }
  if (diff === 1) return { text: "1 day left", urgent: true }
  if (diff <= 3) return { text: `${diff} days left`, urgent: true }
  return { text: `${diff} days left`, urgent: false }
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

function getSpotsLabel(remaining: number | null): string {
  if (remaining === null) return "No limit"
  if (remaining <= 0) return "Full"
  return `${remaining} spot${remaining === 1 ? "" : "s"} left`
}

function getDisabledReason(program: StudentAvailableProgram): string | undefined {
  const canEnroll = !program.is_deadline_passed && (program.spots_remaining === null || program.spots_remaining > 0)
  if (canEnroll) return undefined
  if (program.is_deadline_passed) return "Enrollment deadline has passed"
  return "This program is full"
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface AvailableProgramCardProps {
  program: StudentAvailableProgram
  onEnroll: (program: StudentAvailableProgram) => void
}

export default memo(function AvailableProgramCard({ program, onEnroll }: Readonly<AvailableProgramCardProps>) {
  const shouldReduce = useReducedMotion()
  const deadline = getDeadlineInfo(program.enrollment_deadline, program.is_deadline_passed)
  const spotsLabel = getSpotsLabel(program.spots_remaining)
  const canEnroll = !program.is_deadline_passed && (program.spots_remaining === null || program.spots_remaining > 0)
  const disabledReason = getDisabledReason(program)

  return (
    <motion.div
      variants={shouldReduce ? undefined : staggerItem}
      className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-5 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {program.program_name}
          </h3>
          <span className={`inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400`}>
            {PROGRAM_TYPE_LABELS[program.program_type] ?? program.program_type}
          </span>
        </div>
        {deadline && (
          <span
            className={`shrink-0 text-xs font-medium px-2 py-1 rounded-lg ${
              deadline.urgent
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            }`}
          >
            <Clock size={12} className="inline -mt-0.5 mr-1" />
            {deadline.text}
          </span>
        )}
      </div>

      {/* Description */}
      {program.program_description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {program.program_description}
        </p>
      )}

      {/* Info Grid */}
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        {program.trainer_name && (
          <div className="flex items-center gap-2">
            <User size={14} className="shrink-0 text-gray-400" />
            <span className="truncate">
              {program.trainer_name}
              {program.trainer_organization && (
                <span className="text-gray-400 dark:text-gray-500"> · {program.trainer_organization}</span>
              )}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="shrink-0 text-gray-400" />
          <span>{formatDate(program.start_date)} — {formatDate(program.end_date)}</span>
        </div>
        {program.total_sessions && (
          <div className="flex items-center gap-2">
            <Clock size={14} className="shrink-0 text-gray-400" />
            <span>
              {program.total_sessions} session{program.total_sessions === 1 ? "" : "s"}
              {program.session_duration_hours
                ? ` · ${program.session_duration_hours}h each`
                : ""}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Spots + Enroll Button */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-gray-400" />
          <span className={`text-xs font-medium ${getSpotsColor(program.spots_remaining)}`}>
            {program.max_enrollment
              ? `${program.enrolled_count}/${program.max_enrollment} enrolled`
              : `${program.enrolled_count} enrolled`}
            {" · "}
            {spotsLabel}
          </span>
          {program.spots_remaining !== null && program.spots_remaining <= 0 && (
            <AlertTriangle size={12} className="text-red-500" />
          )}
        </div>
        <button
          type="button"
          onClick={() => onEnroll(program)}
          disabled={!canEnroll}
          title={disabledReason}
          className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Enroll
        </button>
      </div>
    </motion.div>
  )
})
