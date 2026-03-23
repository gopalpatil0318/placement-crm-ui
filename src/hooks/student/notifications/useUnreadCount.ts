import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { NotificationService } from "@/services/student/notification.service"

// ─── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Polls the lightweight unread count endpoint every 30 seconds.
 * React Query handles tab-visibility pause via `refetchIntervalInBackground: false`.
 */
export function useUnreadCount() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.studentUnreadCount(),
    queryFn: () => NotificationService.getUnreadCount(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })

  const unreadCount = data?.unread_count ?? 0
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount)

  return {
    unreadCount,
    badgeLabel,
    isLoading,
  }
}
