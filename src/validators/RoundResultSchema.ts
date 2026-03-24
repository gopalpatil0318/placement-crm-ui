import { z } from "zod/v4";

// --- Status config ---

export const RESULT_STATUS_OPTIONS = [
    "pending",
    "passed",
    "failed",
    "on_hold",
    "absent",
] as const;

export type ResultStatus = (typeof RESULT_STATUS_OPTIONS)[number];

export const RESULT_STATUS_COLORS: Record<
    ResultStatus,
    { bg: string; text: string; dot: string }
> = {
    pending: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
    },
    passed: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    failed: {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-600 dark:text-red-400",
        dot: "bg-red-400",
    },
    on_hold: {
        bg: "bg-cyan-50 dark:bg-cyan-900/20",
        text: "text-cyan-700 dark:text-cyan-400",
        dot: "bg-cyan-500",
    },
    absent: {
        bg: "bg-gray-50 dark:bg-gray-800",
        text: "text-gray-600 dark:text-gray-400",
        dot: "bg-gray-400",
    },
};

export const RESULT_STATUS_LABELS: Record<ResultStatus, string> = {
    pending: "Pending",
    passed: "Passed",
    failed: "Failed",
    on_hold: "On Hold",
    absent: "Absent",
};

// --- Add single round result schema ---

export const addRoundResultSchema = z
    .object({
        application_id: z.string().min(1, "Application is required"),
        result_status: z.enum(RESULT_STATUS_OPTIONS).optional(),
        score: z
            .number()
            .min(0, "Score must be at least 0")
            .max(100000, "Score must not exceed 100,000")
            .optional(),
        remarks: z
            .string()
            .max(2000, "Remarks must not exceed 2000 characters")
            .optional()
            .or(z.literal("")),
        attended: z.boolean().optional(),
        scheduled_at: z.string().optional().or(z.literal("")),
        completed_at: z.string().optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (data.scheduled_at && data.completed_at) {
                return (
                    new Date(data.completed_at) > new Date(data.scheduled_at)
                );
            }
            return true;
        },
        {
            message: "Completed time must be after scheduled time",
            path: ["completed_at"],
        },
    );

export type AddRoundResultInput = z.infer<typeof addRoundResultSchema>;

// --- Update round result schema ---

export const updateRoundResultSchema = z
    .object({
        result_status: z.enum(RESULT_STATUS_OPTIONS).optional(),
        score: z
            .number()
            .min(0, "Score must be at least 0")
            .max(100000, "Score must not exceed 100,000")
            .optional()
            .or(z.literal(null)),
        remarks: z
            .string()
            .max(2000, "Remarks must not exceed 2000 characters")
            .optional()
            .or(z.literal("")),
        attended: z.boolean().optional(),
        scheduled_at: z.string().optional().or(z.literal("")),
        completed_at: z.string().optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            const hasField =
                data.result_status !== undefined ||
                data.score !== undefined ||
                (data.remarks !== undefined && data.remarks !== "") ||
                data.attended !== undefined ||
                (data.scheduled_at !== undefined && data.scheduled_at !== "") ||
                (data.completed_at !== undefined && data.completed_at !== "");
            return hasField;
        },
        { message: "At least one field must be provided" },
    )
    .refine(
        (data) => {
            if (data.scheduled_at && data.completed_at) {
                return (
                    new Date(data.completed_at) > new Date(data.scheduled_at)
                );
            }
            return true;
        },
        {
            message: "Completed time must be after scheduled time",
            path: ["completed_at"],
        },
    );

export type UpdateRoundResultInput = z.infer<typeof updateRoundResultSchema>;

// --- Bulk add round results schema ---

const bulkResultItemSchema = z
    .object({
        application_id: z.string().min(1, "Application is required"),
        result_status: z.enum(RESULT_STATUS_OPTIONS).optional(),
        score: z
            .number()
            .min(0, "Score must be at least 0")
            .max(100000, "Score must not exceed 100,000")
            .optional(),
        remarks: z
            .string()
            .max(2000, "Remarks must not exceed 2000 characters")
            .optional()
            .or(z.literal("")),
        attended: z.boolean().optional(),
        scheduled_at: z.string().optional().or(z.literal("")),
        completed_at: z.string().optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (data.scheduled_at && data.completed_at) {
                return (
                    new Date(data.completed_at) > new Date(data.scheduled_at)
                );
            }
            return true;
        },
        {
            message: "Completed time must be after scheduled time",
            path: ["completed_at"],
        },
    );

export const bulkAddRoundResultsSchema = z.object({
    results: z
        .array(bulkResultItemSchema)
        .min(1, "At least one result is required")
        .max(200, "Cannot add more than 200 results at once"),
});

export type BulkAddRoundResultsInput = z.infer<
    typeof bulkAddRoundResultsSchema
>;
