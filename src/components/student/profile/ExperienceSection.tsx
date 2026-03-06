import { useState } from "react";
import { Briefcase, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { ExperienceResponse } from "@/types/student";

interface ExperienceSectionProps {
    experiences: ExperienceResponse | null;
}

function formatDateRange(start: string, end: string | null, isCurrent: boolean) {
    const startDate = new Date(start).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
    if (isCurrent) return `${startDate} – Present`;
    if (!end) return startDate;
    const endDate = new Date(end).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
    return `${startDate} – ${endDate}`;
}

function capitalizeType(type: string) {
    return type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("-");
}

const INITIAL_VISIBLE = 2;

export default function ExperienceSection({
    experiences,
}: ExperienceSectionProps) {
    const list = experiences?.experience || [];
    const [showAll, setShowAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const visibleItems = showAll ? list : list.slice(0, INITIAL_VISIBLE);
    const hasMore = list.length > INITIAL_VISIBLE;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-4">
                <Briefcase className="h-4 w-4 text-violet-500" />
                Experiences
                {experiences && (
                    <span className="text-xs font-normal text-gray-400 ml-auto">
                        {experiences.total_experience}/{experiences.max_experience}
                    </span>
                )}
            </h2>

            {list.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No experience added yet.</p>
            ) : (
                <div className="space-y-4">
                    {visibleItems.map((exp) => {
                        const isExpanded = expandedId === exp.experience_id;

                        return (
                            <div
                                key={exp.experience_id}
                                className="rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
                            >
                                {/* Header */}
                                <button
                                    onClick={() =>
                                        setExpandedId(isExpanded ? null : exp.experience_id)
                                    }
                                    className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            {exp.position_title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {exp.company_name} · {capitalizeType(exp.employment_type)} ·{" "}
                                            {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                                        </p>
                                        {!isExpanded && exp.job_description && (
                                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                                                {exp.job_description}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {/* Expanded */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                                        {exp.work_location && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {exp.work_location}
                                                {exp.work_mode && ` (${capitalizeType(exp.work_mode)})`}
                                            </p>
                                        )}
                                        {exp.job_description && (
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {exp.job_description}
                                            </p>
                                        )}
                                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                                            <ul className="space-y-1">
                                                {exp.responsibilities.map((r, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-xs text-gray-500 flex items-start gap-1.5"
                                                    >
                                                        <span className="text-violet-400 mt-0.5">•</span>
                                                        {r}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {exp.technologies_used && exp.technologies_used.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {exp.technologies_used.map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {exp.duration_months > 0 && (
                                            <p className="text-xs text-gray-400">
                                                Duration: {exp.duration_months} month{exp.duration_months > 1 ? "s" : ""}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Show more/less */}
                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors cursor-pointer"
                        >
                            {showAll ? (
                                <>
                                    Show Less <ChevronUp className="h-3.5 w-3.5" />
                                </>
                            ) : (
                                <>
                                    Show More ({list.length - INITIAL_VISIBLE} more){" "}
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
