import { z } from "zod";

export const VALID_SKILL_CATEGORIES = [
    "programming_language", "framework", "database", "devops",
    "cloud", "design", "testing", "soft_skill", "tool", "other",
] as const;

export const VALID_PROFICIENCY_LEVELS = [
    "beginner", "intermediate", "advanced", "expert",
] as const;

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
    programming_language: "Programming Language",
    framework: "Framework",
    database: "Database",
    devops: "DevOps",
    cloud: "Cloud",
    design: "Design",
    testing: "Testing",
    soft_skill: "Soft Skill",
    tool: "Tool",
    other: "Other",
};

export const PROFICIENCY_LABELS: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
};

export const addSkillSchema = z.object({
    skill_name: z.string().min(1, "Skill name is required").max(100),
    skill_category: z.enum(VALID_SKILL_CATEGORIES, {
        message: "Please select a valid category",
    }),
});

export const syncSkillsSchema = z.object({
    skills: z.array(
        z.object({
            skill_id: z.string().min(1, "Skill ID is required"),
            proficiency_level: z.enum(VALID_PROFICIENCY_LEVELS, {
                message: "Please select a valid proficiency level",
            }),
        })
    ),
});

export type AddSkillSchemaType = z.infer<typeof addSkillSchema>;
export type SyncSkillsSchemaType = z.infer<typeof syncSkillsSchema>;
