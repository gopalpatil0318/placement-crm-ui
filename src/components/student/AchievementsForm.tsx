import { useState, memo, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useAchievements, VALID_ACHIEVEMENT_TYPES, ACHIEVEMENT_TYPE_LABELS, VALID_ACHIEVEMENT_LEVELS, ACHIEVEMENT_LEVEL_LABELS } from "@/hooks/student/useAchievements";
import type { AchievementData } from "@/services/student/achievement.service";
import { Plus, Pencil, Trash2, Trophy, CheckCircle, ExternalLink, Star, AlertCircle, XCircle, Clock, Calendar, ChevronDown } from "lucide-react";
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
                    className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer">
                    {expanded ? "Show less" : "Show more"}
                    <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
            )}
        </div>
    );
}

const LEVEL_COLORS: Record<string, string> = {
    international: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    national: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    state: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    university: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    college: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    departmental: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const LEVEL_ACCENT_COLORS: Record<string, string> = {
    international: "bg-amber-500",
    national: "bg-slate-500",
    state: "bg-orange-500",
    university: "bg-purple-500",
    college: "bg-teal-500",
    departmental: "bg-gray-500",
};

const LEVEL_ICON_COLORS: Record<string, { bg: string; text: string }> = {
    international: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
    national: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
    state: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400" },
    university: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400" },
    college: { bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-600 dark:text-teal-400" },
    departmental: { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400" },
};

const AchievementsForm = () => {
    const {
        achievements, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        maxAchievements, openAddForm, openEditForm, closeForm,
        handleChange, handleSubmit, handleDelete,
    } = useAchievements();

    const shouldReduce = useReducedMotion();
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const getSubmitLabel = () => {
        if (saving) return "Saving...";
        return editingId ? "Update" : "Add Achievement";
    };

    if (loading) {
        return (
            <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-5 w-36 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
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
                                <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            </div>
                            <div className="h-3 w-40 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            <div className="space-y-1.5">
                                <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
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
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">My Achievements</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{achievements.length}/{maxAchievements} entries</p>
                </div>
                {achievements.length < maxAchievements && (
                    <button type="button" onClick={openAddForm}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full font-medium transition cursor-pointer">
                        <Plus className="h-4 w-4" /> Add Achievement
                    </button>
                )}
            </div>

            {/* Cards */}
            {achievements.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium mb-1">No achievements added yet</p>
                    <p className="text-sm">Add hackathon wins, competitions, certifications, and more</p>
                </div>
            ) : (
                <motion.div
                    variants={shouldReduce ? undefined : staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {achievements.map((ach) => (
                        <AchievementCard
                            key={ach.achievement_id}
                            achievement={ach}
                            onEdit={() => openEditForm(ach)}
                            onDelete={() => ach.achievement_id && setPendingDeleteId(ach.achievement_id)}
                            isDeleting={deleting === ach.achievement_id}
                            shouldReduce={shouldReduce}
                        />
                    ))}
                </motion.div>
            )}

            {/* ===== Modal Form ===== */}
            <ModalWrapper isOpen={isFormOpen} onClose={closeForm} title={`${editingId ? "Edit" : "Add"} Achievement`} disabled={saving} size="2xl" footer={
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
                            <FloatingInput label="Achievement Title" name="achievement_title" value={formData.achievement_title} onChange={handleChange} error={errors.achievement_title} required placeholder="e.g. 1st Place — Smart India Hackathon 2024" />

                            <FloatingTextarea label="Description" name="achievement_description" value={formData.achievement_description} onChange={handleChange} error={errors.achievement_description} rows={3} placeholder="Brief description of the achievement" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingSelect label="Achievement Type" name="achievement_type" value={formData.achievement_type} onChange={handleChange} error={errors.achievement_type} options={VALID_ACHIEVEMENT_TYPES.map(t => ({ value: t, label: ACHIEVEMENT_TYPE_LABELS[t] }))} />
                                <FloatingSelect label="Achievement Level" name="achievement_level" value={formData.achievement_level} onChange={handleChange} error={errors.achievement_level} options={VALID_ACHIEVEMENT_LEVELS.map(l => ({ value: l, label: ACHIEVEMENT_LEVEL_LABELS[l] }))} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Issuing Organization" name="issuing_organization" value={formData.issuing_organization} onChange={handleChange} placeholder="e.g. Ministry of Education" />
                                <FloatingInput label="Event Name" name="event_name" value={formData.event_name} onChange={handleChange} placeholder="e.g. Smart India Hackathon 2024" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FloatingInput label="Position / Rank" name="position_rank" value={formData.position_rank} onChange={handleChange} placeholder="e.g. 1st Place" />
                                <FloatingInput label="Participants" name="participants_count" value={formData.participants_count} onChange={handleChange} error={errors.participants_count} type="number" inputMode="numeric" placeholder="e.g. 5000" />
                                <FloatingInput label="Date" name="achievement_date" value={formData.achievement_date} onChange={handleChange} error={errors.achievement_date} type="date" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Certificate URL" name="certificate_url" value={formData.certificate_url} onChange={handleChange} error={errors.certificate_url} placeholder="https://..." inputMode="url" />
                                <FloatingInput label="Proof URL" name="proof_url" value={formData.proof_url} onChange={handleChange} error={errors.proof_url} placeholder="https://..." inputMode="url" />
                            </div>

                            {/* Featured + Display Order */}
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300"><Star className="inline h-4 w-4 text-amber-500 fill-amber-500 -mt-0.5 mr-1" />Featured Achievement</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Order</p>
                                    <input name="display_order" type="number" min="1" max="10" value={formData.display_order} onChange={handleChange}
                                        placeholder="#" inputMode="numeric"
                                        className="w-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-center text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" />
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
                itemLabel="achievement"
            />
        </div>
    );
};

export default AchievementsForm;

/* ================= Achievement Card ================= */

const AchievementCard = memo(function AchievementCard({
    achievement: ach, onEdit, onDelete, isDeleting, shouldReduce,
}: {
    achievement: AchievementData;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
    shouldReduce: boolean | null;
}) {
    const accentColor = (ach.achievement_level && LEVEL_ACCENT_COLORS[ach.achievement_level]) || "bg-gray-500";
    const iconColors = (ach.achievement_level && LEVEL_ICON_COLORS[ach.achievement_level]) || { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400" };

    return (
        <motion.div
            variants={shouldReduce ? undefined : staggerItem}
            role="article"
            className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 overflow-hidden transition-shadow hover:shadow-md"
        >
            {/* Accent strip — level-colored */}
            <div className={`h-1 ${accentColor}`} />

            <div className="p-5">
                {/* Header: Icon + Title + Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${iconColors.bg}`}>
                            <Trophy size={16} className={iconColors.text} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                {ach.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />}
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{ach.achievement_title}</h3>
                            </div>
                            {ach.issuing_organization && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{ach.issuing_organization}</p>
                            )}
                        </div>
                    </div>
                    {/* Actions — always visible on mobile */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                        <button type="button" onClick={onEdit} aria-label="Edit achievement"
                            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition cursor-pointer">
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={onDelete} disabled={isDeleting} aria-label="Delete achievement" aria-busy={isDeleting}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition cursor-pointer disabled:opacity-50">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {ach.achievement_type && (
                        <output className="text-xs px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                            {ACHIEVEMENT_TYPE_LABELS[ach.achievement_type] || ach.achievement_type}
                        </output>
                    )}
                    {ach.achievement_level && (
                        <output className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${LEVEL_COLORS[ach.achievement_level] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {ACHIEVEMENT_LEVEL_LABELS[ach.achievement_level] || ach.achievement_level}
                        </output>
                    )}
                    {ach.position_rank && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full">
                            <Trophy size={11} /> {ach.position_rank}
                        </span>
                    )}
                </div>

                {/* Meta: date + event */}
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
                        <span>
                            {formatDate(ach.achievement_date)}
                            {ach.event_name ? ` · ${ach.event_name}` : ""}
                        </span>
                    </div>
                    {ach.participants_count && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">{ach.participants_count.toLocaleString()}+ participants</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {ach.achievement_description && <ExpandableDescription text={ach.achievement_description} />}

                {/* Links + Verified */}
                <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-gray-100 dark:border-gray-700">
                    {ach.certificate_url && (
                        <a href={ach.certificate_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ExternalLink className="h-3.5 w-3.5" /> Certificate
                        </a>
                    )}
                    {ach.proof_url && (
                        <a href={ach.proof_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ExternalLink className="h-3.5 w-3.5" /> Proof
                        </a>
                    )}
                    {ach.verification_status === "approved" && (
                        <output className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </output>
                    )}
                    {ach.verification_status === "pending" && (
                        <output className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="h-3.5 w-3.5" /> Pending verification
                        </output>
                    )}
                    {ach.verification_status === "rejected" && (
                        <output className="inline-flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-medium">
                            <XCircle className="h-3.5 w-3.5" /> Rejected
                        </output>
                    )}
                </div>
                {ach.verification_status === "rejected" && ach.rejection_reason && (
                    <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40">
                        <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-red-700 dark:text-red-300">Reason: {ach.rejection_reason}</p>
                            <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">Edit this item to resubmit for review.</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
});
