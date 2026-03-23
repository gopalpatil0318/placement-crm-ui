import { useState, useRef, memo, useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  HelpCircle,
  Loader2,
  RefreshCw,
  Search,
  Send,
  Tag,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { JobBrowsingService } from "@/services/student/jobBrowsing.service"
import { useBrowseQuestions } from "@/hooks/student/feedback/useBrowseQuestions"
import { useSubmitInterviewQuestion } from "@/hooks/student/feedback/useSubmitInterviewQuestion"
import {
  SORT_OPTIONS_QUESTIONS,
  TOPIC_SUGGESTIONS,
  type BrowseInterviewQuestion,
} from "@/validators/FeedbackSchema"
import type { JobListItem } from "@/services/student/jobBrowsing.service"

// ─── Tab Config ─────────────────────────────────────────────────────────────────

type DashboardTab = "browse" | "share"

const TABS: { key: DashboardTab; label: string; icon: typeof BookOpen }[] = [
  { key: "browse", label: "Browse Questions", icon: BookOpen },
  { key: "share", label: "Share a Question", icon: Send },
]

// ─── Date Formatter ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

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

// ─── Question Browse Card ───────────────────────────────────────────────────────

const QuestionBrowseCard = memo(function QuestionBrowseCard({
  question,
  shouldReduceMotion,
}: {
  question: BrowseInterviewQuestion
  shouldReduceMotion: boolean | null
}) {
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
      {/* Question text */}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
        {question.question_description}
      </p>

      {/* Tags row */}
      <div className="flex items-center gap-2 flex-wrap">
        {question.topic && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
            <Tag size={11} />
            {question.topic}
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
          {question.company_name}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {question.job_title}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
          {question.passout_year}
        </span>
      </div>

      {/* Expandable sample answer */}
      {question.sample_answer ? (
        <div>
          <button
            type="button"
            onClick={() => setShowAnswer(!showAnswer)}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            {showAnswer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, height: "auto" }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {question.sample_answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No sample answer provided</p>
      )}

      {/* Date */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Shared on {formatDate(question.created_at)}
      </p>
    </div>
  )
})

// ─── Card Skeleton ──────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 motion-safe:animate-pulse space-y-3">
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-700/60" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-700/60" />
    </div>
  )
}

// ─── Browse Panel ───────────────────────────────────────────────────────────────

function BrowsePanel({ enabled, onSwitchToShare }: { enabled: boolean; onSwitchToShare: () => void }) {
  const shouldReduce = useReducedMotion()
  const {
    questions,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    search,
    companyFilter,
    topicFilter,
    sortIndex,
    handleSearchChange,
    handleCompanyFilterChange,
    handleTopicFilterChange,
    handleSortChange,
    handlePageChange,
  } = useBrowseQuestions(20, enabled)

  // Fetch available jobs to extract unique companies for filter
  const { data: jobsData } = useQuery({
    queryKey: queryKeys.studentPortal.availableJobs({ limit: 200 } as Record<string, unknown>),
    queryFn: () => JobBrowsingService.getAvailableJobs({ limit: 200 }),
    enabled,
  })

  const companies = useMemo(() => {
    const jobs: JobListItem[] = jobsData?.jobs ?? []
    const map = new Map<string, string>()
    for (const j of jobs) {
      if (!map.has(j.company_id)) map.set(j.company_id, j.company_name)
    }
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }, [jobsData])

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton filter bar */}
        <div className="flex gap-3 motion-safe:animate-pulse">
          <div className="h-9 w-56 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-9 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-9 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={32} className="text-red-400 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed to load questions</p>
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

  const hasFilters = search || topicFilter || companyFilter
  const Container = shouldReduce ? "div" : motion.div

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search questions…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        {/* Company filter */}
        <select
          value={companyFilter}
          onChange={(e) => handleCompanyFilterChange(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {/* Sort */}
        <select
          value={sortIndex}
          onChange={(e) => handleSortChange(Number(e.target.value))}
          className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {SORT_OPTIONS_QUESTIONS.map((opt, i) => (
            <option key={i} value={i}>{opt.label}</option>
          ))}
        </select>
        {isFetching && (
          <Loader2 size={14} className="animate-spin text-indigo-500" />
        )}
      </div>

      {/* Topic chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {TOPIC_SUGGESTIONS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTopicFilterChange(t)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
              topicFilter === t
                ? "bg-purple-600 text-white border-purple-600 dark:bg-purple-500 dark:border-purple-500"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cards or empty */}
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <HelpCircle size={24} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {hasFilters ? "No questions match your filters" : "No interview questions yet"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            {hasFilters
              ? "Try adjusting your search or filters to see more results."
              : (
                <>
                  Be the first to share!{" "}
                  <button
                    type="button"
                    onClick={onSwitchToShare}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                  >
                    Switch to Share tab
                  </button>{" "}
                  to submit a question.
                </>
              )}
          </p>
        </div>
      ) : (
        <Container
          {...(!shouldReduce ? { variants: staggerContainer, initial: "hidden", animate: "show" } : {})}
          className="space-y-3"
        >
          {questions.map((q) => {
            const ItemWrapper = shouldReduce ? "div" : motion.div
            return (
              <ItemWrapper key={q.question_id} {...(!shouldReduce ? { variants: staggerItem } : {})}>
                <QuestionBrowseCard question={q} shouldReduceMotion={shouldReduce} />
              </ItemWrapper>
            )
          })}
        </Container>
      )}

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

// ─── Share Panel ────────────────────────────────────────────────────────────────

function SharePanel({ onSubmitSuccess }: { onSubmitSuccess: () => void }) {
  const shouldReduce = useReducedMotion()
  const {
    companyId,
    jobId,
    questionDescription,
    topic,
    sampleAnswer,
    errors,
    setCompanyId,
    handleJobChange,
    handleQuestionChange,
    handleTopicChange,
    handleSampleAnswerChange,
    handleSubmit,
    isSubmitting,
  } = useSubmitInterviewQuestion(onSubmitSuccess)

  // Fetch available jobs (grouped by company)
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: queryKeys.studentPortal.availableJobs({ limit: 200 } as Record<string, unknown>),
    queryFn: () => JobBrowsingService.getAvailableJobs({ limit: 200 }),
    placeholderData: keepPreviousData,
  })

  const allJobs: JobListItem[] = jobsData?.jobs ?? []

  // Extract unique companies
  const companies = useMemo(() => {
    const map = new Map<string, string>()
    for (const j of allJobs) {
      if (!map.has(j.company_id)) map.set(j.company_id, j.company_name)
    }
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }, [allJobs])

  // Filter jobs by selected company
  const filteredJobs = useMemo(() => {
    if (!companyId) return []
    return allJobs.filter((j) => j.company_id === companyId)
  }, [allJobs, companyId])

  const questionCharCount = questionDescription.length
  const answerCharCount = sampleAnswer.length

  const Wrapper = shouldReduce ? "div" : motion.div

  return (
    <Wrapper
      {...(!shouldReduce ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } } : {})}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Info banner */}
      <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 p-4">
        <p className="text-sm text-purple-700 dark:text-purple-300">
          Share interview questions to help future batches prepare. Questions go through admin review before appearing in browse.
        </p>
      </div>

      {/* Company selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Company <span className="text-red-500">*</span>
        </label>
        {jobsLoading ? (
          <div className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 motion-safe:animate-pulse" />
        ) : (
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className={`w-full h-11 rounded-xl border bg-white dark:bg-gray-800 px-4 text-sm transition-colors cursor-pointer
              ${errors.company_id
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              } text-gray-900 dark:text-gray-100 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800`}
          >
            <option value="">Select a company…</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        {errors.company_id && <p className="mt-1 text-xs text-red-500">{errors.company_id}</p>}
      </div>

      {/* Job selector (filtered by company) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Job <span className="text-red-500">*</span>
        </label>
        <select
          value={jobId}
          onChange={(e) => handleJobChange(e.target.value)}
          disabled={!companyId}
          className={`w-full h-11 rounded-xl border bg-white dark:bg-gray-800 px-4 text-sm transition-colors cursor-pointer disabled:opacity-50
            ${errors.job_id
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            } text-gray-900 dark:text-gray-100 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800`}
        >
          <option value="">{companyId ? "Select a job…" : "Select a company first"}</option>
          {filteredJobs.map((j) => (
            <option key={j.job_id} value={j.job_id}>{j.job_title}</option>
          ))}
        </select>
        {errors.job_id && <p className="mt-1 text-xs text-red-500">{errors.job_id}</p>}
      </div>

      {/* Question textarea */}
      <div>
        <label htmlFor="question-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Interview Question <span className="text-red-500">*</span>
        </label>
        <textarea
          id="question-desc"
          value={questionDescription}
          onChange={(e) => handleQuestionChange(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="What was the interview question? (min 5 characters)"
          className={`w-full rounded-xl border bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none
            ${errors.question_description
              ? "border-red-500 focus:ring-red-500/20"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500"
            }`}
        />
        <div className="flex justify-between mt-1">
          {errors.question_description ? (
            <p className="text-xs text-red-500">{errors.question_description}</p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ${
              questionCharCount >= 1900
                ? "text-red-500"
                : questionCharCount >= 1600
                  ? "text-amber-500"
                  : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {questionCharCount} / 2000
          </span>
        </div>
      </div>

      {/* Topic input with suggestion chips */}
      <div>
        <label htmlFor="question-topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Topic
        </label>
        <input
          id="question-topic"
          type="text"
          value={topic}
          onChange={(e) => handleTopicChange(e.target.value)}
          maxLength={100}
          placeholder="e.g., DSA, DBMS, HR…"
          className={`w-full h-11 rounded-xl border bg-white dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent
            ${errors.topic
              ? "border-red-500 focus:ring-red-500/20"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500"
            }`}
        />
        {errors.topic && <p className="mt-1 text-xs text-red-500">{errors.topic}</p>}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {TOPIC_SUGGESTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTopicChange(t)}
              className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors cursor-pointer ${
                topic === t
                  ? "bg-purple-600 text-white border-purple-600 dark:bg-purple-500 dark:border-purple-500"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Sample answer textarea */}
      <div>
        <label htmlFor="sample-answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Sample Answer
        </label>
        <textarea
          id="sample-answer"
          value={sampleAnswer}
          onChange={(e) => handleSampleAnswerChange(e.target.value)}
          rows={5}
          maxLength={3000}
          placeholder="Share your answer or a suggested approach… (optional)"
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.sample_answer ? (
            <p className="text-xs text-red-500">{errors.sample_answer}</p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ${
              answerCharCount >= 2850
                ? "text-red-500"
                : answerCharCount >= 2400
                  ? "text-amber-500"
                  : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {answerCharCount} / 3000
          </span>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isSubmitting || !companyId || !jobId || questionDescription.trim().length < 5}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Submitting…" : "Submit Question"}
        </button>
      </div>
    </Wrapper>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function InterviewQuestionsDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("browse")
  const visitedTabs = useRef<Set<DashboardTab>>(new Set(["browse"]))
  if (!visitedTabs.current.has(activeTab)) visitedTabs.current.add(activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Questions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Prepare for interviews by browsing questions shared by your peers
        </p>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`tab-iq-${key}`}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`tabpanel-iq-${key}`}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === key
                ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div role="tabpanel" id={`tabpanel-iq-${activeTab}`} aria-labelledby={`tab-iq-${activeTab}`}>
        {activeTab === "browse" ? (
          <BrowsePanel enabled={visitedTabs.current.has("browse")} onSwitchToShare={() => setActiveTab("share")} />
        ) : (
          <SharePanel onSubmitSuccess={() => setActiveTab("browse")} />
        )}
      </div>
    </div>
  )
}
