import { useState, useEffect, memo, useMemo, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  HelpCircle,
  Loader2,
  MessageSquarePlus,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { useBrowseQuestions } from "@/hooks/student/feedback/useBrowseQuestions"
import { useSubmitInterviewQuestions } from "@/hooks/student/feedback/useSubmitInterviewQuestions"
import { useAppliedJobOptions } from "@/hooks/student/feedback/useAppliedJobOptions"
import { useQuestionCompanies } from "@/hooks/student/feedback/useQuestionCompanies"
import {
  INTERVIEW_ROUND_TYPE_OPTIONS,
  INTERVIEW_ROUND_TYPE_LABELS,
  type BrowseInterviewQuestion,
  type QuestionCompany,
} from "@/validators/FeedbackSchema"

// ─── Tab Config ─────────────────────────────────────────────────────────────────

type DashboardTab = "browse" | "share"

const TABS: { key: DashboardTab; label: string; icon: typeof BookOpen }[] = [
  { key: "browse", label: "Browse Questions", icon: BookOpen },
  { key: "share", label: "Share a Question", icon: Send },
]

const SKELETON_CARD_KEYS = ["skel-q-1", "skel-q-2", "skel-q-3", "skel-q-4"] as const

// ─── Date Formatter ─────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

// ─── Pagination ─────────────────────────────────────────────────────────────────

interface PaginationProps {
  pagination: { page: number; total_pages: number; total: number; limit: number }
  onPageChange: (page: number) => void
}

function Pagination({ pagination, onPageChange }: Readonly<PaginationProps>) {
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
          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: total_pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === total_pages || Math.abs(p - page) <= 1)
          .reduce<(number | string)[]>((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push(`dots-after-${arr[i - 1]}`)
            acc.push(p)
            return acc
          }, [])
          .map((item) =>
            typeof item === "string" ? (
              <span key={item} className="px-1 text-xs text-gray-400">…</span>
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
          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors cursor-pointer"
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
}: Readonly<{
  question: BrowseInterviewQuestion
  shouldReduceMotion: boolean | null
}>) {
  const [showAnswer, setShowAnswer] = useState(false)
  const roundLabel = question.round_type ? INTERVIEW_ROUND_TYPE_LABELS[question.round_type] ?? question.round_type : null

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
      {/* Job title + round badge row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 dark:text-gray-400">{question.job_title}</span>
        {roundLabel && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
            {roundLabel}
          </span>
        )}
      </div>

      {/* Question text */}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
        {question.question_description}
      </p>

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
        {formatRelativeDate(question.created_at)}
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

// ─── Questions List Content (extracted to reduce BrowsePanel complexity) ─────

interface QuestionsListContentProps {
  questionsLoading: boolean
  questionsError: boolean
  questions: BrowseInterviewQuestion[]
  questionSearch: string
  roundTypeFilter: string
  refetchQuestions: () => void
  shouldReduce: boolean | null
  containerMotionProps: Record<string, unknown>
  itemMotionProps: Record<string, unknown>
}

function QuestionsListContent({
  questionsLoading,
  questionsError,
  questions,
  questionSearch,
  roundTypeFilter,
  refetchQuestions,
  shouldReduce,
  containerMotionProps,
  itemMotionProps,
}: Readonly<QuestionsListContentProps>) {
  if (questionsLoading) {
    return (
      <div className="space-y-3">
        {SKELETON_CARD_KEYS.map((id) => <CardSkeleton key={id} />)}
      </div>
    )
  }

  if (questionsError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={32} className="text-red-400 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed to load questions</p>
        <button
          type="button"
          onClick={() => refetchQuestions()}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <HelpCircle size={24} className="text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {questionSearch || roundTypeFilter ? "No questions match your filters" : "No questions for this company yet"}
        </p>
      </div>
    )
  }

  const Container = shouldReduce ? "div" : motion.div
  return (
    <Container {...containerMotionProps} className="space-y-3">
      {questions.map((q) => {
        const ItemWrapper = shouldReduce ? "div" : motion.div
        return (
          <ItemWrapper key={q.question_id} {...itemMotionProps}>
            <QuestionBrowseCard question={q} shouldReduceMotion={shouldReduce} />
          </ItemWrapper>
        )
      })}
    </Container>
  )
}

// ─── Company Card ───────────────────────────────────────────────────────────────

const CompanyCard = memo(function CompanyCard({
  company,
  onClick,
}: Readonly<{ company: QuestionCompany; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {company.company_name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
              {company.question_count} question{company.question_count === 1 ? "" : "s"}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Latest: {formatRelativeDate(company.latest_date)}
            </span>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors mt-1" />
      </div>
    </button>
  )
})

// ─── Browse Panel (Company-first drill-down) ────────────────────────────────────

function BrowsePanel({ enabled, onSwitchToShare }: Readonly<{ enabled: boolean; onSwitchToShare: () => void }>) {
  const shouldReduce = useReducedMotion()
  const [selectedCompany, setSelectedCompany] = useState<{ company_id: string; company_name: string } | null>(null)
  const [companySearch, setCompanySearch] = useState("")

  // Sub-view 1: Company directory
  const { companies: allCompanies, isLoading: companiesLoading, isError: companiesError, refetch: refetchCompanies } = useQuestionCompanies(enabled)

  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return allCompanies
    const q = companySearch.toLowerCase()
    return allCompanies.filter((c) => c.company_name.toLowerCase().includes(q))
  }, [allCompanies, companySearch])

  // Sub-view 2: Questions for selected company
  const {
    questions,
    pagination,
    isLoading: questionsLoading,
    isFetching: questionsFetching,
    isError: questionsError,
    refetch: refetchQuestions,
    search: questionSearch,
    roundTypeFilter,
    handleSearchChange: handleQuestionSearchChange,
    handleRoundTypeFilterChange,
    handlePageChange,
  } = useBrowseQuestions(20, enabled && selectedCompany !== null, selectedCompany?.company_id)

  // Round type counts (from the full company question data, approximate from current page)
  const roundTypeCounts = useMemo(() => {
    // This is computed from the entire fetched pagination total and current filter
    // For exact counts we'd need a separate endpoint, but for UX the chip highlights are sufficient
    const counts: Record<string, number> = {}
    for (const q of questions) {
      const rt = q.round_type || "other"
      counts[rt] = (counts[rt] || 0) + 1
    }
    return counts
  }, [questions])

  const handleBackToDirectory = useCallback(() => {
    setSelectedCompany(null)
    handleQuestionSearchChange("")
    handleRoundTypeFilterChange("")
    handlePageChange(1)
  }, [handleQuestionSearchChange, handleRoundTypeFilterChange, handlePageChange])

  // ── Company directory (sub-view 1) ──
  if (!selectedCompany) {
    if (companiesLoading) {
      return (
        <div className="space-y-4">
          <div className="h-9 w-56 rounded-lg bg-gray-200 dark:bg-gray-700 motion-safe:animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={`skel-company-${i}`} className="h-20 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 motion-safe:animate-pulse" />
            ))}
          </div>
        </div>
      )
    }

    if (companiesError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={32} className="text-red-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed to load companies</p>
          <button
            type="button"
            onClick={() => refetchCompanies()}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )
    }

    if (allCompanies.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <HelpCircle size={24} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No interview questions yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            Be the first to share!{" "}
            <button type="button" onClick={onSwitchToShare} className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium">
              Switch to Share tab
            </button>{" "}
            to submit a question.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Company search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={companySearch}
            onChange={(e) => setCompanySearch(e.target.value)}
            placeholder="Search companies…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {filteredCompanies.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No companies match &ldquo;{companySearch}&rdquo;
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCompanies.map((c) => (
              <CompanyCard
                key={c.company_id}
                company={c}
                onClick={() => setSelectedCompany({ company_id: c.company_id, company_name: c.company_name })}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Company questions (sub-view 2) ──
  const containerMotionProps = shouldReduce ? {} : { variants: staggerContainer, initial: "hidden" as const, animate: "show" as const }
  const itemMotionProps = shouldReduce ? {} : { variants: staggerItem }

  return (
    <div className="space-y-4">
      {/* Back + Company name header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBackToDirectory}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Back to company directory"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {selectedCompany.company_name}
        </h2>
        {questionsFetching && <Loader2 size={14} className="animate-spin text-indigo-500" />}
      </div>

      {/* Round type chip filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => handleRoundTypeFilterChange("")}
          className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
            roundTypeFilter
              ? "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
              : "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
          }`}
        >
          All ({pagination.total})
        </button>
        {INTERVIEW_ROUND_TYPE_OPTIONS.map((rt) => {
          const label = INTERVIEW_ROUND_TYPE_LABELS[rt]
          const count = roundTypeCounts[rt] || 0
          return (
            <button
              key={rt}
              type="button"
              onClick={() => handleRoundTypeFilterChange(roundTypeFilter === rt ? "" : rt)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                roundTypeFilter === rt
                  ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
            >
              {label}{!roundTypeFilter && count > 0 ? ` (${count})` : ""}
            </button>
          )
        })}
      </div>

      {/* Search within company */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={questionSearch}
          onChange={(e) => handleQuestionSearchChange(e.target.value)}
          placeholder="Search questions…"
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      {/* Questions list */}
      <QuestionsListContent
        questionsLoading={questionsLoading}
        questionsError={questionsError}
        questions={questions}
        questionSearch={questionSearch}
        roundTypeFilter={roundTypeFilter}
        refetchQuestions={refetchQuestions}
        shouldReduce={shouldReduce}
        containerMotionProps={containerMotionProps}
        itemMotionProps={itemMotionProps}
      />

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

// ─── Share Panel (Batch Submit) ─────────────────────────────────────────────────

function SharePanel({ onSubmitSuccess }: Readonly<{ onSubmitSuccess: () => void }>) {
  const shouldReduce = useReducedMotion()
  const { companies: appliedCompanies, isLoading: optionsLoading } = useAppliedJobOptions()
  const {
    companyId,
    jobId,
    roundType,
    questions,
    errors,
    submittedCount,
    setCompanyId: handleCompanyIdChange,
    handleJobChange,
    handleRoundTypeChange,
    addQuestion,
    removeQuestion,
    updateQuestion,
    handleSubmit,
    isSubmitting,
  } = useSubmitInterviewQuestions(onSubmitSuccess)

  // Filter jobs by selected company
  const filteredJobs = useMemo(() => {
    if (!companyId) return []
    const company = appliedCompanies.find((c) => c.company_id === companyId)
    return company?.jobs ?? []
  }, [appliedCompanies, companyId])

  const nonEmptyCount = questions.filter((q) => q.question_description.trim().length > 0).length

  const submitButtonLabel = useMemo(() => {
    if (isSubmitting) return "Submitting…"
    if (nonEmptyCount > 1) return `Submit ${nonEmptyCount} Questions`
    return "Submit Question"
  }, [isSubmitting, nonEmptyCount])

  const Wrapper = shouldReduce ? "div" : motion.div

  // Empty state: no applied companies
  if (!optionsLoading && appliedCompanies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
        <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-3">
          <MessageSquarePlus size={24} className="text-amber-500" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Apply to jobs first</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          You can share interview questions only for jobs you&apos;ve applied to. Browse available jobs and apply to get started.
        </p>
      </div>
    )
  }

  return (
    <Wrapper
      {...(shouldReduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } })}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Info banner */}
      <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 p-4">
        <p className="text-sm text-purple-700 dark:text-purple-300">
          Share interview questions to help future batches prepare. Pick a company you applied to, select the round, and add your questions. All submissions go through admin review.
        </p>
      </div>

      {/* Submitted count badge */}
      {submittedCount > 0 && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2">
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            You&apos;ve shared {submittedCount} question{submittedCount === 1 ? "" : "s"} for this job
          </p>
        </div>
      )}

      {/* Company selector */}
      <div>
        <label htmlFor="company-select-iq" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Company <span className="text-red-500">*</span>
        </label>
        {optionsLoading ? (
          <div className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 motion-safe:animate-pulse" />
        ) : (
          <select
            id="company-select-iq"
            value={companyId}
            onChange={(e) => handleCompanyIdChange(e.target.value)}
            className={`w-full h-11 rounded-xl border bg-white dark:bg-gray-800 px-4 text-sm transition-colors cursor-pointer
              ${errors.company_id
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              } text-gray-900 dark:text-gray-100 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800`}
          >
            <option value="">Select a company you applied to…</option>
            {appliedCompanies.map((c) => (
              <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
            ))}
          </select>
        )}
        {errors.company_id && <p className="mt-1 text-xs text-red-500">{errors.company_id}</p>}
      </div>

      {/* Job selector */}
      <div>
        <label htmlFor="job-select-iq" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Job <span className="text-red-500">*</span>
        </label>
        <select
          id="job-select-iq"
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

      {/* Round type selector */}
      <div>
        <label htmlFor="round-type-iq" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Interview Round <span className="text-red-500">*</span>
        </label>
        <select
          id="round-type-iq"
          value={roundType}
          onChange={(e) => handleRoundTypeChange(e.target.value)}
          disabled={!jobId}
          className={`w-full h-11 rounded-xl border bg-white dark:bg-gray-800 px-4 text-sm transition-colors cursor-pointer disabled:opacity-50
            ${errors.round_type
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            } text-gray-900 dark:text-gray-100 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800`}
        >
          <option value="">{jobId ? "Select round type…" : "Select a job first"}</option>
          {INTERVIEW_ROUND_TYPE_OPTIONS.map((rt) => (
            <option key={rt} value={rt}>{INTERVIEW_ROUND_TYPE_LABELS[rt]}</option>
          ))}
        </select>
        {errors.round_type && <p className="mt-1 text-xs text-red-500">{errors.round_type}</p>}
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Questions <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-gray-400 font-normal">({questions.length}/10)</span>
          </label>
        </div>
        {errors.questions && <p className="text-xs text-red-500">{errors.questions}</p>}

        {questions.map((q, index) => (
          <div key={q.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Question {index + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                  aria-label={`Remove question ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Question text */}
            <textarea
              value={q.question_description}
              onChange={(e) => updateQuestion(index, "question_description", e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="What was the interview question? (min 5 characters)"
              className={`w-full rounded-xl border bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none
                ${errors.questionRows?.[index]?.question_description
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
            />
            {errors.questionRows?.[index]?.question_description && (
              <p className="text-xs text-red-500">{errors.questionRows[index].question_description}</p>
            )}

            {/* Sample answer (collapsible) */}
            <details className="group">
              <summary className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors list-none">
                <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                Add sample answer (optional)
              </summary>
              <textarea
                value={q.sample_answer}
                onChange={(e) => updateQuestion(index, "sample_answer", e.target.value)}
                rows={3}
                maxLength={3000}
                placeholder="Share your answer or a suggested approach…"
                className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </details>
          </div>
        ))}

        {/* Add another question button */}
        {questions.length < 10 && (
          <button
            type="button"
            onClick={addQuestion}
            disabled={!roundType}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 border border-dashed border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Plus size={16} />
            Add Another Question
          </button>
        )}
      </div>

      {/* Submit button (sticky on mobile) */}
      <div className="flex justify-end sticky bottom-4 bg-white dark:bg-gray-950 pt-2 pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isSubmitting || !companyId || !jobId || !roundType || nonEmptyCount === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {submitButtonLabel}
        </button>
      </div>
    </Wrapper>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function InterviewQuestionsDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("browse")
  const [visitedTabs, setVisitedTabs] = useState<Set<DashboardTab>>(new Set(["browse"]))

  useEffect(() => {
    if (!visitedTabs.has(activeTab)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- track visited tabs
      setVisitedTabs(prev => new Set([...prev, activeTab]))
    }
  }, [activeTab, visitedTabs])

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
          <BrowsePanel enabled={visitedTabs.has("browse")} onSwitchToShare={() => setActiveTab("share")} />
        ) : (
          <SharePanel onSubmitSuccess={() => setActiveTab("browse")} />
        )}
      </div>
    </div>
  )
}
