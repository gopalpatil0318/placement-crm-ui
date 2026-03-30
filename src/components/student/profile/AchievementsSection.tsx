import { useState } from "react";
import { Trophy, ChevronDown, ChevronUp, ExternalLink, Star, Users, Medal } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AchievementsResponse, Achievement } from "@/types/student";

interface AchievementsSectionProps {
    achievements: AchievementsResponse | null;
}

const LEVEL_CONFIG: Record<string, { accent: string; bg: string; icon: typeof Trophy }> = {
    international: { accent: "border-l-amber-400 dark:border-l-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400", icon: Trophy },
    national: { accent: "border-l-gray-400 dark:border-l-gray-500", bg: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300", icon: Medal },
    state: { accent: "border-l-orange-400 dark:border-l-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400", icon: Medal },
    college: { accent: "border-l-violet-400 dark:border-l-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400", icon: Star },
};

const DEFAULT_LEVEL = { accent: "border-l-gray-300 dark:border-l-gray-600", bg: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400", icon: Star };

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const INITIAL_VISIBLE = 3;

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
    const list = achievements?.achievements || [];
    const [showAll, setShowAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const shouldReduce = useReducedMotion();

    const visibleItems = showAll ? list : list.slice(0, INITIAL_VISIBLE);
    const hasMore = list.length > INITIAL_VISIBLE;

    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <Trophy className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                </div>
                Achievements
                {achievements && (
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-auto">
                        {achievements.total_achievements}/{achievements.max_achievements}
                    </span>
                )}
            </h2>

            {list.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No achievements added yet.</p>
            ) : (
                <div className="space-y-3">
                    {visibleItems.map((ach) => {
                        const isExpanded = expandedId === ach.achievement_id;
                        const levelKey = ach.achievement_level?.toLowerCase() || "";
                        const config = LEVEL_CONFIG[levelKey] || DEFAULT_LEVEL;
                        const LevelIcon = config.icon;

                        return (
                            <div
                                key={ach.achievement_id}
                                className={`rounded-xl border border-gray-100 dark:border-gray-800 border-l-[3px] ${config.accent} overflow-hidden transition-all duration-200 hover:shadow-md`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setExpandedId(isExpanded ? null : ach.achievement_id)}
                                    className="w-full text-left px-4 py-3.5 flex items-start gap-3 cursor-pointer"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {ach.achievement_title}
                                            </h3>
                                            {ach.is_featured && (
                                                <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                                            )}
                                        </div>
                                        {ach.event_name && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ach.event_name}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg}`}>
                                                <LevelIcon className="h-2.5 w-2.5" />
                                                {capitalize(levelKey || "other")}
                                            </span>
                                            {ach.position_rank && (
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    #{ach.position_rank}
                                                </span>
                                            )}
                                            {ach.achievement_date && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {formatDate(ach.achievement_date)}
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
                                                <AchDetail ach={ach} />
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
                                                    <AchDetail ach={ach} />
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

function AchDetail({ ach }: { ach: Achievement }) {
    return (
        <>
            {ach.achievement_description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{ach.achievement_description}</p>
            )}
            {ach.issuing_organization && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Issued by <span className="text-gray-500 dark:text-gray-400 font-medium">{ach.issuing_organization}</span>
                </p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
                {(ach.participants_count ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Users className="h-3 w-3" />
                        {ach.participants_count} participants
                    </span>
                )}
                {(ach.certificate_url || ach.proof_url) && (
                    <a
                        href={ach.certificate_url || ach.proof_url || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                    >
                        <ExternalLink className="h-3 w-3" />
                        View Proof
                    </a>
                )}
            </div>
        </>
    );
}
