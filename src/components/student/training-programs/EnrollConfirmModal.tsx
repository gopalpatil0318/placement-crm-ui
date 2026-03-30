import { AlertTriangle, Calendar, Clock, Loader2, User, Users } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import {
  PROGRAM_TYPE_LABELS,
  type StudentAvailableProgram,
} from "@/validators/TrainingProgramSchema"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
  if (!d) return "TBD"
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

function getSpotsLabel(program: StudentAvailableProgram): string {
  if (program.spots_remaining === null) return "No limit"
  return `${program.spots_remaining} spot${program.spots_remaining === 1 ? "" : "s"} remaining`
}

function formatDeadline(d: string | null, isPassed: boolean): { text: string; urgent: boolean } | null {
  if (!d) return null
  if (isPassed) return { text: "Deadline passed", urgent: true }
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return { text: "Deadline passed", urgent: true }
  const formatted = formatDate(d)
  if (diff <= 3) return { text: `${formatted} (${diff} day${diff === 1 ? "" : "s"} left)`, urgent: true }
  return { text: formatted, urgent: false }
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface EnrollConfirmModalProps {
  program: StudentAvailableProgram | null
  isOpen: boolean
  isEnrolling: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function EnrollConfirmModal({
  program,
  isOpen,
  isEnrolling,
  onConfirm,
  onClose,
}: Readonly<EnrollConfirmModalProps>) {
  const spotsLabel = program ? getSpotsLabel(program) : ""

  const deadlineInfo = program
    ? formatDeadline(program.enrollment_deadline, program.is_deadline_passed)
    : null

  const footer = (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <button
        type="button"
        onClick={onClose}
        disabled={isEnrolling}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isEnrolling}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isEnrolling && <Loader2 size={16} className="animate-spin" />}
        {isEnrolling ? "Enrolling…" : "Enroll Now"}
      </button>
    </div>
  )

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      disabled={isEnrolling}
      size="md"
      title="Confirm Enrollment"
      titleIcon={
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      }
      footer={footer}
    >
      {program && (
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to enroll in{" "}
            <span className="font-semibold">{program.program_name}</span>?
          </p>

          <div className="space-y-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                {PROGRAM_TYPE_LABELS[program.program_type] ?? program.program_type}
              </span>
            </div>
            {program.trainer_name && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User size={14} className="text-gray-400" />
                <span>
                  {program.trainer_name}
                  {program.trainer_organization && ` · ${program.trainer_organization}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar size={14} className="text-gray-400" />
              <span>{formatDate(program.start_date)} — {formatDate(program.end_date)}</span>
            </div>
            {deadlineInfo && (
              <div className={`flex items-center gap-2 ${deadlineInfo.urgent ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                {deadlineInfo.urgent ? <AlertTriangle size={14} /> : <Clock size={14} className="text-gray-400" />}
                <span>Deadline: {deadlineInfo.text}</span>
              </div>
            )}
            {program.total_sessions && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock size={14} className="text-gray-400" />
                <span>
                  {program.total_sessions} session{program.total_sessions === 1 ? "" : "s"}
                  {program.session_duration_hours ? ` · ${program.session_duration_hours}h each` : ""}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users size={14} className="text-gray-400" />
              <span>{spotsLabel}</span>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  )
}
