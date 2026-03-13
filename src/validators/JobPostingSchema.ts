import { z } from "zod";

// ========================
// SHARED CONSTANTS
// ========================

export const JOB_TYPE_OPTIONS = ["full-time", "internship", "both"] as const;

export const ROUND_TYPE_OPTIONS = ["written", "interview", "GD", "coding", "HR"] as const;

export const QUESTION_TYPE_OPTIONS = ["text", "essay", "yes_no", "mcq_single", "mcq_multiple"] as const;

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

// ========================
// NESTED SCHEMAS
// ========================

export const positionSchema = z.object({
    position_name: z.string().min(1, "Position name is required").max(200),
    position_description: z.string().max(2000).optional().or(z.literal("")),
    vacancies: z.number().min(1, "Minimum 1 vacancy").optional(),
});

export const eligibilityCriteriaSchema = z.object({
    min_overall_cgpa: z.number().min(0).max(10).optional(),
    max_live_kts: z.number().min(0).max(20).optional(),
    min_tenth_percentage: z.number().min(0).max(100).optional(),
    min_twelfth_percentage: z.number().min(0).max(100).optional(),
    min_diploma_percentage: z.number().min(0).max(100).optional(),
    allowed_genders: z.array(z.string()).optional(),
    allowed_departments: z.array(z.string()).optional(),
    exclude_already_placed: z.boolean().optional(),
});

export const roundSchema = z.object({
    round_number: z.number().min(1),
    round_name: z.string().min(1, "Round name is required").max(200),
    round_type: z.string().optional().or(z.literal("")),
    round_date: z.string().optional().or(z.literal("")),
    round_venue: z.string().max(500).optional().or(z.literal("")),
});

export const questionSchema = z.object({
    question_text: z.string().min(1, "Question text is required").max(2000),
    question_type: z.string().min(1, "Question type is required"),
    question_options: z.array(z.string()).optional(),
    is_required: z.boolean(),
    question_order: z.number().min(1),
});

// ========================
// CREATE JOB SCHEMA
// ========================

export const jobCreateSchema = z.object({
    company_id: z.string().min(1, "Company is required"),
    job_title: z.string().min(3, "Job title must be at least 3 characters").max(300),
    job_description: z.string().max(5000).optional().or(z.literal("")),
    job_location: z.string().min(2, "Location is required").max(300),
    salary_package: z.string().max(100).optional().or(z.literal("")),
    salary_min: z.number().min(0).optional(),
    salary_max: z.number().min(0).optional(),
    bond_duration: z.string().max(100).optional().or(z.literal("")),
    bond_details: z.string().max(1000).optional().or(z.literal("")),
    job_type: z.string().min(1, "Job type is required"),
    internship_duration: z.string().max(100).optional().or(z.literal("")).nullable(),
    internship_stipend: z.string().max(100).optional().or(z.literal("")).nullable(),
    passout_years: z.array(z.number()).min(1, "At least one passout year is required"),
    application_deadline: z.string().min(1, "Application deadline is required"),
    positions: z.array(positionSchema).min(1, "At least one position is required"),
    eligibility_criteria: eligibilityCriteriaSchema.optional(),
    rounds: z.array(roundSchema).optional(),
    questions: z.array(questionSchema).optional(),
});

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type PositionInput = z.infer<typeof positionSchema>;
export type RoundInput = z.infer<typeof roundSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type EligibilityCriteriaInput = z.infer<typeof eligibilityCriteriaSchema>;
