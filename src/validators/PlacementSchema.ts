import { z } from "zod/v4";
import {
    Briefcase,
    CheckCircle,
    XCircle,
    PartyPopper,
    Ban,
} from "lucide-react";
import type { ComponentType } from "react";

// ========================
// PLACEMENT TYPE OPTIONS
// ========================

export const PLACEMENT_TYPE_OPTIONS = ["full-time", "internship", "both"] as const;

export type PlacementType = (typeof PLACEMENT_TYPE_OPTIONS)[number];

export const PLACEMENT_TYPE_LABELS: Record<PlacementType, string> = {
    "full-time": "Full-Time",
    internship: "Internship",
    both: "Both",
};

// ========================
// PLACEMENT STATUS CONFIG
// ========================

export const PLACEMENT_STATUS_OPTIONS = [
    "offered",
    "accepted",
    "rejected",
    "joined",
    "cancelled",
] as const;

export type PlacementStatus = (typeof PLACEMENT_STATUS_OPTIONS)[number];

export const PLACEMENT_STATUS_LABELS: Record<PlacementStatus, string> = {
    offered: "Offered",
    accepted: "Accepted",
    rejected: "Rejected",
    joined: "Joined",
    cancelled: "Cancelled by College",
};

export const PLACEMENT_STATUS_COLORS: Record<
    PlacementStatus,
    { bg: string; text: string; dot: string }
> = {
    offered:   { bg: "bg-cyan-50 dark:bg-cyan-900/20",      text: "text-cyan-700 dark:text-cyan-400",       dot: "bg-cyan-500" },
    accepted:  { bg: "bg-emerald-50 dark:bg-emerald-900/20",  text: "text-emerald-700 dark:text-emerald-400",  dot: "bg-emerald-500" },
    joined:    { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    rejected:  { bg: "bg-red-50 dark:bg-red-900/20",        text: "text-red-600 dark:text-red-400",         dot: "bg-red-400" },
    cancelled: { bg: "bg-gray-100 dark:bg-gray-800",         text: "text-gray-600 dark:text-gray-400",       dot: "bg-gray-400" },
};

// ========================
// ACCEPTANCE STATUS CONFIG
// ========================

export const ACCEPTANCE_STATUS_OPTIONS = ["pending", "accepted", "rejected"] as const;

export type AcceptanceStatus = (typeof ACCEPTANCE_STATUS_OPTIONS)[number];

export const ACCEPTANCE_STATUS_LABELS: Record<AcceptanceStatus, string> = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
};

// ========================
// STATUS TRANSITIONS (from API docs)
// ========================

export const PLACEMENT_STATUS_TRANSITIONS: Record<PlacementStatus, PlacementStatus[]> = {
    offered: ["accepted", "rejected", "cancelled"],
    accepted: ["joined", "cancelled"],
    joined: ["cancelled"],
    rejected: [],
    cancelled: [],
};

// ========================
// ZOD SCHEMAS
// ========================

const urlOptional = z
    .string()
    .max(2000, "URL cannot exceed 2000 characters")
    .refine(
        (val) => val === "" || /^https?:\/\/.+/i.test(val),
        "Must be a valid URL starting with http:// or https://",
    )
    .optional()
    .or(z.literal(""));

export const createPlacementSchema = z
    .object({
        application_id: z
            .string()
            .trim()
            .min(1, "Application ID is required"),
        placement_type: z.enum(PLACEMENT_TYPE_OPTIONS, {
            error: "Select a placement type",
        }),
        fulltime_package: z
            .string()
            .optional()
            .or(z.literal("")),
        fulltime_designation: z
            .string()
            .max(200, "Designation cannot exceed 200 characters")
            .optional()
            .or(z.literal("")),
        fulltime_joining_date: z.string().optional().or(z.literal("")),
        internship_stipend: z
            .string()
            .optional()
            .or(z.literal("")),
        internship_duration: z
            .string()
            .max(100, "Duration cannot exceed 100 characters")
            .optional()
            .or(z.literal("")),
        internship_start_date: z.string().optional().or(z.literal("")),
        offer_letter_url: urlOptional,
    })
    .refine(
        (data) => {
            if (data.placement_type === "full-time" || data.placement_type === "both") {
                return data.fulltime_package !== undefined && data.fulltime_package !== "";
            }
            return true;
        },
        { message: "Package is required for full-time/both placement", path: ["fulltime_package"] },
    )
    .refine(
        (data) => {
            if (data.placement_type === "internship" || data.placement_type === "both") {
                return data.internship_stipend !== undefined && data.internship_stipend !== "";
            }
            return true;
        },
        { message: "Stipend is required for internship/both placement", path: ["internship_stipend"] },
    )
    .refine(
        (data) => {
            if (data.fulltime_package && data.fulltime_package !== "") {
                const num = Number(data.fulltime_package);
                return !isNaN(num) && num >= 0;
            }
            return true;
        },
        { message: "Package must be a non-negative number", path: ["fulltime_package"] },
    )
    .refine(
        (data) => {
            if (data.internship_stipend && data.internship_stipend !== "") {
                const num = Number(data.internship_stipend);
                return !isNaN(num) && num >= 0;
            }
            return true;
        },
        { message: "Stipend must be a non-negative number", path: ["internship_stipend"] },
    );

export const updatePlacementSchema = z
    .object({
        placement_type: z
            .enum(PLACEMENT_TYPE_OPTIONS)
            .optional(),
        fulltime_package: z
            .string()
            .optional()
            .or(z.literal("")),
        fulltime_designation: z
            .string()
            .max(200, "Designation cannot exceed 200 characters")
            .optional()
            .or(z.literal("")),
        fulltime_joining_date: z.string().optional().or(z.literal("")),
        internship_stipend: z
            .string()
            .optional()
            .or(z.literal("")),
        internship_duration: z
            .string()
            .max(100, "Duration cannot exceed 100 characters")
            .optional()
            .or(z.literal("")),
        internship_start_date: z.string().optional().or(z.literal("")),
        offer_letter_url: urlOptional,
    })
    .refine(
        (data) => {
            const fields = Object.values(data).filter(
                (v) => v !== undefined && v !== "",
            );
            return fields.length >= 1;
        },
        { message: "At least one field must be provided", path: ["placement_type"] },
    )
    .refine(
        (data) => {
            if (data.fulltime_package && data.fulltime_package !== "") {
                const num = Number(data.fulltime_package);
                return !isNaN(num) && num >= 0;
            }
            return true;
        },
        { message: "Package must be a non-negative number", path: ["fulltime_package"] },
    )
    .refine(
        (data) => {
            if (data.internship_stipend && data.internship_stipend !== "") {
                const num = Number(data.internship_stipend);
                return !isNaN(num) && num >= 0;
            }
            return true;
        },
        { message: "Stipend must be a non-negative number", path: ["internship_stipend"] },
    );

export const verifyOfferLetterSchema = z.object({
    offer_letter_verified: z.boolean(),
    remarks: z
        .string()
        .max(2000, "Remarks cannot exceed 2000 characters")
        .optional()
        .or(z.literal("")),
});

export const updatePlacementStatusSchema = z.object({
    placement_status: z.enum(PLACEMENT_STATUS_OPTIONS, {
        error: "Select a valid placement status",
    }),
    remarks: z
        .string()
        .max(2000, "Remarks cannot exceed 2000 characters")
        .optional()
        .or(z.literal("")),
});

// ========================
// TYPES
// ========================

export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;
export type VerifyOfferLetterInput = z.infer<typeof verifyOfferLetterSchema>;
export type UpdatePlacementStatusInput = z.infer<typeof updatePlacementStatusSchema>;

// ========================
// STUDENT-SIDE INTERFACES
// ========================

export interface StudentPlacement {
    placement_id: string;
    application_id: string;
    placement_type: PlacementType;
    fulltime_package: number | null;
    fulltime_designation: string | null;
    fulltime_joining_date: string | null;
    internship_stipend: number | null;
    internship_duration: string | null;
    internship_start_date: string | null;
    offer_letter_url: string | null;
    offer_letter_verified: boolean;
    placement_status: PlacementStatus;
    acceptance_status: AcceptanceStatus;
    passout_year: number;
    created_at: string;
    updated_at: string;
    company_id: string;
    company_name: string;
    company_website: string | null;
    industry_type: string | null;
    job_id: string;
    job_title: string;
    job_type: string;
    job_location: string | null;
    position_id: string | null;
    position_name: string | null;
}

export interface PlacementStatusSummary {
    total: number;
    offered: number;
    accepted: number;
    rejected: number;
    joined: number;
    cancelled: number;
}

export interface PlacementPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface StudentPlacementsResponse {
    placements: StudentPlacement[];
    statusSummary: PlacementStatusSummary;
    pagination: PlacementPagination;
}

export interface AcceptPlacementResponse {
    placement_id: string;
    placement_status: "accepted";
    acceptance_status: "accepted";
    previous_status: string;
    previous_acceptance: string;
    updated_at: string;
    job_title: string;
    company_name: string;
    position_name: string | null;
    fulltime_package: number | null;
    fulltime_designation: string | null;
    fulltime_joining_date: string | null;
    internship_stipend: number | null;
}

export interface RejectPlacementResponse {
    placement_id: string;
    placement_status: "rejected";
    acceptance_status: "rejected";
    previous_status: string;
    previous_acceptance: string;
    rejection_reason: string;
    updated_at: string;
    job_title: string;
    company_name: string;
    position_name: string | null;
}

export interface PlacementFilters {
    placement_status?: PlacementStatus;
    placement_type?: PlacementType | "both";
    acceptance_status?: AcceptanceStatus;
    sort_by?: "created_at" | "fulltime_package" | "placement_status" | "company_name";
    sort_order?: "asc" | "desc";
    page?: number;
    limit?: number;
}

// ========================
// STUDENT-SIDE ZOD SCHEMAS
// ========================

export const rejectPlacementSchema = z.object({
    rejection_reason: z
        .string()
        .trim()
        .min(3, "Rejection reason must be at least 3 characters")
        .max(1000, "Rejection reason must be at most 1000 characters"),
});

export type RejectPlacementFormData = z.infer<typeof rejectPlacementSchema>;

// ========================
// STATUS FILTER TABS
// ========================

export type PlacementStatusFilter = PlacementStatus | "all";

export const PLACEMENT_STATUS_TABS: { key: PlacementStatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "offered", label: "Offered" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
    { key: "joined", label: "Joined" },
    { key: "cancelled", label: "Cancelled" },
];

// ========================
// SORT OPTIONS
// ========================

export const PLACEMENT_SORT_OPTIONS: { value: PlacementFilters["sort_by"]; label: string }[] = [
    { value: "created_at", label: "Date" },
    { value: "fulltime_package", label: "Package" },
    { value: "company_name", label: "Company" },
    { value: "placement_status", label: "Status" },
];

// ========================
// TYPE FILTER OPTIONS
// ========================

export type PlacementTypeFilter = PlacementType | "all";

export const PLACEMENT_TYPE_FILTER_OPTIONS: { value: PlacementTypeFilter; label: string }[] = [
    { value: "all", label: "All Types" },
    { value: "full-time", label: "Full-Time" },
    { value: "internship", label: "Internship" },
    { value: "both", label: "Both" },
];

// ========================
// STUDENT-SIDE ICONS
// ========================

export const PLACEMENT_STATUS_ICONS: Record<
    PlacementStatus,
    ComponentType<{ size?: number; className?: string }>
> = {
    offered: Briefcase,
    accepted: CheckCircle,
    rejected: XCircle,
    joined: PartyPopper,
    cancelled: Ban,
};

// ========================
// STUDENT-SIDE HELPERS
// ========================

/** Format salary in Indian ₹ notation (LPA) */
export function formatPackage(amount: number | null): string {
    if (amount === null || amount === undefined) return "—";
    if (amount >= 100000) {
        const lpa = amount / 100000;
        return `₹${lpa % 1 === 0 ? lpa.toFixed(0) : lpa.toFixed(1)} LPA`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
}

/** Format stipend as monthly */
export function formatStipend(amount: number | null): string {
    if (amount === null || amount === undefined) return "—";
    return `₹${amount.toLocaleString("en-IN")}/mo`;
}

/** Check if placement can be acted upon (accept/reject) */
export function canActOnPlacement(placement: StudentPlacement): boolean {
    return (
        placement.placement_status === "offered" &&
        placement.acceptance_status === "pending"
    );
}
