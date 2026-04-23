import { z } from "zod/v4";

// ========================
// RESTRICTION TYPE OPTIONS
// ========================

export const RESTRICTION_TYPE_OPTIONS = [
    "bar_from_placements",
    "bar_from_company",
    "probation",
    "warning",
    "temporary_suspension",
] as const;

export type RestrictionType = (typeof RESTRICTION_TYPE_OPTIONS)[number];

export const RESTRICTION_TYPE_LABELS: Record<RestrictionType, string> = {
    bar_from_placements: "🚫 Barred from Placements",
    bar_from_company: "🏢 Barred from Company",
    probation: "⚠️ On Probation",
    warning: "📋 Warning",
    temporary_suspension: "⏸️ Temporary Suspension",
};

/** Whether this restriction type blocks job applications */
export const BLOCKING_TYPES: ReadonlySet<RestrictionType> = new Set([
    "bar_from_placements",
    "bar_from_company",
    "temporary_suspension",
]);

export const RESTRICTION_TYPE_COLORS: Record<
    RestrictionType,
    { bg: string; text: string; dot: string; border: string }
> = {
    bar_from_placements: {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
        border: "border-red-200 dark:border-red-800/40",
    },
    bar_from_company: {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-700 dark:text-orange-400",
        dot: "bg-orange-500",
        border: "border-orange-200 dark:border-orange-800/40",
    },
    probation: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
        border: "border-amber-200 dark:border-amber-800/40",
    },
    warning: {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        text: "text-yellow-700 dark:text-yellow-400",
        dot: "bg-yellow-500",
        border: "border-yellow-200 dark:border-yellow-800/40",
    },
    temporary_suspension: {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
        border: "border-red-200 dark:border-red-800/40",
    },
};

// ========================
// RESTRICTION SEVERITY
// ========================

export const RESTRICTION_SEVERITY: Record<RestrictionType, "high" | "medium" | "low"> = {
    bar_from_placements: "high",
    bar_from_company: "high",
    temporary_suspension: "high",
    probation: "medium",
    warning: "low",
};

// ========================
// STATUS FILTER TABS
// ========================

export const RESTRICTION_STATUS_TABS = ["all", "active", "resolved"] as const;
export type RestrictionStatusFilter = (typeof RESTRICTION_STATUS_TABS)[number];

export const RESTRICTION_STATUS_LABELS: Record<RestrictionStatusFilter, string> = {
    all: "All",
    active: "Active",
    resolved: "Resolved",
};

// ========================
// SORT OPTIONS
// ========================

export const RESTRICTION_SORT_OPTIONS = [
    { value: "created_at", label: "Recently Added" },
    { value: "applied_on", label: "Applied Date" },
    { value: "valid_until", label: "Expiry Date" },
    { value: "restriction_type", label: "Type" },
] as const;

export type RestrictionSortField = (typeof RESTRICTION_SORT_OPTIONS)[number]["value"];

// ========================
// DATA INTERFACES
// ========================

export interface StudentRestriction {
    restriction_id: string
    restriction_type: RestrictionType
    reason: string
    details: string | null
    applied_on: string
    valid_until: string | null
    is_active: boolean
    restricted_by_name: string
    appeal_submitted: boolean
    appeal_notes: string | null
    appeal_resolved_at: string | null
    resolved_by_name: string | null
    is_expired: boolean
    can_appeal: boolean
    company_id: string | null
    company_name: string | null
    created_at: string
    updated_at: string
}

export interface RestrictionSummary {
    total_restrictions: number
    active_count: number
    resolved_count: number
    appeals_submitted: number
    appeals_resolved: number
    appeals_pending: number
}

export interface RestrictionFilters {
    is_active?: string
    restriction_type?: RestrictionType
    sort_by?: RestrictionSortField
    sort_order?: "asc" | "desc"
    page?: number
    limit?: number
}

// ========================
// ZOD SCHEMAS
// ========================

export const appealRestrictionSchema = z.object({
    appeal_notes: z
        .string()
        .trim()
        .min(10, "Appeal must be at least 10 characters — please explain clearly")
        .max(2000, "Appeal cannot exceed 2000 characters"),
});

export type AppealRestrictionInput = z.infer<typeof appealRestrictionSchema>;

// ========================
// COLLEGE ADMIN — ADD RESTRICTION SCHEMA
// ========================

export const addRestrictionSchema = z.object({
    restriction_type: z.enum(RESTRICTION_TYPE_OPTIONS, {
        error: "Please select a restriction type",
    }),
    reason: z
        .string()
        .min(5, "Reason must be at least 5 characters")
        .max(1000, "Reason cannot exceed 1000 characters"),
    details: z
        .string()
        .max(2000, "Details cannot exceed 2000 characters")
        .optional()
        .or(z.literal("")),
    valid_until: z
        .string()
        .optional()
        .or(z.literal("")),
    company_id: z
        .uuid({ error: "Company ID must be a valid UUID" })
        .optional()
        .or(z.literal("")),
});

export type AddRestrictionInput = z.infer<typeof addRestrictionSchema>;

// ========================
// COLLEGE ADMIN — UPDATE RESTRICTION SCHEMA
// ========================

export const updateRestrictionSchema = z.object({
    reason: z
        .string()
        .min(5, "Reason must be at least 5 characters")
        .max(1000, "Reason cannot exceed 1000 characters")
        .optional()
        .or(z.literal("")),
    details: z
        .string()
        .max(2000, "Details cannot exceed 2000 characters")
        .optional()
        .or(z.literal("")),
    valid_until: z
        .string()
        .optional()
        .or(z.literal("")),
});

export type UpdateRestrictionInput = z.infer<typeof updateRestrictionSchema>;

// ========================
// COLLEGE ADMIN — DATA INTERFACES
// ========================

export interface CollegeRestrictionListItem {
    restriction_id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    dept_name: string;
    student_passout_year: number;
    restriction_type: RestrictionType;
    reason: string;
    details: string | null;
    restricted_by_name: string;
    applied_on: string;
    valid_until: string | null;
    is_active: boolean;
    appeal_submitted: boolean;
    resolved_by_name: string | null;
    company_id: string | null;
    company_name: string | null;
    created_at: string;
}

export interface CollegeStudentRestrictionsResponse {
    student: {
        student_id: string;
        student_name: string;
        student_email: string;
        student_passout_year: number;
        dept_name: string;
    };
    total_restrictions: number;
    active_restrictions: number;
    restrictions: StudentRestriction[];
}

export interface CollegeRestrictionFilters {
    passout_year: number;
    restriction_type?: RestrictionType;
    is_active?: string;
    search?: string;
    sort_by?: RestrictionSortField;
    sort_order?: "asc" | "desc";
    page?: number;
    limit?: number;
}
