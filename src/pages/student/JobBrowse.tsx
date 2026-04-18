import { useState, useCallback, useRef, useEffect, useMemo, memo, type SyntheticEvent } from "react"
import { Link } from "react-router-dom"
import TierBadge from "@/components/collegeadmin/TierBadge"
import { motion, useReducedMotion } from "framer-motion"
import {
  Search,
  Briefcase,
  MapPin,
  Building2,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  X,
  ArrowUpDown,
  Ban,
  CheckCircle2,
  IndianRupee,
  GraduationCap,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { useJobList } from "@/hooks/student/jobs/useJobList"
import type { JobListFilters, JobListItem } from "@/services/student/jobBrowsing.service"
import { DRIVE_TYPE_OPTIONS, DRIVE_TYPE_LABELS } from "@/validators/JobPostingSchema"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getCountdown(deadline: string): { text: string; urgent: boolean; expired: boolean } {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return { text: "Expired", urgent: true, expired: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 7) return { text: `${days}d left`, urgent: false, expired: false }
  if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days <= 3, expired: false }
  return { text: `${hours}h left`, urgent: true, expired: false }
}

function formatSalary(pkg: string, min: number, max: number, jobType: string): string {
  if (jobType === "internship") {
    if (min && max) return `Stipend: ₹${(min / 1000).toFixed(0)}k–₹${(max / 1000).toFixed(0)}k/mo`
    if (pkg) return `Stipend: ${pkg}`
    return "Stipend TBD"
  }
  if (min && max) {
    const fmtMin = min >= 100000 ? `₹${(min / 100000).toFixed(1)}` : `₹${min.toLocaleString("en-IN")}`
    const fmtMax = max >= 100000 ? `${(max / 100000).toFixed(1)} LPA` : `₹${max.toLocaleString("en-IN")}`
    return `${fmtMin}–${fmtMax}`
  }
  if (pkg) return pkg
  return "Not disclosed"
}

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  internship: "Internship",
  both: "Both",
}

function getCountdownClassName(countdown: { urgent: boolean; expired: boolean }): string {
  if (countdown.expired) return "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
  if (countdown.urgent) return "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800/50"
  return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
}

const JOB_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "full-time", label: "Full-time" },
  { value: "internship", label: "Internship" },
  { value: "both", label: "Both" },
]

const DRIVE_TYPE_FILTER_OPTIONS = [
  { value: "", label: "All Drives" },
  ...DRIVE_TYPE_OPTIONS.map((t) => ({ value: t, label: DRIVE_TYPE_LABELS[t] })),
]

const DRIVE_TYPE_BADGE: Record<string, string> = {
  off_campus: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pool_campus: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
}

const SORT_OPTIONS = [
  { value: "application_deadline", label: "Deadline" },
  { value: "created_at", label: "Newest" },
  { value: "salary_min", label: "Salary" },
  { value: "job_title", label: "Title" },
  { value: "company_name", label: "Company" },
]

interface StatusBadgeCfg { className: string; label: string; icon: LucideIcon }

const statusBadge: Record<string, StatusBadgeCfg> = {
  pending:      { className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Applied · Pending", icon: Clock },
  under_review: { className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Under Review", icon: Clock },
  shortlisted:  { className: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400", label: "Shortlisted", icon: CheckCircle2 },
  rejected:     { className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Rejected", icon: AlertCircle },
  selected:     { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Selected", icon: CheckCircle2 },
  offered:      { className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", label: "Offered", icon: CheckCircle2 },
  waitlisted:   { className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "Waitlisted", icon: Clock },
  withdrawn:    { className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400", label: "Withdrawn", icon: Ban },
  auto_withdrawn: { className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400", label: "Auto-Withdrawn", icon: Ban },
}

// Company avatar gradient rotation
const AVATAR_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
]
function avatarGradient(name: string): string {
  return AVATAR_GRADIENTS[(name.codePointAt(0) ?? 0) % AVATAR_GRADIENTS.length]
}

// ─── Skeletons ──────────────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 motion-safe:animate-pulse space-y-4">
      <div className="flex items-start gap-3.5">
        <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="h-7 w-20 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-7 w-28 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-7 w-16 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

// ─── Job Card ───────────────────────────────────────────────────────────────────

const JobCard = memo(function JobCard({
  job,
  shouldReduceMotion,
}: Readonly<{
  job: JobListItem
  shouldReduceMotion: boolean | null
}>) {
  const countdown = getCountdown(job.application_deadline)
  const salary = formatSalary(job.salary_package, job.salary_min, job.salary_max, job.job_type)
  const badge = job.has_applied && job.application_status ? statusBadge[job.application_status] : null
  const BadgeIcon = badge?.icon

  return (
    <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
      <Link
        to={`/student/jobs/${job.job_id}`}
        className="group flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl hover:shadow-indigo-500/8 hover:scale-[1.01] transition-all duration-200 h-full"
      >
        {/* ── Top: Avatar + Title/Company ── */}
        <div className="flex items-start gap-3.5">
          {job.company_logo ? (
            <img
              src={job.company_logo}
              alt={job.company_name}
              className="h-12 w-12 rounded-xl object-contain shrink-0 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              onError={(e: SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling?.classList.remove("hidden")
              }}
            />
          ) : null}
          <div className={`flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${avatarGradient(job.company_name)} text-white text-base font-bold shrink-0 shadow-sm ${job.company_logo ? "hidden" : ""}`}>
            {job.company_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
              {job.job_title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {job.company_name}
              <TierBadge tierName={job.tier_name} tierLevel={job.tier_level} />
            </p>
          </div>
        </div>

        {/* ── Info Chips ── */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-600 dark:text-gray-400">
            <MapPin className="h-3 w-3" />
            {job.job_location || "Remote"}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-600 dark:text-gray-400">
            <IndianRupee className="h-3 w-3" />
            {salary}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-600 dark:text-gray-400">
            <Briefcase className="h-3 w-3" />
            {JOB_TYPE_LABELS[job.job_type] ?? "Both"}
          </span>
          {job.drive_type && job.drive_type !== "on_campus" && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${DRIVE_TYPE_BADGE[job.drive_type] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
              {DRIVE_TYPE_LABELS[job.drive_type] || job.drive_type}
            </span>
          )}
        </div>

        {/* ── Stats row + Prominent Deadline ── */}
        <div className="mt-auto pt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {job.total_applications} applied
            </span>
            {job.position_count > 0 && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {job.position_count} {job.position_count === 1 ? "position" : "positions"}
              </span>
            )}
          </div>

          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getCountdownClassName(countdown)}`}>
            <Clock className="h-3 w-3" />
            {countdown.text}
          </span>
        </div>

        {/* ── Status overlay / action hint ── */}
        {(badge || (!job.is_eligible && !job.has_applied) || job.has_denied) ? (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {badge && BadgeIcon && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                  <BadgeIcon className="h-3 w-3" />
                  {badge.label}
                </span>
              )}
              {!job.is_eligible && !job.has_applied && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  Not Eligible
                </span>
              )}
              {job.has_denied && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <Ban className="h-3 w-3" />
                  Opted Out
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              View Details <ChevronRightIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
              View Details <ChevronRightIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  )
})

// ─── Subtitle helper (avoids nested ternary in JSX) ─────────────────────────────

function SubtitleText({ total, isLoading }: Readonly<{ total: number; isLoading: boolean }>) {
  if (total > 0) return <>{total} {total === 1 ? "job" : "jobs"} available</>
  if (isLoading) return <>Loading jobs&hellip;</>
  return <>No jobs found</>
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function JobBrowse() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [jobType, setJobType] = useState("")
  const [sortBy, setSortBy] = useState("application_deadline")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [companyName, setCompanyName] = useState("")
  const [driveType, setDriveType] = useState("")

  const shouldReduceMotion = useReducedMotion()

  const limit = 12

  // Debounce search with proper cleanup
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 400)
  }, [])

  const filters: JobListFilters = useMemo(() => ({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(jobType && { job_type: jobType }),
    ...(driveType && { drive_type: driveType }),
    ...(companyName && { company_name: companyName }),
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit,
  }), [debouncedSearch, jobType, driveType, companyName, sortBy, sortOrder, page, limit])

  const { jobs, pagination, placementContext, isLoading, isFetching, isError, error } = useJobList(filters)

  const hasActiveFilters = Boolean(jobType || driveType || debouncedSearch || companyName)

  const clearAllFilters = useCallback(() => {
    setJobType("")
    setDriveType("")
    setSearch("")
    setDebouncedSearch("")
    setCompanyName("")
    setPage(1)
  }, [])

  const showFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const showTo = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <AnimatedPage className="space-y-6 max-w-6xl mx-auto">
      {/* ───── Header ───── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Browse Jobs</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <SubtitleText total={pagination.total} isLoading={isLoading} />
        </p>
      </div>

      {/* ───── Placement Policy Banner ───── */}
      {placementContext.is_placed && (
        <div className="flex gap-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 p-4">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">
              You are placed at {placementContext.company_name}
              {placementContext.tier_name ? ` (${placementContext.tier_name})` : ""}
            </p>
            <p className="mt-1 text-blue-700 dark:text-blue-400">
              {placementContext.allow_dream_upgrade
                ? "Your college allows dream upgrades. You can apply to jobs in a higher tier than your current placement."
                : "Your college does not allow dream upgrades. You cannot apply to additional jobs."}
              {placementContext.max_placements && placementContext.max_placements > 1
                ? ` Up to ${placementContext.max_placements} active placements are allowed.`
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* ───── Search Bar (large, full-width) ───── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search jobs, companies, locations…"
          aria-label="Search jobs"
          maxLength={200}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition shadow-sm"
        />
        {search && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ───── Filter Pills + Sort ───── */}
      <div className="space-y-3">
        {/* Horizontal scrollable filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {/* Company text input */}
          <input
            type="text"
            value={companyName}
            onChange={(e) => { setCompanyName(e.target.value); setPage(1) }}
            placeholder="Company…"
            aria-label="Filter by company name"
            maxLength={200}
            className="px-3.5 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-36 shrink-0"
          />

          {/* Divider */}
          <span className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0" />

          {/* Job type pills */}
          {JOB_TYPE_OPTIONS.map((opt) => {
            const isActive = jobType === opt.value
            return (
              <button
                key={`jt-${opt.value}`}
                onClick={() => { setJobType(opt.value); setPage(1) }}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition shrink-0 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {opt.label}
              </button>
            )
          })}

          <span className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0" />

          {/* Drive type pills */}
          {DRIVE_TYPE_FILTER_OPTIONS.map((opt) => {
            const isActive = driveType === opt.value
            return (
              <button
                key={`dt-${opt.value}`}
                onClick={() => { setDriveType(opt.value); setPage(1) }}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition shrink-0 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {opt.label}
              </button>
            )
          })}

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 whitespace-nowrap transition shrink-0"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Sort row */}
        <div className="flex items-center gap-2 justify-end">
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
            aria-label="Sort jobs by"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => { setSortOrder((o) => (o === "asc" ? "desc" : "asc")); setPage(1) }}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
            aria-label={sortOrder === "asc" ? "Sort ascending" : "Sort descending"}
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ───── Job Grid ───── */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={`skel-${String(i)}`} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Failed to load jobs</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {error instanceof Error ? error.message : "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {!isLoading && !isError && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-5">
            <Briefcase className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No jobs found</h3>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {hasActiveFilters
              ? "No jobs match your current filters. Try adjusting your search or clear all filters."
              : "No jobs are currently available. Check back soon!"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-medium transition shadow-lg shadow-indigo-500/25"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      )}

      {!isLoading && !isError && jobs.length > 0 && (
        <motion.div
          variants={shouldReduceMotion ? undefined : staggerContainer}
          initial="initial"
          animate="animate"
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}
        >
          {jobs.map((job) => (
            <JobCard key={job.job_id} job={job} shouldReduceMotion={shouldReduceMotion} />
          ))}
        </motion.div>
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
