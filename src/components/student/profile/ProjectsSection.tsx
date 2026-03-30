import { useState } from "react";
import {
    FolderGit2,
    ExternalLink,
    Calendar,
    ChevronDown,
    ChevronUp,
    Github,
    Globe,
    Users,
    Briefcase,
    Star,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ProjectsResponse } from "@/types/student";

interface ProjectsSectionProps {
    projects: ProjectsResponse | null;
}

/* ─── Tech tag color cycling ─── */
const TECH_COLORS = [
    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800",
    "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-800",
    "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-800",
    "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800",
    "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800",
    "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800",
];

function formatDateRange(start: string, end: string | null, isOngoing: boolean) {
    const startDate = new Date(start).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (isOngoing) return `${startDate} – Present`;
    if (!end) return startDate;
    return `${startDate} – ${new Date(end).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
}

function capitalize(str: string) {
    return str.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const INITIAL_VISIBLE = 2;

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
    const list = projects?.projects || [];
    const [showAll, setShowAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const shouldReduce = useReducedMotion();

    const visibleProjects = showAll ? list : list.slice(0, INITIAL_VISIBLE);
    const hasMore = list.length > INITIAL_VISIBLE;

    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <FolderGit2 className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                </div>
                Projects
                {projects && (
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-auto">
                        {projects.total_projects}/{projects.max_projects}
                    </span>
                )}
            </h2>

            {list.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No projects added yet.</p>
            ) : (
                <div className="space-y-3">
                    {visibleProjects.map((project) => {
                        const isExpanded = expandedId === project.project_id;

                        return (
                            <div
                                key={project.project_id}
                                className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200 hover:shadow-md border-l-[3px] border-l-violet-400 dark:border-l-violet-500"
                            >
                                {/* Header */}
                                <button
                                    type="button"
                                    onClick={() => setExpandedId(isExpanded ? null : project.project_id)}
                                    className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {project.project_title}
                                            </h3>
                                            {project.is_featured && (
                                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                    <Star className="h-2.5 w-2.5" />
                                                    Featured
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                {capitalize(project.project_type ?? "")}
                                            </span>
                                            {project.is_ongoing && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                                    Ongoing
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDateRange(project.start_date, project.end_date, project.is_ongoing)}
                                        </div>
                                        {!isExpanded && project.project_description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                                                {project.project_description}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {/* Expanded Detail */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        shouldReduce ? (
                                            <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3 space-y-3">
                                                <ProjectDetail project={project} />
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
                                                    <ProjectDetail project={project} />
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
                            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer"
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

/* ─── Extracted detail sub-component ─── */
function ProjectDetail({ project }: { project: ProjectsResponse["projects"][number] }) {
    return (
        <>
            {project.project_description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {project.project_description}
                </p>
            )}
            <div className="flex items-center gap-6">
                {project.role_in_project && (
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Role</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5 mt-0.5">
                            <Briefcase className="h-3.5 w-3.5 text-violet-400" />
                            {project.role_in_project}
                        </p>
                    </div>
                )}
                {project.team_size > 0 && (
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Team</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5 mt-0.5">
                            <Users className="h-3.5 w-3.5 text-violet-400" />
                            {project.team_size} member{project.team_size > 1 ? "s" : ""}
                        </p>
                    </div>
                )}
            </div>
            {project.technologies_used.length > 0 && (
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Technologies</p>
                    <div className="flex flex-wrap gap-1.5">
                        {project.technologies_used.map((tech, i) => (
                            <span
                                key={tech}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium border ${TECH_COLORS[i % TECH_COLORS.length]}`}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
                {project.github_link && (
                    <a href={project.github_link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105 transition-all duration-200">
                        <Github className="h-3.5 w-3.5" /> GitHub
                    </a>
                )}
                {project.demo_link && (
                    <a href={project.demo_link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white hover:scale-105 transition-all duration-200"
                        style={{ background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" }}>
                        <Globe className="h-3.5 w-3.5" /> Live Demo
                    </a>
                )}
                {project.project_url && !project.demo_link && (
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white hover:scale-105 transition-all duration-200"
                        style={{ background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" }}>
                        <ExternalLink className="h-3.5 w-3.5" /> View Project
                    </a>
                )}
            </div>
        </>
    );
}
