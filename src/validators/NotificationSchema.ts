import { z } from "zod/v4";

// ========================
// NOTIFICATION TYPES
// ========================

export const NOTIFICATION_TYPES = [
    "new_job_posted",
    "application_received",
    "application_status_changed",
    "round_scheduled",
    "round_result",
    "offer_received",
    "deadline_reminder",
    "restriction_applied",
    "restriction_removed",
    "training_enrollment",
    "training_completed",
    "profile_incomplete",
    "general",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
    new_job_posted: "New Job Posted",
    application_received: "Application Received",
    application_status_changed: "Application Status Changed",
    round_scheduled: "Round Scheduled",
    round_result: "Round Result",
    offer_received: "Offer Received",
    deadline_reminder: "Deadline Reminder",
    restriction_applied: "Restriction Applied",
    restriction_removed: "Restriction Removed",
    training_enrollment: "Training Enrollment",
    training_completed: "Training Completed",
    profile_incomplete: "Profile Incomplete",
    general: "General Announcement",
};

export const NOTIFICATION_TYPE_COLORS: Record<
    NotificationType,
    { bg: string; text: string; dot: string; iconBg: string }
> = {
    new_job_posted: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        text: "text-purple-700 dark:text-purple-400",
        dot: "bg-purple-500",
        iconBg: "bg-purple-100 dark:bg-purple-900/40",
    },
    application_received: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500",
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
    },
    application_status_changed: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500",
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
    },
    round_scheduled: {
        bg: "bg-teal-50 dark:bg-teal-900/20",
        text: "text-teal-700 dark:text-teal-400",
        dot: "bg-teal-500",
        iconBg: "bg-teal-100 dark:bg-teal-900/40",
    },
    round_result: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500",
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
    },
    offer_received: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    deadline_reminder: {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-700 dark:text-orange-400",
        dot: "bg-orange-500",
        iconBg: "bg-orange-100 dark:bg-orange-900/40",
    },
    restriction_applied: {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
        iconBg: "bg-red-100 dark:bg-red-900/40",
    },
    restriction_removed: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    training_enrollment: {
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        text: "text-indigo-700 dark:text-indigo-400",
        dot: "bg-indigo-500",
        iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
    },
    training_completed: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    profile_incomplete: {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-700 dark:text-orange-400",
        dot: "bg-orange-500",
        iconBg: "bg-orange-100 dark:bg-orange-900/40",
    },
    general: {
        bg: "bg-gray-50 dark:bg-gray-800/40",
        text: "text-gray-700 dark:text-gray-400",
        dot: "bg-gray-500",
        iconBg: "bg-gray-100 dark:bg-gray-800/60",
    },
};

// ========================
// RECIPIENT TYPES
// ========================

export const RECIPIENT_TYPES = ["student", "user"] as const;
export type RecipientType = (typeof RECIPIENT_TYPES)[number];

export const RECIPIENT_TYPE_LABELS: Record<RecipientType, string> = {
    student: "Students",
    user: "College Users",
};

// ========================
// RELATED ENTITY TYPES
// ========================

export const RELATED_ENTITY_TYPES = [
    "job",
    "application",
    "round",
    "placement",
    "restriction",
    "training",
    "enrollment",
    "student",
    "user",
] as const;

export type RelatedEntityType = (typeof RELATED_ENTITY_TYPES)[number];

// ========================
// SORT OPTIONS
// ========================

export const SORT_OPTIONS_NOTIFICATIONS = [
    { label: "Newest", sort_by: "created_at", sort_order: "desc" },
    { label: "Oldest", sort_by: "created_at", sort_order: "asc" },
] as const;

// ========================
// STUDENT STATUS & PROFILE STATUS
// ========================

export const STUDENT_STATUS_OPTIONS = ["active", "inactive", "graduated"] as const;
export const PROFILE_STATUS_OPTIONS = ["approved", "pending", "rejected"] as const;
export const USER_ROLE_OPTIONS = ["tpo", "hod", "teacher"] as const;

// ========================
// NOTIFICATION TEMPLATES
// ========================

export interface NotificationTemplate {
    name: string;
    notification_type: NotificationType;
    title: string;
    body: string;
    related_entity_type?: RelatedEntityType;
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
    {
        name: "New Job Alert",
        notification_type: "new_job_posted",
        title: "New Job Opportunity Available!",
        body: "A new job has been posted. Check the job details and apply before the deadline.",
        related_entity_type: "job",
    },
    {
        name: "Deadline Reminder",
        notification_type: "deadline_reminder",
        title: "Application Deadline Approaching",
        body: "Don't miss the application deadline! Apply by the closing date.",
        related_entity_type: "job",
    },
    {
        name: "Round Scheduled",
        notification_type: "round_scheduled",
        title: "Selection Round Scheduled",
        body: "A new selection round has been scheduled. Check your application for details.",
        related_entity_type: "round",
    },
    {
        name: "Round Results",
        notification_type: "round_result",
        title: "Round Results Published",
        body: "Your round results are now available. Check your application status.",
        related_entity_type: "round",
    },
    {
        name: "Offer Letter",
        notification_type: "offer_received",
        title: "Congratulations! You Have Received an Offer",
        body: "You have received a placement offer! Check your placements page for details.",
        related_entity_type: "placement",
    },
    {
        name: "Profile Reminder",
        notification_type: "profile_incomplete",
        title: "Complete Your Profile",
        body: "Your profile is incomplete. Companies can't shortlist you without a complete profile.",
    },
    {
        name: "Restriction Notice",
        notification_type: "restriction_applied",
        title: "Placement Restriction Applied",
        body: "A restriction has been placed on your account. Check your restrictions page for details.",
        related_entity_type: "restriction",
    },
    {
        name: "General Announcement",
        notification_type: "general",
        title: "",
        body: "",
    },
];

// ========================
// ZOD SCHEMAS
// ========================

export const sendNotificationSchema = z.object({
    recipient_type: z.enum(RECIPIENT_TYPES),
    recipient_ids: z.array(z.uuid()).min(1, "At least one recipient is required").max(100, "Maximum 100 recipients allowed"),
    title: z.string().trim().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters"),
    body: z.string().trim().max(3000, "Body must be at most 3000 characters").optional().or(z.literal("")),
    notification_type: z.enum(NOTIFICATION_TYPES),
    related_entity_type: z.enum(RELATED_ENTITY_TYPES).optional(),
    related_entity_id: z.uuid().optional(),
});

export const bulkFiltersSchema = z.object({
    recipient_type: z.enum(RECIPIENT_TYPES),
    dept_ids: z.array(z.uuid()).optional(),
    passout_years: z.array(z.number().int().min(2000).max(2100)).optional(),
    student_status: z.enum(STUDENT_STATUS_OPTIONS).optional(),
    profile_status: z.enum(PROFILE_STATUS_OPTIONS).optional(),
    is_profile_complete: z.boolean().optional(),
    user_roles: z.array(z.enum(USER_ROLE_OPTIONS)).optional(),
    exclude_ids: z.array(z.uuid()).max(500, "Maximum 500 exclude IDs allowed").optional(),
});

export const bulkNotificationSchema = z.object({
    title: z.string().trim().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters"),
    body: z.string().trim().max(3000, "Body must be at most 3000 characters").optional().or(z.literal("")),
    notification_type: z.enum(NOTIFICATION_TYPES),
    related_entity_type: z.enum(RELATED_ENTITY_TYPES).optional(),
    related_entity_id: z.uuid().optional(),
    filters: bulkFiltersSchema,
});

// ========================
// DATA INTERFACES
// ========================

export interface SentNotification {
    title: string;
    body: string | null;
    notification_type: NotificationType;
    recipient_type: RecipientType;
    related_entity_type: RelatedEntityType | null;
    related_entity_id: string | null;
    sent_at: string;
    total_recipients: number;
    read_count: number;
    unread_count: number;
}

export interface NotificationSummary {
    total_sent: number;
    unique_recipients: number;
    total_read: number;
    total_unread: number;
    by_type: Partial<Record<NotificationType, number>>;
}

export interface SendNotificationPayload {
    recipient_type: RecipientType;
    recipient_ids: string[];
    title: string;
    body?: string;
    notification_type: NotificationType;
    related_entity_type?: RelatedEntityType;
    related_entity_id?: string;
}

export interface BulkNotificationFilters {
    recipient_type: RecipientType;
    dept_ids?: string[];
    passout_years?: number[];
    student_status?: string;
    profile_status?: string;
    is_profile_complete?: boolean;
    user_roles?: string[];
    exclude_ids?: string[];
}

export interface BulkNotificationPayload {
    title: string;
    body?: string;
    notification_type: NotificationType;
    related_entity_type?: RelatedEntityType;
    related_entity_id?: string;
    filters: BulkNotificationFilters;
}

export interface SendNotificationResponse {
    sent_count: number;
    invalid_count: number;
    notification_type: NotificationType;
    recipient_type: RecipientType;
}

export interface BulkNotificationResponse {
    sent_count: number;
    skipped_count: number;
    total_eligible: number;
    notification_type: NotificationType;
    recipient_type: RecipientType;
}

export interface NotificationFilters {
    notification_type?: NotificationType;
    recipient_type?: RecipientType;
    search?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ========================
// STUDENT NOTIFICATION TYPES
// ========================

export interface StudentNotification {
    notification_id: string;
    title: string;
    body: string | null;
    notification_type: NotificationType;
    related_entity_type: string | null;
    related_entity_id: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

export interface StudentNotificationsResponse {
    notifications: StudentNotification[];
    pagination: Pagination;
}

export interface UnreadCountResponse {
    unread_count: number;
}

export interface MarkAllReadResponse {
    marked_count: number;
}

export type ReadFilter = "all" | "unread" | "read";

export interface StudentNotificationFilters {
    is_read?: boolean;
    notification_type?: NotificationType;
    sort_order?: "asc" | "desc";
    page?: number;
    limit?: number;
}

// ========================
// NOTIFICATION ICON MAP (Lucide component references)
// ========================

import {
    Briefcase,
    ClipboardCheck,
    RefreshCw,
    Calendar,
    BarChart3,
    PartyPopper,
    Clock,
    Ban,
    CheckCircle,
    BookOpen,
    GraduationCap,
    AlertTriangle,
    Megaphone,
} from "lucide-react";
import type { ComponentType } from "react";

export const NOTIFICATION_TYPE_ICONS: Record<
    NotificationType,
    ComponentType<{ size?: number; className?: string }>
> = {
    new_job_posted: Briefcase,
    application_received: ClipboardCheck,
    application_status_changed: RefreshCw,
    round_scheduled: Calendar,
    round_result: BarChart3,
    offer_received: PartyPopper,
    deadline_reminder: Clock,
    restriction_applied: Ban,
    restriction_removed: CheckCircle,
    training_enrollment: BookOpen,
    training_completed: GraduationCap,
    profile_incomplete: AlertTriangle,
    general: Megaphone,
};

// ========================
// DEEP-LINK ROUTING MAP
// ========================

/**
 * Maps notification entity types to student-side route templates.
 * `:id` is replaced with `related_entity_id` at runtime.
 */
export const DEEP_LINK_MAP: Record<string, string> = {
    job: "/student/jobs/:id",
    application: "/student/applications/:id",
    round: "/student/applications",
    placement: "/student/placements/:id",
    restriction: "/student/restrictions",
    training: "/student/trainings/:id",
    enrollment: "/student/trainings/:id",
};

/** Build a navigation path from a notification's entity type & id */
export function getNotificationLink(
    entityType: string | null,
    entityId: string | null,
): string | null {
    if (!entityType) return null;
    const template = DEEP_LINK_MAP[entityType];
    if (!template) return null;
    if (entityId && template.includes(":id")) return template.replace(":id", entityId);
    return template.includes(":id") ? null : template;
}

// ========================
// RELATIVE TIME HELPER
// ========================

export function formatRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
