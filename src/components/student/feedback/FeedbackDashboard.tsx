import { useState, useCallback, useRef, memo, useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Star,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import { FeedbackService } from "@/services/student/feedback.service"
import { useSubmitFeedback } from "@/hooks/student/feedback/useSubmitFeedback"
import { useMyFeedback } from "@/hooks/student/feedback/useMyFeedback"
import {
  SORT_OPTIONS_FEEDBACK,
  STAR_LABELS,
  APPROVAL_STATUS_COLORS,
  type StudentFeedback,
} from "@/validators/FeedbackSchema"
import type { ApplicationListItem } from "@/services/student/jobBrowsing.service"

// ─── Tab Config ─────────────────────────────────────────────────────────────────

type DashboardTab = "submit" | "my-feedback"

const TABS: { key: DashboardTab; label: string; icon: typeof Send }[] = [
  { key: "submit", label: "Submit Feedback", icon: Send },
  { key: "my-feedback", label: "My Feedback", icon: MessageSquare },
]

// ─── Date Formatter ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ─── Star Display (read-only) ───────────────────────────────────────────────────

const StarDisplay = memo(function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < rating
              ? "text-amber-400 fill-amber-400"
              : "text-gray-300 dark:text-gray-600"
          }
        />
      ))}
    </div>
  )
})

// ─── Pagination ─────────────────────────────────────────────────────────────────

interface PaginationProps {
  pagination: { page: number; total_pages: number; total: number; limit: number }
  onPageChange: (page: number) => void
}

function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, total_pages, total, limit } = pagination
  if (total <= 0) return null
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: total_pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === total_pages || Math.abs(p - page) <= 1)
          .reduce<(number | "dots")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("dots")
            acc.push(p)
            return acc
          }, [])
          .map((item, i) =>
            item === "dots" ? (
              <span key={`dots-${i}`} className="px-1 text-xs text-gray-400">…</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`min-w-[28px] h-7 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  page === item
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item}
              </button>
            ),
          )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Feedback Card ──────────────────────────────────────────────────────────────

const FeedbackCard = memo(function FeedbackCard({ item }: { item: StudentFeedback }) {
  const colors = APPROVAL_STATUS_COLORS[item.is_approved ? "approved" : "pending"]

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
      {/* Header: company + job + badges */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {item.company_name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.job_title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.is_anonymous && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <EyeOff size={12} />
              Anonymous
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {item.is_approved ? "Approved" : "Pending"}
          </span>
        </div>
      </div>

      {/* Star rating */}
      <StarDisplay rating={item.rating} />

      {/* Feedback text */}
      {item.feedback_text ? (
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {item.feedback_text}
        </p>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No feedback text provided</p>
      )}

      {/* Date */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Submitted: {formatDate(item.created_at)}
      </p>
    </div>
  )
})

// ─── Card Skeleton ──────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 motion-safe:animate-pulse space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-48 rounded bg-gray-100 dark:bg-gray-700/60" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-700/60" />
        <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-700/60" />
      </div>
      <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-700/60" />
    </div>
  )
}

// ─── Submit Panel ───────────────────────────────────────────────────────────────

function SubmitPanel({ onTabSwitch }: { onTabSwitch: (tab: DashboardTab) => void }) {
  const shouldReduce = useReducedMotion()
  const {
    jobId,
    rating,
    feedbackText,
    isAnonymous,
    errors,
    handleJobSelect,
    handleRatingChange,
    handleFeedbackTextChange,
    setIsAnonymous,
    handleSubmit,
    isSubmitting,
  } = useSubmitFeedback(() => onTabSwitch("my-feedback"))

  const [hoverRating, setHoverRating] = useState(0)
  const [showAnonConfirm, setShowAnonConfirm] = useState(false)

  // Fetch student's applications to populate job dropdown
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: queryKeys.studentPortal.myApplications({ limit: 200 } as Record<string, unknown>),
    queryFn: () => JobBrowsingService.getMyApplications({ limit: 200 }),
  })

  // Fetch student's existing feedback to disable already-submitted jobs
  const { data: feedbackData } = useQuery({
    queryKey: queryKeys.studentPortal.myFeedback({ limit: 200 } as Record<string, unknown>),
    queryFn: () => FeedbackService.getMyFeedback({ limit: 200 }),
  })

  const submittedJobIds = useMemo(() => {
    if (!feedbackData?.feedback) return new Set<string>()
    return new Set(feedbackData.feedback.map((f) => f.job_id))
  }, [feedbackData])

  const applications: ApplicationListItem[] = appsData?.applications ?? []

  const handleJobChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedJobId = e.target.value
      const app = applications.find((a) => a.job_id === selectedJobId)
      handleJobSelect(selectedJobId, app?.company_id ?? "")
    },
    [applications, handleJobSelect],
  )

  // Derive company name from selected job
  const selectedCompanyName = useMemo(() => {
    if (!jobId) return ""
    return applications.find((a) => a.job_id === jobId)?.company_name ?? ""
  }, [jobId, applications])

  const displayRating = hoverRating || rating
  const charCount = feedbackText.length

  const doSubmit = useCallback(() => {
    if (isAnonymous) {
      setShowAnonConfirm(true)
    } else {
      handleSubmit()
    }
  }, [isAnonymous, handleSubmit])

  const Wrapper = shouldReduce ? "div" : motion.div

  return (
    <Wrapper
      {...(!shouldReduce ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } } : {})}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Info banner */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Share your experience after a placement drive. Your feedback helps improve the placement process for everyone.
        </p>
      </div>

      {/* Job selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Select Job <span className="text-red-500">*</span>
        </label>
        {appsLoading ? (
          <div className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 motion-safe:animate-pulse" />
        ) : (
          <select
            value={jobId}
            onChange={handleJobChange}
            className={`w-full h-11 rounded-xl border bg-white dark:bg-gray-800 px-4 text-sm transition-colors cursor-pointer
              ${errors.job_id
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              } text-gray-900 dark:text-gray-100 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800`}
          >
            <option value="">Select a job you applied for…</option>
            {applications.map((app) => (
              <option
                key={app.job_id}
                value={app.job_id}
                disabled={submittedJobIds.has(app.job_id)}
              >
                {app.job_title} — {app.company_name}
                {submittedJobIds.has(app.job_id) ? " (Feedback submitted)" : ""}
              </option>
            ))}
          </select>
        )}
        {errors.job_id && (
          <p className="mt-1 text-xs text-red-500">{errors.job_id}</p>
        )}
      </div>

      {/* Company (auto-populated from selected job) */}
      {selectedCompanyName && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Company
          </label>
          <div className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 flex items-center text-sm text-gray-700 dark:text-gray-300">
            {selectedCompanyName}
          </div>
        </div>
      )}

      {/* Star rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1
            const isFilled = starValue <= displayRating
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleRatingChange(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className={`p-1 rounded transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900${shouldReduce ? "" : " hover:scale-110"}`}
                role="radio"
                aria-checked={starValue === rating}
                aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
              >
                <Star
                  size={28}
                  className={
                    isFilled
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300 dark:text-gray-600"
                  }
                />
              </button>
            )
          })}
          {displayRating > 0 && (
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {displayRating}/5 — {STAR_LABELS[displayRating - 1]}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="mt-1 text-xs text-red-500">{errors.rating}</p>
        )}
      </div>

      {/* Feedback text */}
      <div>
        <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Feedback Text
        </label>
        <textarea
          id="feedback-text"
          value={feedbackText}
          onChange={(e) => handleFeedbackTextChange(e.target.value)}
          rows={5}
          maxLength={3000}
          placeholder="Share your experience with this placement drive... (optional)"
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.feedback_text ? (
            <p className="text-xs text-red-500">{errors.feedback_text}</p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ${
              charCount >= 2850
                ? "text-red-500"
                : charCount >= 2400
                  ? "text-amber-500"
                  : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {charCount} / 3000
          </span>
        </div>
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          role="switch"
          aria-checked={isAnonymous}
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent cursor-pointer transition-colors ${
            isAnonymous ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              isAnonymous ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            {isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}
            Submit Anonymously
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isAnonymous
              ? "Your identity will be hidden from college admins."
              : "Your name will be visible to college admins reviewing this feedback."}
          </p>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => doSubmit()}
          disabled={isSubmitting || rating === 0 || !jobId}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Submitting…" : "Submit Feedback"}
        </button>
      </div>

      {/* Anonymous confirmation dialog */}
      <AnimatePresence>
        {showAnonConfirm && (
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0 }}
            animate={shouldReduce ? undefined : { opacity: 1 }}
            exit={shouldReduce ? undefined : { opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowAnonConfirm(false)}
          >
            <motion.div
              initial={shouldReduce ? undefined : { opacity: 0, scale: 0.95 }}
              animate={shouldReduce ? undefined : { opacity: 1, scale: 1 }}
              exit={shouldReduce ? undefined : { opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm mx-4 space-y-4"
            >
              <div className="flex items-center gap-2">
                <EyeOff size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Submit Anonymously?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your identity will be hidden from college admins. They will not be able to see who submitted this feedback.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnonConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnonConfirm(false)
                    handleSubmit()
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer"
                >
                  Confirm & Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  )
}

// ─── My Feedback Panel ──────────────────────────────────────────────────────────

function MyFeedbackPanel({ enabled }: { enabled: boolean }) {
  const shouldReduce = useReducedMotion()
  const {
    feedback,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    sortIndex,
    handleSortChange,
    handlePageChange,
  } = useMyFeedback(20, enabled)

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={32} className="text-red-400 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed to load feedback</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
          Retry
        </button>
      </div>
    )
  }

  // ── Empty state ──
  if (feedback.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <MessageSquare size={24} className="text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No feedback submitted yet</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
          After participating in a placement drive, share your experience through the Submit tab.
        </p>
      </div>
    )
  }

  const Container = shouldReduce ? "div" : motion.div

  return (
    <div className="space-y-4">
      {/* Sort + refresh */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <select
          value={sortIndex}
          onChange={(e) => handleSortChange(Number(e.target.value))}
          className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {SORT_OPTIONS_FEEDBACK.map((opt, i) => (
            <option key={i} value={i}>{opt.label}</option>
          ))}
        </select>
        {isFetching && (
          <Loader2 size={14} className="animate-spin text-indigo-500" />
        )}
      </div>

      {/* Cards */}
      <Container
        {...(!shouldReduce ? { variants: staggerContainer, initial: "hidden", animate: "show" } : {})}
        className="space-y-3"
      >
        {feedback.map((item) => {
          const ItemWrapper = shouldReduce ? "div" : motion.div
          return (
            <ItemWrapper key={item.feedback_id} {...(!shouldReduce ? { variants: staggerItem } : {})}>
              <FeedbackCard item={item} />
            </ItemWrapper>
          )
        })}
      </Container>

      {/* Pagination */}
      <Pagination
        pagination={{
          page: pagination.page,
          total_pages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
        }}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function FeedbackDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("submit")
  const visitedTabs = useRef<Set<DashboardTab>>(new Set(["submit"]))
  if (!visitedTabs.current.has(activeTab)) visitedTabs.current.add(activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Placement Feedback</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Rate and review your placement drive experiences
        </p>
      </div>

      {/* Tabs */}
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

      {/* Tab Panels */}
      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === "submit" ? (
          <SubmitPanel onTabSwitch={setActiveTab} />
        ) : (
          <MyFeedbackPanel enabled={visitedTabs.current.has("my-feedback")} />
        )}
      </div>
    </div>
  )
}
