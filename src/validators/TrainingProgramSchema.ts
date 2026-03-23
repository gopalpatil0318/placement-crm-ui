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
    "upcoming",
    "enrollment_open",
    "in_progress",
    "completed",
    "cancelled",
] as const;

export type ProgramStatus = (typeof PROGRAM_STATUS_OPTIONS)[number];

export const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
    upcoming: "Upcoming",
    enrollment_open: "Enrollment Open",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

export const PROGRAM_STATUS_COLORS: Record<
    ProgramStatus,
    { bg: string; text: string; dot: string }
> = {
    upcoming:        { bg: "bg-blue-50 dark:bg-blue-900/20",      text: "text-blue-700 dark:text-blue-400",      dot: "bg-blue-500" },
    enrollment_open: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    in_progress:     { bg: "bg-amber-50 dark:bg-amber-900/20",    text: "text-amber-700 dark:text-amber-400",    dot: "bg-amber-500" },
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

// ========================
// STATUS TRANSITIONS (from API state machine)
// ========================

export const PROGRAM_STATUS_TRANSITIONS: Record<ProgramStatus, ProgramStatus[]> = {
    upcoming: ["enrollment_open", "cancelled"],
    enrollment_open: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: ["upcoming"],
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
        sessions_attended: z
            .string()
            .optional()
            .or(z.literal("")),
        completion_status: z.enum(ENROLLMENT_STATUS_OPTIONS).optional(),
        completion_percentage: z
            .string()
            .optional()
            .or(z.literal("")),
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
    enrolled_at: string
    sessions_attended: number
    completion_status: EnrollmentStatus
    completion_percentage: number
    certificate_issued: boolean
    certificate_url: string | null
    student_feedback: string | null
    student_rating: number | null
    completed_at: string | null
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
