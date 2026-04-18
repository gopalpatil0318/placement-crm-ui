import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { LayoutGroup, motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  FileText,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
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
  type LucideIcon,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { useMyApplications } from "@/hooks/student/applications/useMyApplications"
import type { ApplicationsListFilters, StatusSummary, ApplicationListItem } from "@/services/student/jobBrowsing.service"

// ─── Status Config ──────────────────────────────────────────────────────────────

interface StatusCfg {
  label: string
  className: string
  icon: LucideIcon
  dotColor: string
  whatsNext: string
}

const STATUS_CONFIG: Record<string, StatusCfg> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Hourglass,
    dotColor: "bg-amber-500",
    whatsNext: "Awaiting review",
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Eye,
    dotColor: "bg-blue-500",
    whatsNext: "Being evaluated",
  },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    icon: CheckCircle2,
    dotColor: "bg-teal-500",
    whatsNext: "Prepare for rounds",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
    dotColor: "bg-red-500",
    whatsNext: "Not selected",
  },
  selected: {
    label: "Selected",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: Trophy,
    dotColor: "bg-emerald-500",
    whatsNext: "Offer coming soon",
  },
  offered: {
    label: "Offered",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Star,
    dotColor: "bg-purple-500",
    whatsNext: "Accept your offer!",
  },
  waitlisted: {
    label: "Waitlisted",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: ClipboardList,
    dotColor: "bg-orange-500",
    whatsNext: "Auto-promoted when slot opens",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    icon: Ban,
    dotColor: "bg-gray-400",
    whatsNext: "Application withdrawn",
  },
  auto_withdrawn: {
    label: "Auto-Withdrawn",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    icon: Ban,
    dotColor: "bg-gray-400",
    whatsNext: "Auto-withdrawn by system",
  },
}

const TAB_KEYS = [
  "",
  "pending",
  "under_review",
  "shortlisted",
  "selected",
  "offered",
  "waitlisted",
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
  waitlisted: "Waitlisted",
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

// ─── Company avatar gradient by first letter ────────────────────────────────────

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
]

function avatarGradient(name: string): string {
  const idx = (name.codePointAt(0) ?? 0) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[idx]
}

// ─── Skeletons ──────────────────────────────────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 motion-safe:animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-8 w-14 rounded-lg bg-gray-100 dark:bg-gray-800 mb-1" />
      <div className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800" />
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
        <div className="h-6 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
        <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
        <div className="h-6 w-28 rounded-full bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-2 w-36 rounded-full bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

// ─── Summary Cards Config ───────────────────────────────────────────────────────

const SUMMARY_CARDS = [
  { key: "total", label: "Total Applications", icon: FileText, gradient: "from-indigo-500 to-blue-600", tint: "bg-indigo-50 dark:bg-indigo-950/20" },
  { key: "pending", label: "Pending", icon: Hourglass, gradient: "from-amber-500 to-orange-600", tint: "bg-amber-50 dark:bg-amber-950/20" },
  { key: "shortlisted", label: "Shortlisted", icon: CheckCircle2, gradient: "from-teal-500 to-cyan-600", tint: "bg-teal-50 dark:bg-teal-950/20" },
  { key: "selected", label: "Selected", icon: Trophy, gradient: "from-emerald-500 to-green-600", tint: "bg-emerald-50 dark:bg-emerald-950/20" },
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

  const { applications, statusSummary, pagination, isLoading, isFetching, isError, error } =
    useMyApplications(filters)

  const handleTabChange = (key: string) => {
    setStatusFilter(key)
    setPage(1)
  }

  // Pagination computed
  const showFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const showTo = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <AnimatedPage className="space-y-6 max-w-6xl mx-auto">
      {/* ───── Header ───── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">My Applications</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track and manage all your job applications
        </p>
      </div>

      {/* ───── Summary Bento (4 gradient cards) ───── */}
      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SummaryCardSkeleton key={`summary-skeleton-${String(i)}`} />
          ))}
        </div>
      )}

      {!isLoading && statusSummary && (
        <motion.div
          variants={shouldReduceMotion ? undefined : staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {SUMMARY_CARDS.map((card) => {
            const count = statusSummary[card.key as keyof StatusSummary] ?? 0
            const Icon = card.icon
            return (
              <motion.div
                key={card.key}
                variants={shouldReduceMotion ? undefined : staggerItem}
                className={`rounded-2xl border border-gray-100 dark:border-gray-800 p-5 ${card.tint} hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-200 cursor-default`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tabular-nums">
                  {count}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* ───── Tab Bar (LayoutGroup animated) + Sort ───── */}
      <div className="space-y-3">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-3 py-2">
          <LayoutGroup>
            <nav className="flex gap-1 overflow-x-auto scrollbar-hide" aria-label="Filter by status">
              {TAB_KEYS.map((key) => {
                const count = getTabCount(statusSummary, key)
                const isActive = statusFilter === key
                return (
                  <button
                    key={key}
                    onClick={() => handleTabChange(key)}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors rounded-xl ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    {TAB_LABELS[key]}
                    {count > 0 && (
                      <span className={`inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-bold ${
                        isActive
                          ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}>
                        {count}
                      </span>
                    )}
                    {isActive && (
                      shouldReduceMotion ? (
                        <span className="absolute bottom-0 inset-x-2 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                      ) : (
                        <motion.span
                          layoutId="my-apps-tab-indicator"
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

        {/* Sort controls */}
        <div className="flex items-center gap-2 self-end justify-end">
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

      {/* ───── Application Cards ───── */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AppCardSkeleton key={`app-skeleton-${String(i)}`} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Failed to load applications</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {error instanceof Error ? error.message : "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {!isLoading && !isError && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-5">
            <Briefcase className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {statusFilter ? "No applications match this filter" : "No applications yet"}
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {statusFilter
              ? `You don't have any ${TAB_LABELS[statusFilter]?.toLowerCase()} applications. Try a different filter or browse new jobs.`
              : "Start exploring jobs and submit your first application to see them here!"}
          </p>
          <Link
            to="/student/jobs"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-medium transition shadow-lg shadow-indigo-500/25"
          >
            <Briefcase className="h-4 w-4" />
            Browse Jobs \u2192
          </Link>
        </div>
      )}

      {!isLoading && !isError && applications.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${statusFilter}-${sortBy}-${sortOrder}-${page}`}
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial="initial"
            animate="animate"
            className={`space-y-3 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}
          >
            {applications.map((app) => (
              <motion.div key={app.application_id} variants={shouldReduceMotion ? undefined : staggerItem}>
                <ApplicationCard app={app} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ───── Pagination ───── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{showFrom}–{showTo}</span> of{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-300">{pagination.total}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2.5 min-w-[44px] min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 px-4 py-2.5 min-w-[44px] min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
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

// ─── Application Card (extracted sub-component) ─────────────────────────────────

function ApplicationCard({ app }: Readonly<{ app: ApplicationListItem }>) {
  const config = STATUS_CONFIG[app.application_status] ?? STATUS_CONFIG.pending
  const StatusIcon = config.icon

  const minWidth = app.rounds_passed > 0 ? 8 : 0
  const roundProgress = app.total_rounds > 0
    ? Math.max((app.rounds_passed / app.total_rounds) * 100, minWidth)
    : 0

  return (
    <Link
      to={`/student/applications/${app.application_id}`}
      className="group block rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Company avatar */}
        {app.company_logo ? (
          <img
            src={app.company_logo}
            alt={app.company_name}
            className="h-12 w-12 rounded-xl object-contain shrink-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm"
          />
        ) : (
          <div className={`flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${avatarGradient(app.company_name)} text-white text-base font-bold shrink-0 shadow-sm`}>
            {app.company_name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {app.job_title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                {app.company_name}
                {app.position_name && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    {app.position_name}
                  </>
                )}
              </p>
            </div>

            {/* Status badge + what's next micro-text */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}
                aria-label={`Status: ${config.label}`}
              >
                <StatusIcon className="h-3 w-3" />
                {app.application_status === "waitlisted" && app.waitlist_rank
                  ? `Waitlisted (#${app.waitlist_rank})`
                  : config.label}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {config.whatsNext}
              </span>
            </div>
          </div>

          {/* Info chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              {app.job_location || "Remote"}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
              <IndianRupee className="h-3 w-3" />
              {app.salary_package || "Not disclosed"}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
              <Briefcase className="h-3 w-3" />
              {JOB_TYPE_LABELS[app.job_type] ?? app.job_type}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              Applied {formatDate(app.applied_at)}
            </span>
          </div>

          {/* Round progress pill with gradient fill */}
          {app.total_rounds > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 max-w-52">
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${roundProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Round {app.rounds_passed}/{app.total_rounds}
              </span>
              {app.current_round_name && (
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  Next: {app.current_round_name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-1.5 hidden sm:block" />
      </div>

      {/* Footer: timeAgo + eligibility flag */}
      <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>Updated {timeAgo(app.last_updated_at)}</span>
        {!app.is_eligible && app.eligibility_remarks && (
          <span className="flex items-center gap-1 text-amber-500 font-medium">
            <AlertCircle className="h-3 w-3" />
            Eligibility flagged
          </span>
        )}
      </div>
    </Link>
  )
}
