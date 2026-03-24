import { useState, useCallback, useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react"
import { staggerContainer } from "@/lib/animations"
import { useMyRestrictions } from "@/hooks/student/restrictions/useMyRestrictions"
import RestrictionCard from "@/components/student/restrictions/RestrictionCard"
import AppealModal from "@/components/student/restrictions/AppealModal"
import {
  RESTRICTION_TYPE_OPTIONS,
  RESTRICTION_TYPE_LABELS,
  RESTRICTION_STATUS_TABS,
  RESTRICTION_STATUS_LABELS,
  RESTRICTION_SORT_OPTIONS,
  type StudentRestriction,
  type RestrictionType,
  type RestrictionSortField,
} from "@/validators/RestrictionSchema"

// ─── Pagination ─────────────────────────────────────────────────────────────────

interface PaginationProps {
  pagination: { page: number; totalPages: number; total: number; limit: number }
  onPageChange: (page: number) => void
}

function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = pagination
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
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
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
                className={`min-w-[28px] h-7 text-xs font-medium rounded-lg transition-colors cursor-pointer ${page === item
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
          disabled={page >= totalPages}
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

export default function RestrictionDashboard() {
  const shouldReduce = useReducedMotion()

  // ── Data & Filters ──
  const {
    restrictions,
    summary,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    activeFilter,
    typeFilter,
    sortBy,
    sortOrder,
    handleActiveFilterChange,
    handleTypeFilterChange,
    handleSortByChange,
    handleSortOrderChange,
    handlePageChange,
    getTabCount,
  } = useMyRestrictions()

  // ── Modal State ──
  const [appealTarget, setAppealTarget] = useState<StudentRestriction | null>(null)

  const handleAppealClick = useCallback((restriction: StudentRestriction) => {
    setAppealTarget(restriction)
  }, [])

  // ── Summary Cards Config ──
  const summaryCards = useMemo(() => [
    { label: "Total", value: summary.total_restrictions, icon: Shield, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Active", value: summary.active_count, icon: ShieldX, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
    { label: "Resolved", value: summary.resolved_count, icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Appeals Pending", value: summary.appeals_pending, icon: MessageSquareText, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ], [summary])

  // ── Contextual empty state message ──
  const emptyMessage = (() => {
    if (activeFilter === "active" && typeFilter !== "all") return `No active ${RESTRICTION_TYPE_LABELS[typeFilter].toLowerCase()} restrictions`
    if (activeFilter === "active") return "No active restrictions"
    if (activeFilter === "resolved" && typeFilter !== "all") return `No resolved ${RESTRICTION_TYPE_LABELS[typeFilter].toLowerCase()} restrictions`
    if (activeFilter === "resolved") return "No resolved restrictions"
    if (typeFilter !== "all") return `No ${RESTRICTION_TYPE_LABELS[typeFilter].toLowerCase()} restrictions found`
    return "No restrictions on your record"
  })()

  const emptySubtext = activeFilter === "all" && typeFilter === "all"
    ? "You're in good standing — keep it up!"
    : "Try adjusting your filters to see more results."

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Restrictions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View your placement restrictions and submit appeals
        </p>
      </div>

      {/* ── Summary Cards ── */}
      {!isError && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4 motion-safe:animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700 mb-2" />
                <div className="h-6 w-12 rounded bg-gray-200 dark:bg-gray-700 mb-1" />
                <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700/60" />
              </div>
            ))
          ) : (
            summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${bg}`}>
                  <Icon size={16} className={color} />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Status Filter Tabs ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div
          className="flex gap-1 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filter by status"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault()
              const idx = RESTRICTION_STATUS_TABS.indexOf(activeFilter)
              const next =
                e.key === "ArrowRight"
                  ? RESTRICTION_STATUS_TABS[(idx + 1) % RESTRICTION_STATUS_TABS.length]
                  : RESTRICTION_STATUS_TABS[(idx - 1 + RESTRICTION_STATUS_TABS.length) % RESTRICTION_STATUS_TABS.length]
              handleActiveFilterChange(next)
              const nextBtn = document.getElementById(`restriction-tab-${next}`)
              nextBtn?.focus()
            }
          }}
        >          {RESTRICTION_STATUS_TABS.map((tab) => {
          const count = getTabCount(tab)
          return (
            <button
              key={tab}
              id={`restriction-tab-${tab}`}
              role="tab"
              aria-selected={activeFilter === tab}
              tabIndex={activeFilter === tab ? 0 : -1}
              onClick={() => handleActiveFilterChange(tab)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${activeFilter === tab
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {RESTRICTION_STATUS_LABELS[tab]}
              <span
                className={`text-[10px] min-w-[18px] text-center px-1 py-0.5 rounded-full ${activeFilter === tab
                    ? "bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
              >
                {count}
              </span>
            </button>
          )
        })}
        </div>

        {/* Type Filter + Sort Controls */}
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <Loader2 size={14} className="animate-spin text-indigo-500" />
          )}

          {/* Type Dropdown */}
          <div className="relative">
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value as RestrictionType | "all")}
              aria-label="Filter by restriction type"
              className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer appearance-none"
            >
              <option value="all">All Types</option>
              {RESTRICTION_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{RESTRICTION_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as RestrictionSortField)}
            aria-label="Sort by"
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer appearance-none"
          >
            {RESTRICTION_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

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
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-5 motion-safe:animate-pulse">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="h-5 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 mb-2" />
              <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-700/60 mb-4" />
              <div className="space-y-1.5 mb-3">
                <div className="h-3 w-48 rounded bg-gray-100 dark:bg-gray-700/60" />
                <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-700/60" />
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="h-7 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
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
            Failed to load restrictions
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Something went wrong. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      ) : restrictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
            <ShieldCheck size={24} className="text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {emptyMessage}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {emptySubtext}
          </p>
        </div>
      ) : (
        <>
          {/* Active restriction warning banner */}
          {activeFilter === "all" && summary.active_count > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200/60 dark:border-red-800/30">
              <ShieldAlert size={16} className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs text-red-700 dark:text-red-300">
                  You have <span className="font-semibold">{summary.active_count} active restriction{summary.active_count > 1 ? "s" : ""}</span> on your record.
                  {summary.appeals_pending > 0
                    ? ` ${summary.appeals_pending} appeal${summary.appeals_pending > 1 ? "s" : ""} pending review.`
                    : " You can submit an appeal for eligible restrictions."
                  }
                </p>
                {restrictions.some((r) => r.is_active && (r.restriction_type === "bar_from_placements" || r.restriction_type === "temporary_suspension")) && (
                  <p className="text-xs font-medium text-red-800 dark:text-red-200">
                    ⚠ Active placement bar or suspension detected — you are currently blocked from applying to jobs.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <motion.div
            variants={shouldReduce ? undefined : staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {restrictions.map((r) => (
              <RestrictionCard
                key={r.restriction_id}
                restriction={r}
                onAppeal={handleAppealClick}
              />
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {/* ── Appeal Modal ── */}
      <AppealModal
        restriction={appealTarget}
        isOpen={appealTarget !== null}
        onClose={() => setAppealTarget(null)}
      />
    </div>
  )
}
