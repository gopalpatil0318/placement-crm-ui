import { useState } from "react";
import { useProjects } from "@/hooks/student/useProjects";
import { PROJECT_TYPE_LABELS, VALID_PROJECT_TYPES } from "@/validators/student/projectSchema";
import { Plus, X, Pencil, Trash2, Star, ExternalLink, Github, CheckCircle, AlertCircle } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const ProjectsForm = ({ }: Props) => {
    const {
        projects, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        techInput, setTechInput, maxProjects,
        openAddForm, openEditForm, closeForm,
        handleChange, addTech, removeTech,
        handleSubmit, handleDelete,
    } = useProjects();

    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-xl border">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-3 text-gray-500">Loading projects...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
                    <p className="text-sm text-gray-500 mt-1">{projects.length}/{maxProjects} projects</p>
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
                <div className="text-center py-12 text-gray-400">
                    <p className="text-lg font-medium mb-1">No projects yet</p>
                    <p className="text-sm">Click "Add Project" to showcase your work</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.project_id}
                            project={project}
                            onEdit={() => openEditForm(project)}
                            onDelete={() => project.project_id && setPendingDeleteId(project.project_id)}
                            isDeleting={deleting === project.project_id}
                        />
                    ))}
                </div>
            )}

            {/* ===== Modal Form ===== */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeForm} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {editingId ? "Edit" : "Add"} Project
                            </h3>
                            <button type="button" onClick={closeForm} className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="project_title" value={formData.project_title} onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.project_title && <p className="text-xs text-red-500 mt-1">{errors.project_title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="project_description" value={formData.project_description} onChange={handleChange}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.project_description && <p className="text-xs text-red-500 mt-1">{errors.project_description}</p>}
                            </div>

                            {/* Type + Role */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="project_type" value={formData.project_type} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Type</option>
                                        {VALID_PROJECT_TYPES.map((t) => (
                                            <option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>
                                        ))}
                                    </select>
                                    {errors.project_type && <p className="text-xs text-red-500 mt-1">{errors.project_type}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Role <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="role_in_project" value={formData.role_in_project} onChange={handleChange}
                                        placeholder="e.g. Full Stack Developer"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.role_in_project && <p className="text-xs text-red-500 mt-1">{errors.role_in_project}</p>}
                                </div>
                            </div>

                            {/* Technologies */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Technologies Used <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
                                        placeholder="Type & press Enter"
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="button" onClick={addTech}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition cursor-pointer">
                                        Add
                                    </button>
                                </div>
                                {formData.technologies_used.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.technologies_used.map((tech) => (
                                            <span key={tech} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                                                {tech}
                                                <button type="button" onClick={() => removeTech(tech)} className="hover:text-blue-900 cursor-pointer">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {errors.technologies_used && <p className="text-xs text-red-500 mt-1">{errors.technologies_used}</p>}
                            </div>

                            {/* Dates + Ongoing + Team Size */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input name="start_date" type="date" value={formData.start_date} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>}
                                </div>
                                {!formData.is_ongoing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <input name="end_date" type="date" value={formData.end_date} onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="is_ongoing" checked={formData.is_ongoing}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-700">Ongoing project</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
                                    <span className="text-sm text-gray-700">⭐ Featured</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                                    <input name="team_size" type="number" min="1" value={formData.team_size} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input name="display_order" type="number" min="1" value={formData.display_order} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            {/* Links */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                                    <input name="project_url" value={formData.project_url} onChange={handleChange} placeholder="https://..."
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.project_url && <p className="text-xs text-red-500 mt-1">{errors.project_url}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Link</label>
                                    <input name="github_link" value={formData.github_link} onChange={handleChange} placeholder="https://github.com/..."
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.github_link && <p className="text-xs text-red-500 mt-1">{errors.github_link}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Demo Link</label>
                                    <input name="demo_link" value={formData.demo_link} onChange={handleChange} placeholder="https://..."
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.demo_link && <p className="text-xs text-red-500 mt-1">{errors.demo_link}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button type="button" onClick={closeForm}
                                className="px-6 py-2.5 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 font-medium transition cursor-pointer">
                                Cancel
                            </button>
                            <button type="button" onClick={handleSubmit} disabled={saving}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition cursor-pointer disabled:opacity-50">
                                {saving ? "Saving..." : editingId ? "Update" : "Add Project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

const ProjectCard = ({
    project, onEdit, onDelete, isDeleting,
}: {
    project: any;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) => (
    <div className="relative p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition group">
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {project.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    <h3 className="text-base font-semibold text-gray-800 truncate">{project.project_title}</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {PROJECT_TYPE_LABELS[project.project_type] || project.project_type}
                    </span>
                    <span className="text-xs text-gray-400">
                        {project.start_date?.substring(0, 10)} – {project.is_ongoing ? "Ongoing" : project.end_date?.substring(0, 10)}
                    </span>
                    {project.team_size > 1 && (
                        <span className="text-xs text-gray-400">· Team of {project.team_size}</span>
                    )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.project_description}</p>

                {/* Technologies */}
                {project.technologies_used?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.technologies_used.map((tech: string) => (
                            <span key={tech} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                {/* Links */}
                <div className="flex items-center gap-3">
                    {project.github_link && (
                        <a href={project.github_link} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <Github className="h-3.5 w-3.5" /> GitHub
                        </a>
                    )}
                    {project.demo_link && (
                        <a href={project.demo_link} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> Demo
                        </a>
                    )}
                    {project.project_url && (
                        <a href={project.project_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> Live
                        </a>
                    )}
                    {project.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </span>
                    )}
                    {project.is_verified === false && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Please verify this project from admin
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition ml-3">
                <button type="button" onClick={onEdit}
                    className="p-2 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition cursor-pointer">
                    <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={onDelete} disabled={isDeleting}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer disabled:opacity-50">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    </div>
);
