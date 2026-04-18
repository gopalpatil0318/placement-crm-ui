import { useState } from "react";
import { Briefcase, MapPin, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, AlertCircle, Check, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ExperienceResponse } from "@/types/student";

interface ExperienceSectionProps {
    experiences: ExperienceResponse | null;
    viewMode?: "student" | "college" | "interviewer";
    onApproveItem?: (id: string) => void;
    onRejectItem?: (id: string) => void;
    processingId?: string | null;
}

function formatDateRange(start: string, end: string | null, isCurrent: boolean) {
    const startDate = new Date(start).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (isCurrent) return `${startDate} – Present`;
    if (!end) return startDate;
    return `${startDate} – ${new Date(end).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
}

function capitalizeType(type: string) {
    return type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("-");
}

const INITIAL_VISIBLE = 3;

export default function ExperienceSection({ experiences, viewMode, onApproveItem, onRejectItem, processingId }: Readonly<ExperienceSectionProps>) {
    const list = experiences?.experience || [];
    const [showAll, setShowAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const shouldReduce = useReducedMotion();

    const visibleItems = showAll ? list : list.slice(0, INITIAL_VISIBLE);
    const hasMore = list.length > INITIAL_VISIBLE;

    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <Briefcase className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                </div>
                Experience
                {experiences && (
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-auto">
                        {experiences.total_experience}/{experiences.max_experience}
                    </span>
                )}
            </h2>

            {list.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No experience added yet.</p>
            ) : (
                <div className="relative">
                    {/* Timeline vertical connector */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-300 via-violet-200 to-transparent dark:from-violet-700 dark:via-violet-800 dark:to-transparent" />

                    <div className="space-y-4">
                        {visibleItems.map((exp) => {
                            const isExpanded = expandedId === exp.experience_id;
                            const companyInitial = exp.company_name?.charAt(0).toUpperCase() || "C";

                            return (
                                <div key={exp.experience_id} className="relative pl-12">
                                    {/* Timeline dot — company initial */}
                                    <div className="absolute left-0 top-3 h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-900/30 border-2 border-violet-200 dark:border-violet-700 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-400 z-10">
                                        {companyInitial}
                                    </div>

                                    <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200 hover:shadow-md">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedId(isExpanded ? null : exp.experience_id)}
                                            className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {exp.position_title}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {exp.company_name} · {capitalizeType(exp.employment_type)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                                                    </span>
                                                    {(exp.duration_months ?? 0) > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            {exp.duration_months}mo
                                                        </span>
                                                    )}
                                                </div>
                                                {!isExpanded && exp.job_description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                                                        {exp.job_description}
                                                    </p>
                                                )}
                                            </div>
                                            <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                        </button>

                                        {/* Verification status bar (college view) */}
                                        {viewMode === "college" && exp.verification_status && (
                                            <div className="px-4 py-2 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${(() => {
                                                    if (exp.verification_status === "approved") return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
                                                    if (exp.verification_status === "rejected") return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                                                    return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300";
                                                })()}`}>
                                                    {exp.verification_status === "approved" && <CheckCircle className="h-3 w-3" />}
                                                    {exp.verification_status === "rejected" && <XCircle className="h-3 w-3" />}
                                                    {exp.verification_status === "pending" && <AlertCircle className="h-3 w-3" />}
                                                    {exp.verification_status.charAt(0).toUpperCase() + exp.verification_status.slice(1)}
                                                </span>
                                                {exp.verification_status === "rejected" && exp.rejection_reason && (
                                                    <span className="text-[11px] text-red-500 dark:text-red-400 truncate flex-1 text-right">
                                                        {exp.rejection_reason}
                                                    </span>
                                                )}
                                                {exp.verification_status === "pending" && onApproveItem && onRejectItem && (
                                                    <div className="flex items-center gap-1">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); onApproveItem(exp.experience_id); }} disabled={processingId === exp.experience_id} className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Approve">
                                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                        </button>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); onRejectItem(exp.experience_id); }} disabled={processingId === exp.experience_id} className="h-7 w-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Reject">
                                                            <X className="h-3.5 w-3.5 text-red-600" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <AnimatePresence>
                                            {isExpanded && (
                                                shouldReduce ? (
                                                    <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3 space-y-3">
                                                        <ExpDetail exp={exp} />
                                                    </div>
                                                ) : (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3 space-y-3">
                                                            <ExpDetail exp={exp} />
                                                        </div>
                                                    </motion.div>
                                                )
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 mt-3 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer"
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

function ExpDetail({ exp }: Readonly<{ exp: ExperienceResponse["experience"][number] }>) {
    return (
        <>
            {exp.work_location && (
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {exp.work_location}
                    {exp.work_mode && ` (${capitalizeType(exp.work_mode)})`}
                </p>
            )}
            {exp.job_description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{exp.job_description}</p>
            )}
            {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="space-y-1">
                    {exp.responsibilities.map((r) => (
                        <li key={r} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                            <span className="text-violet-400 mt-0.5">•</span>
                            {r}
                        </li>
                    ))}
                </ul>
            )}
            {exp.technologies_used && exp.technologies_used.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {exp.technologies_used.map((tech) => (
                        <span key={tech} className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                            {tech}
                        </span>
                    ))}
                </div>
            )}
        </>
    );
}
