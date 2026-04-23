import { z } from "zod";

export const VALID_EMPLOYMENT_TYPES = [
    "internship", "full-time", "part-time", "freelance", "contract",
] as const;

export const VALID_WORK_MODES = [
    "on-site", "remote", "hybrid",
] as const;

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    internship: "Internship",
    "full-time": "Full-time",
    "part-time": "Part-time",
    freelance: "Freelance",
    contract: "Contract",
};

export const WORK_MODE_LABELS: Record<string, string> = {
    "on-site": "On-site",
    remote: "Remote",
    hybrid: "Hybrid",
};

export const experienceSchema = z
    .object({
        company_name: z.string().min(1, "Company name is required").max(200),
        company_website: z.url({ message: "Must be a valid URL" }).max(500).optional().or(z.literal("")),
        position_title: z.string().min(1, "Position title is required").max(200),
        employment_type: z.enum(VALID_EMPLOYMENT_TYPES, {
            message: "Please select employment type",
        }),
        job_description: z.string().min(1, "Job description is required").max(2000),
        responsibilities: z.array(z.string()).default([]),
        technologies_used: z.array(z.string()).default([]),
        work_location: z.string().min(1, "Work location is required").max(200),
        work_mode: z.enum(VALID_WORK_MODES, {
            message: "Please select work mode",
        }),
        start_date: z.string().min(1, "Start date is required"),
        end_date: z.string().optional().or(z.literal("")),
        is_current: z.boolean(),
        duration_months: z.union([z.number(), z.string()]).transform((v) => v === "" ? undefined : Number(v)).optional(),
        stipend_amount: z.union([z.number(), z.string()]).transform((v) => v === "" ? undefined : Number(v)).optional(),
        offer_letter_url: z.string().max(500).optional().or(z.literal("")),
        completion_certificate_url: z.string().max(500).optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (!data.is_current && !data.end_date) return false;
            return true;
        },
        { message: "End date is required when not currently working here", path: ["end_date"] }
    )
    .refine(
        (data) => {
            // B24: End date cannot be in the future for past experience
            if (!data.is_current && data.end_date) {
                return new Date(data.end_date) <= new Date();
            }
            return true;
        },
        { message: 'End date cannot be in the future for past experience', path: ['end_date'] }
    )
    .refine(
        (data) => {
            if (data.start_date && data.end_date) {
                return new Date(data.end_date) >= new Date(data.start_date);
            }
            return true;
        },
        { message: 'End date must be on or after start date', path: ['end_date'] }
    );

export type ExperienceSchemaType = z.infer<typeof experienceSchema>;
