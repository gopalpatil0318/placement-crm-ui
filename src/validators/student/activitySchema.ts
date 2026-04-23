import { z } from "zod";

const optionalFilePath = z.string().max(500).or(z.literal("")).optional();

export const activitySchema = z
    .object({
        activity_name: z.string().min(2, "Activity name must be at least 2 characters").max(200),
        activity_description: z.string().max(1500).optional().or(z.literal("")),
        activity_type: z
            .enum(["sports", "cultural", "technical", "social", "volunteer", "arts", "nss", "ncc"], {
                message: "Please select a valid activity type",
            })
            .optional()
            .or(z.literal("")),
        organizing_body: z.string().max(200).optional().or(z.literal("")),
        role_position: z.string().max(100).optional().or(z.literal("")),
        start_date: z.string().optional().or(z.literal("")),
        end_date: z.string().optional().or(z.literal("")),
        is_ongoing: z.boolean().default(false),
        hours_contributed: z
            .union([z.number(), z.string()])
            .transform((val) => (val === "" ? undefined : Number(val)))
            .refine((val) => val === undefined || (!Number.isNaN(val) && val >= 1 && val <= 10000), {
                message: "Hours must be between 1 and 10,000",
            })
            .optional(),
        certificate_url: optionalFilePath,
        proof_urls: z
            .array(z.string().max(500))
            .max(5, "Maximum 5 proof files")
            .default([]),
    })
    .refine(
        (data) => {
            if (!data.is_ongoing && data.start_date && data.end_date) {
                return new Date(data.end_date) >= new Date(data.start_date);
            }
            return true;
        },
        { message: "End date must be after start date", path: ["end_date"] }
    );

export type ActivitySchemaType = z.infer<typeof activitySchema>;
