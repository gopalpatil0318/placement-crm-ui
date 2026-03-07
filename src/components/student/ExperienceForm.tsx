import { useState } from "react";
import { useExperience } from "@/hooks/student/useExperience";
import { EMPLOYMENT_TYPE_LABELS, VALID_EMPLOYMENT_TYPES, WORK_MODE_LABELS, VALID_WORK_MODES } from "@/validators/student/experienceSchema";
import { Plus, X, Pencil, Trash2, Briefcase, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const ExperienceForm = ({ }: Props) => {
    const {
        experiences, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        techInput, setTechInput, respInput, setRespInput,
        maxExperience, openAddForm, openEditForm, closeForm,
        handleChange, addTech, removeTech, addResp, removeResp,
        handleSubmit, handleDelete,
    } = useExperience();

    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-xl border">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-3 text-gray-500">Loading experience...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Experience</h2>
                    <p className="text-sm text-gray-500 mt-1">{experiences.length}/{maxExperience} entries</p>
                </div>
                {experiences.length < maxExperience && (
                    <button type="button" onClick={openAddForm}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full font-medium transition cursor-pointer">
                        <Plus className="h-4 w-4" /> Add Experience
                    </button>
                )}
            </div>

            {/* Cards */}
            {experiences.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium mb-1">No experience added yet</p>
                    <p className="text-sm">Add internships, jobs, or freelance work</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {experiences.map((exp) => (
                        <ExperienceCard
                            key={exp.experience_id}
                            experience={exp}
                            onEdit={() => openEditForm(exp)}
                            onDelete={() => exp.experience_id && setPendingDeleteId(exp.experience_id)}
                            isDeleting={deleting === exp.experience_id}
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
                            <h3 className="text-lg font-semibold text-gray-800">{editingId ? "Edit" : "Add"} Experience</h3>
                            <button type="button" onClick={closeForm} className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Company + Position */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input name="company_name" value={formData.company_name} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.company_name && <p className="text-xs text-red-500 mt-1">{errors.company_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Position Title <span className="text-red-500">*</span>
                                    </label>
                                    <input name="position_title" value={formData.position_title} onChange={handleChange}
                                        placeholder="e.g. Software Engineering Intern"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.position_title && <p className="text-xs text-red-500 mt-1">{errors.position_title}</p>}
                                </div>
                            </div>

                            {/* Type + Mode + Location */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type <span className="text-red-500">*</span></label>
                                    <select name="employment_type" value={formData.employment_type} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select</option>
                                        {VALID_EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{EMPLOYMENT_TYPE_LABELS[t]}</option>)}
                                    </select>
                                    {errors.employment_type && <p className="text-xs text-red-500 mt-1">{errors.employment_type}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode <span className="text-red-500">*</span></label>
                                    <select name="work_mode" value={formData.work_mode} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select</option>
                                        {VALID_WORK_MODES.map((m) => <option key={m} value={m}>{WORK_MODE_LABELS[m]}</option>)}
                                    </select>
                                    {errors.work_mode && <p className="text-xs text-red-500 mt-1">{errors.work_mode}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                                    <input name="work_location" value={formData.work_location} onChange={handleChange} placeholder="e.g. Pune"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.work_location && <p className="text-xs text-red-500 mt-1">{errors.work_location}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Description <span className="text-red-500">*</span>
                                </label>
                                <textarea name="job_description" value={formData.job_description} onChange={handleChange} rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {errors.job_description && <p className="text-xs text-red-500 mt-1">{errors.job_description}</p>}
                            </div>

                            {/* Responsibilities */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                                <div className="flex gap-2">
                                    <input value={respInput} onChange={(e) => setRespInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addResp(); } }}
                                        placeholder="Type a responsibility & press Enter"
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <button type="button" onClick={addResp}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition cursor-pointer">Add</button>
                                </div>
                                {formData.responsibilities.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {formData.responsibilities.map((r, i) => (
                                            <li key={i} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <span>• {r}</span>
                                                <button type="button" onClick={() => removeResp(r)} className="text-red-400 hover:text-red-600 cursor-pointer"><X className="h-3 w-3" /></button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Technologies */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                                <div className="flex gap-2">
                                    <input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
                                        placeholder="Type & press Enter"
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <button type="button" onClick={addTech}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition cursor-pointer">Add</button>
                                </div>
                                {formData.technologies_used.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.technologies_used.map((t) => (
                                            <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                                                {t}
                                                <button type="button" onClick={() => removeTech(t)} className="hover:text-blue-900 cursor-pointer"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dates + Current */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input name="start_date" type="date" value={formData.start_date} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>}
                                </div>
                                {!formData.is_current && (
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

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="is_current" checked={formData.is_current} onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-700">I currently work here</span>
                            </label>

                            {/* Stipend + Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stipend / Salary (₹)</label>
                                    <input name="stipend_amount" type="number" value={formData.stipend_amount} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                                    <input name="duration_months" type="number" value={formData.duration_months} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            {/* Links */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
                                    <input name="company_website" value={formData.company_website} onChange={handleChange} placeholder="https://..."
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.company_website && <p className="text-xs text-red-500 mt-1">{errors.company_website}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Offer Letter URL</label>
                                        <input name="offer_letter_url" value={formData.offer_letter_url} onChange={handleChange} placeholder="https://..."
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        {errors.offer_letter_url && <p className="text-xs text-red-500 mt-1">{errors.offer_letter_url}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Completion Certificate URL</label>
                                        <input name="completion_certificate_url" value={formData.completion_certificate_url} onChange={handleChange} placeholder="https://..."
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        {errors.completion_certificate_url && <p className="text-xs text-red-500 mt-1">{errors.completion_certificate_url}</p>}
                                    </div>
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
                                {saving ? "Saving..." : editingId ? "Update" : "Add Experience"}
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
                itemLabel="experience"
            />
        </div>
    );
};

export default ExperienceForm;

/* ================= Experience Card ================= */

const ExperienceCard = ({
    experience: exp, onEdit, onDelete, isDeleting,
}: {
    experience: any;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) => (
    <div className="relative p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition group">
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-1">
                    {exp.is_current && <span className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />}
                    <h3 className="text-base font-semibold text-gray-800 truncate">{exp.position_title}</h3>
                    <span className="text-sm text-gray-500 truncate">— {exp.company_name}</span>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {EMPLOYMENT_TYPE_LABELS[exp.employment_type] || exp.employment_type}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {WORK_MODE_LABELS[exp.work_mode] || exp.work_mode}
                    </span>
                    {exp.work_location && (
                        <span className="text-xs text-gray-400">· {exp.work_location}</span>
                    )}
                </div>

                {/* Date + duration */}
                <p className="text-xs text-gray-400 mb-2">
                    {exp.start_date?.substring(0, 10)} – {exp.is_current ? "Present" : exp.end_date?.substring(0, 10)}
                    {exp.duration_months ? ` · ${exp.duration_months} months` : ""}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exp.job_description}</p>

                {/* Technologies */}
                {exp.technologies_used?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {exp.technologies_used.map((tech: string) => (
                            <span key={tech} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                {/* Links + Verified */}
                <div className="flex items-center gap-3">
                    {exp.company_website && (
                        <a href={exp.company_website} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> Website
                        </a>
                    )}
                    {exp.offer_letter_url && (
                        <a href={exp.offer_letter_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> Offer Letter
                        </a>
                    )}
                    {exp.completion_certificate_url && (
                        <a href={exp.completion_certificate_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> Certificate
                        </a>
                    )}
                    {exp.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </span>
                    )}
                    {exp.is_verified === false && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Please verify this experience from admin
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
