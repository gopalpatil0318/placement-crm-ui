// ============================================================================
// CRITERIA_CONFIG — Single source of truth for all eligibility criteria UX
// ============================================================================
// Used by: JobCriteriaManager, CreateJobForm (Step 4), CriteriaHistoryPanel
// Each criterion has: label, description, example, unit, inputType, help text,
// and optional min/max/step for numeric inputs.
// ============================================================================

export interface CriteriaConfigItem {
    key: string;
    label: string;
    description: string;
    example: string;
    helpWhenEnabled: string;
    helpWhenDisabled: string;
    unit?: string;
    inputType: "number" | "boolean" | "multiselect" | "skills";
    min?: number;
    max?: number;
    step?: number;
    group: "academic" | "demographic" | "placement" | "skills";
}

export const CRITERIA_CONFIG: Record<string, CriteriaConfigItem> = {
    // ── Academic ──────────────────────────────────────────────────────────
    min_overall_cgpa: {
        key: "min_overall_cgpa",
        label: "Minimum Overall CGPA",
        description: "Only students with CGPA at or above this value can apply.",
        example: "Set to 7.0 → A student with 7.5 CGPA can apply. A student with 6.8 cannot.",
        helpWhenEnabled: "Students with CGPA below this will see 'Not Eligible' and cannot apply (unless they get an override).",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        unit: "CGPA",
        inputType: "number",
        min: 0,
        max: 10,
        step: 0.1,
        group: "academic",
    },
    max_live_kts: {
        key: "max_live_kts",
        label: "Maximum Active Backlogs",
        description: "Only students with active backlogs at or below this number can apply.",
        example: "Set to 2 → A student with 1 backlog can apply. Set to 0 → Only students with zero backlogs.",
        helpWhenEnabled: "Students with more backlogs than this limit will be marked ineligible.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        unit: "backlogs",
        inputType: "number",
        min: 0,
        max: 20,
        step: 1,
        group: "academic",
    },
    min_tenth_percentage: {
        key: "min_tenth_percentage",
        label: "Minimum 10th Percentage",
        description: "Only students with 10th marks at or above this percentage can apply.",
        example: "Set to 60 → A student with 65% can apply. A student with 55% cannot.",
        helpWhenEnabled: "Students below this percentage will be blocked from applying.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        unit: "%",
        inputType: "number",
        min: 0,
        max: 100,
        step: 1,
        group: "academic",
    },
    min_twelfth_percentage: {
        key: "min_twelfth_percentage",
        label: "Minimum 12th Percentage",
        description: "Only students who completed 12th with marks at or above this percentage. Applied only to 12th-pass students (not diploma).",
        example: "Set to 55 → 12th students with 60% can apply. Diploma students are not affected by this criterion.",
        helpWhenEnabled: "Only 12th-pass students are checked. Diploma students bypass this filter.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        unit: "%",
        inputType: "number",
        min: 0,
        max: 100,
        step: 1,
        group: "academic",
    },
    min_diploma_percentage: {
        key: "min_diploma_percentage",
        label: "Minimum Diploma Percentage",
        description: "Only diploma students with marks at or above this percentage. Applied only to diploma students (not 12th-pass).",
        example: "Set to 60 → Diploma students with 65% can apply. 12th-pass students are not affected.",
        helpWhenEnabled: "Only diploma students are checked. 12th-pass students bypass this filter.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        unit: "%",
        inputType: "number",
        min: 0,
        max: 100,
        step: 1,
        group: "academic",
    },

    // ── Placement / Package ──────────────────────────────────────────────
    min_existing_package: {
        key: "min_existing_package",
        label: "Minimum Existing Package (₹ LPA)",
        description: "Only students who already have a placement at or above this package can apply.",
        example: "Set to 5 → Only students placed at ₹5 LPA or above can sit for this drive (dream upgrade). Unplaced students (₹0) will be filtered out.",
        helpWhenEnabled: "This filters out students with lower packages. Use for dream/super-dream drives.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        unit: "₹ LPA",
        inputType: "number",
        min: 0,
        max: 999,
        step: 0.5,
        group: "placement",
    },
    max_existing_package: {
        key: "max_existing_package",
        label: "Maximum Existing Package (₹ LPA)",
        description: "Students with an existing package above this cannot apply.",
        example: "Set to 10 → Students already placed at ₹12 LPA cannot apply. Use to reserve mass-hiring drives for lower-package or unplaced students.",
        helpWhenEnabled: "Students with packages above this will be excluded.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        unit: "₹ LPA",
        inputType: "number",
        min: 0,
        max: 999,
        step: 0.5,
        group: "placement",
    },
    exclude_already_placed: {
        key: "exclude_already_placed",
        label: "Exclude Already Placed Students",
        description: "If enabled, students who have already accepted or joined a company cannot apply.",
        example: "Enable this → A student who accepted TCS cannot apply. Disable this → Placed students can also apply (useful for dream upgrades).",
        helpWhenEnabled: "All placed students (accepted/joined status) will be blocked from applying.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        inputType: "boolean",
        group: "placement",
    },

    // ── Demographic ──────────────────────────────────────────────────────
    allowed_genders: {
        key: "allowed_genders",
        label: "Allowed Genders",
        description: "Only students with these genders can apply.",
        example: "Select 'Female' only → Only female students can apply. Select all → No gender filter.",
        helpWhenEnabled: "Students with genders not in this list will be marked ineligible.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        inputType: "multiselect",
        group: "demographic",
    },
    allowed_departments: {
        key: "allowed_departments",
        label: "Allowed Departments",
        description: "Only students from these departments can apply.",
        example: "Select 'CSE' and 'IT' → Only CS and IT students can apply. Leave empty → All departments allowed.",
        helpWhenEnabled: "Students from other departments will see 'Not Eligible'.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        inputType: "multiselect",
        group: "demographic",
    },
    allowed_gap_statuses: {
        key: "allowed_gap_statuses",
        label: "Education Gap Status",
        description: "Filter students by whether they have a gap in education.",
        example: "Select 'No Gap' → Only students without education gaps. Select both → No gap filter.",
        helpWhenEnabled: "Students whose gap status doesn't match will be blocked.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        inputType: "multiselect",
        group: "demographic",
    },

    // ── Skills ───────────────────────────────────────────────────────────
    min_skill_match_percentage: {
        key: "min_skill_match_percentage",
        label: "Minimum Skill Match (%)",
        description: "Students must match at least this percentage of required skills to apply.",
        example: "You require 5 skills and set 60% → Student must have at least 3 of 5 skills. Set to 100% → Must have all 5.",
        helpWhenEnabled: "Students below this skill match threshold will be marked ineligible.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        unit: "%",
        inputType: "number",
        min: 0,
        max: 100,
        step: 5,
        group: "skills",
    },
    required_skills: {
        key: "required_skills",
        label: "Required Skills",
        description: "Select skills from your college's skill catalog. Students' skills will be matched against these.",
        example: "Select 'React', 'Node.js', 'SQL' → Students who have these skills in their profile will have a higher match %. Those below the threshold won't be eligible.",
        helpWhenEnabled: "Students will be matched against these skills. Their match % determines eligibility.",
        helpWhenDisabled: "This criterion is currently disabled and will not be applied.",
        inputType: "skills",
        group: "skills",
    },
};

// Ordered groups for rendering
export const CRITERIA_GROUPS = [
    { key: "academic" as const, label: "Academic Criteria", icon: "GraduationCap" },
    { key: "placement" as const, label: "Placement & Package", icon: "Briefcase" },
    { key: "demographic" as const, label: "Demographic Filters", icon: "Users" },
    { key: "skills" as const, label: "Skill-Based Matching", icon: "Sparkles" },
] as const;

// Get configs for a specific group
export function getCriteriaByGroup(group: string): CriteriaConfigItem[] {
    return Object.values(CRITERIA_CONFIG).filter((c) => c.group === group);
}

// All criteria keys in render order
export const CRITERIA_ORDER = [
    "min_overall_cgpa",
    "max_live_kts",
    "min_tenth_percentage",
    "min_twelfth_percentage",
    "min_diploma_percentage",
    "min_existing_package",
    "max_existing_package",
    "exclude_already_placed",
    "allowed_genders",
    "allowed_departments",
    "allowed_gap_statuses",
    "min_skill_match_percentage",
    "required_skills",
] as const;
