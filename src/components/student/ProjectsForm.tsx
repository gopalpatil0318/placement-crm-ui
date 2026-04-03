import { useState, memo, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useProjects } from "@/hooks/student/useProjects";
import type { ProjectData } from "@/services/student/projects.service";
import { PROJECT_TYPE_LABELS, VALID_PROJECT_TYPES } from "@/validators/student/projectSchema";
import { Plus, X, Pencil, Trash2, Star, ExternalLink, CheckCircle, AlertCircle, Calendar, Users, ChevronDown, Code } from "lucide-react";

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
);
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ExpandableDescription({ text }: Readonly<{ text: string }>) {
    const [expanded, setExpanded] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (el) setIsClamped(el.scrollHeight > el.clientHeight + 1);
    }, [text]);

    return (
        <div className="mb-3">
            <p ref={ref} className={`text-sm text-gray-600 dark:text-gray-400 ${expanded ? "" : "line-clamp-2"}`}>
                {text}
            </p>
            {isClamped && (
                <button type="button" onClick={() => setExpanded(v => !v)}
                    className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer">
                    {expanded ? "Show less" : "Show more"}
                    <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
            )}
        </div>
    );
}

const MAX_VISIBLE_CHIPS = 5;

const ProjectsForm = () => {
    const {
        projects, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        techInput, setTechInput, maxProjects,
        openAddForm, openEditForm, closeForm,
        handleChange, addTech, removeTech,
        handleSubmit, handleDelete,
    } = useProjects();

    const shouldReduce = useReducedMotion();
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const getSubmitLabel = () => {
        if (saving) return "Saving...";
        return editingId ? "Update" : "Add Project";
    };

    if (loading) {
        return (
            <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                        <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse mt-2" />
                    </div>
                    <div className="h-9 w-28 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {["a", "b"].map((id) => (
                        <div key={id} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                            <div className="h-4 w-44 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            <div className="flex gap-2">
                                <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            </div>
                            <div className="flex gap-1.5">
                                <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-5 w-12 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Projects</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{projects.length}/{maxProjects} projects</p>
                </div>
                {projects.length < maxProjects && (
                    <button
                        type="button"
                        onClick={openAddForm}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full font-medium transition cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Add Project
                    </button>
                )}
            </div>

            {/* Project Cards */}
            {projects.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <Code className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium mb-1">No projects yet</p>
                    <p className="text-sm">Click "Add Project" to showcase your work</p>
                </div>
            ) : (
                <motion.div
                    variants={shouldReduce ? undefined : staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.project_id}
                            project={project}
                            onEdit={() => openEditForm(project)}
                            onDelete={() => project.project_id && setPendingDeleteId(project.project_id)}
                            isDeleting={deleting === project.project_id}
                            shouldReduce={shouldReduce}
                        />
                    ))}
                </motion.div>
            )}

            {/* ===== Modal Form ===== */}
            <ModalWrapper isOpen={isFormOpen} onClose={closeForm} title={`${editingId ? "Edit" : "Add"} Project`} disabled={saving} size="2xl" footer={
                <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
                    <button type="button" onClick={closeForm}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition cursor-pointer">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition cursor-pointer disabled:opacity-50">
                        {getSubmitLabel()}
                    </button>
                </div>
            }>
                        {/* Body */}
                        <div className="p-6 space-y-5">
                            <FloatingInput label="Project Title" name="project_title" value={formData.project_title} onChange={handleChange} error={errors.project_title} required />

                            <FloatingTextarea label="Description" name="project_description" value={formData.project_description} onChange={handleChange} error={errors.project_description} required rows={3} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingSelect label="Project Type" name="project_type" value={formData.project_type} onChange={handleChange} error={errors.project_type} required options={VALID_PROJECT_TYPES.map(t => ({ value: t, label: PROJECT_TYPE_LABELS[t] }))} />
                                <FloatingInput label="Your Role" name="role_in_project" value={formData.role_in_project} onChange={handleChange} error={errors.role_in_project} required placeholder="e.g. Full Stack Developer" />
                            </div>

                            {/* Technologies */}
                            <div>
                                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Technologies Used <span className="text-red-500">*</span>
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
                                        placeholder="Type & press Enter"
                                        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button type="button" onClick={addTech}
                                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition cursor-pointer">
                                        Add
                                    </button>
                                </div>
                                {formData.technologies_used.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.technologies_used.map((tech) => (
                                            <span key={tech} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800">
                                                {tech}
                                                <button type="button" onClick={() => removeTech(tech)} className="hover:text-blue-900 dark:hover:text-blue-100 cursor-pointer">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {errors.technologies_used && <p className="text-xs text-red-500 mt-1">{errors.technologies_used}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Start Date" name="start_date" value={formData.start_date} onChange={handleChange} error={errors.start_date} required type="date" />
                                {!formData.is_ongoing && (
                                    <FloatingInput label="End Date" name="end_date" value={formData.end_date} onChange={handleChange} error={errors.end_date} required type="date" />
                                )}
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="is_ongoing" checked={formData.is_ongoing}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Ongoing project</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300"><Star className="inline h-4 w-4 text-amber-500 fill-amber-500 -mt-0.5 mr-1" />Featured</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Team Size" name="team_size" value={formData.team_size} onChange={handleChange} type="number" inputMode="numeric" />
                                <FloatingInput label="Display Order" name="display_order" value={formData.display_order} onChange={handleChange} type="number" inputMode="numeric" />
                            </div>

                            <div className="space-y-4">
                                <FloatingInput label="Project URL" name="project_url" value={formData.project_url} onChange={handleChange} error={errors.project_url} placeholder="https://..." inputMode="url" />
                                <FloatingInput label="GitHub Link" name="github_link" value={formData.github_link} onChange={handleChange} error={errors.github_link} placeholder="https://github.com/..." inputMode="url" />
                                <FloatingInput label="Demo Link" name="demo_link" value={formData.demo_link} onChange={handleChange} error={errors.demo_link} placeholder="https://..." inputMode="url" />
                            </div>
                        </div>
            </ModalWrapper>

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={!!pendingDeleteId}
                onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
                onConfirm={() => { if (pendingDeleteId) { handleDelete(pendingDeleteId); setPendingDeleteId(null); } }}
                isDeleting={deleting === pendingDeleteId}
                itemLabel="project"
            />
        </div>
    );
};

export default ProjectsForm;

/* ================= Project Card ================= */

const ProjectCard = memo(function ProjectCard({
    project, onEdit, onDelete, isDeleting, shouldReduce,
}: {
    project: ProjectData;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
    shouldReduce: boolean | null;
}) {
    const visibleTech = project.technologies_used?.slice(0, MAX_VISIBLE_CHIPS) ?? [];
    const hiddenTechCount = (project.technologies_used?.length ?? 0) - MAX_VISIBLE_CHIPS;

    return (
        <motion.div
            variants={shouldReduce ? undefined : staggerItem}
            role="article"
            className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 overflow-hidden transition-shadow hover:shadow-md"
        >
            {/* Accent strip */}
            <div className={`h-1 ${project.is_featured ? "bg-amber-500" : "bg-indigo-500"}`} />

            <div className="p-5">
                {/* Header: Icon + Title + Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-900/20">
                            <Code size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                {project.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />}
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{project.project_title}</h3>
                            </div>
                            {project.role_in_project && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{project.role_in_project}</p>
                            )}
                        </div>
                    </div>
                    {/* Actions — always visible on mobile */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                        <button type="button" onClick={onEdit} aria-label="Edit project"
                            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition cursor-pointer">
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={onDelete} disabled={isDeleting} aria-label="Delete project" aria-busy={isDeleting}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition cursor-pointer disabled:opacity-50">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <output className="text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
                        {PROJECT_TYPE_LABELS[project.project_type] || project.project_type}
                    </output>
                    {project.is_ongoing && (
                        <output className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
                            <span>Ongoing</span>
                        </output>
                    )}
                    {project.is_featured && (
                        <span className="text-xs px-2.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full font-medium">
                            Featured
                        </span>
                    )}
                </div>

                {/* Meta: date + team */}
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
                        <span>
                            {formatDate(project.start_date)} – {project.is_ongoing ? "Present" : formatDate(project.end_date)}
                        </span>
                    </div>
                    {project.team_size > 1 && (
                        <div className="flex items-center gap-2">
                            <Users size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
                            <span>Team of {project.team_size}</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {project.project_description && <ExpandableDescription text={project.project_description} />}

                {/* Technologies */}
                {visibleTech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {visibleTech.map((tech: string) => (
                            <span key={tech} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                                {tech}
                            </span>
                        ))}
                        {hiddenTechCount > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                                +{hiddenTechCount} more
                            </span>
                        )}
                    </div>
                )}

                {/* Links + Verified */}
                <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-gray-100 dark:border-gray-700">
                    {project.github_link && (
                        <a href={project.github_link} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <GitHubIcon className="h-3.5 w-3.5" /> GitHub
                        </a>
                    )}
                    {project.demo_link && (
                        <a href={project.demo_link} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ExternalLink className="h-3.5 w-3.5" /> Demo
                        </a>
                    )}
                    {project.project_url && (
                        <a href={project.project_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ExternalLink className="h-3.5 w-3.5" /> Live
                        </a>
                    )}
                    {project.is_verified && (
                        <output className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </output>
                    )}
                    {project.is_verified === false && (
                        <output className="inline-flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Pending verification
                        </output>
                    )}
                </div>
            </div>
        </motion.div>
    );
});
