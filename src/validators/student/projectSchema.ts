import { z } from "zod";

export const VALID_PROJECT_TYPES = [
    "academic", "personal", "internship", "freelance", "research", "open_source",
] as const;

export const PROJECT_TYPE_LABELS: Record<string, string> = {
    academic: "Academic",
    personal: "Personal",
    internship: "Internship",
    freelance: "Freelance",
    research: "Research",
    open_source: "Open Source",
};

export const projectSchema = z
    .object({
        project_title: z.string().min(1, "Project title is required").max(200),
        project_description: z.string().min(1, "Description is required").max(2000),
        project_type: z.enum(VALID_PROJECT_TYPES, {
            message: "Please select a valid project type",
        }),
        project_url: z.url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
        github_link: z.url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
        demo_link: z.url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
        technologies_used: z.array(z.string()).min(1, "Add at least one technology"),
        start_date: z.string().min(1, "Start date is required"),
        end_date: z.string().optional().or(z.literal("")),
        is_ongoing: z.boolean(),
        team_size: z
            .union([z.number(), z.string()])
            .transform(Number)
            .refine((v) => !Number.isNaN(v) && v >= 1, { message: "Team size must be at least 1" }),
        role_in_project: z.string().min(1, "Your role is required").max(100),
        display_order: z
            .union([z.number(), z.string()])
            .transform(Number)
            .optional(),
        is_featured: z.boolean(),
    })
    .refine(
        (data) => {
            if (!data.is_ongoing && !data.end_date) {
                return false;
            }
            return true;
        },
        { message: "End date is required when project is not ongoing", path: ["end_date"] }
    )
    .refine(
        (data) => {
            // B24: End date cannot be in the future for completed projects
            if (!data.is_ongoing && data.end_date) {
                return new Date(data.end_date) <= new Date();
            }
            return true;
        },
        { message: 'End date cannot be in the future for completed projects', path: ['end_date'] }
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

export type ProjectSchemaType = z.infer<typeof projectSchema>;
