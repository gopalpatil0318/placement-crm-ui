import { z } from "zod";

// ========================
// SHARED CONSTANTS
// ========================

/** Admin-settable statuses only (no "pending" or "withdrawn") */
export const APPLICATION_STATUS_OPTIONS = [
    "under_review",
    "shortlisted",
    "rejected",
    "selected",
    "offered",
    "waitlisted",
] as const;

/** All possible application statuses (includes system/student-only) */
export const ALL_APPLICATION_STATUSES = [
    "pending",
    "under_review",
    "shortlisted",
    "rejected",
    "selected",
    "offered",
    "waitlisted",
    "withdrawn",
    "auto_withdrawn",
] as const;

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    under_review: "Under Review",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
    selected: "Selected",
    offered: "Offered",
    waitlisted: "Waitlisted",
    withdrawn: "Withdrawn",
    auto_withdrawn: "Auto-Withdrawn",
};

export const APPLICATION_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    pending:        { bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-500" },
    under_review:   { bg: "bg-cyan-50 dark:bg-cyan-900/20",      text: "text-cyan-700 dark:text-cyan-400",       dot: "bg-cyan-500" },
    shortlisted:    { bg: "bg-blue-50 dark:bg-blue-900/20",      text: "text-blue-700 dark:text-blue-400",       dot: "bg-blue-500" },
    rejected:       { bg: "bg-red-50 dark:bg-red-900/20",        text: "text-red-600 dark:text-red-400",         dot: "bg-red-400" },
    selected:       { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    offered:        { bg: "bg-purple-50 dark:bg-purple-900/20",  text: "text-purple-700 dark:text-purple-400",   dot: "bg-purple-500" },
    waitlisted:     { bg: "bg-orange-50 dark:bg-orange-900/20",  text: "text-orange-700 dark:text-orange-400",   dot: "bg-orange-500" },
    withdrawn:      { bg: "bg-gray-100 dark:bg-gray-800",        text: "text-gray-600 dark:text-gray-400",       dot: "bg-gray-400" },
    auto_withdrawn: { bg: "bg-gray-100 dark:bg-gray-800",        text: "text-gray-500 dark:text-gray-500",       dot: "bg-gray-400" },
};

/**
 * Valid status transitions (from → to[]).
 * `rejected` and `withdrawn` are terminal states.
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
    pending:        ["under_review", "shortlisted", "rejected"],
    under_review:   ["shortlisted", "rejected"],
    shortlisted:    ["selected", "waitlisted", "rejected"],
    selected:       ["offered", "waitlisted", "rejected"],
    offered:        ["rejected"],
    waitlisted:     ["shortlisted", "selected", "rejected"],
    rejected:       ["shortlisted", "under_review"],
    withdrawn:      [],
    auto_withdrawn: [],
};

// ========================
// SCHEMAS
// ========================

export const updateApplicationStatusSchema = z.object({
    application_status: z.enum(APPLICATION_STATUS_OPTIONS, {
        message: "Invalid application status",
    }),
    remarks: z.string().max(1000, "Remarks cannot exceed 1000 characters").optional().or(z.literal("")),
});

export const bulkUpdateStatusSchema = z.object({
    application_ids: z
        .array(z.string().uuid())
        .min(1, "At least one application must be selected")
        .max(100, "Cannot update more than 100 applications at once"),
    application_status: z.enum(APPLICATION_STATUS_OPTIONS, {
        message: "Invalid application status",
    }),
    remarks: z.string().max(1000, "Remarks cannot exceed 1000 characters").optional().or(z.literal("")),
});

// ========================
// EXPORTED TYPES
// ========================

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;
