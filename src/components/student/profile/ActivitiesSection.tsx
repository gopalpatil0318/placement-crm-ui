import { useState } from "react";
import { Activity, Calendar, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import type { ActivitiesResponse } from "@/types/student";

interface ActivitiesSectionProps {
    activities: ActivitiesResponse | null;
}

function formatDateRange(start: string, end: string | null, isOngoing: boolean) {
    const startDate = new Date(start).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
    if (isOngoing) return `${startDate} – Present`;
    if (!end) return startDate;
    const endDate = new Date(end).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
    return `${startDate} – ${endDate}`;
}

function capitalize(str: string) {
    return str
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

const INITIAL_VISIBLE = 2;

export default function ActivitiesSection({
    activities,
}: ActivitiesSectionProps) {
    const list = activities?.activities || [];
    const [showAll, setShowAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const visibleItems = showAll ? list : list.slice(0, INITIAL_VISIBLE);
    const hasMore = list.length > INITIAL_VISIBLE;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-violet-500" />
                Activities
                {activities && (
                    <span className="text-xs font-normal text-gray-400 ml-auto">
                        {activities.total_activities}/{activities.max_activities}
                    </span>
                )}
            </h2>

            {list.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No activities added yet.</p>
            ) : (
                <div className="space-y-4">
                    {visibleItems.map((act) => {
                        const isExpanded = expandedId === act.activity_id;

                        return (
                            <div
                                key={act.activity_id}
                                className="rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedId(isExpanded ? null : act.activity_id)
                                    }
                                    className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            {act.activity_name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {act.organizing_body}
                                            {act.role_position && ` · ${act.role_position}`}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDateRange(act.start_date, act.end_date, act.is_ongoing)}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px] font-medium uppercase">
                                                {capitalize(act.activity_type)}
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
                                        {act.activity_description && (
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {act.activity_description}
                                            </p>
                                        )}
                                        {act.hours_contributed > 0 && (
                                            <p className="text-xs text-gray-400">
                                                Hours contributed: <span className="text-gray-600 font-medium">{act.hours_contributed}h</span>
                                            </p>
                                        )}
                                        {act.certificate_url && (
                                            <a
                                                href={act.certificate_url}
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
