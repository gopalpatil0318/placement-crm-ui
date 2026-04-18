import { useState, type SyntheticEvent } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import TierBadge from "@/components/collegeadmin/TierBadge"
import { LayoutGroup, motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Users,
  Briefcase,
  IndianRupee,
  Calendar,
  ExternalLink,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Ban,
  FileText,
  GraduationCap,
  CircleDot,
  Send,
  AlertTriangle,
  Share2,
  ListOrdered,
  type LucideIcon,
} from "lucide-react"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { useJobDetail } from "@/hooks/student/jobs/useJobDetail"
import { useJobEligibility } from "@/hooks/student/jobs/useJobEligibility"
import { useApplyJob } from "@/hooks/student/jobs/useApplyJob"
import { useDenyJob } from "@/hooks/student/jobs/useDenyJob"
import JobApplicationForm from "@/components/student/jobs/JobApplicationForm"
import DenyJobModal from "@/components/student/jobs/DenyJobModal"
import OverrideRequestSection from "@/components/student/overrides/OverrideRequestSection"
import { toast } from "sonner"
import type { ApplyPayload, EligibilityResponse, JobDetailResponse } from "@/services/student/jobBrowsing.service"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getCountdown(deadline: string): { text: string; urgent: boolean; expired: boolean } {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return { text: "Deadline passed", urgent: true, expired: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 7) return { text: `${days} days left`, urgent: false, expired: false }
  if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days <= 3, expired: false }
  return { text: `${hours}h left`, urgent: true, expired: false }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

interface TabConfig { key: string; label: string; icon: LucideIcon }

const ALL_TABS: TabConfig[] = [
  { key: "Overview",    label: "Overview",    icon: FileText },
  { key: "Positions",   label: "Positions",   icon: GraduationCap },
  { key: "Eligibility", label: "Eligibility", icon: Shield },
  { key: "Rounds",      label: "Rounds",      icon: ListOrdered },
  { key: "Apply",       label: "Apply",       icon: Send },
]

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  internship: "Internship",
  both: "Both",
}

const ROUND_TYPE_LABELS: Record<string, string> = {
  aptitude: "Aptitude Test",
  coding: "Coding Round",
  technical: "Technical Interview",
  hr: "HR Interview",
  group_discussion: "Group Discussion",
  presentation: "Presentation",
  assignment: "Take-Home Assignment",
  mcq: "MCQ Test",
  psychometric: "Psychometric Test",
  other: "Other",
}

const ROUND_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Upcoming", className: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" },
  in_progress: { label: "In Progress", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  completed: { label: "Completed", className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", className: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
}

function getCountdownClassName(countdown: { urgent: boolean; expired: boolean }): string {
  if (countdown.expired) return "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
  if (countdown.urgent) return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
  return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
}

function getRoundDotClass(status: string): string {
  if (status === "completed") return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
  if (status === "in_progress") return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-300 dark:ring-blue-700"
  return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
}

function getStatusGuidance(status: string): { message: string; cta?: string } {
  switch (status) {
    case "pending":        return { message: "Your application is being reviewed by the placement team. You\u2019ll be notified once they shortlist candidates.", cta: "View Application" }
    case "under_review":   return { message: "The placement team is evaluating your profile. Sit tight \u2014 you\u2019ll hear back soon.", cta: "View Application" }
    case "shortlisted":    return { message: "Great news! You\u2019ve been shortlisted. Prepare for the upcoming selection rounds \u2014 check the Rounds tab.", cta: "View Rounds" }
    case "selected":       return { message: "Congratulations! You\u2019ve been selected. Your offer details will be shared by the placement team soon.", cta: "View Application" }
    case "offered":        return { message: "You have a placement offer! Review the details and respond before the deadline.", cta: "View Offer" }
    case "waitlisted":     return { message: "You\u2019re on the waitlist. If a selected candidate declines, you\u2019ll be promoted automatically." }
    case "rejected":       return { message: "Unfortunately, you weren\u2019t selected for this role. Don\u2019t worry \u2014 keep applying to other opportunities!" }
    case "withdrawn":
    case "auto_withdrawn": return { message: "You withdrew from this job. If the college allows re-applications, you can apply again." }
    case "accepted":       return { message: "Your placement is confirmed! Check your placements page for joining details and next steps.", cta: "View Placements" }
    default:               return { message: "" }
  }
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:        { label: "Pending",        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  under_review:   { label: "Under Review",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shortlisted:    { label: "Shortlisted",    className: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  rejected:       { label: "Rejected",       className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  selected:       { label: "Selected",       className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  offered:        { label: "Offered",        className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  waitlisted:     { label: "Waitlisted",     className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  withdrawn:      { label: "Withdrawn",      className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  auto_withdrawn: { label: "Auto Withdrawn", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  accepted:       { label: "Accepted",       className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
}

// ─── Skeletons ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6 motion-safe:animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
        <div className="p-6 -mt-10 space-y-4">
          <div className="flex gap-4 items-end">
            <div className="h-16 w-16 rounded-2xl bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-900 shrink-0" />
            <div className="flex-1 space-y-2 pt-6">
              <div className="h-6 w-64 rounded-lg bg-gray-100 dark:bg-gray-800" />
              <div className="h-4 w-40 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-9 w-28 rounded-xl bg-gray-100 dark:bg-gray-800" />)}
          </div>
        </div>
      </div>
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 w-24 rounded-xl bg-gray-100 dark:bg-gray-800" />)}
      </div>
      {/* Content skeleton */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-3">
        <div className="h-5 w-40 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

// ─── Eligibility status banner (extracted to eliminate nested ternaries) ──────

type EligibilityState = "can-apply" | "eligible-blocked" | "ineligible"

function getEligibilityState(canApply: boolean, isEligible: boolean, hasBlockers: boolean): EligibilityState {
  if (canApply) return "can-apply"
  if (isEligible && hasBlockers) return "eligible-blocked"
  return "ineligible"
}

const ELIGIBILITY_BANNER_STYLES: Record<EligibilityState, { bg: string; text: string; icon: typeof CheckCircle2; message: string }> = {
  "can-apply": {
    bg: "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50",
    text: "text-emerald-800 dark:text-emerald-300",
    icon: CheckCircle2,
    message: "You are eligible to apply for this job!",
  },
  "eligible-blocked": {
    bg: "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50",
    text: "text-amber-800 dark:text-amber-300",
    icon: AlertCircle,
    message: "You meet the eligibility criteria, but cannot apply right now.",
  },
  ineligible: {
    bg: "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50",
    text: "text-red-800 dark:text-red-300",
    icon: XCircle,
    message: "You do not meet the eligibility criteria for this job.",
  },
}

const ELIGIBILITY_ICON_COLORS: Record<EligibilityState, string> = {
  "can-apply": "text-emerald-500",
  "eligible-blocked": "text-amber-500",
  ineligible: "text-red-500",
}

function EligibilityBanner({ state }: Readonly<{ state: EligibilityState }>) {
  const style = ELIGIBILITY_BANNER_STYLES[state]
  const Icon = style.icon
  return (
    <div className={`flex items-center gap-3 rounded-xl p-4 ${style.bg}`}>
      <Icon className={`h-5 w-5 shrink-0 ${ELIGIBILITY_ICON_COLORS[state]}`} />
      <p className={`text-sm font-medium ${style.text}`}>{style.message}</p>
    </div>
  )
}

// ─── Eligibility Tab (extracted to reduce parent complexity) ─────────────────

function EligibilityTab({
  eligibility,
  jobId,
  countdown,
  setActiveTab,
}: Readonly<{
  eligibility: ReturnType<typeof useJobEligibility>
  jobId: string | undefined
  countdown: { text: string; urgent: boolean; expired: boolean }
  setActiveTab: (tab: string) => void
}>) {
  if (eligibility.isLoading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 motion-safe:animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map((id) => (
          <div key={id} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    )
  }

  if (!eligibility.data) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 text-center">
        <Shield className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Unable to load eligibility data. Please try again.
        </p>
        <button
          onClick={() => eligibility.refetch()}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <Shield className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  const data = eligibility.data
  const hasBlockers = data.blockers.length > 0
  const state = getEligibilityState(data.can_apply, data.eligibility.is_eligible, hasBlockers)
  return (
    <>
      <EligibilityBanner state={state} />

      {/* Blockers */}
      {hasBlockers && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Blockers
          </h4>
          {data.blockers.map((b) => (
            <p key={b} className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {b}
            </p>
          ))}
        </div>
      )}

      {/* Placement Policy Info */}
      {data.policy?.is_placed && (
        <div className={`rounded-xl p-4 space-y-2 ${
          data.policy.upgrade
            ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50"
            : "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50"
        }`}>
          <h4 className={`text-sm font-semibold flex items-center gap-1.5 ${
            data.policy.upgrade
              ? "text-amber-800 dark:text-amber-300"
              : "text-blue-800 dark:text-blue-300"
          }`}>
            <Shield className="h-4 w-4" />
            Placement Policy
          </h4>
          <p className={`text-sm ${
            data.policy.upgrade
              ? "text-amber-700 dark:text-amber-400"
              : "text-blue-700 dark:text-blue-400"
          }`}>
            You are currently placed at{" "}
            <span className="font-medium">{data.policy.current_placement?.company_name}</span>
            {data.policy.current_placement?.tier_name && (
              <> ({data.policy.current_placement.tier_name} tier)</>
            )}.
            {data.policy.upgrade && (
              <> This is a <span className="font-semibold">dream upgrade</span> opportunity ({data.policy.target_job?.tier_name} tier).</>
            )}
          </p>
        </div>
      )}

      {/* Criteria comparison table */}
      {data.eligibility.criteria && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Eligibility Comparison
            </h4>
          </div>

          {/* Desktop: semantic table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th scope="col" className="px-5 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Criteria</th>
                  <th scope="col" className="px-5 py-2.5 text-center font-medium text-gray-500 dark:text-gray-400">Required</th>
                  <th scope="col" className="px-5 py-2.5 text-center font-medium text-gray-500 dark:text-gray-400">Yours</th>
                  <th scope="col" className="px-5 py-2.5 text-center font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {buildCriteriaRows(data).map((row) => (
                  <tr key={row.label}>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{row.label}</td>
                    <td className="px-5 py-3 text-center text-gray-600 dark:text-gray-300">{row.required}</td>
                    <td className="px-5 py-3 text-center font-medium text-gray-900 dark:text-gray-100">{row.yours}</td>
                    <td className="px-5 py-3 text-center">
                      {row.pass ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: card layout */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {buildCriteriaRows(data).map((row) => (
              <div key={row.label} className="px-5 py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Required: {row.required} · Yours: {row.yours}
                  </p>
                </div>
                <span className="ml-3 shrink-0">
                  {row.pass ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {data.eligibility.issues.length > 0 && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            Issues
          </h4>
          {data.eligibility.issues.map((issue) => (
            <p key={issue} className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <CircleDot className="h-3.5 w-3.5 shrink-0" /> {issue}
            </p>
          ))}
        </div>
      )}

      {/* Override Request Section — shows when ineligible */}
      <OverrideRequestSection
        jobId={jobId!}
        isIneligible={!data.can_apply}
        onSwitchToApplyTab={() => setActiveTab("Apply")}
        deadlineExpired={countdown.expired}
      />
    </>
  )
}

// ─── Overview Sidebar ────────────────────────────────────────────────────────

function OverviewSidebar({ job, eligibility_criteria, student_status, onShowEligibility, onShowRounds }: Readonly<{
  job: JobDetailResponse["job"]
  eligibility_criteria: JobDetailResponse["eligibility_criteria"]
  student_status: JobDetailResponse["student_status"]
  onShowEligibility: () => void
  onShowRounds: () => void
}>) {
  return (
    <div className="space-y-4">
      {/* Salary card */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Package</span>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{job.salary_package ? `₹${job.salary_package} LPA` : "Not disclosed"}</p>
      </div>

      {/* Bond card */}
      {job.bond_duration && Number(job.bond_duration) > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bond</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{job.bond_duration} {Number(job.bond_duration) === 1 ? "year" : "years"}</p>
          {job.bond_details && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{job.bond_details}</p>}
        </div>
      )}

      {/* Internship duration */}
      {job.internship_duration && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Internship</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{job.internship_duration} {Number(job.internship_duration) === 1 ? "month" : "months"}</p>
          {job.internship_stipend && Number(job.internship_stipend) > 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Stipend: ₹{Number(job.internship_stipend).toLocaleString("en-IN")}/mo</p>
          )}
        </div>
      )}

      {/* Application status card */}
      {student_status.has_applied && student_status.application_status && (() => {
        const guidance = getStatusGuidance(student_status.application_status)
        const badge = STATUS_BADGE[student_status.application_status] ?? STATUS_BADGE.pending
        return (
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Application</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Applied on {formatDate(student_status.applied_at!)}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${badge.className}`}>{badge.label}</span>
            </div>
            <div className="mt-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">What happens next?</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{guidance.message}</p>
              {student_status.application_id && (
                <button onClick={onShowRounds} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition">
                  {guidance.cta ?? "View Application"} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )
      })()}

      {/* Quick eligibility preview */}
      {eligibility_criteria && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Eligibility</span>
            </div>
            <button onClick={onShowEligibility} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Details →
            </button>
          </div>
          <div className="space-y-2 text-sm">
            {eligibility_criteria.min_overall_cgpa != null && (
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Min CGPA</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{eligibility_criteria.min_overall_cgpa}</span>
              </div>
            )}
            {eligibility_criteria.max_live_kts != null && (
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Max Live KTs</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{eligibility_criteria.max_live_kts}</span>
              </div>
            )}
            {eligibility_criteria.min_tenth_percentage != null && (
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Min 10th %</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{eligibility_criteria.min_tenth_percentage}%</span>
              </div>
            )}
            {eligibility_criteria.min_twelfth_percentage != null && (
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Min 12th %</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{eligibility_criteria.min_twelfth_percentage}%</span>
              </div>
            )}
            {eligibility_criteria.min_diploma_percentage != null && (
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Min Diploma %</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{eligibility_criteria.min_diploma_percentage}%</span>
              </div>
            )}
            {(eligibility_criteria.allowed_departments?.length ?? 0) > 0 && (
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Departments</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-right max-w-[60%] truncate">
                  {eligibility_criteria.allowed_departments!.join(", ")}
                </span>
              </div>
            )}
            {(eligibility_criteria.allowed_genders?.length ?? 0) > 0 && (
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Genders</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-right max-w-[60%] truncate">
                  {eligibility_criteria.allowed_genders!.join(", ")}
                </span>
              </div>
            )}
            {(eligibility_criteria.allowed_gap_statuses?.length ?? 0) > 0 && (
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Gap Status</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-right max-w-[60%] truncate">
                  {eligibility_criteria.allowed_gap_statuses!.map((s) => s === "no_gap" ? "No Gap" : "Gap").join(", ")}
                </span>
              </div>
            )}
            {eligibility_criteria.exclude_already_placed && (
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Already Placed</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Not Eligible</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useJobDetail(jobId)
  const [activeTab, setActiveTab] = useState<string>("Overview")
  const [showDenyModal, setShowDenyModal] = useState(false)
  const [showDreamWarning, setShowDreamWarning] = useState(false)
  const [pendingApplyPayload, setPendingApplyPayload] = useState<ApplyPayload | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const eligibility = useJobEligibility(jobId, true)
  const applyMutation = useApplyJob(jobId ?? "")
  const denyMutation = useDenyJob(jobId ?? "")

  if (isLoading) {
    return (
      <AnimatedPage className="max-w-6xl mx-auto">
        <DetailSkeleton />
      </AnimatedPage>
    )
  }

  if (isError || !data) {
    return (
      <AnimatedPage>
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Job not found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This job may have been removed or is no longer available.
        </p>
        <Link
          to="/student/jobs"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
      </div>
      </AnimatedPage>
    )
  }

  const { job, company, positions, eligibility_criteria, rounds, questions, student_status } = data
  const countdown = getCountdown(job.application_deadline)
  const hasApplied = student_status.has_applied
  const hasDenied = student_status.has_denied
  const canShowApply = !hasApplied && !hasDenied && !countdown.expired

  // Determine which tabs to show
  const visibleTabs = ALL_TABS.filter((tab) => {
    if (tab.key === "Positions") return positions.length > 0
    if (tab.key === "Rounds") return rounds.length > 0
    if (tab.key === "Apply") return canShowApply
    return true
  })

  const isDreamUpgrade = eligibility.data?.policy?.is_placed && eligibility.data?.policy?.upgrade

  const submitApplication = (payload: ApplyPayload) => {
    applyMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res.message || `Applied for ${res.job_title} at ${res.company_name}!`)
        navigate("/student/applications")
      },
      onError: (err) => {
        toast.error(err.message || "Failed to submit application")
      },
    })
  }

  const handleApply = (payload: ApplyPayload) => {
    // Show warning dialog if this is a dream upgrade application
    if (isDreamUpgrade) {
      setPendingApplyPayload(payload)
      setShowDreamWarning(true)
      return
    }
    submitApplication(payload)
  }

  const handleConfirmDreamApply = () => {
    setShowDreamWarning(false)
    if (pendingApplyPayload) {
      submitApplication(pendingApplyPayload)
      setPendingApplyPayload(null)
    }
  }

  const handleDeny = async (payload: { denial_reason: string; additional_comments?: string }) => {
    await denyMutation.mutateAsync(payload, {
      onSuccess: (res) => {
        toast.success(res.message || `Opted out of ${res.job_title}`)
      },
    })
  }

  // Status guidance
  const badge = student_status.application_status ? STATUS_BADGE[student_status.application_status] ?? STATUS_BADGE.pending : null

  return (
    <AnimatedPage className="max-w-6xl mx-auto space-y-6">
      {/* ───── Back + Share Bar ───── */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(globalThis.location.href)
            toast.success("Link copied to clipboard!")
          }}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
          aria-label="Share job link"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {/* ───── HERO CARD ───── */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Gradient header stripe */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        </div>

        <div className="px-6 pb-6 lg:px-8 lg:pb-8">
          {/* Avatar overlapping stripe */}
          <div className="flex items-end gap-4 -mt-10 relative z-10">
            {company.company_logo ? (
              <img
                src={company.company_logo}
                alt={company.company_name}
                className="h-20 w-20 rounded-2xl object-contain shrink-0 bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-lg"
                onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling?.classList.remove("hidden") }}
              />
            ) : null}
            <div className={`flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold shrink-0 border-4 border-white dark:border-gray-900 shadow-lg ${company.company_logo ? "hidden" : ""}`}>
              {company.company_name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Title + CTA row */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl leading-tight">
                {job.job_title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 dark:text-gray-400">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{company.company_name}</span>
                <TierBadge tierName={job.tier_name} tierLevel={job.tier_level} />
                {company.company_website && (
                  <a href={company.company_website} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 transition">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* CTA / Status badges */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {hasApplied && badge && (
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm ${badge.className}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {badge.label}
                </span>
              )}
              {canShowApply && eligibility.data?.eligibility.is_eligible && (
                <>
                  <button
                    onClick={() => setActiveTab("Apply")}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                  >
                    <Send className="h-4 w-4" /> Apply Now
                  </button>
                  <button
                    onClick={() => setActiveTab("Eligibility")}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Shield className="h-4 w-4" /> Check Eligibility
                  </button>
                  <button
                    onClick={() => setShowDenyModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Ban className="h-4 w-4" /> Not Interested
                  </button>
                </>
              )}
              {canShowApply && eligibility.data && !eligibility.data.eligibility.is_eligible && (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <XCircle className="h-3.5 w-3.5" /> Not Eligible
                  </span>
                  <button
                    onClick={() => setActiveTab("Eligibility")}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 text-sm font-semibold shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40"
                  >
                    <Shield className="h-4 w-4" /> Request Override
                  </button>
                  <button
                    onClick={() => setShowDenyModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Ban className="h-4 w-4" /> Not Interested
                  </button>
                </>
              )}
              {hasDenied && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <Ban className="h-3.5 w-3.5" /> Opted Out
                </span>
              )}
            </div>
          </div>

          {/* Info chips row */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { icon: MapPin, text: job.job_location || "Remote" },
              { icon: Briefcase, text: JOB_TYPE_LABELS[job.job_type] ?? "Both" },
              { icon: IndianRupee, text: job.salary_package ? `₹${job.salary_package} LPA` : "Not disclosed" },
              { icon: Users, text: `${job.total_applications} applied` },
              { icon: GraduationCap, text: `${positions.length} ${positions.length === 1 ? "position" : "positions"}` },
            ].map((chip) => (
              <span key={chip.text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700/50">
                <chip.icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                {chip.text}
              </span>
            ))}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${getCountdownClassName(countdown)}`}>
              <Clock className="h-3.5 w-3.5" />
              {countdown.text}
            </span>
          </div>
        </div>
      </div>

      {/* Denied banner */}
      {hasDenied && (
        <div className="flex items-center gap-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 p-5">
          <Ban className="h-5 w-5 text-gray-400 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-gray-600 dark:text-gray-300">
              You opted out of this job{student_status.denied_at && ` on ${formatDate(student_status.denied_at)}`}
            </p>
            {student_status.denial_reason && (
              <p className="mt-0.5 text-gray-500 dark:text-gray-400">Reason: {student_status.denial_reason}</p>
            )}
          </div>
        </div>
      )}

      {/* ───── TAB BAR (spring-animated) ───── */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-3 py-2">
        <LayoutGroup>
          <nav className="flex gap-1.5 overflow-x-auto scrollbar-hide" aria-label="Job details tabs">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  role="tab"
                  type="button"
                  id={`tab-${tab.key}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors rounded-xl ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {isActive && (
                    shouldReduceMotion ? (
                      <span className="absolute bottom-0 inset-x-2 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                    ) : (
                      <motion.span
                        layoutId="student-job-tab-indicator"
                        className="absolute bottom-0 inset-x-2 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )
                  )}
                </button>
              )
            })}
          </nav>
        </LayoutGroup>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} variants={shouldReduceMotion ? undefined : fadeInUp} initial="initial" animate="animate" exit="exit">
          {/* ─── Overview Tab ─── */}
          {activeTab === "Overview" && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Description (wide) */}
              <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">About this role</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                    {job.job_description}
                  </p>
                </div>
              </div>

              {/* Right: Key details stack (narrow) */}
              <OverviewSidebar job={job} eligibility_criteria={eligibility_criteria} student_status={student_status} onShowEligibility={() => setActiveTab("Eligibility")} onShowRounds={() => setActiveTab("Rounds")} />
            </div>
          )}

          {/* ─── Positions Tab ─── */}
          {activeTab === "Positions" && (
            <motion.div variants={shouldReduceMotion ? undefined : staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {positions.map((pos) => (
                <motion.div
                  key={pos.position_id}
                  variants={shouldReduceMotion ? undefined : staggerItem}
                  className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30">
                        <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {pos.position_name}
                        </h4>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {pos.vacancies} {pos.vacancies === 1 ? "vacancy" : "vacancies"}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Open
                    </span>
                  </div>
                  {pos.position_description && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {pos.position_description}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ─── Eligibility Tab ─── */}
          {activeTab === "Eligibility" && (
            <div className="space-y-4">
              <EligibilityTab
                eligibility={eligibility}
                jobId={jobId}
                countdown={countdown}
                setActiveTab={setActiveTab}
              />
            </div>
          )}

          {/* ─── Rounds Tab ─── */}
          {activeTab === "Rounds" && (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Header with progress */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Selection Process</h3>
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {rounds.length} {rounds.length === 1 ? "round" : "rounds"}
                  </span>
                </div>
                {rounds.length > 0 && (() => {
                  const completed = rounds.filter(r => r.round_status === "completed").length
                  const pct = Math.round((completed / rounds.length) * 100)
                  return (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        <span>{completed} of {rounds.length} completed</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="p-5">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-3 bottom-3 w-px bg-gray-200 dark:bg-gray-700" />

                <motion.div variants={shouldReduceMotion ? undefined : staggerContainer} initial="initial" animate="animate" className="space-y-6">
                  {[...rounds]
                    .sort((a, b) => a.round_number - b.round_number)
                    .map((round) => {
                      const sInfo = ROUND_STATUS_LABELS[round.round_status] ?? ROUND_STATUS_LABELS.pending
                      return (
                        <motion.div
                          key={round.round_id}
                          variants={shouldReduceMotion ? undefined : staggerItem}
                          className="relative flex gap-4 pl-1"
                        >
                          {/* Dot */}
                          <div
                            className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-xl shrink-0 text-sm font-bold ${getRoundDotClass(round.round_status)}`}
                          >
                            {round.round_number}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {round.round_name}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sInfo.className}`}>
                                {sInfo.label}
                              </span>
                            </div>
                            {round.round_description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {round.round_description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                {ROUND_TYPE_LABELS[round.round_type] ?? round.round_type.replaceAll("_", " ")}
                              </span>
                              {round.round_date && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(round.round_date)}
                                </span>
                              )}
                              {round.round_venue && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
                                  <MapPin className="h-3 w-3" />
                                  {round.round_venue}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </motion.div>
              </div>
              </div>
            </div>
          )}

          {/* ─── Apply Tab ─── */}
          {activeTab === "Apply" && canShowApply && (
            <div className="space-y-4">
              {/* Intro card */}
              <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-indigo-100 dark:border-indigo-800/30 p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <Send className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                    You&apos;re applying for {job.job_title}
                  </p>
                  <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 mt-0.5">
                    at {company.company_name} · {positions.length} {positions.length === 1 ? "position" : "positions"} available
                  </p>
                </div>
              </div>

              {/* Application form */}
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
                <JobApplicationForm
                  positions={positions}
                  questions={questions}
                  jobTitle={job.job_title}
                  companyName={company.company_name}
                  isSubmitting={applyMutation.isPending}
                  onSubmit={handleApply}
                  onCancel={() => setActiveTab("Overview")}
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Deny Modal */}
      <DenyJobModal
        isOpen={showDenyModal}
        onClose={() => setShowDenyModal(false)}
        jobTitle={job.job_title}
        companyName={company.company_name}
        onConfirm={handleDeny}
      />

      {/* Dream Upgrade Warning Dialog */}
      {showDreamWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Dream Upgrade
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You are currently placed at{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {eligibility.data?.policy?.current_placement?.company_name}
              </span>{" "}
              ({eligibility.data?.policy?.current_placement?.tier_name} tier).
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Applying for this <span className="font-medium text-gray-900 dark:text-gray-100">{eligibility.data?.policy?.target_job?.tier_name}</span> tier
              job is a dream upgrade. If you receive and accept an offer, your existing applications for same or lower tier
              companies may be <span className="font-semibold text-amber-600 dark:text-amber-400">automatically withdrawn</span>.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowDreamWarning(false); setPendingApplyPayload(null) }}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDreamApply}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/25"
              >
                Continue & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  )
}

// ─── Criteria comparison rows builder ────────────────────────────────────────

interface CriteriaRow {
  label: string
  required: string
  yours: string
  pass: boolean
}

function formatPercentOrNA(value: number | null, suffix = "%"): string {
  return value == null ? "N/A" : `${value}${suffix}`
}

function buildCriteriaRows(data: EligibilityResponse): CriteriaRow[] {
  const c = data.eligibility.criteria
  const s = data.student_snapshot
  if (!c) return []

  const rows: CriteriaRow[] = []

  const numericChecks: Array<{
    threshold: number | null
    label: string
    required: string
    value: number | null
    suffix?: string
    compareFn?: (v: number, t: number) => boolean
  }> = [
    { threshold: c.min_overall_cgpa, label: "Min CGPA", required: String(c.min_overall_cgpa ?? ""), value: s.overall_cgpa, suffix: "" },
    { threshold: c.max_live_kts, label: "Max Live KTs", required: String(c.max_live_kts ?? ""), value: s.total_live_kts, suffix: "", compareFn: (v, t) => v <= t },
    { threshold: c.min_tenth_percentage, label: "Min 10th %", required: `${c.min_tenth_percentage}%`, value: s.tenth_percentage },
  ]

  // Show only the relevant education criterion based on student's track
  if (s.twelfth_or_diploma === "Diploma") {
    numericChecks.push({ threshold: c.min_diploma_percentage, label: "Min Diploma %", required: `${c.min_diploma_percentage}%`, value: s.diploma_percentage })
  } else {
    numericChecks.push({ threshold: c.min_twelfth_percentage, label: "Min 12th %", required: `${c.min_twelfth_percentage}%`, value: s.twelfth_percentage })
  }

  for (const check of numericChecks) {
    if (check.threshold == null) continue
    const compare = check.compareFn ?? ((v: number, t: number) => v >= t)
    rows.push({
      label: check.label,
      required: check.required,
      yours: formatPercentOrNA(check.value, check.suffix ?? "%"),
      pass: check.value != null && compare(check.value, check.threshold),
    })
  }

  if (c.allowed_departments?.length) {
    rows.push({
      label: "Department",
      required: c.allowed_departments.join(", "),
      yours: s.dept_name,
      pass: c.allowed_departments.some(
        (d) => d.toLowerCase() === s.dept_name.toLowerCase(),
      ),
    })
  }
  if (c.allowed_genders?.length) {
    rows.push({
      label: "Gender",
      required: c.allowed_genders.join(", "),
      yours: s.gender,
      pass: c.allowed_genders.some(
        (g) => g.toLowerCase() === s.gender.toLowerCase(),
      ),
    })
  }
  if (c.allowed_gap_statuses?.length) {
    const gapLabels: Record<string, string> = { gap: "Gap", no_gap: "No Gap" }
    rows.push({
      label: "Gap Status",
      required: c.allowed_gap_statuses.map((g) => gapLabels[g] ?? g).join(", "),
      yours: gapLabels[s.gap_status] ?? s.gap_status,
      pass: c.allowed_gap_statuses.includes(s.gap_status),
    })
  }

  return rows
}
