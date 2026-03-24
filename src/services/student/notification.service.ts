import api from "@/lib/api"
import type {
  StudentNotification,
  StudentNotificationsResponse,
  StudentNotificationFilters,
  UnreadCountResponse,
  MarkAllReadResponse,
  Pagination,
} from "@/validators/NotificationSchema"

// ─── Service ────────────────────────────────────────────────────────────────────

export const NotificationService = {
  /** API #168 — List notifications with optional filters */
  getMyNotifications: async (
    filters: StudentNotificationFilters = {},
  ): Promise<StudentNotificationsResponse> => {
    const params = new URLSearchParams()
    if (filters.is_read !== undefined) params.append("is_read", String(filters.is_read))
    if (filters.notification_type) params.append("notification_type", filters.notification_type)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.limit) params.append("limit", String(filters.limit))

    const queryStr = params.toString()
    const url = queryStr
      ? `/student/get_my_notifications?${queryStr}`
      : "/student/get_my_notifications"
    const response = await api.get(url)

    return {
      notifications: response.data.data as StudentNotification[],
      pagination: response.data.pagination as Pagination,
    }
  },

  /** API #169 — Lightweight unread badge count */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get("/student/get_unread_notification_count")
    return response.data.data as UnreadCountResponse
  },

  /** API #170 — Mark single notification as read */
  markNotificationRead: async (
    notificationId: string,
  ): Promise<StudentNotification> => {
    const response = await api.patch(
      `/student/mark_notification_read/${notificationId}`,
    )
    return response.data.data as StudentNotification
  },

  /** API #171 — Mark all unread notifications as read */
  markAllNotificationsRead: async (): Promise<MarkAllReadResponse> => {
    const response = await api.patch("/student/mark_all_notifications_read")
    return response.data.data as MarkAllReadResponse
  },
}
