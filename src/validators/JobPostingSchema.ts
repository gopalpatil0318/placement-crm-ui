import { z } from "zod";

// ========================
// SHARED CONSTANTS
// ========================

export const JOB_TYPE_OPTIONS = ["full-time", "internship", "both"] as const;

export const ROUND_TYPE_OPTIONS = ["aptitude", "technical", "hr", "group_discussion", "coding", "other"] as const;

export const QUESTION_TYPE_OPTIONS = ["text", "essay", "yes_no", "mcq_single", "mcq_multiple"] as const;

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const DRIVE_TYPE_OPTIONS = ["on_campus", "off_campus", "pool_campus"] as const;

export const DRIVE_TYPE_LABELS: Record<string, string> = {
    on_campus: "On Campus",
    off_campus: "Off Campus",
    pool_campus: "Pool Campus",
};

// ========================
// NESTED SCHEMAS
// ========================

export const positionSchema = z.object({
    position_name: z.string().min(2, "Position name must be at least 2 characters").max(200),
    position_description: z.string().max(1000).optional().or(z.literal("")),
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
    allowed_gap_statuses: z.array(z.string()).optional(),
    min_existing_package: z.number().min(0).optional(),
    max_existing_package: z.number().min(0).optional(),
    exclude_already_placed: z.boolean().optional(),
});

export const roundSchema = z.object({
    round_number: z.number().min(1),
    round_name: z.string().min(2, "Round name must be at least 2 characters").max(200),
    round_type: z.string().optional().or(z.literal("")),
    round_date: z.string().optional().or(z.literal("")),
    round_venue: z.string().max(500).optional().or(z.literal("")),
});

export const questionSchema = z.object({
    question_text: z.string().min(5, "Question must be at least 5 characters").max(2000, "Question cannot exceed 2000 characters"),
    question_type: z.enum(QUESTION_TYPE_OPTIONS, { message: "Invalid question type" }),
    question_options: z.array(z.string().min(1, "Option cannot be empty").max(500, "Option cannot exceed 500 characters")).min(2).max(20).optional(),
    is_required: z.boolean().default(true),
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
    salary_min: z.number().min(0).max(99999999, "Salary cannot exceed 9,99,99,999").optional(),
    salary_max: z.number().min(0).max(99999999, "Salary cannot exceed 9,99,99,999").optional(),
    bond_duration: z.string().max(100).optional().or(z.literal("")),
    bond_details: z.string().max(1000).optional().or(z.literal("")),
    job_type: z.string().min(1, "Job type is required"),
    internship_duration: z.string().max(100).optional().or(z.literal("")).nullable(),
    internship_stipend: z.string().max(100).optional().or(z.literal("")).nullable(),
    passout_years: z.array(z.number()).min(1, "At least one passout year is required"),
    application_deadline: z.string().min(1, "Application deadline is required"),
    drive_type: z.enum(DRIVE_TYPE_OPTIONS).optional().default("on_campus"),
    positions: z.array(positionSchema).min(1, "At least one position is required"),
    eligibility_criteria: eligibilityCriteriaSchema.optional(),
    rounds: z.array(roundSchema).optional(),
    questions: z.array(questionSchema).optional(),
}).refine(
    (data) => {
        if (data.salary_min != null && data.salary_max != null) {
            return data.salary_min <= data.salary_max;
        }
        return true;
    },
    { message: 'Minimum salary cannot exceed maximum salary', path: ['salary_min'] }
);

// ========================
// UPDATE JOB SCHEMA (core fields only, all optional)
// ========================

export const jobUpdateSchema = z.object({
    job_title: z.string().min(3, "Job title must be at least 3 characters").max(300).optional(),
    job_description: z.string().max(5000).optional().or(z.literal("")),
    job_location: z.string().min(2, "Location must be at least 2 characters").max(300).optional(),
    salary_package: z.string().max(100).optional().or(z.literal("")),
    salary_min: z.number().min(0).max(99999999, "Salary cannot exceed 9,99,99,999").optional(),
    salary_max: z.number().min(0).max(99999999, "Salary cannot exceed 9,99,99,999").optional(),
    bond_duration: z.string().max(100).optional().or(z.literal("")),
    bond_details: z.string().max(1000).optional().or(z.literal("")),
    application_deadline: z.string().optional(),
    passout_years: z.array(z.number()).min(1, "At least one passout year is required").optional(),
    drive_type: z.enum(DRIVE_TYPE_OPTIONS).optional(),
}).refine(
    (data) => {
        if (data.salary_min != null && data.salary_max != null) {
            return data.salary_min <= data.salary_max;
        }
        return true;
    },
    { message: 'Minimum salary cannot exceed maximum salary', path: ['salary_min'] }
);

// ========================
// POSITION STANDALONE SCHEMAS (for add/edit after job creation)
// ========================

export const addPositionSchema = z.object({
    position_name: z.string().min(2, "Position name must be at least 2 characters").max(200, "Position name cannot exceed 200 characters"),
    position_description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().or(z.literal("")),
    vacancies: z.number().min(1, "Minimum 1 vacancy").max(9999, "Maximum 9999 vacancies").optional(),
});

export const updatePositionSchema = z
    .object({
        position_name: z.string().min(2, "Position name must be at least 2 characters").max(200, "Position name cannot exceed 200 characters").optional(),
        position_description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().or(z.literal("")),
        vacancies: z.number().min(1, "Minimum 1 vacancy").max(9999, "Maximum 9999 vacancies").optional(),
    })
    .refine(
        (data) => data.position_name !== undefined || data.position_description !== undefined || data.vacancies !== undefined,
        { message: "At least one field must be provided", path: ["position_name"] }
    );

// ========================
// ROUND STANDALONE SCHEMAS (for add/edit after job creation)
// ========================

export const addRoundSchema = z.object({
    round_name: z.string().min(2, "Round name must be at least 2 characters").max(200, "Round name cannot exceed 200 characters"),
    round_description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().or(z.literal("")),
    round_type: z.enum(ROUND_TYPE_OPTIONS).optional().or(z.literal("")),
    round_date: z.string().optional().or(z.literal("")),
    round_venue: z.string().max(500, "Venue cannot exceed 500 characters").optional().or(z.literal("")),
});

export const updateRoundSchema = z
    .object({
        round_name: z.string().min(2, "Round name must be at least 2 characters").max(200, "Round name cannot exceed 200 characters").optional(),
        round_description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().or(z.literal("")),
        round_type: z.enum(ROUND_TYPE_OPTIONS).optional().or(z.literal("")),
        round_date: z.string().optional().or(z.literal("")),
        round_venue: z.string().max(500, "Venue cannot exceed 500 characters").optional().or(z.literal("")),
    })
    .refine(
        (data) =>
            data.round_name !== undefined ||
            data.round_description !== undefined ||
            data.round_type !== undefined ||
            data.round_date !== undefined ||
            data.round_venue !== undefined,
        { message: "At least one field must be provided", path: ["round_name"] }
    );

// ========================
// SET CRITERIA SCHEMA (standalone set/update criteria)
// ========================

export const setCriteriaSchema = z
    .object({
        min_overall_cgpa: z.number().min(0, "CGPA must be at least 0").max(10, "CGPA cannot exceed 10").optional(),
        max_live_kts: z.number().min(0, "KTs must be at least 0").max(20, "KTs cannot exceed 20").optional(),
        min_tenth_percentage: z.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100").optional(),
        min_twelfth_percentage: z.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100").optional(),
        min_diploma_percentage: z.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100").optional(),
        allowed_genders: z.array(z.string()).min(1, "Select at least one gender").optional(),
        allowed_departments: z.array(z.string()).min(1, "Select at least one department").optional(),
        allowed_gap_statuses: z.array(z.string()).min(1, "Select at least one gap status").optional(),
        min_existing_package: z.number().min(0, "Package must be at least 0").optional(),
        max_existing_package: z.number().min(0, "Package must be at least 0").optional(),
        exclude_already_placed: z.boolean().optional(),
    })
    .refine(
        (data) =>
            data.min_overall_cgpa !== undefined ||
            data.max_live_kts !== undefined ||
            data.min_tenth_percentage !== undefined ||
            data.min_twelfth_percentage !== undefined ||
            data.min_diploma_percentage !== undefined ||
            data.allowed_genders !== undefined ||
            data.allowed_departments !== undefined ||
            data.allowed_gap_statuses !== undefined ||
            data.min_existing_package !== undefined ||
            data.max_existing_package !== undefined ||
            data.exclude_already_placed !== undefined,
        { message: "Enable and configure at least one eligibility criterion", path: ["min_overall_cgpa"] }
    );

// ========================
// ADD QUESTION SCHEMA (standalone add question)
// ========================

const MCQ_TYPES = new Set(["mcq_single", "mcq_multiple"]);

/** Check for case-insensitive duplicate options and report via ctx */
function checkDuplicateOptions(options: string[], ctx: z.RefinementCtx): void {
    const seen = new Set<string>();
    for (const opt of options) {
        const normalized = opt.trim().toLowerCase();
        if (seen.has(normalized)) {
            ctx.addIssue({
                code: "custom",
                message: `Duplicate option: "${opt.trim()}"`,
                path: ["question_options"],
            });
            return;
        }
        seen.add(normalized);
    }
}

export const addQuestionSchema = z
    .object({
        question_text: z.string().min(5, "Question must be at least 5 characters").max(2000, "Question cannot exceed 2000 characters"),
        question_type: z.enum(QUESTION_TYPE_OPTIONS, { message: "Select a valid question type" }),
        question_options: z
            .array(z.string().min(1, "Option cannot be empty").max(500, "Option cannot exceed 500 characters"))
            .min(2, "MCQ questions need at least 2 options")
            .max(20, "Cannot have more than 20 options")
            .optional()
            .or(z.literal(undefined)),
        is_required: z.boolean().default(true),
    })
    .superRefine((data, ctx) => {
        const isMcq = MCQ_TYPES.has(data.question_type);

        if (isMcq) {
            if (!data.question_options || data.question_options.length < 2) {
                ctx.addIssue({
                    code: "custom",
                    message: "MCQ questions must have at least 2 options",
                    path: ["question_options"],
                });
                return;
            }
            checkDuplicateOptions(data.question_options, ctx);
        } else if (data.question_options && data.question_options.length > 0) {
            ctx.addIssue({
                code: "custom",
                message: "Options should not be provided for this question type",
                path: ["question_options"],
            });
        }
    });

// ========================
// UPDATE QUESTION SCHEMA (standalone update question)
// ========================

export const updateQuestionSchema = z
    .object({
        question_text: z.string().min(5, "Question must be at least 5 characters").max(2000, "Question cannot exceed 2000 characters").optional(),
        question_type: z.enum(QUESTION_TYPE_OPTIONS, { message: "Select a valid question type" }).optional(),
        question_options: z
            .array(z.string().min(1, "Option cannot be empty").max(500, "Option cannot exceed 500 characters"))
            .min(2, "MCQ questions need at least 2 options")
            .max(20, "Cannot have more than 20 options")
            .optional()
            .or(z.literal(undefined)),
        is_required: z.boolean().optional(),
        question_order: z.number().min(1, "Order must be at least 1").max(100, "Order cannot exceed 100").optional(),
    })
    .refine(
        (data) =>
            data.question_text !== undefined ||
            data.question_type !== undefined ||
            data.question_options !== undefined ||
            data.is_required !== undefined ||
            data.question_order !== undefined,
        { message: "At least one field must be provided", path: ["question_text"] }
    )
    .superRefine((data, ctx) => {
        // If question_type is being changed TO an MCQ type, options must be provided
        if (data.question_type && MCQ_TYPES.has(data.question_type)) {
            if (data.question_options) {
                checkDuplicateOptions(data.question_options, ctx);
            }
        }
        // If only options are updated (no type change), still check duplicates
        if (data.question_options && !data.question_type) {
            checkDuplicateOptions(data.question_options, ctx);
        }
    });

// ========================
// INFERRED TYPES
// ========================

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
export type PositionInput = z.infer<typeof positionSchema>;
export type AddPositionInput = z.infer<typeof addPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
export type RoundInput = z.infer<typeof roundSchema>;
export type AddRoundInput = z.infer<typeof addRoundSchema>;
export type UpdateRoundInput = z.infer<typeof updateRoundSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type AddQuestionInput = z.infer<typeof addQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type EligibilityCriteriaInput = z.infer<typeof eligibilityCriteriaSchema>;
export type SetCriteriaInput = z.infer<typeof setCriteriaSchema>;
