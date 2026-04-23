import { z } from "zod";

const optionalUrl = z.url({ message: "Must be a valid URL" }).max(500).or(z.literal("")).optional();
const optionalFilePath = z.string().max(500).or(z.literal("")).optional();

export const certificateSchema = z
    .object({
        certificate_name: z.string().min(2, "Name must be at least 2 characters").max(300),
        issuing_organization: z.string().min(2, "Issuing organization is required").max(200),
        certificate_description: z.string().max(1000).optional().or(z.literal("")),
        certificate_type: z
            .enum(["course", "training", "workshop", "seminar", "certification", "bootcamp"], {
                message: "Please select a valid certificate type",
            })
            .optional()
            .or(z.literal("")),
        issuing_platform: z.string().max(100).optional().or(z.literal("")),
        credential_id: z.string().max(100).optional().or(z.literal("")),
        credential_url: optionalUrl,
        issue_date: z
            .string()
            .refine(
                (val) => !val || new Date(val) <= new Date(),
                { message: "Issue date cannot be in the future" }
            )
            .optional()
            .or(z.literal("")),
        expiry_date: z.string().optional().or(z.literal("")),
        does_not_expire: z.boolean().default(true),
        skills_covered: z
            .array(z.string().max(50, "Max 50 chars per skill"))
            .max(20, "Maximum 20 skills")
            .default([]),
        certificate_url: optionalFilePath,
    })
    .refine(
        (data) => {
            if (!data.does_not_expire && data.issue_date && data.expiry_date) {
                return new Date(data.expiry_date) >= new Date(data.issue_date);
            }
            return true;
        },
        { message: "Expiry date must be after issue date", path: ["expiry_date"] }
    );

export type CertificateSchemaType = z.infer<typeof certificateSchema>;
