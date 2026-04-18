import { Sparkles } from "lucide-react";
import type { Skill } from "@/types/student";
import { SKILL_CATEGORY_LABELS } from "@/constants/skillCategories";

interface SkillsSectionProps {
    readonly mySkills: Skill[];
}

/* ─── Proficiency config ─── */
const PROFICIENCY_CONFIG: Record<string, { label: string; dots: number; color: string; bg: string }> = {
    beginner:     { label: "Beginner",     dots: 1, color: "bg-gray-400",    bg: "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700" },
    intermediate: { label: "Intermediate", dots: 2, color: "bg-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    advanced:     { label: "Advanced",     dots: 3, color: "bg-violet-500",  bg: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800" },
    expert:       { label: "Expert",       dots: 4, color: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
};

const PROFICIENCY_ORDER = ["expert", "advanced", "intermediate", "beginner", "unspecified"];

function getProficiency(level?: string) {
    if (!level) return null;
    return PROFICIENCY_CONFIG[level.toLowerCase()] || null;
}

function ProficiencyDots({ count }: Readonly<{ count: number }>) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className={`h-1.5 w-4 rounded-full transition-colors ${
                        i <= count ? "bg-violet-500 dark:bg-violet-400" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                />
            ))}
        </div>
    );
}

function groupByProficiency(skills: Skill[]) {
    const groups: Record<string, Skill[]> = {};
    for (const skill of skills) {
        const key = skill.proficiency_level?.toLowerCase() || "unspecified";
        if (!groups[key]) groups[key] = [];
        groups[key].push(skill);
    }
    return Object.entries(groups).sort(
        ([a], [b]) => PROFICIENCY_ORDER.indexOf(a) - PROFICIENCY_ORDER.indexOf(b)
    );
}

function GroupedSkills({ skills }: Readonly<{ skills: Skill[] }>) {
    const grouped = groupByProficiency(skills);

    return (
        <div className="space-y-4">
            {grouped.map(([level, levelSkills]) => {
                const config = getProficiency(level);
                return (
                    <div key={level}>
                        {config && (
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {config.label}
                                </span>
                                <ProficiencyDots count={config.dots} />
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {levelSkills.map((skill) => {
                                const cfg = getProficiency(skill.proficiency_level);
                                const catLabel = skill.skill_category
                                    ? SKILL_CATEGORY_LABELS[skill.skill_category] ?? skill.skill_category
                                    : null;
                                return (
                                    <span
                                        key={skill.skill_id}
                                        title={catLabel ? `Category: ${catLabel}` : undefined}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border hover:scale-105 hover:shadow-sm transition-all duration-200 cursor-default ${
                                            cfg?.bg || "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                                        }`}
                                    >
                                        {skill.skill_name}
                                        {catLabel && (
                                            <span className="ml-1 opacity-60 text-[10px]">
                                                · {catLabel}
                                            </span>
                                        )}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function SimpleSkills({ skills }: Readonly<{ skills: Skill[] }>) {
    return (
        <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
                <span
                    key={skill.skill_id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 hover:scale-105 hover:shadow-sm transition-all duration-200 cursor-default"
                >
                    {skill.skill_name}
                </span>
            ))}
        </div>
    );
}

function renderSkillContent(mySkills: Skill[]) {
    if (!mySkills || mySkills.length === 0) {
        return (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                No skills added yet.
            </p>
        );
    }

    const hasAnyProficiency = mySkills.some((s) => s.proficiency_level);

    if (hasAnyProficiency) {
        return <GroupedSkills skills={mySkills} />;
    }

    return <SimpleSkills skills={mySkills} />;
}

export default function SkillsSection({ mySkills }: Readonly<SkillsSectionProps>) {
    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                </div>
                Skills
                {mySkills && mySkills.length > 0 && (
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-auto">
                        {mySkills.length}
                    </span>
                )}
            </h2>

            {renderSkillContent(mySkills)}
        </div>
    );
}
