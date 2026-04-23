import { useState, memo, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useActivities, VALID_ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS } from "@/hooks/student/useActivities";
import type { ActivityData } from "@/services/student/activity.service";
import { Plus, X, Pencil, Trash2, Activity, CheckCircle, Calendar, Clock, ChevronDown } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import { FileUpload } from "@/components/ui/FileUpload";
import { DocumentPreview } from "@/components/ui/DocumentPreview";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useStudentAuth } from "@/hooks/student/useStudentAuth";

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
                    className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer">
                    {expanded ? "Show less" : "Show more"}
                    <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
            )}
        </div>
    );
}

const MAX_VISIBLE_PROOFS = 3;

const ActivitiesForm = () => {
    const {
        activities, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,

        maxActivities, openAddForm, openEditForm, closeForm,
        handleChange, addProofUrl, removeProofUrl, handleSubmit, handleDelete,
    } = useActivities();

    const { user } = useStudentAuth();
    const certUpload = useFileUpload();
    const proofUpload = useFileUpload();

    const handleCertSelect = async (file: File | null) => {
        if (!file || !user) return;
        try {
            const { storagePath } = await certUpload.upload(file, {
                bucket: "placenex-private",
                category: "certs",
                entityId: `act_${user.id}`,
            });
            handleChange({ target: { name: "certificate_url", value: storagePath } } as React.ChangeEvent<HTMLInputElement>);
        } catch { /* error in certUpload.error */ }
    };

    const handleProofFileSelect = async (file: File | null) => {
        if (!file || !user) return;
        try {
            const { storagePath } = await proofUpload.upload(file, {
                bucket: "placenex-private",
                category: "certs",
                entityId: `act_${user.id}`,
            });
            addProofUrl(storagePath);
        } catch { /* error in proofUpload.error */ }
    };

    const shouldReduce = useReducedMotion();
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const getSubmitLabel = () => {
        if (saving) return "Saving...";
        return editingId ? "Update" : "Add Activity";
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
                            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            <div className="flex gap-2">
                                <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            </div>
                            <div className="h-3 w-36 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            <div className="space-y-1.5">
                                <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
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
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">My Activities</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activities.length}/{maxActivities} entries</p>
                </div>
                {activities.length < maxActivities && (
                    <button type="button" onClick={openAddForm}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full font-medium transition cursor-pointer">
                        <Plus className="h-4 w-4" /> Add Activity
                    </button>
                )}
            </div>

            {/* Cards */}
            {activities.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium mb-1">No activities added yet</p>
                    <p className="text-sm">Add clubs, sports, NSS, NCC, volunteer work, and more</p>
                </div>
            ) : (
                <motion.div
                    variants={shouldReduce ? undefined : staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {activities.map((act) => (
                        <ActivityCard
                            key={act.activity_id}
                            activity={act}
                            onEdit={() => openEditForm(act)}
                            onDelete={() => act.activity_id && setPendingDeleteId(act.activity_id)}
                            isDeleting={deleting === act.activity_id}
                            shouldReduce={shouldReduce}
                        />
                    ))}
                </motion.div>
            )}

            {/* ===== Modal Form ===== */}
            <ModalWrapper isOpen={isFormOpen} onClose={closeForm} title={`${editingId ? "Edit" : "Add"} Activity`} disabled={saving} size="2xl" footer={
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
                            <FloatingInput label="Activity Name" name="activity_name" value={formData.activity_name} onChange={handleChange} error={errors.activity_name} required placeholder="e.g. NSS Special Camp — Rural Development" />

                            <FloatingTextarea label="Description" name="activity_description" value={formData.activity_description} onChange={handleChange} error={errors.activity_description} rows={3} placeholder="Brief description of the activity" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FloatingSelect label="Activity Type" name="activity_type" value={formData.activity_type} onChange={handleChange} error={errors.activity_type} options={VALID_ACTIVITY_TYPES.map(t => ({ value: t, label: ACTIVITY_TYPE_LABELS[t] }))} />
                                <FloatingInput label="Organizing Body" name="organizing_body" value={formData.organizing_body} onChange={handleChange} placeholder="e.g. NSS Unit, IEEE" />
                                <FloatingInput label="Role / Position" name="role_position" value={formData.role_position} onChange={handleChange} placeholder="e.g. Volunteer, Captain" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Start Date" name="start_date" value={formData.start_date} onChange={handleChange} type="date" />
                                {!formData.is_ongoing && (
                                    <FloatingInput label="End Date" name="end_date" value={formData.end_date} onChange={handleChange} error={errors.end_date} type="date" />
                                )}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="is_ongoing" checked={formData.is_ongoing} onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">This activity is ongoing</span>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Hours Contributed" name="hours_contributed" value={formData.hours_contributed} onChange={handleChange} error={errors.hours_contributed} type="number" inputMode="numeric" placeholder="e.g. 120" />
                                <FileUpload
                                    value={formData.certificate_url || null}
                                    onFileSelect={handleCertSelect}
                                    progress={certUpload.progress}
                                    isUploading={certUpload.isUploading}
                                    error={certUpload.error || errors.certificate_url}
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    maxSizeBytes={5 * 1024 * 1024}
                                    label="Certificate"
                                    hint="PDF or image, max 5 MB"
                                />
                            </div>

                            {/* Proof Files */}
                            <div>
                                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proof Files (max 5)</p>
                                {formData.proof_urls.length < 5 && (
                                    <FileUpload
                                        value={null}
                                        onFileSelect={handleProofFileSelect}
                                        progress={proofUpload.progress}
                                        isUploading={proofUpload.isUploading}
                                        error={proofUpload.error}
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        maxSizeBytes={5 * 1024 * 1024}
                                        label="Add proof file"
                                        hint="PDF or image, max 5 MB"
                                    />
                                )}
                                {formData.proof_urls.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {formData.proof_urls.map((url, idx) => (
                                            <li key={url} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                                                <span className="truncate mr-2">Proof {idx + 1}: {url.split("/").pop()}</span>
                                                <button type="button" onClick={() => removeProofUrl(url)} className="text-red-400 hover:text-red-600 cursor-pointer flex-shrink-0"><X className="h-3 w-3" /></button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.proof_urls && <p className="text-xs text-red-500 mt-1">{errors.proof_urls}</p>}
                            </div>
                        </div>
            </ModalWrapper>

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={!!pendingDeleteId}
                onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
                onConfirm={() => { if (pendingDeleteId) { handleDelete(pendingDeleteId); setPendingDeleteId(null); } }}
                isDeleting={deleting === pendingDeleteId}
                itemLabel="activity"
            />
        </div>
    );
};

export default ActivitiesForm;

/* ================= Activity Card ================= */

const ActivityCard = memo(function ActivityCard({
    activity: act, onEdit, onDelete, isDeleting, shouldReduce,
}: {
    activity: ActivityData;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
    shouldReduce: boolean | null;
}) {
    const visibleProofs = act.proof_urls?.slice(0, MAX_VISIBLE_PROOFS) ?? [];
    const hiddenProofCount = (act.proof_urls?.length ?? 0) - MAX_VISIBLE_PROOFS;

    let endDateLabel = "";
    if (act.is_ongoing) endDateLabel = " \u2013 Present";
    else if (act.end_date) endDateLabel = ` \u2013 ${formatDate(act.end_date)}`;

    return (
        <motion.div
            variants={shouldReduce ? undefined : staggerItem}
            role="article"
            className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 overflow-hidden transition-shadow hover:shadow-md"
        >
            {/* Accent strip */}
            <div className="h-1 bg-teal-500" />

            <div className="p-5">
                {/* Header: Icon + Title + Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-teal-50 dark:bg-teal-900/20">
                            <Activity size={16} className="text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{act.activity_name}</h3>
                            {act.role_position && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{act.role_position}</p>
                            )}
                        </div>
                    </div>
                    {/* Actions — always visible on mobile */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                        <button type="button" onClick={onEdit} aria-label="Edit activity"
                            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition cursor-pointer">
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={onDelete} disabled={isDeleting} aria-label="Delete activity" aria-busy={isDeleting}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition cursor-pointer disabled:opacity-50">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {act.activity_type && (
                        <output className="text-xs px-2.5 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-full font-medium">
                            {ACTIVITY_TYPE_LABELS[act.activity_type] || act.activity_type}
                        </output>
                    )}
                    {act.organizing_body && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{act.organizing_body}</span>
                    )}
                    {act.is_ongoing && (
                        <output className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
                            <span>Ongoing</span>
                        </output>
                    )}
                    {act.hours_contributed && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                            <Clock size={11} /> {act.hours_contributed} hrs
                        </span>
                    )}
                </div>

                {/* Meta: dates */}
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
                        <span>
                            {formatDate(act.start_date)}
                            {endDateLabel}
                        </span>
                    </div>
                </div>

                {/* Description */}
                {act.activity_description && <ExpandableDescription text={act.activity_description} />}

                {/* Links + Verified */}
                <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-gray-100 dark:border-gray-700">
                    {act.certificate_url && (
                        <DocumentPreview value={act.certificate_url} bucket="placenex-private" label="Certificate" variant="inline" />
                    )}
                    {visibleProofs.map((url: string, idx: number) => (
                        <DocumentPreview key={url} value={url} bucket="placenex-private" label={`Proof ${idx + 1}`} variant="inline" />
                    ))}
                    {hiddenProofCount > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">+{hiddenProofCount} more</span>
                    )}
                    {(act as ActivityData & { is_verified?: boolean }).is_verified && (
                        <output className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </output>
                    )}
                </div>
            </div>
        </motion.div>
    );
});
