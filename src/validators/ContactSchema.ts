import { z } from "zod";

// ========================
// CREATE SCHEMA
// ========================

export const contactSchema = z.object({
    contactName: z
        .string()
        .min(2, { message: "Contact name must be at least 2 characters" })
        .max(200, { message: "Contact name cannot exceed 200 characters" }),

    contactDesignation: z
        .string()
        .max(150, { message: "Designation cannot exceed 150 characters" })
        .optional()
        .or(z.literal("")),

    contactEmail: z
        .string()
        .email({ message: "Must be a valid email address" })
        .optional()
        .or(z.literal("")),

    contactPhone: z
        .string()
        .refine(
            (val) => val === "" || /^\d{10,15}$/.test(val),
            { message: "Must be 10–15 digits only" }
        )
        .optional()
        .or(z.literal("")),

    isPrimary: z.boolean().default(false),

    notes: z
        .string()
        .max(1000, { message: "Notes cannot exceed 1000 characters" })
        .optional()
        .or(z.literal("")),
});

export type ContactCreateInput = z.infer<typeof contactSchema>;

// ========================
// UPDATE SCHEMA (partial — at least 1 field required)
// ========================

export const contactUpdateSchema = z.object({
    contactName: z
        .string()
        .min(2, { message: "Contact name must be at least 2 characters" })
        .max(200, { message: "Contact name cannot exceed 200 characters" })
        .optional()
        .or(z.literal("")),

    contactDesignation: z
        .string()
        .max(150, { message: "Designation cannot exceed 150 characters" })
        .optional()
        .or(z.literal("")),

    contactEmail: z
        .string()
        .email({ message: "Must be a valid email address" })
        .optional()
        .or(z.literal("")),

    contactPhone: z
        .string()
        .refine(
            (val) => val === "" || /^\d{10,15}$/.test(val),
            { message: "Must be 10–15 digits only" }
        )
        .optional()
        .or(z.literal("")),

    isPrimary: z.boolean().optional(),

    notes: z
        .string()
        .max(1000, { message: "Notes cannot exceed 1000 characters" })
        .optional()
        .or(z.literal("")),
});

export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;
