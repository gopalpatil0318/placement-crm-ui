import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  FileText,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightSmall,
  ArrowUpDown,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Trophy,
  Hourglass,
  Ban,
  Star,
  ClipboardList,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { useMyApplications } from "@/hooks/student/applications/useMyApplications"
import type { ApplicationsListFilters, StatusSummary } from "@/services/student/jobBrowsing.service"

// ─── Status Config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType; dotColor: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Hourglass,
    dotColor: "bg-amber-500",
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Eye,
    dotColor: "bg-blue-500",
  },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    icon: CheckCircle2,
    dotColor: "bg-teal-500",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
    dotColor: "bg-red-500",
  },
  selected: {
    label: "Selected",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: Trophy,
    dotColor: "bg-emerald-500",
  },
  offered: {
    label: "Offered",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Star,
    dotColor: "bg-purple-500",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    icon: Ban,
    dotColor: "bg-gray-400",
  },
}

const TAB_KEYS = [
  "",
  "pending",
  "under_review",
  "shortlisted",
  "selected",
  "offered",
  "rejected",
  "withdrawn",
] as const

const TAB_LABELS: Record<string, string> = {
  "": "All",
  pending: "Pending",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  selected: "Selected",
  offered: "Offered",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

const SORT_OPTIONS = [
  { value: "last_updated_at", label: "Last Updated" },
  { value: "applied_at", label: "Applied Date" },
  { value: "application_status", label: "Status" },
  { value: "job_title", label: "Job Title" },
]

function getTabCount(summary: StatusSummary | null, key: string): number {
  if (!summary) return 0
  if (key === "") return summary.total
  return summary[key as keyof StatusSummary] ?? 0
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}

// ─── Skeletons ──────────────────────────────────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 motion-safe:animate-pulse">
      <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800 mb-2" />
      <div className="h-7 w-10 rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

function AppCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 motion-safe:animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="h-11 w-11 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
        <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

// ─── Summary Cards ──────────────────────────────────────────────────────────────

const SUMMARY_CARDS = [
  { key: "total", label: "Total", icon: FileText, gradient: "from-indigo-500 to-blue-600" },
  { key: "pending", label: "Pending", icon: Hourglass, gradient: "from-amber-500 to-orange-600" },
  { key: "shortlisted", label: "Shortlisted", icon: CheckCircle2, gradient: "from-teal-500 to-cyan-600" },
  { key: "selected", label: "Selected", icon: Trophy, gradient: "from-emerald-500 to-green-600" },
] as const

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  internship: "Internship",
  both: "Both",
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function MyApplications() {
  const shouldReduceMotion = useReducedMotion()
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState("last_updated_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)

  const limit = 10

  const filters = useMemo<ApplicationsListFilters>(() => ({
    ...(statusFilter && { application_status: statusFilter }),
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit,
  }), [statusFilter, sortBy, sortOrder, page])

  const { applications, statusSummary, pagination, isLoading, isFetching } =
    useMyApplications(filters)

  const handleTabChange = (key: string) => {
    setStatusFilter(key)
    setPage(1)
  }

  return (
    <AnimatedPage className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">My Applications</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track and manage all your job applications
        </p>
      </div>

      {/* Summary Row */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SummaryCardSkeleton key={`summary-skeleton-${String(i)}`} />
          ))}
        </div>
      ) : (
        statusSummary && (
          <motion.div
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {SUMMARY_CARDS.map((card) => {
              const count = statusSummary[card.key as keyof StatusSummary] ?? 0
              const Icon = card.icon
              return (
                <motion.div
                  key={card.key}
                  variants={shouldReduceMotion ? undefined : staggerItem}
                  className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br ${card.gradient} text-white`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
                </motion.div>
              )
            })}
          </motion.div>
        )
      )}

      {/* Status Tabs + Sort */}
      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TAB_KEYS.map((key) => {
            const count = getTabCount(statusSummary, key)
            const isActive = statusFilter === key
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                {TAB_LABELS[key]}
                {count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-xs font-semibold ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2 self-end">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            aria-label="Sort applications by"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
              setPage(1)
            }}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
            aria-label={`Sort order: ${sortOrder === "asc" ? "ascending" : "descending"}`}
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Application Cards */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AppCardSkeleton key={`app-skeleton-${String(i)}`} />
          ))}
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {statusFilter ? "No applications found" : "No applications yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {statusFilter
              ? `You don't have any ${TAB_LABELS[statusFilter]?.toLowerCase()} applications.`
              : "Start exploring jobs and submit your first application!"}
          </p>
          {!statusFilter && (
            <Link
              to="/student/jobs"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-medium transition"
            >
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </Link>
          )}
        </div>
      )}

      {!isLoading && applications.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={statusFilter + sortBy + sortOrder}
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial="initial"
            animate="animate"
            className={`space-y-3 ${isFetching ? "opacity-70" : ""}`}
          >
            {applications.map((app) => {
              const config = STATUS_CONFIG[app.application_status] ?? STATUS_CONFIG.pending
              const StatusIcon = config.icon
              return (
                <motion.div key={app.application_id} variants={shouldReduceMotion ? undefined : staggerItem}>
                  <Link
                    to={`/student/applications/${app.application_id}`}
                    className="group block rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Company avatar */}
                      <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shrink-0">
                        {app.company_name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {app.job_title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3.5 w-3.5 shrink-0" />
                              {app.company_name}
                              {app.position_name && (
                                <>
                                  <span className="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
                                  {app.position_name}
                                </>
                              )}
                            </p>
                          </div>

                          {/* Status badge */}
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
                            aria-label={`Application status: ${config.label}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </span>
                        </div>

                        {/* Meta row */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.job_location || "Remote"}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {app.salary_package || "Not disclosed"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {JOB_TYPE_LABELS[app.job_type] ?? app.job_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Applied {formatDate(app.applied_at)}
                          </span>
                        </div>

                        {/* Round progress */}
                        {app.total_rounds > 0 && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 max-w-48">
                              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                  style={{
                                    width: `${Math.max(
                                      (app.rounds_passed / app.total_rounds) * 100,
                                      app.rounds_passed > 0 ? 8 : 0,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              Round {app.rounds_passed}/{app.total_rounds}
                            </span>
                            {app.current_round_name && (
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium whitespace-nowrap">
                                Next: {app.current_round_name}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRightSmall className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-1 hidden sm:block" />
                    </div>

                    {/* Last updated */}
                    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>Updated {timeAgo(app.last_updated_at)}</span>
                      {!app.is_eligible && app.eligibility_remarks && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <AlertCircle className="h-3 w-3" />
                          Eligibility flagged
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 min-w-[44px] min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 px-3 py-2 min-w-[44px] min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </AnimatedPage>
  )
}
