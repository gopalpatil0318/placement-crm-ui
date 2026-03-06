import { Sparkles } from "lucide-react";
import type { Skill } from "@/types/student";

interface SkillsSectionProps {
    mySkills: Skill[];
}

/* ─── Proficiency level labels ─── */
const PROFICIENCY_LABELS: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
};

function getProficiencyLabel(level?: string): string | null {
    if (!level) return null;
    return PROFICIENCY_LABELS[level.toLowerCase()] || null;
}

export default function SkillsSection({ mySkills }: SkillsSectionProps) {
    const hasAnyProficiency = mySkills?.some((s) => s.proficiency_level);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-5">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Skills
                {mySkills && mySkills.length > 0 && (
                    <span className="text-xs font-normal text-gray-400 ml-auto">
                        {mySkills.length}
                    </span>
                )}
            </h2>

            {!mySkills || mySkills.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                    No skills added yet.
                </p>
            ) : hasAnyProficiency ? (
                /* ─── Skills list with proficiency label ─── */
                <div className="divide-y divide-gray-50">
                    {mySkills.map((skill, idx) => {
                        const label = getProficiencyLabel(skill.proficiency_level);
                        return (
                            <div
                                key={skill.skill_id || idx}
                                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                            >
                                <span className="text-sm font-medium text-gray-800">
                                    {skill.skill_name ||
                                        skill.name ||
                                        String(skill)}
                                </span>
                                {label && (
                                    <span className="text-xs text-gray-500 font-medium">
                                        {label}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ─── Fallback: simple tags (no proficiency data) ─── */
                <div className="flex flex-wrap gap-2">
                    {mySkills.map((skill, idx) => (
                        <span
                            key={skill.skill_id || idx}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                        >
                            {skill.skill_name || skill.name || String(skill)}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
