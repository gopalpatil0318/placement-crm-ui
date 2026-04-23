import { z } from "zod";

const optionalFilePath = z.string().max(500).or(z.literal("")).optional();

export const achievementSchema = z.object({
    achievement_title: z.string().min(2, "Title must be at least 2 characters").max(300),
    achievement_description: z.string().max(2000).optional().or(z.literal("")),
    achievement_type: z
        .enum(["competition", "hackathon", "award", "certification", "publication", "research", "sports", "cultural"], {
            message: "Please select a valid achievement type",
        })
        .optional()
        .or(z.literal("")),
    issuing_organization: z.string().max(200).optional().or(z.literal("")),
    event_name: z.string().max(200).optional().or(z.literal("")),
    achievement_level: z
        .enum(["international", "national", "state", "university", "college", "departmental"], {
            message: "Please select a valid achievement level",
        })
        .optional()
        .or(z.literal("")),
    position_rank: z.string().max(50).optional().or(z.literal("")),
    participants_count: z
        .union([z.number(), z.string()])
        .transform((val) => (val === "" ? undefined : Number(val)))
        .refine((val) => val === undefined || (!Number.isNaN(val) && val >= 1 && val <= 1000000), {
            message: "Must be between 1 and 1,000,000",
        })
        .optional(),
    achievement_date: z
        .string()
        .refine(
            (val) => !val || new Date(val) <= new Date(),
            { message: "Achievement date cannot be in the future" }
        )
        .optional()
        .or(z.literal("")),
    certificate_url: optionalFilePath,
    proof_url: optionalFilePath,
    is_featured: z.boolean().default(false),
    display_order: z
        .union([z.number(), z.string()])
        .transform((val) => (val === "" ? undefined : Number(val)))
        .refine((val) => val === undefined || (!Number.isNaN(val) && val >= 1 && val <= 10), {
            message: "Display order must be between 1 and 10",
        })
        .optional(),
});

export type AchievementSchemaType = z.infer<typeof achievementSchema>;
