import { z } from "zod";

// ========================
// CONSTANTS
// ========================

export const VERIFICATION_ACTIONS = ["approved", "rejected"] as const;

export const VERIFICATION_CATEGORIES = [
    "profiles",
    "experiences",
    "achievements",
    "certificates",
] as const;

export type VerificationCategory = (typeof VERIFICATION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<VerificationCategory, string> = {
    profiles: "Profiles",
    experiences: "Experiences",
    achievements: "Achievements",
    certificates: "Certificates",
};

export const VERIFICATION_STATUS_CONFIG: Record<
    string,
    { label: string; bg: string; dot: string; textColor: string }
> = {
    pending: {
        label: "Pending",
        bg: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
        dot: "bg-amber-500",
        textColor: "text-amber-700 dark:text-amber-300",
    },
    approved: {
        label: "Approved",
        bg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
        dot: "bg-emerald-500",
        textColor: "text-emerald-700 dark:text-emerald-300",
    },
    rejected: {
        label: "Rejected",
        bg: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
        dot: "bg-red-400",
        textColor: "text-red-600 dark:text-red-400",
    },
};

// ========================
// SCHEMAS
// ========================

export const verifyItemSchema = z
    .object({
        action: z.enum(VERIFICATION_ACTIONS, {
            message: "Action is required",
        }),
        rejection_reason: z
            .string()
            .min(5, "Rejection reason must be at least 5 characters")
            .max(500, "Rejection reason cannot exceed 500 characters")
            .optional()
            .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        if (
            data.action === "rejected" &&
            (!data.rejection_reason || data.rejection_reason.trim().length < 5)
        ) {
            ctx.addIssue({
                code: "custom",
                message: "Rejection reason is required (at least 5 characters)",
                path: ["rejection_reason"],
            });
        }
    });

export const bulkVerifySchema = z
    .object({
        ids: z
            .array(z.uuid())
            .min(1, "Select at least one item")
            .max(100, "Maximum 100 items per bulk action"),
        action: z.enum(VERIFICATION_ACTIONS, {
            message: "Action is required",
        }),
        rejection_reason: z
            .string()
            .min(5, "Rejection reason must be at least 5 characters")
            .max(500, "Rejection reason cannot exceed 500 characters")
            .optional()
            .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        if (
            data.action === "rejected" &&
            (!data.rejection_reason || data.rejection_reason.trim().length < 5)
        ) {
            ctx.addIssue({
                code: "custom",
                message: "Rejection reason is required (at least 5 characters)",
                path: ["rejection_reason"],
            });
        }
    });

// ========================
// TYPES
// ========================

export type VerifyItemInput = z.infer<typeof verifyItemSchema>;
export type BulkVerifyInput = z.infer<typeof bulkVerifySchema>;
