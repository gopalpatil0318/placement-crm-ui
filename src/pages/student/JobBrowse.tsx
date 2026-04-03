import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react"
import { Link } from "react-router-dom"
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
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Ban,
  CheckCircle2,
  IndianRupee,
  GraduationCap,
  AlertCircle,
} from "lucide-react"
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { useJobList } from "@/hooks/student/jobs/useJobList"
import { useAvailableJobYears } from "@/hooks/student/jobs/useAvailableJobYears"
import type { JobListFilters, JobListItem } from "@/services/student/jobBrowsing.service"

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
  if (jobType === "internship") return pkg || "Stipend TBD"
  if (pkg) return pkg
  if (min && max) {
    const fmtMin = min >= 100000 ? `${(min / 100000).toFixed(1)} LPA` : `₹${min.toLocaleString("en-IN")}`
    const fmtMax = max >= 100000 ? `${(max / 100000).toFixed(1)} LPA` : `₹${max.toLocaleString("en-IN")}`
    return `${fmtMin} – ${fmtMax}`
  }
  return "Not disclosed"
}

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  internship: "Internship",
  both: "Both",
}

function getCountdownClassName(countdown: { urgent: boolean; expired: boolean }): string {
  if (countdown.expired) return "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
  if (countdown.urgent) return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
  return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
}

function getSubtitleText(total: number, isLoading: boolean): string {
  if (total > 0) return `${total} jobs available`
  if (isLoading) return "Loading jobs..."
  return "No jobs found"
}

const JOB_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "full-time", label: "Full-time" },
  { value: "internship", label: "Internship" },
  { value: "both", label: "Both" },
]

const SORT_OPTIONS = [
  { value: "application_deadline", label: "Deadline" },
  { value: "created_at", label: "Newest" },
  { value: "salary_min", label: "Salary" },
  { value: "job_title", label: "Title" },
  { value: "company_name", label: "Company" },
]

const statusBadge: Record<string, { className: string; label: string }> = {
  pending: {
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    label: "Applied • Pending",
  },
  under_review: {
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    label: "Under Review",
  },
  shortlisted: {
    className: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    label: "Shortlisted",
  },
  rejected: {
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    label: "Rejected",
  },
  selected: {
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    label: "Selected",
  },
  offered: {
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    label: "Offered",
  },
  withdrawn: {
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    label: "Withdrawn",
  },
}

// ─── Skeletons ──────────────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 motion-safe:animate-pulse space-y-4">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
        <div className="h-6 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
        <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

// ─── Job Card ───────────────────────────────────────────────────────────────────

const JobCard = memo(function JobCard({
  job,
  shouldReduceMotion,
}: {
  job: JobListItem
  shouldReduceMotion: boolean | null
}) {
  const countdown = getCountdown(job.application_deadline)
  const salary = formatSalary(job.salary_package, job.salary_min, job.salary_max, job.job_type)
  const badge = job.has_applied && job.application_status
    ? statusBadge[job.application_status]
    : null

  return (
    <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
      <Link
        to={`/student/jobs/${job.job_id}`}
        className="group block rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
      >
        {/* Top row: icon + title */}
        <div className="flex items-start gap-3.5">
          <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shrink-0">
            {job.company_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {job.job_title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {job.company_name}
            </p>
          </div>
        </div>

        {/* Info chips */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
            <MapPin className="h-3 w-3" />
            {job.job_location || "Remote"}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
            <Briefcase className="h-3 w-3" />
            {job.job_type === "full-time" ? "Full-time" : JOB_TYPE_LABELS[job.job_type] ?? "Both"}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
            <IndianRupee className="h-3 w-3" />
            {salary}
          </span>
        </div>

        {/* Bottom row: stats + deadline */}
        <div className="mt-3.5 flex items-center justify-between">
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

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getCountdownClassName(countdown)}`}
          >
            <Clock className="h-3 w-3" />
            {countdown.text}
          </span>
        </div>

        {/* Status badges */}
        {(badge || job.has_denied) && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            {badge && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                <CheckCircle2 className="h-3 w-3" />
                {badge.label}
              </span>
            )}
            {job.has_denied && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <Ban className="h-3 w-3" />
                Opted Out
              </span>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  )
})

// ─── Component ──────────────────────────────────────────────────────────────────

export default function JobBrowse() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [jobType, setJobType] = useState("")
  const [sortBy, setSortBy] = useState("application_deadline")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [selectedJobYear, setSelectedJobYear] = useState("")

  const shouldReduceMotion = useReducedMotion()

  const { years: availableYears } = useAvailableJobYears()

  const limit = 12

  // Debounce search with proper cleanup on unmount
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
    ...(companyName && { company_name: companyName }),
    ...(selectedJobYear && !Number.isNaN(Number.parseInt(selectedJobYear, 10)) && { passout_year: Number.parseInt(selectedJobYear, 10) }),
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit,
  }), [debouncedSearch, jobType, companyName, selectedJobYear, sortBy, sortOrder, page, limit])

  const { jobs, pagination, isLoading, isFetching, isError, error } = useJobList(filters)

  const activeFilterCount = [jobType, debouncedSearch, companyName, selectedJobYear].filter(Boolean).length

  return (
    <AnimatedPage className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Browse Jobs</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {getSubtitleText(pagination.total, isLoading)}
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search jobs, companies..."
            aria-label="Search jobs"
            maxLength={200}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
            showFilters || activeFilterCount > 0
              ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600 text-white text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            aria-label="Sort jobs by"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
            aria-label={sortOrder === "asc" ? "Sort ascending" : "Sort descending"}
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <motion.div
          variants={shouldReduceMotion ? undefined : fadeInUp}
          initial="initial"
          animate="animate"
          className="flex flex-wrap gap-2"
        >
          <input
            type="text"
            value={companyName}
            onChange={(e) => { setCompanyName(e.target.value); setPage(1) }}
            placeholder="Filter by company..."
            aria-label="Filter by company name"
            maxLength={200}
            className="px-3.5 py-1.5 rounded-full text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-44"
          />
          {JOB_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setJobType(opt.value)
                setPage(1)
              }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                jobType === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
          {availableYears.length > 0 && (
            <select
              value={selectedJobYear}
              onChange={(e) => { setSelectedJobYear(e.target.value); setPage(1) }}
              aria-label="Filter by passout year"
              className="px-3.5 py-1.5 rounded-full text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setJobType("")
                setSearch("")
                setDebouncedSearch("")
                setCompanyName("")
                setSelectedJobYear("")
                setPage(1)
              }}
              className="px-3.5 py-1.5 rounded-full text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              Clear All
            </button>
          )}
        </motion.div>
      )}

      {/* Job Grid */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["skel-1", "skel-2", "skel-3", "skel-4", "skel-5", "skel-6"].map((id) => (
            <JobCardSkeleton key={id} />
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
          <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No jobs found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {debouncedSearch || jobType
              ? "Try adjusting your search or filters."
              : "No jobs are currently available. Check back soon!"}
          </p>
        </div>
      )}
      {!isLoading && !isError && jobs.length > 0 && (
        <motion.div
          variants={shouldReduceMotion ? undefined : staggerContainer}
          initial="initial"
          animate="animate"
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-70" : ""}`}
        >
          {jobs.map((job) => (
            <JobCard key={job.job_id} job={job} shouldReduceMotion={shouldReduceMotion} />
          ))}
        </motion.div>
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
