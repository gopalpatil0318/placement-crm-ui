import { z } from "zod/v4";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// --- Status config ---

export const OVERRIDE_STATUS_OPTIONS = [
  "pending",
  "approved",
  "rejected",
] as const;

export type OverrideStatus = (typeof OVERRIDE_STATUS_OPTIONS)[number];

export const OVERRIDE_STATUS_COLORS: Record<
  OverrideStatus,
  { bg: string; text: string; dot: string }
> = {
  pending: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  approved: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  rejected: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-400",
  },
};

export const OVERRIDE_STATUS_LABELS: Record<OverrideStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

// --- Single review schema ---

export const reviewOverrideSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    review_notes: z
      .string()
      .max(1000, "Review notes must not exceed 1000 characters")
      .optional()
      .or(z.literal("")),
    rejection_reason: z
      .string()
      .max(500, "Rejection reason must not exceed 500 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.action === "reject") {
        const reason = (data.rejection_reason ?? "").trim();
        return reason.length >= 5;
      }
      return true;
    },
    {
      message: "Rejection reason must be at least 5 characters",
      path: ["rejection_reason"],
    },
  );

export type ReviewOverrideInput = z.infer<typeof reviewOverrideSchema>;

// --- Bulk review schema ---

export const bulkReviewOverrideSchema = z
  .object({
    override_ids: z
      .array(z.string().regex(UUID_REGEX, "Invalid override ID"))
      .min(1, "Select at least one override request")
      .max(100, "Cannot review more than 100 overrides at once"),
    action: z.enum(["approve", "reject"]),
    review_notes: z
      .string()
      .max(1000, "Review notes must not exceed 1000 characters")
      .optional()
      .or(z.literal("")),
    rejection_reason: z
      .string()
      .max(500, "Rejection reason must not exceed 500 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.action === "reject") {
        const reason = (data.rejection_reason ?? "").trim();
        return reason.length >= 5;
      }
      return true;
    },
    {
      message: "Rejection reason must be at least 5 characters",
      path: ["rejection_reason"],
    },
  );

export type BulkReviewInput = z.infer<typeof bulkReviewOverrideSchema>;

// ========================
// STUDENT-SIDE: STATUS FILTER TABS
// ========================

export const OVERRIDE_STATUS_TABS = ["all", "pending", "approved", "rejected"] as const;
export type OverrideStatusFilter = (typeof OVERRIDE_STATUS_TABS)[number];

export const OVERRIDE_STATUS_TAB_LABELS: Record<OverrideStatusFilter, string> = {
  all: "All",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

// ========================
// STUDENT-SIDE: DATA INTERFACES
// ========================

/** Nested override_request object inside eligibility check response */
export interface OverrideRequestInfo {
  override_id: string;
  override_status: OverrideStatus;
  requested_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
}

/** Application object in eligibility check (if already applied) */
export interface OverrideApplication {
  application_id: string;
  application_status: string;
  applied_at: string;
}

/** Response shape for GET /check_override_eligibility/:jobId → data */
export interface OverrideEligibility {
  job_id: string;
  job_title: string;
  company_name: string;
  year_eligible: boolean;
  criteria_eligible: boolean;
  is_fully_eligible: boolean;
  ineligibility_reasons: string[];
  can_request_override: boolean;
  override_request: OverrideRequestInfo | null;
  application: OverrideApplication | null;
}

/** Item shape for GET /get_my_override_requests → data[] */
export interface MyOverrideRequest {
  override_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  industry_type: string;
  job_type: string;
  application_deadline: string;
  override_status: OverrideStatus;
  request_reason: string;
  ineligibility_reasons: string;
  review_notes: string | null;
  rejection_reason: string | null;
  reviewed_by_name: string | null;
  requested_at: string;
  reviewed_at: string | null;
}

/** Response shape for POST /request_job_override/:jobId → data */
export interface OverrideRequestResponse {
  override_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  override_status: OverrideStatus;
  request_reason: string;
  ineligibility_reasons: string;
  requested_at: string;
}

// ========================
// STUDENT-SIDE: FILTERS
// ========================

export interface OverrideFilters {
  status?: OverrideStatus;
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ========================
// STUDENT-SIDE: ZOD SCHEMA
// ========================

export const requestOverrideSchema = z.object({
  request_reason: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters — explain why you should be considered")
    .max(2000, "Request reason cannot exceed 2000 characters"),
});

export type RequestOverrideInput = z.infer<typeof requestOverrideSchema>;
