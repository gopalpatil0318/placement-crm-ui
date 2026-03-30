import { useMemo, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { useNotifications } from "@/hooks/student/notifications/useNotifications"
import { useUnreadCount } from "@/hooks/student/notifications/useUnreadCount"
import { useNotificationActions } from "@/hooks/student/notifications/useNotificationActions"
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_COLORS,
  formatRelativeTime,
  type StudentNotification,
  type NotificationType,
  type ReadFilter,
} from "@/validators/NotificationSchema"

// ─── Read Filter Tabs ───────────────────────────────────────────────────────────

const READ_TABS: { key: ReadFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
]

// ─── Component ──────────────────────────────────────────────────────────────────

export default function NotificationCenter() {
  const shouldReduce = useReducedMotion()
  const { unreadCount } = useUnreadCount()
  const {
    notifications,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    readFilter,
    typeFilter,
    sortOrder,
    page,
    handleReadFilterChange,
    handleTypeFilterChange,
    handleSortOrderChange,
    handlePageChange,
  } = useNotifications()
  const { handleNotificationClick, markAllRead, isMarkingAllRead } =
    useNotificationActions()

  // ── Pagination numbers ──
  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages
    const current = pagination.page
    const pages: (number | "...")[] = []
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push("...")
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (current < total - 2) pages.push("...")
      pages.push(total)
    }
    return pages
  }, [pagination.totalPages, pagination.page])

  const onPageChange = useCallback((newPage: number) => {
    handlePageChange(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [handlePageChange])

  const Wrapper = shouldReduce ? "div" : motion.div
  const wrapperProps = shouldReduce
    ? {}
    : { variants: staggerContainer, initial: "hidden", animate: "visible" }
  const itemMotion = shouldReduce ? {} : { variants: staggerItem }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.total} total
            {unreadCount > 0 && (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                {" · "}{unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAllRead()}
          disabled={unreadCount === 0 || isMarkingAllRead}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isMarkingAllRead ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CheckCheck size={15} />
          )}
          Mark all as read
        </button>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
        <div className="px-5 py-4 flex items-center gap-4 flex-wrap">
          {/* Read filter tabs */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5" role="tablist" aria-label="Filter by read status">
            {READ_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                id={`notif-tab-${tab.key}`}
                role="tab"
                aria-selected={readFilter === tab.key}
                aria-controls="notif-tabpanel"
                onClick={() => handleReadFilterChange(tab.key)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  readFilter === tab.key
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
                {tab.key === "unread" && unreadCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-400 dark:text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) =>
                handleTypeFilterChange(
                  (e.target.value as NotificationType) || "",
                )
              }
              aria-label="Filter by notification type"
              className="text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-1.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              <option value="">All types</option>
              {NOTIFICATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {NOTIFICATION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <button
            type="button"
            onClick={() =>
              handleSortOrderChange(sortOrder === "desc" ? "asc" : "desc")
            }
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <ArrowUpDown size={14} />
            {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </button>

          {/* Fetching indicator */}
          {isFetching && !isLoading && (
            <Loader2 size={14} className="animate-spin text-indigo-500 ml-auto" />
          )}
        </div>

        {/* ── Notification List ── */}
        <div id="notif-tabpanel" role="tabpanel" aria-labelledby={`notif-tab-${readFilter}`} className="border-t border-gray-100 dark:border-gray-800">
          {isLoading && <SkeletonList />}
          {!isLoading && isError && <ErrorState onRetry={() => refetch()} />}
          {!isLoading && !isError && notifications.length === 0 && (
            <EmptyState hasFilters={readFilter !== "all" || typeFilter !== ""} />
          )}
          {!isLoading && !isError && notifications.length > 0 && (
            <Wrapper {...wrapperProps}>
              {notifications.map((notification) => {
                const ItemWrapper = shouldReduce ? "div" : motion.div
                return (
                  <ItemWrapper key={notification.notification_id} {...itemMotion}>
                    <NotificationRow
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  </ItemWrapper>
                )
              })}
            </Wrapper>
          )}
        </div>

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3.5 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {(page - 1) * pagination.limit + 1}–
                {Math.min(page * pagination.limit, pagination.total)}
              </span>{" "}
              of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} className="text-gray-500" />
              </button>
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${p}-${idx}`}
                    className="px-1 text-xs text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={`h-8 min-w-8 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      page === p
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Notification Row ───────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  onClick,
}: Readonly<{
  notification: StudentNotification
  onClick: (n: StudentNotification) => void
}>) {
  const { notification_type: type } = notification
  const Icon = NOTIFICATION_TYPE_ICONS[type] ?? Bell
  const colors = NOTIFICATION_TYPE_COLORS[type] ?? NOTIFICATION_TYPE_COLORS.general

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`w-full flex items-start gap-4 px-5 py-4 text-left transition-colors cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800/40 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 ${
        notification.is_read
          ? ""
          : "bg-indigo-50/30 dark:bg-indigo-950/15"
      }`}
    >
      {/* Icon */}
      <div
        className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${colors.iconBg}`}
      >
        <Icon size={18} className={colors.text} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={`text-sm leading-snug ${
              notification.is_read
                ? "font-normal text-gray-700 dark:text-gray-300"
                : "font-semibold text-gray-900 dark:text-gray-100"
            }`}
          >
            {notification.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
            )}
            <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {formatRelativeTime(notification.created_at)}
            </span>
          </div>
        </div>
        {notification.body && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.body}
          </p>
        )}
        {/* Type badge */}
        <span
          className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-medium ${colors.bg} ${colors.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
          {NOTIFICATION_TYPE_LABELS[type]}
        </span>
      </div>
    </button>
  )
}

// ─── Skeleton List ──────────────────────────────────────────────────────────────

const SKELETON_KEYS_6 = ["sk-c-1", "sk-c-2", "sk-c-3", "sk-c-4", "sk-c-5", "sk-c-6"] as const;

function SkeletonList() {
  return (
    <div>
      {SKELETON_KEYS_6.map((key) => (
        <div
          key={key}
          className="flex items-start gap-4 px-5 py-4 motion-safe:animate-pulse border-b border-gray-50 dark:border-gray-800/50 last:border-b-0"
        >
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-14" />
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Error State ────────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-500 dark:text-red-400" />
      </div>
      <p className="text-base font-medium text-gray-600 dark:text-gray-400">
        Failed to load notifications
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 text-center max-w-xs">
        Something went wrong. Please check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  )
}

// ─── Empty States ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: Readonly<{ hasFilters: boolean }>) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        {hasFilters ? (
          <Search size={24} className="text-gray-400 dark:text-gray-500" />
        ) : (
          <Bell size={24} className="text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <p className="text-base font-medium text-gray-600 dark:text-gray-400">
        {hasFilters ? "No matching notifications" : "No notifications yet"}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 text-center max-w-xs">
        {hasFilters
          ? "Try adjusting your filters to see more results."
          : "We'll notify you when there are updates about jobs, applications, and more."}
      </p>
    </div>
  )
}
