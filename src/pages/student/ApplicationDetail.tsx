import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
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
  ClipboardList,
  RotateCcw,
  ExternalLink,
  Briefcase,
  IndianRupee,
  Timer,
  type LucideIcon,
} from "lucide-react"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { useApplicationDetail } from "@/hooks/student/applications/useApplicationDetail"
import { useWithdrawApplication } from "@/hooks/student/jobs/useWithdrawApplication"
import { useAcceptPlacement } from "@/hooks/student/placements/useAcceptPlacement"
import { useRejectPlacement } from "@/hooks/student/placements/useRejectPlacement"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { toast } from "sonner"
import type { RoundResult, JobRound } from "@/services/student/jobBrowsing.service"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

function formatDateTime(dateStr: string): string {
  return (
    new Date(dateStr).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }) + " IST"
  )
}

// ─── Status Config ──────────────────────────────────────────────────────────────

interface StatusCfg {
  label: string
  className: string
  icon: LucideIcon
  gradient: string
}

const STATUS_CONFIG: Record<string, StatusCfg> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Hourglass,
    gradient: "from-amber-500 via-orange-500 to-amber-500",
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Eye,
    gradient: "from-blue-500 via-indigo-500 to-blue-500",
  },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    icon: CheckCircle2,
    gradient: "from-teal-500 via-emerald-500 to-teal-500",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
    gradient: "from-red-500 via-rose-600 to-red-500",
  },
  selected: {
    label: "Selected",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: Trophy,
    gradient: "from-emerald-500 via-green-500 to-emerald-500",
  },
  offered: {
    label: "Offered",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Star,
    gradient: "from-purple-500 via-violet-600 to-purple-500",
  },
  waitlisted: {
    label: "Waitlisted",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: ClipboardList,
    gradient: "from-orange-500 via-amber-500 to-orange-500",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    icon: Ban,
    gradient: "from-gray-400 via-gray-500 to-gray-400",
  },
  auto_withdrawn: {
    label: "Auto-Withdrawn",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    icon: Ban,
    gradient: "from-gray-400 via-gray-500 to-gray-400",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle2,
    gradient: "from-emerald-500 via-green-500 to-emerald-500",
  },
}

const WITHDRAWABLE_STATUSES = new Set(["pending", "under_review", "shortlisted", "selected", "offered", "waitlisted"])

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
  return Math.max(idx, 0)
}

// ─── "What happens next?" guidance ──────────────────────────────────────────────

function getStatusGuidance(status: string): { icon: LucideIcon; title: string; message: string; cta?: string; ctaLabel?: string } {
  switch (status) {
    case "pending":        return { icon: Hourglass, title: "Application Submitted", message: "Your application is being reviewed by the placement team. You\u2019ll be notified once they shortlist candidates.", cta: "job", ctaLabel: "View Job Details" }
    case "under_review":   return { icon: Eye, title: "Under Review", message: "The placement team is evaluating your profile. Sit tight \u2014 you\u2019ll hear back soon.", cta: "job", ctaLabel: "View Job Details" }
    case "shortlisted":    return { icon: CheckCircle2, title: "Shortlisted!", message: "Great news! You\u2019ve been shortlisted. Prepare for the upcoming selection rounds.", cta: "rounds", ctaLabel: "View Rounds" }
    case "selected":       return { icon: Trophy, title: "Selected!", message: "Congratulations! You\u2019ve been selected. Your offer details will be shared by the placement team soon." }
    case "offered":        return { icon: Star, title: "Offer Received!", message: "You have a placement offer! Review the details and respond before the deadline.", cta: "offer", ctaLabel: "View Offer" }
    case "waitlisted":     return { icon: ClipboardList, title: "On Waitlist", message: "You\u2019re on the waitlist. If a selected candidate declines, you\u2019ll be promoted automatically." }
    case "rejected":       return { icon: XCircle, title: "Not Selected", message: "Unfortunately, you weren\u2019t selected for this role. Don\u2019t worry \u2014 keep applying to other opportunities!", cta: "jobs", ctaLabel: "Browse More Jobs" }
    case "withdrawn":
    case "auto_withdrawn": return { icon: Ban, title: "Withdrawn", message: "This application has been withdrawn. If the deadline hasn\u2019t passed, you may be able to re-apply.", cta: "job", ctaLabel: "View Job" }
    case "accepted":       return { icon: PartyPopper, title: "Placement Confirmed!", message: "Your placement is confirmed! Check your placements page for joining details and next steps.", cta: "placements", ctaLabel: "View Placements" }
    default:               return { icon: CircleDot, title: "Processing", message: "" }
  }
}

// ─── Offer Countdown Hook ───────────────────────────────────────────────────────

function useCountdown(deadline: string | null | undefined) {
  const [state, setState] = useState<{ days: number; hours: number; minutes: number; expired: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!deadline) return

    function update() {
      const diff = new Date(deadline!).getTime() - Date.now()
      if (diff <= 0) {
        setState({ days: 0, hours: 0, minutes: 0, expired: true, text: "Expired" })
      } else {
        const days = Math.floor(diff / 86_400_000)
        const hours = Math.floor((diff % 86_400_000) / 3_600_000)
        const minutes = Math.floor((diff % 3_600_000) / 60_000)
        setState({ days, hours, minutes, expired: false, text: `${days}d ${hours}h ${minutes}m` })
      }
    }

    // Initial computation via microtask to satisfy React Compiler (no sync setState in effect)
    const initId = setTimeout(update, 0)
    const id = setInterval(update, 60_000)
    return () => {
      clearTimeout(initId)
      clearInterval(id)
    }
  }, [deadline])

  return state
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

function getRoundDotIcon(
  status: "passed" | "failed" | "pending" | "upcoming" | "current",
  roundNumber: number,
): React.ReactNode {
  if (status === "passed") return <CheckCircle2 className="h-5 w-5" />
  if (status === "failed") return <XCircle className="h-5 w-5" />
  if (status === "pending") return <Clock className="h-5 w-5" />
  return <span>{roundNumber}</span>
}

// ─── Skeleton ───────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6 motion-safe:animate-pulse max-w-6xl mx-auto">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
        <div className="p-6 space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-2">
              <div className="h-7 w-72 rounded-lg bg-gray-100 dark:bg-gray-800" />
              <div className="h-4 w-48 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="h-8 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="flex gap-6 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="h-3 w-14 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-3">
          <div className="h-5 w-40 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800" />)}
        </div>
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

  const [currentTime, setCurrentTime] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setCurrentTime(Date.now()), 0)
    return () => clearTimeout(id)
  }, [])

  const withdrawMutation = useWithdrawApplication(appId ?? "")
  const { acceptPlacement, isAccepting } = useAcceptPlacement()
  const { formData: rejectFormData, handleChange: handleRejectChange, errors: rejectErrors, validate: validateReject, rejectPlacement, isRejecting } = useRejectPlacement()

  const handleAcceptOffer = () => {
    if (!data?.placement) return
    acceptPlacement(data.placement.placement_id)
  }

  const handleRejectOffer = () => {
    if (!data?.placement) return
    const validated = validateReject()
    if (!validated) return
    rejectPlacement(
      { placementId: data.placement.placement_id, payload: { rejection_reason: rejectFormData.rejection_reason.trim() } },
    )
  }

  if (isLoading) return <AnimatedPage><DetailSkeleton /></AnimatedPage>

  if (isError || !data) {
    return (
      <AnimatedPage>
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-20 text-center">
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
  const canWithdraw = WITHDRAWABLE_STATUSES.has(app.application_status)
  const canReApply =
    currentTime > 0 &&
    ["withdrawn", "auto_withdrawn"].includes(app.application_status) &&
    new Date(app.application_deadline).getTime() > currentTime
  const journeyIdx = getJourneyIndex(app.application_status)
  const isTerminal = ["rejected", "withdrawn", "auto_withdrawn"].includes(app.application_status)
  const guidance = getStatusGuidance(app.application_status)
  const GuidanceIcon = guidance.icon
  const isOffered = app.application_status === "offered"

  const handleWithdraw = () => {
    withdrawMutation.mutate(
      { withdrawal_reason: withdrawReason.trim() || undefined },
      {
        onSuccess: (res) => {
          toast.success(res.message || `Withdrawn from ${res.job_title} at ${res.company_name}`)
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
    <AnimatedPage className="max-w-6xl mx-auto space-y-6">
      {/* ───── Back ───── */}
      <Link
        to="/student/applications"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      {/* ───── HERO HEADER ───── */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Status-colored gradient stripe */}
        <div className={`h-28 bg-gradient-to-r ${statusConfig.gradient} relative`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
          {/* Mega status badge floating on stripe */}
          <div className="absolute bottom-4 right-6 lg:right-8">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 ${statusConfig.className}`}>
              <StatusIcon className="h-4.5 w-4.5" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 lg:px-8 lg:pb-8">
          {/* Company avatar overlapping stripe */}
          <div className="flex items-end gap-4 -mt-8 relative z-10">
            {app.company_logo ? (
              <img
                src={app.company_logo}
                alt={app.company_name}
                className="h-16 w-16 rounded-2xl object-contain shrink-0 bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold shrink-0 border-4 border-white dark:border-gray-900 shadow-lg">
                {app.company_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Title / Company / Position cluster */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl leading-tight">
                {app.job_title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                  <Building2 className="h-4 w-4 text-gray-400" /> {app.company_name}
                </span>
                {app.position_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" /> {app.position_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Applied {formatDate(app.applied_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility warning */}
          {!app.is_eligible && app.eligibility_remarks && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-3.5 text-sm">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">Eligibility flagged</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-400">{app.eligibility_remarks}</p>
              </div>
            </div>
          )}

          {/* ─── Journey Stepper (animated gradient progress) ─── */}
          <div className="mt-6 pt-1">
            <div className="flex items-center justify-between" aria-label="Application progress">
              {JOURNEY_STEPS.map((step, i) => {
                const Icon = step.icon
                const isReached = !isTerminal && i <= journeyIdx
                const isCurrent = !isTerminal && i === journeyIdx
                let dotClass = "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                if (isCurrent) dotClass = "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30 motion-safe:animate-pulse"
                else if (isReached) dotClass = "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                let textClass = "text-gray-400 dark:text-gray-500"
                if (isCurrent) textClass = "text-indigo-600 dark:text-indigo-400 font-semibold"
                else if (isReached) textClass = "text-gray-700 dark:text-gray-300"
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5 relative">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${dotClass}`}>
                        {isReached && !isCurrent ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={`text-xs font-medium whitespace-nowrap ${textClass}`}>
                        {step.label}
                      </span>
                    </div>

                    {/* Connector with animated gradient fill */}
                    {i < JOURNEY_STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2 mt-[-1.25rem] relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        {!isTerminal && i < journeyIdx && (
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Terminal status badge */}
            {isTerminal && (
              <div className="mt-3 flex items-center justify-center">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${statusConfig.className}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  Application {statusConfig.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───── "WHAT HAPPENS NEXT?" CARD (glassmorphic) ───── */}
      {guidance.message && (
        <div className="rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 p-5 lg:p-6">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                isTerminal ? "bg-gray-100 dark:bg-gray-800" : "bg-indigo-100 dark:bg-indigo-900/30"
              }`}>
                <GuidanceIcon className={`h-5 w-5 ${isTerminal ? "text-gray-500" : "text-indigo-600 dark:text-indigo-400"}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{guidance.title}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{guidance.message}</p>
                {guidance.cta === "job" && (
                  <Link to={`/student/jobs/${app.job_id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {guidance.ctaLabel} <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                {guidance.cta === "jobs" && (
                  <Link to="/student/jobs" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {guidance.ctaLabel} <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                {guidance.cta === "placements" && (
                  <Link to="/student/placements" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {guidance.ctaLabel} <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Offer countdown timer */}
            <OfferCountdownTimer deadline={isOffered ? app.application_deadline : null} />

            {/* Waitlist rank hint */}
            {app.application_status === "waitlisted" && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/50 shrink-0">
                <ClipboardList className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">Waitlisted</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Promotion is automatic</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───── OFFER CARD (premium gradient border) ───── */}
      {placement && (
        <PlacementCard
          placement={placement}
          app={app}
          shouldReduceMotion={shouldReduceMotion}
          onAccept={handleAcceptOffer}
          isAccepting={isAccepting}
          onReject={handleRejectOffer}
          isRejecting={isRejecting}
          rejectReason={rejectFormData.rejection_reason}
          onRejectReasonChange={handleRejectChange}
          rejectError={rejectErrors.rejection_reason}
        />
      )}

      {/* ───── ROUND RESULTS ───── */}
      {all_rounds.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Round Results</h3>
            <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {all_rounds.length} {all_rounds.length === 1 ? "round" : "rounds"}
            </span>
          </div>
          <div className="p-6">
            <div className="relative">
              <div className="absolute left-5 top-3 bottom-3 w-px bg-gray-200 dark:bg-gray-700" />
              <motion.div variants={shouldReduceMotion ? undefined : staggerContainer} initial="initial" animate="animate" className="space-y-5">
                {[...all_rounds]
                  .sort((a, b) => a.round_number - b.round_number)
                  .map((round) => {
                    const roundInfo = getRoundStatus(round, round_results, app.current_round_id)
                    const styles = roundStatusStyles[roundInfo.status]
                    const result = roundInfo.result

                    return (
                      <motion.div key={round.round_id} variants={shouldReduceMotion ? undefined : staggerItem} className="relative flex gap-4 pl-1">
                        {/* Large numbered dot with status icon */}
                        <div className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${styles.dot} text-white text-sm font-bold`}>
                          {getRoundDotIcon(roundInfo.status, round.round_number)}
                        </div>

                        {/* Card */}
                        <div className={`flex-1 rounded-xl border p-4 ${styles.bg} transition-all`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{round.round_name}</h4>
                              <div className="mt-1 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-xs font-medium text-indigo-600 dark:text-indigo-400 capitalize">
                                  {round.round_type.replaceAll("_", " ")}
                                </span>
                                {round.round_date && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-3 w-3" /> {formatDate(round.round_date)}
                                  </span>
                                )}
                                {round.round_venue && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 text-xs text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-3 w-3" /> {round.round_venue}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles.badge}`}>
                              {roundInfo.status === "current" ? "Current Round" : roundInfo.status}
                            </span>
                          </div>

                          {/* Score bar + remarks */}
                          {result && (
                            <div className="mt-3 pt-3 border-t border-gray-100/50 dark:border-gray-700/50 space-y-2">
                              {result.score != null && (
                                <div>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-500 dark:text-gray-400">Score</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{result.score}</span>
                                  </div>
                                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    {(() => {
                                      let barColor = "bg-amber-500"
                                      if (result.result_status === "passed") barColor = "bg-emerald-500"
                                      else if (result.result_status === "failed") barColor = "bg-red-500"
                                      return (
                                        <div
                                          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                          style={{ width: `${Math.min(result.score, 100)}%` }}
                                        />
                                      )
                                    })()}
                                  </div>
                                </div>
                              )}
                              {result.remarks && (
                                <blockquote className="pl-3 border-l-2 border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 italic">
                                  "{result.remarks}"
                                </blockquote>
                              )}
                              {result.completed_at && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">Completed: {formatDateTime(result.completed_at)}</p>
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
        </div>
      )}

      {/* ───── RESPONSES (Accordion) ───── */}
      {answers.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Your Responses ({answers.length})
              </h3>
            </div>
            {showAnswers ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>

          <AnimatePresence>
            {showAnswers && (
              <motion.div
                variants={shouldReduceMotion ? undefined : fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
                className="px-6 pb-6 space-y-3"
              >
                {[...answers]
                  .sort((a, b) => a.question_order - b.question_order)
                  .map((ans, idx) => (
                    <AnswerCard key={ans.answer_id} answer={ans} index={idx} />
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ───── META INFO (2x2 grid) ───── */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            { label: "Application ID", value: app.application_id.slice(0, 8) + "..." },
            { label: "Last Updated", value: formatDateTime(app.last_updated_at) },
            { label: "Job Status", value: app.job_status.replaceAll("_", " ") },
            { label: "Deadline", value: formatDate(app.application_deadline) },
          ].map((item) => (
            <div key={item.label} className="flex justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ───── ACTIONS (sticky bottom bar on mobile, inline on desktop) ───── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 p-3 sm:hidden">
        <div className="flex gap-2 max-w-lg mx-auto">
          <Link to={`/student/jobs/${app.job_id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-2.5 text-sm font-medium">
            <FileText className="h-4 w-4" /> View Job
          </Link>
          {canWithdraw && (
            <button onClick={() => setShowWithdrawModal(true)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2.5 text-sm font-medium">
              <LogOut className="h-4 w-4" /> Withdraw
            </button>
          )}
          {canReApply && (
            <Link to={`/student/jobs/${app.job_id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white px-3 py-2.5 text-sm font-medium">
              <RotateCcw className="h-4 w-4" /> Re-Apply
            </Link>
          )}
        </div>
      </div>
      {/* Desktop actions row */}
      <div className="hidden sm:flex flex-wrap gap-3 pb-2">
        <Link
          to={`/student/jobs/${app.job_id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <FileText className="h-4 w-4" /> View Job
        </Link>
        {canWithdraw && (
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-2.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          >
            <LogOut className="h-4 w-4" /> Withdraw
          </button>
        )}
        {canReApply && (
          <Link
            to={`/student/jobs/${app.job_id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-medium transition shadow-lg shadow-indigo-500/25"
          >
            <RotateCcw className="h-4 w-4" /> Re-Apply
          </Link>
        )}
      </div>

      {/* Mobile bottom bar spacer */}
      <div className="h-16 sm:hidden" />

      {/* ───── Withdraw Modal ───── */}
      <ModalWrapper
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        disabled={withdrawMutation.isPending}
        size="md"
        title="Withdraw Application"
        titleIcon={<LogOut className="h-5 w-5 text-red-500" />}
      >
        <div className="p-6 space-y-5">
          <div className="flex gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800 dark:text-red-300">This action cannot be undone</p>
              <p className="mt-1 text-red-700 dark:text-red-400">
                You are withdrawing your application for{" "}
                <span className="font-semibold">{app.job_title}</span> at{" "}
                <span className="font-semibold">{app.company_name}</span>.
              </p>
            </div>
          </div>

          {app.application_status === "offered" && (
            <div className="flex gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">You have an active offer</p>
                <p className="mt-1 text-amber-700 dark:text-amber-400">
                  Withdrawing will automatically <strong>decline your placement offer</strong>.
                </p>
              </div>
            </div>
          )}

          {app.application_status === "selected" && (
            <div className="flex gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">You are selected</p>
                <p className="mt-1 text-amber-700 dark:text-amber-400">
                  You may receive an offer soon. Withdrawing means you will not receive it.
                </p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="withdraw-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Reason for withdrawal <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <textarea
              id="withdraw-reason"
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder="Why are you withdrawing this application?"
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 transition resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-right">{withdrawReason.length}/1000</p>
          </div>

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

// ─── Sub-components ─────────────────────────────────────────────────────────────

/** Offer countdown timer shown in the guidance card */
function OfferCountdownTimer({ deadline }: Readonly<{ deadline: string | null }>) {
  const cd = useCountdown(deadline)
  if (!cd || !deadline) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 shrink-0">
      <Timer className="h-5 w-5 text-purple-500" />
      <div>
        <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">Offer Deadline</p>
        {cd.expired ? (
          <p className="text-sm font-bold text-red-600 dark:text-red-400">Expired</p>
        ) : (
          <div className="flex gap-1.5 mt-0.5">
            {[
              { val: cd.days, unit: "d" },
              { val: cd.hours, unit: "h" },
              { val: cd.minutes, unit: "m" },
            ].map((t) => (
              <span key={t.unit} className="inline-flex items-baseline gap-0.5 text-sm font-bold text-purple-900 dark:text-purple-100">
                {t.val}<span className="text-[10px] font-medium text-purple-500 dark:text-purple-400">{t.unit}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Premium placement/offer card */
function PlacementCard({
  placement,
  app,
  shouldReduceMotion,
  onAccept,
  isAccepting,
  onReject,
  isRejecting,
  rejectReason,
  onRejectReasonChange,
  rejectError,
}: Readonly<{
  placement: { placement_id: string; placement_type: string; placement_status: string; acceptance_status: string; fulltime_package: number | null; fulltime_designation: string | null; internship_stipend: number | null }
  app: { company_name: string; application_status: string }
  shouldReduceMotion: boolean | null
  onAccept: () => void
  isAccepting: boolean
  onReject: () => void
  isRejecting: boolean
  rejectReason: string
  onRejectReasonChange: (value: string) => void
  rejectError: string | undefined
}>) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const isPendingOffer = placement.acceptance_status === "pending"

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : fadeInUp}
      initial="initial"
      animate="animate"
      className="rounded-2xl p-[2px] bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500"
    >
      <div className="rounded-[14px] bg-white dark:bg-gray-900 p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <PartyPopper className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
              {isPendingOffer ? "You have a placement offer!" : "Congratulations! You\u2019ve been placed."}
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              {app.company_name} — {placement.placement_type === "full-time" ? "Full-time" : "Internship"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {placement.fulltime_package != null && (
            <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Package</span>
              </div>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                ₹{(placement.fulltime_package / 100000).toFixed(1)} LPA
              </p>
            </div>
          )}
          {placement.fulltime_designation && (
            <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Designation</span>
              </div>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{placement.fulltime_designation}</p>
            </div>
          )}
          {placement.internship_stipend != null && (
            <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Stipend</span>
              </div>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                ₹{placement.internship_stipend.toLocaleString("en-IN")}/mo
              </p>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Status:</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300 capitalize">{placement.placement_status}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300 capitalize">{placement.acceptance_status}</span>
        </div>

        {/* Accept / Decline buttons for pending offers */}
        {isPendingOffer && (
          <div className="mt-5 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={onAccept}
                disabled={isAccepting || isRejecting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-semibold transition shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isAccepting ? "Accepting..." : "Accept Offer"}
              </button>
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={isAccepting || isRejecting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-2.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Decline Offer
              </button>
            </div>

            {showRejectForm && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-4 space-y-3">
                <label htmlFor="reject-reason-input" className="block text-sm font-medium text-red-800 dark:text-red-300">
                  Reason for declining <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="reject-reason-input"
                  value={rejectReason}
                  onChange={(e) => onRejectReasonChange(e.target.value)}
                  placeholder="Please share your reason..."
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none"
                />
                {rejectError && <p className="text-xs text-red-600">{rejectError}</p>}
                <button
                  onClick={onReject}
                  disabled={isRejecting}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  {isRejecting ? "Declining..." : "Confirm Decline"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/** Answer accordion card */
function AnswerCard({ answer: ans, index: idx }: Readonly<{ answer: { answer_id: string; question_text: string; question_type: string; question_options: string[] | null; is_required: boolean; answer_text: string | null; answer_options: string[] | null; answer_boolean: boolean | null }; index: number }>) {
  const [open, setOpen] = useState(false)

  let displayAnswer = ""
  if (ans.answer_text) displayAnswer = ans.answer_text
  else if (ans.answer_options) displayAnswer = ans.answer_options.join(", ")
  else if (ans.answer_boolean !== null) displayAnswer = ans.answer_boolean ? "Yes" : "No"

  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition"
      >
        <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
          {idx + 1}
        </span>
        <p className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {ans.question_text}
          {ans.is_required && <span className="text-red-500 ml-0.5">*</span>}
        </p>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 ml-9">
          {/* For MCQ: highlight selected among all options */}
          {ans.question_options && ans.question_options.length > 0 ? (
            <div className="space-y-1.5">
              {ans.question_options.map((opt) => {
                const isSelected = ans.answer_options?.includes(opt)
                return (
                  <div
                    key={opt}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-medium"
                        : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </span>
                    {opt}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {displayAnswer || <span className="text-gray-400 italic">No answer provided</span>}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
