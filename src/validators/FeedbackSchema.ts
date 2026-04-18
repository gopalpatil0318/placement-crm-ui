// ========================
// APPROVAL STATUS CONFIG
// ========================

export const APPROVAL_STATUS_OPTIONS = ["all", "pending", "approved"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUS_OPTIONS)[number];

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
    all: "All",
    pending: "Pending",
    approved: "Approved",
};

export const APPROVAL_STATUS_COLORS: Record<
    "pending" | "approved",
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
};

// ========================
// RATING OPTIONS
// ========================

export const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

// ========================
// SORT CONFIGS
// ========================

export const SORT_OPTIONS_FEEDBACK = [
    { label: "Newest", sort_by: "created_at", sort_order: "desc" },
    { label: "Oldest", sort_by: "created_at", sort_order: "asc" },
    { label: "Highest Rating", sort_by: "rating", sort_order: "desc" },
    { label: "Lowest Rating", sort_by: "rating", sort_order: "asc" },
] as const;

export const SORT_OPTIONS_QUESTIONS = [
    { label: "Newest", sort_by: "created_at", sort_order: "desc" },
    { label: "Oldest", sort_by: "created_at", sort_order: "asc" },
    { label: "Topic A–Z", sort_by: "topic", sort_order: "asc" },
    { label: "Topic Z–A", sort_by: "topic", sort_order: "desc" },
] as const;

// ========================
// DATA INTERFACES
// ========================

export interface Feedback {
    feedback_id: string;
    job_id: string;
    company_id: string;
    student_id: string;
    rating: number;
    feedback_text: string | null;
    is_anonymous: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    company_name: string;
    job_title: string;
    student_name: string;
    department_name: string | null;
}

export interface InterviewQuestion {
    question_id: string;
    company_id: string;
    job_id: string;
    student_id: string;
    question_description: string;
    topic: string | null;
    sample_answer: string | null;
    round_type: string | null;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    company_name: string;
    job_title: string;
    student_name: string;
    department_name: string | null;
}

export interface FeedbackFilters {
    is_approved?: boolean;
    company_id?: string;
    job_id?: string;
    rating?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
}

export interface InterviewQuestionFilters {
    is_approved?: boolean;
    company_id?: string;
    job_id?: string;
    topic?: string;
    round_type?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ========================
// STUDENT-SIDE TYPES
// ========================

/** Feedback as returned to a student viewing their own submissions */
export interface StudentFeedback {
    feedback_id: string;
    job_id: string;
    company_id: string;
    rating: number;
    feedback_text: string | null;
    is_anonymous: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    company_name: string;
    job_title: string;
}

/** Approved interview question visible in the browse endpoint (no student identity) */
export interface BrowseInterviewQuestion {
    question_id: string;
    company_id: string;
    job_id: string;
    question_description: string;
    topic: string | null;
    sample_answer: string | null;
    round_type: string | null;
    created_at: string;
    company_name: string;
    job_title: string;
    passout_year: number | null;
}

// ========================
// STUDENT-SIDE FILTER TYPES
// ========================

export interface StudentFeedbackFilters {
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
}

export interface BrowseQuestionsFilters {
    company_id?: string;
    job_id?: string;
    topic?: string;
    round_type?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
}

// ========================
// STUDENT-SIDE CONSTANTS
// ========================

import { z } from "zod/v4";

export const submitFeedbackSchema = z.object({
    job_id: z.string().min(1, "Job is required"),
    company_id: z.string().min(1, "Company is required"),
    rating: z.number().int().min(1, "Rating is required").max(5, "Rating must be 1–5"),
    feedback_text: z.string().max(3000, "Feedback must be at most 3000 characters").optional().or(z.literal("")),
    is_anonymous: z.boolean().optional().default(false),
});

export type SubmitFeedbackPayload = z.infer<typeof submitFeedbackSchema>;

export const submitInterviewQuestionSchema = z.object({
    company_id: z.string().min(1, "Company is required"),
    job_id: z.string().min(1, "Job is required"),
    question_description: z.string().min(5, "Question must be at least 5 characters").max(2000, "Question must be at most 2000 characters"),
    topic: z.string().max(100, "Topic must be at most 100 characters").optional().or(z.literal("")),
    sample_answer: z.string().max(3000, "Answer must be at most 3000 characters").optional().or(z.literal("")),
});

export type SubmitInterviewQuestionPayload = z.infer<typeof submitInterviewQuestionSchema>;

export const INTERVIEW_ROUND_TYPE_OPTIONS = [
    "aptitude", "technical_interview", "hr_interview", "group_discussion",
    "coding_test", "written_test", "case_study", "psychometric_test",
    "managerial_round", "other",
] as const;

export const INTERVIEW_ROUND_TYPE_LABELS: Record<string, string> = {
    aptitude: "Aptitude",
    technical_interview: "Technical Interview",
    hr_interview: "HR Interview",
    group_discussion: "Group Discussion",
    coding_test: "Coding Test",
    written_test: "Written Test",
    case_study: "Case Study",
    psychometric_test: "Psychometric Test",
    managerial_round: "Managerial Round",
    other: "Other",
};

export const submitInterviewQuestionsSchema = z.object({
    company_id: z.string().min(1, "Company is required"),
    job_id: z.string().min(1, "Job is required"),
    round_type: z.enum(INTERVIEW_ROUND_TYPE_OPTIONS, { message: "Round type is required" }),
    questions: z.array(
        z.object({
            question_description: z.string().min(5, "Question must be at least 5 characters").max(2000, "Question must be at most 2000 characters"),
            sample_answer: z.string().max(3000, "Answer must be at most 3000 characters").optional().or(z.literal("")),
        })
    ).min(1, "At least one question is required").max(10, "Maximum 10 questions per batch"),
});

export type SubmitInterviewQuestionsPayload = z.infer<typeof submitInterviewQuestionsSchema>;

/** Company + jobs the student has applied to (for submit form dropdowns) */
export interface AppliedJobOption {
    company_id: string;
    company_name: string;
    jobs: { job_id: string; job_title: string }[];
}

/** Company with approved question counts (for browse directory) */
export interface QuestionCompany {
    company_id: string;
    company_name: string;
    question_count: number;
    latest_date: string;
}

export const TOPIC_SUGGESTIONS = [
    "DSA", "DBMS", "OS", "CN", "HR", "Aptitude", "Coding", "System Design", "SQL", "OOP",
] as const;

export const STAR_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"] as const;
