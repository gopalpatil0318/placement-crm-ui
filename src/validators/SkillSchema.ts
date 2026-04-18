import { z } from "zod";
import { SKILL_CATEGORIES } from "@/constants/skillCategories";

// ========================
// CREATE SKILL SCHEMA
// ========================

export const createSkillSchema = z.object({
    skill_name: z
        .string()
        .trim()
        .min(1, "Skill name is required")
        .max(100, "Skill name must be at most 100 characters"),
    skill_category: z.enum(SKILL_CATEGORIES, {
        message: "Please select a valid category",
    }),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;

// ========================
// UPDATE SKILL SCHEMA
// ========================

export const updateSkillSchema = z.object({
    skill_name: z
        .string()
        .trim()
        .min(1, "Skill name cannot be empty")
        .max(100, "Skill name must be at most 100 characters")
        .optional(),
    skill_category: z.enum(SKILL_CATEGORIES, {
        message: "Please select a valid category",
    }).optional(),
}).refine(
    (data) => data.skill_name !== undefined || data.skill_category !== undefined,
    { message: "At least one field must be provided" }
);

export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;

export { SKILL_CATEGORIES } from "@/constants/skillCategories";
export { SKILL_CATEGORY_LABELS } from "@/constants/skillCategories";
