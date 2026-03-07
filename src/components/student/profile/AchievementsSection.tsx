import { useState } from "react";
import { Trophy, ExternalLink, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import type { AchievementsResponse } from "@/types/student";

interface AchievementsSectionProps {
    achievements: AchievementsResponse | null;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const INITIAL_VISIBLE = 2;

export default function AchievementsSection({
    achievements,
}: AchievementsSectionProps) {
    const list = achievements?.achievements || [];
    const [showAll, setShowAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const visibleItems = showAll ? list : list.slice(0, INITIAL_VISIBLE);
    const hasMore = list.length > INITIAL_VISIBLE;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-4">
                <Trophy className="h-4 w-4 text-violet-500" />
                Achievements
                {achievements && (
                    <span className="text-xs font-normal text-gray-400 ml-auto">
                        {achievements.total_achievements}/{achievements.max_achievements}
                    </span>
                )}
            </h2>

            {list.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No achievements added yet.</p>
            ) : (
                <div className="space-y-4">
                    {visibleItems.map((ach) => {
                        const isExpanded = expandedId === ach.achievement_id;

                        return (
                            <div
                                key={ach.achievement_id}
                                className="rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedId(isExpanded ? null : ach.achievement_id)
                                    }
                                    className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            {ach.achievement_title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {ach.issuing_organization}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(ach.achievement_date)}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
                                                {capitalize(ach.achievement_level)}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">
                                                {capitalize(ach.achievement_type)}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                                        {ach.achievement_description && (
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {ach.achievement_description}
                                            </p>
                                        )}
                                        {ach.event_name && (
                                            <p className="text-xs text-gray-400">
                                                Event: <span className="text-gray-600">{ach.event_name}</span>
                                            </p>
                                        )}
                                        {ach.position_rank && (
                                            <p className="text-xs text-gray-400">
                                                Position: <span className="text-gray-600 font-medium">{ach.position_rank}</span>
                                                {ach.participants_count > 0 && ` (out of ${ach.participants_count} participants)`}
                                            </p>
                                        )}
                                        {ach.certificate_url && (
                                            <a
                                                href={ach.certificate_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                                                style={{
                                                    background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)",
                                                }}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                View Certificate
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors cursor-pointer"
                        >
                            {showAll ? (
                                <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
                            ) : (
                                <>Show More ({list.length - INITIAL_VISIBLE} more) <ChevronDown className="h-3.5 w-3.5" /></>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
