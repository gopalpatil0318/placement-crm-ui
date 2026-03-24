import { z } from "zod";

// ========================
// SHARED CONSTANTS
// ========================

export const INDUSTRY_OPTIONS = [
    "Information Technology",
    "Banking & Finance",
    "E-commerce",
    "Healthcare",
    "Automobile",
    "Manufacturing",
    "Consulting",
    "Telecom",
    "Media",
    "Education",
    "Retail",
    "Logistics",
    "Other",
] as const;

// ========================
// URL VALIDATION HELPER
// ========================

const urlSchema = z
    .string()
    .refine(
        (val) => val === "" || /^https?:\/\/.+/i.test(val),
        { message: "Must be a valid URL starting with http:// or https://" }
    );

// ========================
// CREATE SCHEMA
// ========================

export const companyCreateSchema = z.object({
    companyName: z
        .string()
        .min(2, { message: "Company name must be at least 2 characters" })
        .max(200, { message: "Company name cannot exceed 200 characters" }),

    companyDescription: z
        .string()
        .max(3000, { message: "Description cannot exceed 3000 characters" })
        .optional()
        .or(z.literal("")),

    companyWebsite: urlSchema
        .optional()
        .or(z.literal("")),

    industry: z
        .string()
        .max(100, { message: "Industry cannot exceed 100 characters" })
        .optional()
        .or(z.literal("")),

    companyLogo: urlSchema
        .optional()
        .or(z.literal("")),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;

// ========================
// UPDATE SCHEMA (partial — at least 1 field required)
// ========================

export const companyUpdateSchema = z.object({
    companyName: z
        .string()
        .min(2, { message: "Company name must be at least 2 characters" })
        .max(200, { message: "Company name cannot exceed 200 characters" })
        .optional()
        .or(z.literal("")),

    companyDescription: z
        .string()
        .max(3000, { message: "Description cannot exceed 3000 characters" })
        .optional()
        .or(z.literal("")),

    companyWebsite: urlSchema
        .optional()
        .or(z.literal("")),

    industry: z
        .string()
        .max(100, { message: "Industry cannot exceed 100 characters" })
        .optional()
        .or(z.literal("")),

    companyLogo: urlSchema
        .optional()
        .or(z.literal("")),
});

export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
