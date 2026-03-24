import { z } from "zod";

// ========================
// CREATE SKILL SCHEMA
// ========================

export const createSkillSchema = z.object({
    skill_name: z
        .string()
        .trim()
        .min(1, "Skill name is required")
        .max(100, "Skill name must be at most 100 characters"),
    skill_category: z
        .string()
        .trim()
        .max(100, "Category must be at most 100 characters")
        .optional()
        .or(z.literal("")),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
