// ============================================================================
// SKILL CATEGORIES — Central Frontend Source of Truth
// ============================================================================
// Mirrors backend SKILL_CATEGORIES, SKILL_CATEGORY_LABELS, SKILL_CATEGORY_GROUPS
// from constants.js. All skill-related UI imports from here.
// ============================================================================

export const SKILL_CATEGORIES = [
    // Software & IT
    "programming_language", "framework", "database", "devops", "cloud", "testing",
    // Design & Creative
    "design", "cad_modeling",
    // Engineering & Domain
    "simulation", "embedded_systems", "manufacturing", "electrical_systems",
    "data_analytics", "ai_ml",
    // Professional
    "project_management", "soft_skill", "communication", "domain_knowledge",
    // General
    "tool", "other",
] as const;

export type SkillCategoryValue = (typeof SKILL_CATEGORIES)[number];

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
    programming_language: "Programming Language",
    framework: "Framework",
    database: "Database",
    devops: "DevOps",
    cloud: "Cloud",
    testing: "Testing",
    design: "Design",
    cad_modeling: "CAD / Modeling",
    simulation: "Simulation",
    embedded_systems: "Embedded Systems",
    manufacturing: "Manufacturing",
    electrical_systems: "Electrical Systems",
    data_analytics: "Data Analytics",
    ai_ml: "AI / ML",
    project_management: "Project Management",
    soft_skill: "Soft Skill",
    communication: "Communication",
    domain_knowledge: "Domain Knowledge",
    tool: "Tool",
    other: "Other",
};

export const SKILL_CATEGORY_GROUPS: Record<string, readonly SkillCategoryValue[]> = {
    "Software & IT": ["programming_language", "framework", "database", "devops", "cloud", "testing"],
    "Design & Creative": ["design", "cad_modeling"],
    "Engineering & Domain": ["simulation", "embedded_systems", "manufacturing", "electrical_systems", "data_analytics", "ai_ml"],
    "Professional": ["project_management", "soft_skill", "communication", "domain_knowledge"],
    "General": ["tool", "other"],
};

export const SKILL_CATEGORY_COLORS: Record<SkillCategoryValue, { bg: string; text: string }> = {
    // Software & IT
    programming_language: { bg: "bg-cyan-50 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
    framework:            { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
    database:             { bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
    devops:               { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
    cloud:                { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
    testing:              { bg: "bg-teal-50 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300" },
    // Design & Creative
    design:               { bg: "bg-pink-50 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
    cad_modeling:         { bg: "bg-indigo-50 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" },
    // Engineering & Domain
    simulation:           { bg: "bg-violet-50 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
    embedded_systems:     { bg: "bg-lime-50 dark:bg-lime-900/30", text: "text-lime-700 dark:text-lime-300" },
    manufacturing:        { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
    electrical_systems:   { bg: "bg-yellow-50 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" },
    data_analytics:       { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
    ai_ml:                { bg: "bg-violet-50 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
    // Professional
    project_management:   { bg: "bg-sky-50 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300" },
    soft_skill:           { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
    communication:        { bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300" },
    domain_knowledge:     { bg: "bg-slate-50 dark:bg-slate-900/30", text: "text-slate-700 dark:text-slate-300" },
    // General
    tool:                 { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
    other:                { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
};

/** Flat options array: { value, label } for each category */
export const SKILL_CATEGORY_OPTIONS = SKILL_CATEGORIES.map((cat) => ({
    value: cat,
    label: SKILL_CATEGORY_LABELS[cat],
}));

/** Grouped options for <optgroup> or grouped selects */
export const SKILL_CATEGORY_GROUPED_OPTIONS = Object.entries(SKILL_CATEGORY_GROUPS).map(
    ([group, cats]) => ({
        group,
        options: cats.map((cat) => ({ value: cat, label: SKILL_CATEGORY_LABELS[cat] })),
    })
);
