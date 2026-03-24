import { z } from "zod/v4";

// ========================
// CREATE SCHEMA
// ========================

export const createPlacementPolicySchema = z.object({
    passout_year: z
        .number({ error: "Passout year is required" })
        .int("Passout year must be a whole number")
        .min(2000, "Passout year must be 2000 or later")
        .max(2100, "Passout year must be 2100 or earlier"),

    policy_title: z
        .string()
        .min(2, "Policy title must be at least 2 characters")
        .max(200, "Policy title cannot exceed 200 characters"),

    policy_description: z
        .string()
        .min(2, "Policy description must be at least 2 characters")
        .max(2000, "Policy description cannot exceed 2000 characters"),
});

export type CreatePlacementPolicyForm = z.infer<typeof createPlacementPolicySchema>;

// ========================
// UPDATE SCHEMA
// ========================

export const updatePlacementPolicySchema = z.object({
    policy_title: z
        .string()
        .min(2, "Policy title must be at least 2 characters")
        .max(200, "Policy title cannot exceed 200 characters"),

    policy_description: z
        .string()
        .min(2, "Policy description must be at least 2 characters")
        .max(2000, "Policy description cannot exceed 2000 characters"),
});

export type UpdatePlacementPolicyForm = z.infer<typeof updatePlacementPolicySchema>;
