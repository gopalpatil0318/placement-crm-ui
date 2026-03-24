import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
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
import type { ApplyPayload } from "@/services/student/jobBrowsing.service"

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
  })
}

const TABS = ["Overview", "Positions", "Eligibility", "Rounds", "Apply"] as const
type Tab = (typeof TABS)[number]

const statusBadgeClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  under_review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shortlisted: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  selected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  offered: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  withdrawn: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
}

// ─── Skeletons ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6 motion-safe:animate-pulse">
      <div className="h-6 w-32 rounded bg-gray-100 dark:bg-gray-800" />
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex gap-4">
          <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-64 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useJobDetail(jobId)
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [showDenyModal, setShowDenyModal] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const eligibility = useJobEligibility(jobId, true)
  const applyMutation = useApplyJob(jobId ?? "")
  const denyMutation = useDenyJob(jobId ?? "")

  if (isLoading) {
    return (
      <AnimatedPage className="max-w-4xl mx-auto">
        <DetailSkeleton />
      </AnimatedPage>
    )
  }

  if (isError || !data) {
    return (
      <AnimatedPage>
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 text-center">
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
  const visibleTabs = TABS.filter((tab) => {
    if (tab === "Positions") return positions.length > 0
    if (tab === "Rounds") return rounds.length > 0
    if (tab === "Apply") return canShowApply
    return true
  })

  const handleCheckEligibility = () => {
    setActiveTab("Eligibility")
  }

  const handleApply = (payload: ApplyPayload) => {
    applyMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(`Applied for ${res.job_title} at ${res.company_name}!`)
        navigate("/student/applications")
      },
      onError: (err) => {
        toast.error(err.message || "Failed to submit application")
      },
    })
  }

  const handleDeny = async (payload: { denial_reason: string; additional_comments?: string }) => {
    await denyMutation.mutateAsync(payload, {
      onSuccess: (res) => {
        toast.success(`Opted out of ${res.job_title}`)
      },
    })
  }

  return (
    <AnimatedPage className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      {/* Back + Share */}
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
            navigator.clipboard.writeText(window.location.href)
            toast.success("Link copied to clipboard!")
          }}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Gradient header stripe */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-6 space-y-5">
          {/* Title row */}
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold shrink-0">
              {company.company_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl">
                {job.job_title}
              </h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Building2 className="h-4 w-4 shrink-0" />
                <span>{company.company_name}</span>
                {company.company_website && (
                  <a
                    href={company.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Deadline badge */}
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                countdown.expired
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  : countdown.urgent
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {countdown.text}
            </span>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-3.5 w-3.5" />
              {job.job_location || "Remote"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
              <Briefcase className="h-3.5 w-3.5" />
              {job.job_type === "full-time" ? "Full-time" : job.job_type === "internship" ? "Internship" : "Both"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
              <IndianRupee className="h-3.5 w-3.5" />
              {job.salary_package || "Not disclosed"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-3.5 w-3.5" />
              {job.total_applications} applicants
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              Posted {formatDate(job.posted_at)}
            </span>
          </div>

          {/* Student status banner */}
          {hasApplied && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  You applied on {formatDate(student_status.applied_at!)}
                </p>
                {student_status.application_status && (
                  <span
                    className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusBadgeClass[student_status.application_status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {student_status.application_status.replace("_", " ")}
                  </span>
                )}
              </div>
              {student_status.application_id && (
                <Link
                  to={`/student/applications/${student_status.application_id}`}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View Application <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}

          {hasDenied && (
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
              <Ban className="h-5 w-5 text-gray-400 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-gray-600 dark:text-gray-300">
                  You opted out of this job
                  {student_status.denied_at && ` on ${formatDate(student_status.denied_at)}`}
                </p>
                {student_status.denial_reason && (
                  <p className="mt-0.5 text-gray-500 dark:text-gray-400">
                    Reason: {student_status.denial_reason}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex gap-1 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} variants={shouldReduceMotion ? undefined : fadeInUp} initial="initial" animate="animate" exit="exit">
          {/* ─── Overview Tab ─── */}
          {activeTab === "Overview" && (
            <div className="space-y-6">
              {/* Description */}
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">About this role</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {job.job_description}
                </p>
              </div>

              {/* Key details grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {job.bond_duration && (
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      Bond Period
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.bond_duration}</p>
                    {job.bond_details && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{job.bond_details}</p>
                    )}
                  </div>
                )}
                {job.internship_duration && (
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Internship Duration
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.internship_duration}</p>
                    {job.internship_stipend && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Stipend: ₹{job.internship_stipend.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                )}

                {/* Eligibility preview */}
                {eligibility_criteria && (
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 sm:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        <Shield className="h-4 w-4 text-indigo-500" />
                        Eligibility Requirements
                      </div>
                      {!hasApplied && !hasDenied && (
                        <button
                          onClick={handleCheckEligibility}
                          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Check My Eligibility
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      {eligibility_criteria.min_overall_cgpa != null && (
                        <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <span className="text-gray-500 dark:text-gray-400">Min CGPA</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {eligibility_criteria.min_overall_cgpa}
                          </span>
                        </div>
                      )}
                      {eligibility_criteria.max_live_kts != null && (
                        <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <span className="text-gray-500 dark:text-gray-400">Max Live KTs</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {eligibility_criteria.max_live_kts}
                          </span>
                        </div>
                      )}
                      {eligibility_criteria.min_tenth_percentage != null && (
                        <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <span className="text-gray-500 dark:text-gray-400">Min 10th %</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {eligibility_criteria.min_tenth_percentage}%
                          </span>
                        </div>
                      )}
                      {eligibility_criteria.min_twelfth_percentage != null && (
                        <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <span className="text-gray-500 dark:text-gray-400">Min 12th %</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {eligibility_criteria.min_twelfth_percentage}%
                          </span>
                        </div>
                      )}
                      {eligibility_criteria.min_diploma_percentage != null && (
                        <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <span className="text-gray-500 dark:text-gray-400">Min Diploma %</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {eligibility_criteria.min_diploma_percentage}%
                          </span>
                        </div>
                      )}
                      {eligibility_criteria.allowed_departments && (
                        <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 sm:col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Departments</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-right">
                            {eligibility_criteria.allowed_departments.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick actions (if applicable) */}
              {canShowApply && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab("Apply")}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-medium transition"
                  >
                    <Send className="h-4 w-4" />
                    Apply Now
                  </button>
                  <button
                    onClick={handleCheckEligibility}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Shield className="h-4 w-4" />
                    Check Eligibility
                  </button>
                  <button
                    onClick={() => setShowDenyModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Ban className="h-4 w-4" />
                    Not Interested
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── Positions Tab ─── */}
          {activeTab === "Positions" && (
            <motion.div variants={shouldReduceMotion ? undefined : staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2">
              {positions.map((pos) => (
                <motion.div
                  key={pos.position_id}
                  variants={shouldReduceMotion ? undefined : staggerItem}
                  className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
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
              {eligibility.isLoading ? (
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 motion-safe:animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              ) : !eligibility.data ? (
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
              ) : (
                <>
                  {/* Status banner */}
                  <div
                    className={`flex items-center gap-3 rounded-xl p-4 ${
                      eligibility.data.can_apply
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50"
                        : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50"
                    }`}
                  >
                    {eligibility.data.can_apply ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <p
                      className={`text-sm font-medium ${
                        eligibility.data.can_apply
                          ? "text-emerald-800 dark:text-emerald-300"
                          : "text-red-800 dark:text-red-300"
                      }`}
                    >
                      {eligibility.data.can_apply
                        ? "You are eligible to apply for this job!"
                        : "You are not eligible to apply for this job."}
                    </p>
                  </div>

                  {/* Blockers */}
                  {eligibility.data.blockers.length > 0 && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Blockers
                      </h4>
                      {eligibility.data.blockers.map((b, i) => (
                        <p key={i} className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5 shrink-0" /> {b}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Criteria comparison table */}
                  {eligibility.data.eligibility.criteria && (
                    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
                      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Eligibility Comparison
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {buildCriteriaRows(eligibility.data).map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between px-5 py-3 text-sm"
                          >
                            <span className="text-gray-500 dark:text-gray-400 flex-1">
                              {row.label}
                            </span>
                            <span className="text-gray-600 dark:text-gray-300 flex-1 text-center">
                              {row.required}
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 flex-1 text-center font-medium">
                              {row.yours}
                            </span>
                            <span className="flex-shrink-0 ml-2">
                              {row.pass ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  {eligibility.data.eligibility.issues.length > 0 && (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        Issues
                      </h4>
                      {eligibility.data.eligibility.issues.map((issue, i) => (
                        <p key={i} className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                          <CircleDot className="h-3.5 w-3.5 shrink-0" /> {issue}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Override Request Section — shows when ineligible */}
                  <OverrideRequestSection
                    jobId={jobId!}
                    isIneligible={!eligibility.data.can_apply}
                    onSwitchToApplyTab={() => setActiveTab("Apply")}
                    deadlineExpired={countdown.expired}
                  />
                </>
              )}
            </div>
          )}

          {/* ─── Rounds Tab ─── */}
          {activeTab === "Rounds" && (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">Selection Process</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-3 bottom-3 w-px bg-gray-200 dark:bg-gray-700" />

                <motion.div variants={shouldReduceMotion ? undefined : staggerContainer} initial="initial" animate="animate" className="space-y-6">
                  {rounds
                    .sort((a, b) => a.round_number - b.round_number)
                    .map((round) => {
                      const isScheduled = round.round_status === "scheduled"
                      const isCompleted = round.round_status === "completed"
                      return (
                        <motion.div
                          key={round.round_id}
                          variants={shouldReduceMotion ? undefined : staggerItem}
                          className="relative flex gap-4 pl-1"
                        >
                          {/* Dot */}
                          <div
                            className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-xl shrink-0 text-sm font-bold ${
                              isCompleted
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                : isScheduled
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {round.round_number}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {round.round_name}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  isCompleted
                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : isScheduled
                                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                              >
                                {round.round_status}
                              </span>
                            </div>
                            {round.round_description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {round.round_description}
                              </p>
                            )}
                            <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500">
                              <span className="capitalize">{round.round_type.replace("_", " ")}</span>
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
                        </motion.div>
                      )
                    })}
                </motion.div>
              </div>
            </div>
          )}

          {/* ─── Apply Tab ─── */}
          {activeTab === "Apply" && canShowApply && (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Apply for {job.job_title}
                </h3>
              </div>
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
    </AnimatedPage>
  )
}

// ─── Criteria comparison rows builder ────────────────────────────────────────

import type { EligibilityResponse } from "@/services/student/jobBrowsing.service"

interface CriteriaRow {
  label: string
  required: string
  yours: string
  pass: boolean
}

function buildCriteriaRows(data: EligibilityResponse): CriteriaRow[] {
  const c = data.eligibility.criteria
  const s = data.student_snapshot
  if (!c) return []

  const rows: CriteriaRow[] = []

  if (c.min_overall_cgpa != null) {
    rows.push({
      label: "Min CGPA",
      required: String(c.min_overall_cgpa),
      yours: s.overall_cgpa != null ? String(s.overall_cgpa) : "N/A",
      pass: s.overall_cgpa != null && s.overall_cgpa >= c.min_overall_cgpa,
    })
  }
  if (c.max_live_kts != null) {
    rows.push({
      label: "Max Live KTs",
      required: String(c.max_live_kts),
      yours: String(s.total_live_kts),
      pass: s.total_live_kts <= c.max_live_kts,
    })
  }
  if (c.min_tenth_percentage != null) {
    rows.push({
      label: "Min 10th %",
      required: `${c.min_tenth_percentage}%`,
      yours: s.tenth_percentage != null ? `${s.tenth_percentage}%` : "N/A",
      pass: s.tenth_percentage != null && s.tenth_percentage >= c.min_tenth_percentage,
    })
  }
  if (c.min_twelfth_percentage != null) {
    rows.push({
      label: "Min 12th %",
      required: `${c.min_twelfth_percentage}%`,
      yours: s.twelfth_percentage != null ? `${s.twelfth_percentage}%` : "N/A",
      pass: s.twelfth_percentage != null && s.twelfth_percentage >= c.min_twelfth_percentage,
    })
  }
  if (c.min_diploma_percentage != null) {
    rows.push({
      label: "Min Diploma %",
      required: `${c.min_diploma_percentage}%`,
      yours: s.diploma_percentage != null ? `${s.diploma_percentage}%` : "N/A",
      pass: s.diploma_percentage != null && s.diploma_percentage >= c.min_diploma_percentage,
    })
  }
  if (c.allowed_departments) {
    rows.push({
      label: "Department",
      required: c.allowed_departments.join(", "),
      yours: s.dept_name,
      pass: c.allowed_departments.some(
        (d) => d.toLowerCase() === s.dept_name.toLowerCase(),
      ),
    })
  }
  if (c.allowed_genders) {
    rows.push({
      label: "Gender",
      required: c.allowed_genders.join(", "),
      yours: s.gender,
      pass: c.allowed_genders.some(
        (g) => g.toLowerCase() === s.gender.toLowerCase(),
      ),
    })
  }

  return rows
}
