import { useEffect, useCallback, type RefObject } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Bell, CheckCheck, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { queryKeys } from "@/lib/queryKeys"
import { NotificationService } from "@/services/student/notification.service"
import { useNotificationActions } from "@/hooks/student/notifications/useNotificationActions"
import {
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_COLORS,
  formatRelativeTime,
  type StudentNotification,
  type NotificationType,
} from "@/validators/NotificationSchema"

// ─── Component ──────────────────────────────────────────────────────────────────

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  unreadCount: number
  containerRef: RefObject<HTMLDivElement | null>
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  unreadCount,
  containerRef,
}: NotificationDropdownProps) {
  const shouldReduce = useReducedMotion()
  const { handleNotificationClick, markAllRead, isMarkingAllRead } =
    useNotificationActions()

  // Fetch 8 most recent when open
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.notifications.studentList({ limit: 8, sort_order: "desc" }),
    queryFn: () =>
      NotificationService.getMyNotifications({ limit: 8, sort_order: "desc" }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: isOpen,
  })

  const notifications = data?.notifications ?? []
  const location = useLocation()

  // ── Auto-close on route change ──
  useEffect(() => {
    if (isOpen) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // ── Close on click outside ──
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose, containerRef])

  // ── Close on Escape ──
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const handleItemClick = useCallback(
    (notification: StudentNotification) => {
      onClose()
      handleNotificationClick(notification)
    },
    [onClose, handleNotificationClick],
  )

  const motionProps = shouldReduce
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95, y: -8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -8 },
        transition: { duration: 0.15, ease: "easeOut" as const },
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...motionProps}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-32px)] rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 shadow-xl shadow-gray-200/40 dark:shadow-black/40 z-50 overflow-hidden"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  aria-label={`${unreadCount} unread notifications`}
                  className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold"
                >                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={unreadCount === 0 || isMarkingAllRead}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isMarkingAllRead ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCheck size={13} />
              )}
              Mark all read
            </button>
          </div>

          {/* ── List ── */}
          <div className="max-h-[400px] overflow-y-auto" aria-live="polite">
            {isLoading ? (
              <SkeletonItems />
            ) : isError ? (
              <ErrorDropdown onRetry={refetch} />
            ) : notifications.length === 0 ? (
              <EmptyDropdown />
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.notification_id}
                  notification={notification}
                  onClick={handleItemClick}
                />
              ))
            )}
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/student/notifications"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
            >
              View all notifications
              <ChevronRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Notification Item ──────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onClick,
}: {
  notification: StudentNotification
  onClick: (n: StudentNotification) => void
}) {
  const type = notification.notification_type as NotificationType
  const Icon = NOTIFICATION_TYPE_ICONS[type] ?? Bell
  const colors = NOTIFICATION_TYPE_COLORS[type] ?? NOTIFICATION_TYPE_COLORS.general

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
        !notification.is_read
          ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-l-[3px] border-l-indigo-500"
          : "border-l-[3px] border-l-transparent"
      }`}
    >
      {/* Icon */}
      <div
        className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${colors.iconBg}`}
      >
        <Icon size={16} className={colors.text} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug ${
            !notification.is_read
              ? "font-semibold text-gray-900 dark:text-gray-100"
              : "font-normal text-gray-700 dark:text-gray-300"
          } line-clamp-1`}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {notification.body}
          </p>
        )}
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-indigo-500" />
      )}
    </button>
  )
}

// ─── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonItems() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-5 py-3.5 motion-safe:animate-pulse">
          <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Error ──────────────────────────────────────────────────────────────────────

function ErrorDropdown({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6">
      <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
        <AlertCircle size={22} className="text-red-500 dark:text-red-400" />
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Couldn&apos;t load notifications
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Check your connection and try again
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
      >
        <RefreshCw size={13} />
        Retry
      </button>
    </div>
  )
}

// ─── Empty ──────────────────────────────────────────────────────────────────────

function EmptyDropdown() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6">
      <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
        <Bell size={22} className="text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        No notifications yet
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        We&apos;ll notify you when something arrives
      </p>
    </div>
  )
}
