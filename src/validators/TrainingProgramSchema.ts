import { z } from "zod/v4";

// ========================
// PROGRAM TYPE OPTIONS
// ========================

export const PROGRAM_TYPE_OPTIONS = [
    "aptitude",
    "coding",
    "soft_skills",
    "interview_prep",
    "resume_building",
    "technical",
    "group_discussion",
    "other",
] as const;

export type ProgramType = (typeof PROGRAM_TYPE_OPTIONS)[number];

export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
    aptitude: "Aptitude Training",
    coding: "Coding / DSA",
    soft_skills: "Soft Skills",
    interview_prep: "Interview Preparation",
    resume_building: "Resume Building",
    technical: "Technical Training",
    group_discussion: "Group Discussion",
    other: "Other",
};

// ========================
// PROGRAM STATUS CONFIG
// ========================

export const PROGRAM_STATUS_OPTIONS = [
    "draft",
    "upcoming",
    "in_progress",
    "on_hold",
    "completed",
    "cancelled",
] as const;

export type ProgramStatus = (typeof PROGRAM_STATUS_OPTIONS)[number];

export const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
    draft: "Draft",
    upcoming: "Upcoming",
    in_progress: "In Progress",
    on_hold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
};

export const PROGRAM_STATUS_COLORS: Record<
    ProgramStatus,
    { bg: string; text: string; dot: string }
> = {
    draft:           { bg: "bg-slate-50 dark:bg-slate-900/20",     text: "text-slate-600 dark:text-slate-400",     dot: "bg-slate-400" },
    upcoming:        { bg: "bg-blue-50 dark:bg-blue-900/20",      text: "text-blue-700 dark:text-blue-400",      dot: "bg-blue-500" },
    in_progress:     { bg: "bg-amber-50 dark:bg-amber-900/20",    text: "text-amber-700 dark:text-amber-400",    dot: "bg-amber-500" },
    on_hold:         { bg: "bg-orange-50 dark:bg-orange-900/20",  text: "text-orange-700 dark:text-orange-400",  dot: "bg-orange-500" },
    completed:       { bg: "bg-gray-100 dark:bg-gray-800",         text: "text-gray-600 dark:text-gray-400",      dot: "bg-gray-400" },
    cancelled:       { bg: "bg-red-50 dark:bg-red-900/20",        text: "text-red-600 dark:text-red-400",        dot: "bg-red-400" },
};

// ========================
// ENROLLMENT STATUS CONFIG
// ========================

export const ENROLLMENT_STATUS_OPTIONS = [
    "enrolled",
    "in_progress",
    "completed",
    "dropped",
    "failed",
] as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUS_OPTIONS)[number];

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
    enrolled: "Enrolled",
    in_progress: "In Progress",
    completed: "Completed",
    dropped: "Dropped",
    failed: "Failed",
};

export const ENROLLMENT_STATUS_COLORS: Record<
    EnrollmentStatus,
    { bg: string; text: string; dot: string }
> = {
    enrolled:    { bg: "bg-cyan-50 dark:bg-cyan-900/20",      text: "text-cyan-700 dark:text-cyan-400",       dot: "bg-cyan-500" },
    in_progress: { bg: "bg-amber-50 dark:bg-amber-900/20",    text: "text-amber-700 dark:text-amber-400",    dot: "bg-amber-500" },
    completed:   { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    dropped:     { bg: "bg-gray-100 dark:bg-gray-800",         text: "text-gray-600 dark:text-gray-400",      dot: "bg-gray-400" },
    failed:      { bg: "bg-red-50 dark:bg-red-900/20",        text: "text-red-600 dark:text-red-400",        dot: "bg-red-400" },
};

export const ENROLLMENT_VALID_TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
    enrolled: ["dropped"],
    in_progress: ["completed", "dropped", "failed"],
    completed: ["in_progress"],
    dropped: ["in_progress"],
    failed: ["in_progress"],
};

// ========================
// PAYMENT STATUS CONFIG
// ========================

export const PAYMENT_STATUS_OPTIONS = [
    "not_applicable",
    "pending",
    "paid",
    "waived",
    "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS_OPTIONS)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    not_applicable: "N/A",
    pending: "Pending",
    paid: "Paid",
    waived: "Waived",
    refunded: "Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<
    PaymentStatus,
    { bg: string; text: string; dot: string }
> = {
    not_applicable: { bg: "bg-gray-100 dark:bg-gray-800",          text: "text-gray-600 dark:text-gray-400",      dot: "bg-gray-400" },
    pending:        { bg: "bg-amber-50 dark:bg-amber-900/20",      text: "text-amber-700 dark:text-amber-400",    dot: "bg-amber-500" },
    paid:           { bg: "bg-emerald-50 dark:bg-emerald-900/20",  text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    waived:         { bg: "bg-blue-50 dark:bg-blue-900/20",        text: "text-blue-700 dark:text-blue-400",      dot: "bg-blue-500" },
    refunded:       { bg: "bg-red-50 dark:bg-red-900/20",          text: "text-red-600 dark:text-red-400",        dot: "bg-red-400" },
};

// ========================
// STATUS TRANSITIONS (from API state machine)
// ========================

export const PROGRAM_STATUS_TRANSITIONS: Record<ProgramStatus, ProgramStatus[]> = {
    draft: ["upcoming", "cancelled"],
    upcoming: ["in_progress", "on_hold", "cancelled"],
    in_progress: ["on_hold", "completed", "cancelled"],
    on_hold: ["in_progress", "cancelled"],
    completed: ["in_progress"],
    cancelled: ["draft"],
};

// ========================
// ZOD SCHEMAS
// ========================

export const createTrainingProgramSchema = z
    .object({
        program_name: z
            .string()
            .trim()
            .min(2, "Program name must be at least 2 characters")
            .max(200, "Program name cannot exceed 200 characters"),
        program_description: z
            .string()
            .max(3000, "Description cannot exceed 3000 characters")
            .optional()
            .or(z.literal("")),
        program_type: z.enum(PROGRAM_TYPE_OPTIONS, {
            error: "Select a program type",
        }),
        trainer_name: z
            .string()
            .max(200, "Trainer name cannot exceed 200 characters")
            .optional()
            .or(z.literal("")),
        trainer_organization: z
            .string()
            .max(200, "Organization cannot exceed 200 characters")
            .optional()
            .or(z.literal("")),
        start_date: z.string().optional().or(z.literal("")),
        end_date: z.string().optional().or(z.literal("")),
        total_sessions: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || (Number(val) >= 1 && Number(val) <= 500 && Number.isInteger(Number(val))),
                { message: "Total sessions must be between 1 and 500" },
            ),
        session_duration_hours: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || (Number(val) >= 0.5 && Number(val) <= 24),
                { message: "Session duration must be between 0.5 and 24 hours" },
            ),
        target_dept_ids: z.array(z.string()).optional(),
        target_passout_year: z
            .string()
            .optional()
            .or(z.literal("")),
        max_enrollment: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || (Number(val) >= 1 && Number(val) <= 10000 && Number.isInteger(Number(val))),
                { message: "Max enrollment must be between 1 and 10,000" },
            ),
        enrollment_deadline: z.string().optional().or(z.literal("")),
        program_fee: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || Number(val) >= 0,
                { message: "Program fee cannot be negative" },
            ),
        fee_currency: z.string().max(10).optional().or(z.literal("")),
        min_attendance_pct: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || (Number(val) >= 0 && Number(val) <= 100),
                { message: "Minimum attendance must be between 0 and 100" },
            ),
    })
    .refine(
        (data) => {
            if (data.start_date && data.end_date) {
                return data.end_date >= data.start_date;
            }
            return true;
        },
        { message: "End date must be on or after the start date", path: ["end_date"] },
    );

export type CreateTrainingProgramInput = z.infer<typeof createTrainingProgramSchema>;

export const updateTrainingProgramSchema = z
    .object({
        program_name: z
            .string()
            .trim()
            .min(2, "Program name must be at least 2 characters")
            .max(200, "Program name cannot exceed 200 characters")
            .optional()
            .or(z.literal("")),
        program_description: z
            .string()
            .max(3000, "Description cannot exceed 3000 characters")
            .optional()
            .or(z.literal("")),
        program_type: z.enum(PROGRAM_TYPE_OPTIONS).optional(),
        trainer_name: z
            .string()
            .max(200, "Trainer name cannot exceed 200 characters")
            .optional()
            .or(z.literal("")),
        trainer_organization: z
            .string()
            .max(200, "Organization cannot exceed 200 characters")
            .optional()
            .or(z.literal("")),
        start_date: z.string().optional().or(z.literal("")),
        end_date: z.string().optional().or(z.literal("")),
        total_sessions: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || (Number(val) >= 1 && Number(val) <= 500 && Number.isInteger(Number(val))),
                { message: "Total sessions must be between 1 and 500" },
            ),
        session_duration_hours: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || (Number(val) >= 0.5 && Number(val) <= 24),
                { message: "Session duration must be between 0.5 and 24 hours" },
            ),
        target_dept_ids: z.array(z.string()).optional(),
        target_passout_year: z
            .string()
            .optional()
            .or(z.literal("")),
        max_enrollment: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || (Number(val) >= 1 && Number(val) <= 10000 && Number.isInteger(Number(val))),
                { message: "Max enrollment must be between 1 and 10,000" },
            ),
        enrollment_deadline: z.string().optional().or(z.literal("")),
        program_fee: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || Number(val) >= 0,
                { message: "Program fee cannot be negative" },
            ),
        fee_currency: z.string().max(10).optional().or(z.literal("")),
        min_attendance_pct: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || (Number(val) >= 0 && Number(val) <= 100),
                { message: "Minimum attendance must be between 0 and 100" },
            ),
    })
    .refine(
        (data) => {
            if (data.start_date && data.end_date) {
                return data.end_date >= data.start_date;
            }
            return true;
        },
        { message: "End date must be on or after the start date", path: ["end_date"] },
    );

export type UpdateTrainingProgramInput = z.infer<typeof updateTrainingProgramSchema>;

export const updateEnrollmentSchema = z
    .object({
        completion_status: z.enum(ENROLLMENT_STATUS_OPTIONS).optional(),
        certificate_issued: z.boolean().optional(),
        certificate_url: z
            .string()
            .max(500, "URL cannot exceed 500 characters")
            .refine(
                (val) => val === "" || /^https?:\/\/.+/i.test(val),
                "Must be a valid URL starting with http:// or https://",
            )
            .optional()
            .or(z.literal("")),
        payment_status: z.enum(PAYMENT_STATUS_OPTIONS).optional(),
        amount_paid: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || Number(val) >= 0,
                { message: "Amount paid cannot be negative" },
            ),
    })
    .refine(
        (data) => {
            return Object.values(data).some(
                (v) => v !== undefined && v !== "" && v !== null,
            );
        },
        { message: "At least one field must be provided" },
    );

export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;

export const toggleStatusSchema = z.object({
    program_status: z.enum(PROGRAM_STATUS_OPTIONS, {
        error: "Select a valid status",
    }),
});

export type ToggleStatusInput = z.infer<typeof toggleStatusSchema>;

// ========================
// STUDENT-SIDE TYPES
// ========================

export interface StudentAvailableProgram {
    program_id: string
    program_name: string
    program_description: string | null
    program_type: ProgramType
    trainer_name: string | null
    trainer_organization: string | null
    start_date: string | null
    end_date: string | null
    total_sessions: number | null
    session_duration_hours: number | null
    max_enrollment: number | null
    enrollment_deadline: string | null
    enrolled_count: number
    spots_remaining: number | null
    program_fee: number
    fee_currency: string
    min_attendance_pct: number
    is_deadline_passed: boolean
    created_by_name: string | null
    created_at: string
}

export interface StudentEnrollment {
    enrollment_id: string
    program_id: string
    program_name: string
    program_description: string | null
    program_type: ProgramType
    program_status: ProgramStatus
    trainer_name: string | null
    trainer_organization: string | null
    start_date: string | null
    end_date: string | null
    total_sessions: number | null
    session_duration_hours: number | null
    program_fee: number
    fee_currency: string
    min_attendance_pct: number
    enrolled_at: string
    sessions_attended: number
    completion_status: EnrollmentStatus
    completion_percentage: number
    certificate_issued: boolean
    certificate_url: string | null
    student_feedback: string | null
    student_rating: number | null
    completed_at: string | null
    payment_status: PaymentStatus
    amount_paid: number
    has_submitted_feedback: boolean
    attendance_percentage: number | null
    created_at: string
    updated_at: string
}

export interface StudentEnrollmentSummary {
    total_enrolled: number
    enrolled_count: number
    in_progress_count: number
    completed_count: number
    dropped_count: number
    failed_count: number
    certificates_earned: number
}

export interface StudentTrainingFilters {
    program_type?: ProgramType
    search?: string
    sort_by?: "program_name" | "start_date" | "end_date" | "enrollment_deadline" | "created_at"
    sort_order?: "asc" | "desc"
    page?: number
    limit?: number
}

export interface StudentEnrollmentFilters {
    completion_status?: EnrollmentStatus
    sort_by?: "enrolled_at" | "completion_percentage" | "sessions_attended" | "program_name"
    sort_order?: "asc" | "desc"
    page?: number
    limit?: number
}

// ── Feedback Zod Schema ──

export const submitFeedbackSchema = z.object({
    student_rating: z
        .number()
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
    student_feedback: z
        .string()
        .min(10, "Feedback must be at least 10 characters")
        .max(2000, "Feedback cannot exceed 2000 characters"),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

// ── Student Sort / Filter Constants ──

export const AVAILABLE_SORT_OPTIONS = [
    { value: "created_at", label: "Recently Added" },
    { value: "program_name", label: "Program Name" },
    { value: "start_date", label: "Start Date" },
    { value: "end_date", label: "End Date" },
    { value: "enrollment_deadline", label: "Enrollment Deadline" },
] as const;

export const ENROLLMENT_SORT_OPTIONS = [
    { value: "enrolled_at", label: "Enrolled Date" },
    { value: "completion_percentage", label: "Progress" },
    { value: "sessions_attended", label: "Sessions Attended" },
    { value: "program_name", label: "Program Name" },
] as const;

export const ENROLLMENT_STATUS_TABS = ["all", ...ENROLLMENT_STATUS_OPTIONS] as const;

export type EnrollmentStatusFilter = (typeof ENROLLMENT_STATUS_TABS)[number];

// ========================
// SESSION TYPES
// ========================

export interface TrainingSession {
    session_id: string
    program_id: string
    session_number: number
    session_date: string | null
    session_topic: string | null
    venue: string | null
    created_by: string | null
    created_at: string
    updated_at: string
    present_count?: number
    absent_count?: number
    total_marked?: number
    total_enrolled?: number
}

export interface TrainingSessionsResponse {
    sessions: TrainingSession[]
    total_enrolled: number
}

export interface StudentSessionSchedule {
    program_id: string
    program_name: string
    program_status: ProgramStatus
    total_sessions: number
    enrollment_id: string
    completion_status: EnrollmentStatus
    sessions_attended: number
    attendance_percentage: number
    sessions: {
        session_id: string
        session_number: number
        session_date: string | null
        session_topic: string | null
        venue: string | null
        present: boolean | null
        marked_at: string | null
    }[]
}

// ========================
// ATTENDANCE TYPES
// ========================

export interface AttendanceRecord {
    enrollment_id: string
    present: boolean
}

export interface AttendanceResult {
    session_id: string
    session_number: number
    program_id: string
    total_marked: number
    present_count: number
    absent_count: number
}

// ========================
// BULK UPDATE TYPES
// ========================

export interface BulkEnrollmentUpdate {
    enrollment_id: string
    completion_status?: EnrollmentStatus
    sessions_attended?: number
    payment_status?: PaymentStatus
    amount_paid?: number
    certificate_issued?: boolean
    certificate_url?: string
}

export interface BulkUpdateResult {
    program_id: string
    total: number
    updated: number
    failed: number
    results: { enrollment_id: string; status: string }[]
    errors: { enrollment_id: string; error: string }[]
}

// ========================
// STUDENT TRAINING REPORT
// ========================

export interface StudentTrainingReport {
    student: {
        student_id: string
        student_name: string
        student_email: string
        dept_id: string
        passout_year: number
    }
    enrollments: (StudentEnrollment & {
        attendance_percentage: number | null
    })[]
    summary: {
        total_enrollments: number
        completed: number
        in_progress: number
        enrolled: number
        dropped: number
        failed: number
        avg_completion_percentage: number
        total_amount_paid: number
        certificates_earned: number
    }
}

// ========================
// SESSION ZOD SCHEMAS (form validation)
// ========================

export const createSessionSchema = z.object({
    session_number: z
        .string()
        .min(1, "Session number is required")
        .refine(
            (val) => Number(val) >= 1 && Number(val) <= 500 && Number.isInteger(Number(val)),
            { message: "Session number must be between 1 and 500" },
        ),
    session_date: z.string().optional().or(z.literal("")),
    session_topic: z.string().max(500, "Topic cannot exceed 500 characters").optional().or(z.literal("")),
    venue: z.string().max(300, "Venue cannot exceed 300 characters").optional().or(z.literal("")),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const updateSessionSchema = z
    .object({
        session_number: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || (Number(val) >= 1 && Number(val) <= 500 && Number.isInteger(Number(val))),
                { message: "Session number must be between 1 and 500" },
            ),
        session_date: z.string().optional().or(z.literal("")),
        session_topic: z.string().max(500, "Topic cannot exceed 500 characters").optional().or(z.literal("")),
        venue: z.string().max(300, "Venue cannot exceed 300 characters").optional().or(z.literal("")),
    })
    .refine(
        (data) => Object.values(data).some((v) => v !== undefined && v !== "" && v !== null),
        { message: "At least one field must be provided" },
    );

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
