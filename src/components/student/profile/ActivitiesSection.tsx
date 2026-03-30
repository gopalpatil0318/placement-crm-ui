import { useState } from "react";
import { Activity as ActivityIcon, ChevronDown, ChevronUp, ExternalLink, Clock } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ActivitiesResponse, Activity } from "@/types/student";

interface ActivitiesSectionProps {
    activities: ActivitiesResponse | null;
}

const TYPE_COLORS: Record<string, string> = {
    hackathon: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    workshop: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    seminar: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    conference: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
    volunteer: "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400",
    sports: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
    cultural: "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400",
    technical: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400",
};

const DEFAULT_TYPE_COLOR = "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400";

function formatDateRange(start: string, end: string | null, isOngoing: boolean) {
    const startDate = new Date(start).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (isOngoing) return `${startDate} – Present`;
    if (!end) return startDate;
    return `${startDate} – ${new Date(end).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
}

function capitalize(str: string) {
    return str.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const INITIAL_VISIBLE = 3;

export default function ActivitiesSection({ activities }: ActivitiesSectionProps) {
    const list = activities?.activities || [];
    const [showAll, setShowAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const shouldReduce = useReducedMotion();

    const visibleItems = showAll ? list : list.slice(0, INITIAL_VISIBLE);
    const hasMore = list.length > INITIAL_VISIBLE;

    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <ActivityIcon className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                </div>
                Activities
                {activities && (
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-auto">
                        {activities.total_activities}/{activities.max_activities}
                    </span>
                )}
            </h2>

            {list.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No activities added yet.</p>
            ) : (
                <div className="space-y-3">
                    {visibleItems.map((act) => {
                        const isExpanded = expandedId === act.activity_id;
                        const typeKey = act.activity_type?.toLowerCase() || "";
                        const typeColor = TYPE_COLORS[typeKey] || DEFAULT_TYPE_COLOR;

                        return (
                            <div
                                key={act.activity_id}
                                className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200 hover:shadow-md"
                            >
                                <button
                                    type="button"
                                    onClick={() => setExpandedId(isExpanded ? null : act.activity_id)}
                                    className="w-full text-left px-4 py-3.5 flex items-start gap-3 cursor-pointer"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {act.activity_name}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${typeColor}`}>
                                                {capitalize(typeKey || "other")}
                                            </span>
                                        </div>
                                        {act.organizing_body && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{act.organizing_body}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {formatDateRange(act.start_date, act.end_date, act.is_ongoing)}
                                            </span>
                                            {(act.hours_contributed ?? 0) > 0 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {act.hours_contributed}h
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        shouldReduce ? (
                                            <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3 space-y-2.5">
                                                <ActDetail act={act} />
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3 space-y-2.5">
                                                    <ActDetail act={act} />
                                                </div>
                                            </motion.div>
                                        )
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer"
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

function ActDetail({ act }: { act: Activity }) {
    return (
        <>
            {act.role_position && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Role: <span className="font-medium text-gray-600 dark:text-gray-300">{act.role_position}</span>
                </p>
            )}
            {act.activity_description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{act.activity_description}</p>
            )}
            {act.proof_urls && act.proof_urls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {act.proof_urls.map((url, i) => (
                        <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Proof {act.proof_urls.length > 1 ? i + 1 : ""}
                        </a>
                    ))}
                </div>
            )}
            {act.certificate_url && (
                <a
                    href={act.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                >
                    <ExternalLink className="h-3 w-3" />
                    View Certificate
                </a>
            )}
        </>
    );
}
