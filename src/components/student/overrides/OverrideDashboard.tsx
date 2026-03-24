import { useReducedMotion, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"
import { staggerContainer } from "@/lib/animations"
import { useMyOverrides } from "@/hooks/student/overrides/useMyOverrides"
import OverrideRequestCard from "@/components/student/overrides/OverrideRequestCard"
import {
  OVERRIDE_STATUS_TABS,
  OVERRIDE_STATUS_TAB_LABELS,
  type OverrideStatusFilter,
} from "@/validators/OverrideSchema"

// ─── Pagination ─────────────────────────────────────────────────────────────────

interface PaginationProps {
  pagination: { page: number; total_pages: number; total: number; limit: number }
  onPageChange: (page: number) => void
}

function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, total_pages, total, limit } = pagination
  if (total_pages <= 1) return null
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
              <span key={`dots-${i}`} className="px-1 text-xs text-gray-400">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`min-w-[28px] h-7 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  page === item
                    ? "bg-indigo-600 text-white"
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

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function OverrideDashboard() {
  const shouldReduce = useReducedMotion()

  const {
    overrides,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    statusFilter,
    sortOrder,
    handleStatusFilterChange,
    handleSortOrderChange,
    handlePageChange,
  } = useMyOverrides()

  // ── Contextual empty state message ──
  const emptyMessage = (() => {
    if (statusFilter === "pending") return "No pending override requests"
    if (statusFilter === "approved") return "No approved override requests"
    if (statusFilter === "rejected") return "No rejected override requests"
    return "No override requests yet"
  })()

  const emptySubtext =
    statusFilter === "all"
      ? "Override requests appear here when you request eligibility exceptions for jobs you're not currently eligible for."
      : "Try adjusting your filters to see more results."

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Override Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your eligibility override requests for jobs
        </p>
      </div>

      {/* ── Status Filter Tabs + Sort Controls ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Filter by status">
          {OVERRIDE_STATUS_TABS.map((tab) => (
            <button
              key={tab}
              id={`override-tab-${tab}`}
              role="tab"
              aria-selected={statusFilter === tab}
              aria-controls="override-tabpanel"
              onClick={() => handleStatusFilterChange(tab)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {OVERRIDE_STATUS_TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <Loader2 size={14} className="animate-spin text-indigo-500" />
          )}

          {/* Sort Direction Toggle */}
          <button
            type="button"
            onClick={() => handleSortOrderChange(sortOrder === "desc" ? "asc" : "desc")}
            aria-label={`Sort ${sortOrder === "desc" ? "ascending" : "descending"}`}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ArrowUpDown size={14} className={`transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div id="override-tabpanel" role="tabpanel" aria-labelledby={`override-tab-${statusFilter}`}>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 overflow-hidden motion-safe:animate-pulse">
              <div className="h-1 bg-gray-200 dark:bg-gray-700" />
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3.5 w-28 rounded bg-gray-100 dark:bg-gray-700/60" />
                  </div>
                  <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded-md bg-gray-100 dark:bg-gray-700/60" />
                  <div className="h-5 w-20 rounded-md bg-gray-100 dark:bg-gray-700/60" />
                  <div className="h-5 w-16 rounded-md bg-gray-100 dark:bg-gray-700/60" />
                </div>
                <div className="h-3.5 w-full rounded bg-gray-100 dark:bg-gray-700/60" />
                <div className="h-3.5 w-2/3 rounded bg-gray-100 dark:bg-gray-700/60" />
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-700/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Failed to load override requests
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Something went wrong. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      ) : overrides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {emptyMessage}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            {emptySubtext}
          </p>
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          {shouldReduce ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overrides.map((o) => (
                <OverrideRequestCard key={o.override_id} override={o} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {overrides.map((o) => (
                <OverrideRequestCard key={o.override_id} override={o} />
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
      </div>
    </div>
  )
}
