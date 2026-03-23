import { useState, useCallback, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  ArrowUpDown,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
} from "lucide-react"
import { staggerContainer } from "@/lib/animations"
import { useAvailableTrainings } from "@/hooks/student/training-programs/useAvailableTrainings"
import { useMyEnrollments } from "@/hooks/student/training-programs/useMyEnrollments"
import { useEnrollInTraining } from "@/hooks/student/training-programs/useEnrollInTraining"
import AvailableProgramCard from "@/components/student/training-programs/AvailableProgramCard"
import EnrollmentCard from "@/components/student/training-programs/EnrollmentCard"
import EnrollConfirmModal from "@/components/student/training-programs/EnrollConfirmModal"
import FeedbackModal from "@/components/student/training-programs/FeedbackModal"
import {
  PROGRAM_TYPE_OPTIONS,
  PROGRAM_TYPE_LABELS,
  ENROLLMENT_STATUS_TABS,
  ENROLLMENT_STATUS_LABELS,
  AVAILABLE_SORT_OPTIONS,
  ENROLLMENT_SORT_OPTIONS,
  type StudentAvailableProgram,
  type StudentEnrollment,
  type StudentTrainingFilters,
  type StudentEnrollmentFilters,
  type ProgramType,
  type EnrollmentStatusFilter,
} from "@/validators/TrainingProgramSchema"

// ─── Tab Types ──────────────────────────────────────────────────────────────────

type DashboardTab = "available" | "enrolled"

const TABS: { key: DashboardTab; label: string; icon: typeof BookOpen }[] = [
  { key: "available", label: "Available Programs", icon: BookOpen },
  { key: "enrolled", label: "My Enrollments", icon: GraduationCap },
]

// ─── Component ──────────────────────────────────────────────────────────────────

export default function TrainingDashboard() {
  const shouldReduce = useReducedMotion()
  const [activeTab, setActiveTab] = useState<DashboardTab>("available")

  // Track whether each tab has been visited to enable lazy-loading
  const visitedTabs = useRef<Set<DashboardTab>>(new Set(["available"]))
  if (!visitedTabs.current.has(activeTab)) visitedTabs.current.add(activeTab)

  // ── Available Programs State ──
  const available = useAvailableTrainings(10, visitedTabs.current.has("available"))

  // ── Enrolled Programs State ──
  const enrolled = useMyEnrollments(10, visitedTabs.current.has("enrolled"))

  // ── Enroll Mutation ──
  const { enroll, isEnrolling } = useEnrollInTraining()

  // ── Modal State ──
  const [enrollTarget, setEnrollTarget] = useState<StudentAvailableProgram | null>(null)
  const [feedbackTarget, setFeedbackTarget] = useState<StudentEnrollment | null>(null)

  const handleEnrollClick = useCallback((program: StudentAvailableProgram) => {
    setEnrollTarget(program)
  }, [])

  const handleConfirmEnroll = useCallback(() => {
    if (!enrollTarget) return
    enroll(enrollTarget.program_id, {
      onSuccess: () => setEnrollTarget(null),
    })
  }, [enrollTarget, enroll])

  const handleFeedbackClick = useCallback((enrollment: StudentEnrollment) => {
    setFeedbackTarget(enrollment)
  }, [])

  // ── Summary helpers for enrolled ──
  const getTabCount = (tab: EnrollmentStatusFilter): number => {
    if (tab === "all") return enrolled.summary.total_enrolled
    const key = `${tab}_count` as keyof typeof enrolled.summary
    return (enrolled.summary[key] as number) ?? 0
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Training Programs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Browse and enroll in training programs, track your progress
        </p>
      </div>

      {/* ── Tabs ── */}
      <div role="tablist" className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`tab-${key}`}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`tabpanel-${key}`}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === key
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Panels ── */}
      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === "available" ? (
          <AvailablePanel
            {...available}
            shouldReduce={shouldReduce}
            onEnroll={handleEnrollClick}
          />
        ) : (
          <EnrolledPanel
            {...enrolled}
            shouldReduce={shouldReduce}
            onFeedback={handleFeedbackClick}
            getTabCount={getTabCount}
          />
        )}
      </div>

      {/* ── Modals ── */}
      <EnrollConfirmModal
        program={enrollTarget}
        isOpen={enrollTarget !== null}
        isEnrolling={isEnrolling}
        onConfirm={handleConfirmEnroll}
        onClose={() => setEnrollTarget(null)}
      />
      <FeedbackModal
        enrollment={feedbackTarget}
        isOpen={feedbackTarget !== null}
        onClose={() => setFeedbackTarget(null)}
      />
    </div>
  )
}

// ─── Available Programs Panel ───────────────────────────────────────────────────

interface AvailablePanelProps {
  programs: StudentAvailableProgram[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
  search: string
  typeFilter: ProgramType | "all"
  sortBy: StudentTrainingFilters["sort_by"]
  sortOrder: "desc" | "asc"
  handleSearchChange: (v: string) => void
  handleTypeFilterChange: (v: ProgramType | "all") => void
  handleSortByChange: (v: StudentTrainingFilters["sort_by"]) => void
  handleSortOrderChange: (v: "desc" | "asc") => void
  handlePageChange: (p: number) => void
  shouldReduce: boolean | null
  onEnroll: (p: StudentAvailableProgram) => void
}

function AvailablePanel({
  programs,
  pagination,
  isLoading,
  isFetching,
  isError,
  refetch,
  search,
  typeFilter,
  handleSearchChange,
  handleTypeFilterChange,
  sortBy,
  handleSortByChange,
  sortOrder,
  handleSortOrderChange,
  handlePageChange,
  shouldReduce,
  onEnroll,
}: AvailablePanelProps) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search programs…"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {isFetching && !isLoading && (
            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-500" />
          )}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => handleTypeFilterChange(e.target.value as ProgramType | "all")}
          aria-label="Filter by program type"
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="all">All Types</option>
          {PROGRAM_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {PROGRAM_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as StudentTrainingFilters["sort_by"])}
            aria-label="Sort by"
            className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {AVAILABLE_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleSortOrderChange(sortOrder === "desc" ? "asc" : "desc")}
            aria-label={`Sort ${sortOrder === "desc" ? "ascending" : "descending"}`}
            className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors cursor-pointer"
          >
            <ArrowUpDown size={16} className={sortOrder === "asc" ? "rotate-180" : ""} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-5 motion-safe:animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={40} className="text-red-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Failed to load training programs</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors cursor-pointer">
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No training programs available</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back later for new programs</p>
        </div>
      ) : (
        <>
          <motion.div
            variants={shouldReduce ? undefined : staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {programs.map((p) => (
              <AvailableProgramCard key={p.program_id} program={p} onEnroll={onEnroll} />
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}

// ─── Enrolled Programs Panel ────────────────────────────────────────────────────

interface EnrolledPanelProps {
  enrollments: StudentEnrollment[]
  summary: ReturnType<typeof useMyEnrollments>["summary"]
  pagination: { total: number; page: number; limit: number; totalPages: number }
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
  statusFilter: EnrollmentStatusFilter
  sortBy: StudentEnrollmentFilters["sort_by"]
  sortOrder: "desc" | "asc"
  handleStatusFilterChange: (v: EnrollmentStatusFilter) => void
  handleSortByChange: (v: StudentEnrollmentFilters["sort_by"]) => void
  handleSortOrderChange: (v: "desc" | "asc") => void
  handlePageChange: (p: number) => void
  shouldReduce: boolean | null
  onFeedback: (e: StudentEnrollment) => void
  getTabCount: (tab: EnrollmentStatusFilter) => number
}

function EnrolledPanel({
  enrollments,
  summary,
  pagination,
  isLoading,
  isFetching,
  isError,
  refetch,
  statusFilter,
  handleStatusFilterChange,
  sortBy,
  handleSortByChange,
  sortOrder,
  handleSortOrderChange,
  handlePageChange,
  shouldReduce,
  onFeedback,
  getTabCount,
}: EnrolledPanelProps) {
  const summaryCards = [
    { label: "Total Enrolled", value: summary.total_enrolled, icon: Users, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" },
    { label: "In Progress", value: summary.in_progress_count, icon: TrendingUp, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
    { label: "Completed", value: summary.completed_count, icon: GraduationCap, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Certificates", value: summary.certificates_earned, icon: Award, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20" },
  ]

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {!isError && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4 motion-safe:animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              ))
            : summaryCards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                    <Icon size={16} />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
        </div>
      )}

      {/* Status Filter Tabs */}
      {!isError && (
        <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
          {ENROLLMENT_STATUS_TABS.map((tab) => {
            const count = getTabCount(tab)
            const label = tab === "all" ? "All" : ENROLLMENT_STATUS_LABELS[tab as keyof typeof ENROLLMENT_STATUS_LABELS]
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={statusFilter === tab}
                onClick={() => handleStatusFilterChange(tab)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {label}
                <span className={`text-[10px] min-w-[18px] text-center px-1 py-0.5 rounded-full ${
                  statusFilter === tab
                    ? "bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Sort Controls */}
      {!isError && (
        <div className="flex items-center gap-2 justify-end">
          {isFetching && !isLoading && (
            <Loader2 size={14} className="animate-spin text-indigo-500" />
          )}
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as StudentEnrollmentFilters["sort_by"])}
            aria-label="Sort by"
            className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {ENROLLMENT_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleSortOrderChange(sortOrder === "desc" ? "asc" : "desc")}
            aria-label={`Sort ${sortOrder === "desc" ? "ascending" : "descending"}`}
            className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors cursor-pointer"
          >
            <ArrowUpDown size={16} className={sortOrder === "asc" ? "rotate-180" : ""} />
          </button>
        </div>
      )}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-5 motion-safe:animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-2" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={40} className="text-red-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Failed to load enrollments</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors cursor-pointer">
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <GraduationCap size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
          {statusFilter !== "all" ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No {ENROLLMENT_STATUS_LABELS[statusFilter as keyof typeof ENROLLMENT_STATUS_LABELS]?.toLowerCase()} enrollments
              </p>
              <button
                type="button"
                onClick={() => handleStatusFilterChange("all")}
                className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                View all enrollments
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400">No enrollments found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Browse available programs to get started</p>
            </>
          )}
        </div>
      ) : (
        <>
          <motion.div
            variants={shouldReduce ? undefined : staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {enrollments.map((e) => (
              <EnrollmentCard key={e.enrollment_id} enrollment={e} onFeedback={onFeedback} />
            ))}
          </motion.div>

          {pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}

// ─── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: { page: number; totalPages: number; total: number }
  onPageChange: (p: number) => void
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
