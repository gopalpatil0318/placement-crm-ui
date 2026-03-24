import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Hourglass,
  Eye,
  Trophy,
  Star,
  Ban,
  FileText,
  MessageSquare,
  Award,
  PartyPopper,
  LogOut,
  CircleDot,
} from "lucide-react"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { useApplicationDetail } from "@/hooks/student/applications/useApplicationDetail"
import { useWithdrawApplication } from "@/hooks/student/jobs/useWithdrawApplication"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { toast } from "sonner"
import type { RoundResult, JobRound } from "@/services/student/jobBrowsing.service"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Status Config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Hourglass,
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Eye,
  },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
  selected: {
    label: "Selected",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: Trophy,
  },
  offered: {
    label: "Offered",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Star,
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    icon: Ban,
  },
}

const WITHDRAWABLE_STATUSES = ["pending", "under_review", "shortlisted"]

// ─── Journey Steps ──────────────────────────────────────────────────────────────

const JOURNEY_STEPS = [
  { key: "pending", label: "Applied", icon: FileText },
  { key: "under_review", label: "Under Review", icon: Eye },
  { key: "shortlisted", label: "Shortlisted", icon: CheckCircle2 },
  { key: "selected", label: "Selected", icon: Trophy },
  { key: "offered", label: "Offered", icon: Award },
]

function getJourneyIndex(status: string): number {
  const idx = JOURNEY_STEPS.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : 0
}

// ─── Round Result Helpers ───────────────────────────────────────────────────────

function getRoundStatus(
  round: JobRound,
  results: RoundResult[],
  currentRoundId: string | null,
): { status: "passed" | "failed" | "pending" | "upcoming" | "current"; result?: RoundResult } {
  const result = results.find((r) => r.round_id === round.round_id)
  if (result) {
    if (result.result_status === "passed") return { status: "passed", result }
    if (result.result_status === "failed") return { status: "failed", result }
    return { status: "pending", result }
  }
  if (round.round_id === currentRoundId) return { status: "current" }
  return { status: "upcoming" }
}

const roundStatusStyles = {
  passed: {
    dot: "bg-emerald-500",
    line: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  failed: {
    dot: "bg-red-500",
    line: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50",
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  pending: {
    dot: "bg-amber-500",
    line: "bg-amber-300 dark:bg-amber-700",
    bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50",
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  current: {
    dot: "bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30",
    line: "bg-gray-200 dark:bg-gray-700",
    bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50",
    text: "text-blue-700 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  upcoming: {
    dot: "bg-gray-300 dark:bg-gray-600",
    line: "bg-gray-200 dark:bg-gray-700",
    bg: "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
    text: "text-gray-400 dark:text-gray-500",
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
}

// ─── Skeleton ───────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6 motion-safe:animate-pulse max-w-4xl mx-auto">
      <div className="h-5 w-24 rounded bg-gray-100 dark:bg-gray-800" />
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="h-7 w-64 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ApplicationDetail() {
  const shouldReduceMotion = useReducedMotion()
  const { appId } = useParams<{ appId: string }>()
  const { data, isLoading, isError } = useApplicationDetail(appId)
  const [showAnswers, setShowAnswers] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState("")

  const withdrawMutation = useWithdrawApplication(appId ?? "")

  if (isLoading) return <AnimatedPage><DetailSkeleton /></AnimatedPage>

  if (isError || !data) {
    return (
      <AnimatedPage>
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Application not found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This application may have been removed or is no longer available.
        </p>
        <Link
          to="/student/applications"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
      </div>
      </AnimatedPage>
    )
  }

  const { application: app, answers, round_results, all_rounds, placement } = data
  const statusConfig = STATUS_CONFIG[app.application_status] ?? STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const canWithdraw = WITHDRAWABLE_STATUSES.includes(app.application_status)
  const journeyIdx = getJourneyIndex(app.application_status)
  const isTerminal = app.application_status === "rejected" || app.application_status === "withdrawn"

  const handleWithdraw = () => {
    withdrawMutation.mutate(
      { withdrawal_reason: withdrawReason.trim() || undefined },
      {
        onSuccess: (res) => {
          toast.success(`Withdrawn from ${res.job_title} at ${res.company_name}`)
          setShowWithdrawModal(false)
          setWithdrawReason("")
        },
        onError: (err) => {
          toast.error(err.message || "Failed to withdraw application")
        },
      },
    )
  }

  return (
    <AnimatedPage className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link
        to="/student/applications"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Link>

      {/* ─── Header Card ─── */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="p-6 space-y-5">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl">
                {app.job_title}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {app.company_name}
                </span>
                {app.position_name && (
                  <span className="flex items-center gap-1">
                    <CircleDot className="h-3.5 w-3.5" />
                    {app.position_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Applied {formatDate(app.applied_at)}
                </span>
              </div>
            </div>

            <span
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.className}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </span>
          </div>

          {/* Eligibility warning */}
          {!app.is_eligible && app.eligibility_remarks && (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-3.5 text-sm">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Eligibility flagged
                </p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                  {app.eligibility_remarks}
                </p>
              </div>
            </div>
          )}

          {/* ─── Journey Progress ─── */}
          <div className="pt-1">
            <div
              className="flex items-center justify-between"
              role="progressbar"
              aria-valuenow={journeyIdx + 1}
              aria-valuemin={1}
              aria-valuemax={JOURNEY_STEPS.length}
              aria-label="Application progress"
            >
              {JOURNEY_STEPS.map((step, i) => {
                const Icon = step.icon
                const isReached = !isTerminal && i <= journeyIdx
                const isCurrent = !isTerminal && i === journeyIdx
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    {/* Step dot */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${
                          isCurrent
                            ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30"
                            : isReached
                              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isCurrent
                            ? "text-indigo-600 dark:text-indigo-400"
                            : isReached
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connector line */}
                    {i < JOURNEY_STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2 mt-[-1.25rem]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            !isTerminal && i < journeyIdx
                              ? "bg-indigo-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Terminal status indicator */}
            {isTerminal && (
              <div className="mt-3 flex items-center justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  Application {statusConfig.label}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to={`/student/jobs/${app.job_id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <FileText className="h-4 w-4" />
              View Job
            </Link>
            {canWithdraw && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                <LogOut className="h-4 w-4" />
                Withdraw
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Placement Card ─── */}
      {placement && (
        <motion.div
          variants={shouldReduceMotion ? undefined : fadeInUp}
          initial="initial"
          animate="animate"
          className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <PartyPopper className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-lg">
                Congratulations! You've been placed.
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {app.company_name} — {placement.placement_type === "full-time" ? "Full-time" : "Internship"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {placement.fulltime_package != null && (
              <div className="rounded-xl bg-white/60 dark:bg-gray-900/40 p-3.5">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">
                  Package
                </p>
                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  ₹{(placement.fulltime_package / 100000).toFixed(1)} LPA
                </p>
              </div>
            )}
            {placement.fulltime_designation && (
              <div className="rounded-xl bg-white/60 dark:bg-gray-900/40 p-3.5">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">
                  Designation
                </p>
                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  {placement.fulltime_designation}
                </p>
              </div>
            )}
            {placement.internship_stipend != null && (
              <div className="rounded-xl bg-white/60 dark:bg-gray-900/40 p-3.5">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">
                  Internship Stipend
                </p>
                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  ₹{placement.internship_stipend.toLocaleString("en-IN")}/month
                </p>
              </div>
            )}
            <div className="rounded-xl bg-white/60 dark:bg-gray-900/40 p-3.5">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">
                Status
              </p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100 capitalize">
                {placement.placement_status} · {placement.acceptance_status}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Rounds Timeline ─── */}
      {all_rounds.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-500" />
            Round Results
          </h3>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-3 bottom-3 w-px bg-gray-200 dark:bg-gray-700" />

            <motion.div
              variants={shouldReduceMotion ? undefined : staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {all_rounds
                .sort((a, b) => a.round_number - b.round_number)
                .map((round, idx) => {
                  const roundInfo = getRoundStatus(round, round_results, app.current_round_id)
                  const styles = roundStatusStyles[roundInfo.status]
                  const result = roundInfo.result

                  return (
                    <motion.div
                      key={round.round_id}
                      variants={shouldReduceMotion ? undefined : staggerItem}
                      className="relative flex gap-4 pl-1"
                    >
                      {/* Dot */}
                      <div
                        className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${styles.dot} text-white text-sm font-bold`}
                      >
                        {roundInfo.status === "passed" ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : roundInfo.status === "failed" ? (
                          <XCircle className="h-5 w-5" />
                        ) : roundInfo.status === "pending" ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <span>{round.round_number}</span>
                        )}
                      </div>

                      {/* Content card */}
                      <div
                        className={`flex-1 rounded-xl border p-4 ${styles.bg} transition-all`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {round.round_name}
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="capitalize">
                                {round.round_type.replace("_", " ")}
                              </span>
                              {round.round_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(round.round_date)}
                                </span>
                              )}
                              {round.round_venue && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {round.round_venue}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status badge */}
                          <span
                            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles.badge}`}
                          >
                            {roundInfo.status === "current" ? "Current Round" : roundInfo.status}
                          </span>
                        </div>

                        {/* Result details */}
                        {result && (
                          <div className="mt-3 pt-3 border-t border-gray-100/50 dark:border-gray-700/50 grid gap-2 sm:grid-cols-3 text-sm">
                            {result.score != null && (
                              <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Score
                                </span>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                  {result.score}
                                </p>
                              </div>
                            )}
                            {result.remarks && (
                              <div className="sm:col-span-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Remarks
                                </span>
                                <p className="text-gray-700 dark:text-gray-300">
                                  {result.remarks}
                                </p>
                              </div>
                            )}
                            {result.completed_at && (
                              <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Completed
                                </span>
                                <p className="text-gray-700 dark:text-gray-300">
                                  {formatDateTime(result.completed_at)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
            </motion.div>
          </div>
        </div>
      )}

      {/* ─── Your Answers (Collapsible) ─── */}
      {answers.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Your Responses ({answers.length})
              </h3>
            </div>
            {showAnswers ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showAnswers && (
            <motion.div
              variants={shouldReduceMotion ? undefined : fadeInUp}
              initial="initial"
              animate="animate"
              className="px-6 pb-6 space-y-4"
            >
              {answers
                .sort((a, b) => a.question_order - b.question_order)
                .map((ans, idx) => {
                  let displayAnswer = ""
                  if (ans.answer_text) displayAnswer = ans.answer_text
                  else if (ans.answer_options) displayAnswer = ans.answer_options.join(", ")
                  else if (ans.answer_boolean !== null)
                    displayAnswer = ans.answer_boolean ? "Yes" : "No"

                  return (
                    <div
                      key={ans.answer_id}
                      className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4"
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {ans.question_text}
                          {ans.is_required && (
                            <span className="text-red-500 ml-0.5">*</span>
                          )}
                        </p>
                      </div>
                      <p className="ml-7 text-sm text-gray-900 dark:text-gray-100">
                        {displayAnswer || (
                          <span className="text-gray-400 italic">No answer provided</span>
                        )}
                      </p>
                    </div>
                  )
                })}
            </motion.div>
          )}
        </div>
      )}

      {/* ─── Meta Info ─── */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="flex justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Application ID</span>
            <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
              {app.application_id.slice(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatDateTime(app.last_updated_at)}
            </span>
          </div>
          <div className="flex justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Job Status</span>
            <span className="text-gray-700 dark:text-gray-300 capitalize">{app.job_status}</span>
          </div>
          <div className="flex justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Deadline</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatDate(app.application_deadline)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Withdraw Modal ─── */}
      <ModalWrapper
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        disabled={withdrawMutation.isPending}
        size="md"
        title="Withdraw Application"
        titleIcon={<LogOut className="h-5 w-5 text-red-500" />}
      >
        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="flex gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800 dark:text-red-300">
                This action cannot be undone
              </p>
              <p className="mt-1 text-red-700 dark:text-red-400">
                You are withdrawing your application for{" "}
                <span className="font-semibold">{app.job_title}</span> at{" "}
                <span className="font-semibold">{app.company_name}</span>.
              </p>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Reason for withdrawal{" "}
              <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <textarea
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder="Why are you withdrawing this application?"
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 transition resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-right">
              {withdrawReason.length}/1000
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowWithdrawModal(false)}
              disabled={withdrawMutation.isPending}
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {withdrawMutation.isPending ? "Withdrawing..." : "Confirm Withdrawal"}
            </button>
          </div>
        </div>
      </ModalWrapper>
    </AnimatedPage>
  )
}
