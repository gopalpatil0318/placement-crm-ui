import { useState, memo, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useExperience } from "@/hooks/student/useExperience";
import type { ExperienceData } from "@/services/student/experience.service";
import { EMPLOYMENT_TYPE_LABELS, VALID_EMPLOYMENT_TYPES, WORK_MODE_LABELS, VALID_WORK_MODES } from "@/validators/student/experienceSchema";
import { Plus, X, Pencil, Trash2, Briefcase, CheckCircle, ExternalLink, AlertCircle, Calendar, ChevronDown, MapPin } from "lucide-react";
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
                    className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">
                    {expanded ? "Show less" : "Show more"}
                    <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
            )}
        </div>
    );
}

const MAX_VISIBLE_CHIPS = 5;

const ExperienceForm = () => {
    const {
        experiences, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        techInput, setTechInput, respInput, setRespInput,
        maxExperience, openAddForm, openEditForm, closeForm,
        handleChange, addTech, removeTech, addResp, removeResp,
        handleSubmit, handleDelete,
    } = useExperience();

    const shouldReduce = useReducedMotion();
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const getSubmitLabel = () => {
        if (saving) return "Saving...";
        return editingId ? "Update" : "Add Experience";
    };

    if (loading) {
        return (
            <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                        <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse mt-2" />
                    </div>
                    <div className="h-9 w-28 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {["a", "b"].map((id) => (
                        <div key={id} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            <div className="flex gap-2">
                                <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            </div>
                            <div className="h-3 w-36 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            <div className="space-y-1.5">
                                <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            </div>
                            <div className="flex gap-1.5">
                                <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
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
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Experience</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{experiences.length}/{maxExperience} entries</p>
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
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium mb-1">No experience added yet</p>
                    <p className="text-sm">Add internships, jobs, or freelance work</p>
                </div>
            ) : (
                <motion.div
                    variants={shouldReduce ? undefined : staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {experiences.map((exp) => (
                        <ExperienceCard
                            key={exp.experience_id}
                            experience={exp}
                            onEdit={() => openEditForm(exp)}
                            onDelete={() => exp.experience_id && setPendingDeleteId(exp.experience_id)}
                            isDeleting={deleting === exp.experience_id}
                            shouldReduce={shouldReduce}
                        />
                    ))}
                </motion.div>
            )}

            {/* ===== Modal Form ===== */}
            <ModalWrapper isOpen={isFormOpen} onClose={closeForm} title={`${editingId ? "Edit" : "Add"} Experience`} disabled={saving} size="2xl" footer={
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} error={errors.company_name} required />
                                <FloatingInput label="Position Title" name="position_title" value={formData.position_title} onChange={handleChange} error={errors.position_title} required placeholder="e.g. Software Engineering Intern" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FloatingSelect label="Employment Type" name="employment_type" value={formData.employment_type} onChange={handleChange} error={errors.employment_type} required options={VALID_EMPLOYMENT_TYPES.map(t => ({ value: t, label: EMPLOYMENT_TYPE_LABELS[t] }))} />
                                <FloatingSelect label="Work Mode" name="work_mode" value={formData.work_mode} onChange={handleChange} error={errors.work_mode} required options={VALID_WORK_MODES.map(m => ({ value: m, label: WORK_MODE_LABELS[m] }))} />
                                <FloatingInput label="Location" name="work_location" value={formData.work_location} onChange={handleChange} error={errors.work_location} required placeholder="e.g. Pune" />
                            </div>

                            <FloatingTextarea label="Job Description" name="job_description" value={formData.job_description} onChange={handleChange} error={errors.job_description} required rows={3} />

                            {/* Responsibilities */}
                            <div>
                                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsibilities</p>
                                <div className="flex gap-2">
                                    <input value={respInput} onChange={(e) => setRespInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addResp(); } }}
                                        placeholder="Type a responsibility & press Enter"
                                        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" />
                                    <button type="button" onClick={addResp}
                                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition cursor-pointer">Add</button>
                                </div>
                                {formData.responsibilities.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {formData.responsibilities.map((r) => (
                                            <li key={r} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                                                <span>• {r}</span>
                                                <button type="button" onClick={() => removeResp(r)} className="text-red-400 hover:text-red-600 cursor-pointer"><X className="h-3 w-3" /></button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Technologies */}
                            <div>
                                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologies Used</p>
                                <div className="flex gap-2">
                                    <input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
                                        placeholder="Type & press Enter"
                                        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" />
                                    <button type="button" onClick={addTech}
                                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition cursor-pointer">Add</button>
                                </div>
                                {formData.technologies_used.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.technologies_used.map((t) => (
                                            <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800">
                                                {t}
                                                <button type="button" onClick={() => removeTech(t)} className="hover:text-blue-900 dark:hover:text-blue-100 cursor-pointer"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Start Date" name="start_date" value={formData.start_date} onChange={handleChange} error={errors.start_date} required type="date" />
                                {!formData.is_current && (
                                    <FloatingInput label="End Date" name="end_date" value={formData.end_date} onChange={handleChange} error={errors.end_date} required type="date" />
                                )}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="is_current" checked={formData.is_current} onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">I currently work here</span>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Stipend / Salary (₹)" name="stipend_amount" value={formData.stipend_amount} onChange={handleChange} type="number" inputMode="decimal" />
                                <FloatingInput label="Duration (months)" name="duration_months" value={formData.duration_months} onChange={handleChange} type="number" inputMode="numeric" />
                            </div>

                            <div className="space-y-4">
                                <FloatingInput label="Company Website" name="company_website" value={formData.company_website} onChange={handleChange} error={errors.company_website} placeholder="https://..." inputMode="url" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FloatingInput label="Offer Letter URL" name="offer_letter_url" value={formData.offer_letter_url} onChange={handleChange} error={errors.offer_letter_url} placeholder="https://..." inputMode="url" />
                                    <FloatingInput label="Completion Certificate URL" name="completion_certificate_url" value={formData.completion_certificate_url} onChange={handleChange} error={errors.completion_certificate_url} placeholder="https://..." inputMode="url" />
                                </div>
                            </div>
                        </div>
            </ModalWrapper>

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

const ExperienceCard = memo(function ExperienceCard({
    experience: exp, onEdit, onDelete, isDeleting, shouldReduce,
}: {
    experience: ExperienceData;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
    shouldReduce: boolean | null;
}) {
    const visibleTech = exp.technologies_used?.slice(0, MAX_VISIBLE_CHIPS) ?? [];
    const hiddenTechCount = (exp.technologies_used?.length ?? 0) - MAX_VISIBLE_CHIPS;

    return (
        <motion.div
            variants={shouldReduce ? undefined : staggerItem}
            role="article"
            className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 overflow-hidden transition-shadow hover:shadow-md"
        >
            {/* Accent strip */}
            <div className={`h-1 ${exp.is_current ? "bg-green-500" : "bg-blue-500"}`} />

            <div className="p-5">
                {/* Header: Icon + Title + Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-900/20">
                            <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{exp.position_title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{exp.company_name}</p>
                        </div>
                    </div>
                    {/* Actions — always visible on mobile */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                        <button type="button" onClick={onEdit} aria-label="Edit experience"
                            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition cursor-pointer">
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={onDelete} disabled={isDeleting} aria-label="Delete experience" aria-busy={isDeleting}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition cursor-pointer disabled:opacity-50">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <output className="text-xs px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                        {EMPLOYMENT_TYPE_LABELS[exp.employment_type] || exp.employment_type}
                    </output>
                    <span className="text-xs px-2.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full font-medium">
                        {WORK_MODE_LABELS[exp.work_mode] || exp.work_mode}
                    </span>
                    {exp.is_current && (
                        <output className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
                            <span>Current</span>
                        </output>
                    )}
                </div>

                {/* Meta: date + location */}
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
                        <span>
                            {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                            {exp.duration_months ? ` · ${exp.duration_months} months` : ""}
                        </span>
                    </div>
                    {exp.work_location && (
                        <div className="flex items-center gap-2">
                            <MapPin size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
                            <span>{exp.work_location}</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {exp.job_description && <ExpandableDescription text={exp.job_description} />}

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
                    {exp.company_website && (
                        <a href={exp.company_website} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ExternalLink className="h-3.5 w-3.5" /> Website
                        </a>
                    )}
                    {exp.offer_letter_url && (
                        <a href={exp.offer_letter_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ExternalLink className="h-3.5 w-3.5" /> Offer Letter
                        </a>
                    )}
                    {exp.completion_certificate_url && (
                        <a href={exp.completion_certificate_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ExternalLink className="h-3.5 w-3.5" /> Certificate
                        </a>
                    )}
                    {exp.is_verified && (
                        <output className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </output>
                    )}
                    {exp.is_verified === false && (
                        <output className="inline-flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Pending verification
                        </output>
                    )}
                </div>
            </div>
        </motion.div>
    );
});
