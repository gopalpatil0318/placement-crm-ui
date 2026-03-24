import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { NotificationService } from "@/services/student/notification.service"
import {
  getNotificationLink,
  type StudentNotification,
  type StudentNotificationsResponse,
  type UnreadCountResponse,
} from "@/validators/NotificationSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useNotificationActions() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // ── Mark single notification as read ──
  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.markNotificationRead(notificationId),
    onSuccess: (_data, notificationId) => {
      // Check if the notification was actually unread before decrementing
      const allCaches = queryClient.getQueriesData<StudentNotificationsResponse>({
        queryKey: ["notifications", "student", "list"],
      })
      const wasUnread = allCaches.some(([, cached]) =>
        cached?.notifications.some(
          (n) => n.notification_id === notificationId && !n.is_read,
        ),
      )

      // Update is_read in all cached notification lists
      queryClient.setQueriesData<StudentNotificationsResponse>(
        { queryKey: ["notifications", "student", "list"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n.notification_id === notificationId
                ? { ...n, is_read: true, read_at: new Date().toISOString() }
                : n,
            ),
          }
        },
      )

      // Only decrement unread count if the notification was actually unread
      if (wasUnread) {
        queryClient.setQueryData<UnreadCountResponse>(
          queryKeys.notifications.studentUnreadCount(),
          (old) => {
            if (!old) return old
            return { unread_count: Math.max(0, old.unread_count - 1) }
          },
        )
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Failed to mark notification as read"
      const status = error instanceof ApiError ? error.status : undefined
      const title = status === 429 ? "Too Many Requests" : "Error"
      const description = status === 429 ? "You're acting too quickly. Please wait a moment." : message
      showToast({ type: "error", title, description })
    },
  })

  // ── Mark all notifications as read ──
  const markAllReadMutation = useMutation({
    mutationFn: () => NotificationService.markAllNotificationsRead(),
    onSuccess: (data) => {
      if (data.marked_count === 0) {
        showToast({
          type: "warning",
          title: "No Unread",
          description: "No unread notifications to mark.",
        })
        return
      }
      showToast({
        type: "success",
        title: "Done",
        description: `${data.marked_count} notification${data.marked_count === 1 ? "" : "s"} marked as read.`,
      })
      // Set badge to 0
      queryClient.setQueryData<UnreadCountResponse>(
        queryKeys.notifications.studentUnreadCount(),
        { unread_count: 0 },
      )
      // Optimistic: mark all cached notifications as read instantly
      queryClient.setQueriesData<StudentNotificationsResponse>(
        { queryKey: ["notifications", "student", "list"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            notifications: old.notifications.map((n) => ({
              ...n,
              is_read: true,
              read_at: n.read_at ?? new Date().toISOString(),
            })),
          }
        },
      )
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError
        ? error.message
        : "Failed to mark notifications as read"
      const status = error instanceof ApiError ? error.status : undefined
      const title = status === 429 ? "Too Many Requests" : "Error"
      const description = status === 429 ? "You're acting too quickly. Please wait a moment." : message
      showToast({ type: "error", title, description })
    },
  })

  // ── Click handler: mark read + deep-link navigate ──
  const handleNotificationClick = useCallback(
    (notification: StudentNotification) => {
      // Mark as read if unread
      if (!notification.is_read) {
        markReadMutation.mutate(notification.notification_id)
      }
      // Navigate to deep-link target
      const link = getNotificationLink(
        notification.related_entity_type,
        notification.related_entity_id,
      )
      if (link) {
        navigate(link)
      } else if (!notification.is_read) {
        showToast({ type: "success", title: "Read", description: "Notification marked as read." })
      }
    },
    [markReadMutation, navigate],
  )

  return {
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isPending,
    handleNotificationClick,
  }
}
