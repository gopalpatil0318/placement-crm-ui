import { useState, memo, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useCertificates, VALID_CERTIFICATE_TYPES, CERTIFICATE_TYPE_LABELS } from "@/hooks/student/useCertificates";
import type { CertificateData } from "@/services/student/certificate.service";
import { Plus, X, Pencil, Trash2, Award, CheckCircle, ExternalLink, Link as LinkIcon, AlertCircle, XCircle, Clock, Calendar, Infinity as InfinityIcon, ChevronDown } from "lucide-react";
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

function getDaysUntilExpiry(expiryDate: string | null | undefined): string | null {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 1) return "1 day left";
    return `${days} days left`;
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
                    className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer">
                    {expanded ? "Show less" : "Show more"}
                    <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
            )}
        </div>
    );
}

const MAX_VISIBLE_CHIPS = 5;

const CertificatesForm = () => {
    const {
        certificates, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        skillInput, setSkillInput,
        maxCertificates, openAddForm, openEditForm, closeForm,
        handleChange, addSkill, removeSkill, handleSubmit, handleDelete,
    } = useCertificates();

    const shouldReduce = useReducedMotion();
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={`cert-skeleton-${String(i)}`} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            <div className="flex gap-2">
                                <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                                <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            </div>
                            <div className="h-3 w-44 rounded bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
                            <div className="flex gap-1.5">
                                <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700/60 motion-safe:animate-pulse" />
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
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">My Certificates</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{certificates.length}/{maxCertificates} entries</p>
                </div>
                {certificates.length < maxCertificates && (
                    <button type="button" onClick={openAddForm}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full font-medium transition cursor-pointer">
                        <Plus className="h-4 w-4" /> Add Certificate
                    </button>
                )}
            </div>

            {/* Cards */}
            {certificates.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium mb-1">No certificates added yet</p>
                    <p className="text-sm">Add courses, certifications, workshops, and more</p>
                </div>
            ) : (
                <motion.div
                    variants={shouldReduce ? undefined : staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {certificates.map((cert) => (
                        <CertificateCard
                            key={cert.certificate_id}
                            certificate={cert}
                            onEdit={() => openEditForm(cert)}
                            onDelete={() => cert.certificate_id && setPendingDeleteId(cert.certificate_id)}
                            isDeleting={deleting === cert.certificate_id}
                            shouldReduce={shouldReduce}
                        />
                    ))}
                </motion.div>
            )}

            {/* ===== Modal Form ===== */}
            <ModalWrapper isOpen={isFormOpen} onClose={closeForm} title={`${editingId ? "Edit" : "Add"} Certificate`} disabled={saving} size="2xl" footer={
                <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
                    <button type="button" onClick={closeForm}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition cursor-pointer">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition cursor-pointer disabled:opacity-50">
                        {(() => {
                            if (saving) return "Saving...";
                            return editingId ? "Update" : "Add Certificate";
                        })()}
                    </button>
                </div>
            }>
                        {/* Body */}
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Certificate Name" name="certificate_name" value={formData.certificate_name} onChange={handleChange} error={errors.certificate_name} required placeholder="e.g. Google Cloud Professional Architect" />
                                <FloatingInput label="Issuing Organization" name="issuing_organization" value={formData.issuing_organization} onChange={handleChange} error={errors.issuing_organization} required placeholder="e.g. Google, Coursera" />
                            </div>

                            <FloatingTextarea label="Description" name="certificate_description" value={formData.certificate_description} onChange={handleChange} error={errors.certificate_description} rows={3} placeholder="Brief description of the certificate" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingSelect label="Certificate Type" name="certificate_type" value={formData.certificate_type} onChange={handleChange} error={errors.certificate_type} options={VALID_CERTIFICATE_TYPES.map(t => ({ value: t, label: CERTIFICATE_TYPE_LABELS[t] }))} />
                                <FloatingInput label="Issuing Platform" name="issuing_platform" value={formData.issuing_platform} onChange={handleChange} placeholder="e.g. Coursera, Udemy, NPTEL" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Credential ID" name="credential_id" value={formData.credential_id} onChange={handleChange} placeholder="e.g. UC-abc123" />
                                <FloatingInput label="Credential URL" name="credential_url" value={formData.credential_url} onChange={handleChange} error={errors.credential_url} inputMode="url" placeholder="https://..." />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="Issue Date" name="issue_date" value={formData.issue_date} onChange={handleChange} error={errors.issue_date} type="date" />
                                {!formData.does_not_expire && (
                                    <FloatingInput label="Expiry Date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} error={errors.expiry_date} type="date" />
                                )}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="does_not_expire" checked={formData.does_not_expire} onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300"><InfinityIcon size={14} className="inline -mt-0.5 mr-1" />This certificate does not expire</span>
                            </label>

                            {/* Skills Covered */}
                            <div>
                                <label htmlFor="cert-skill-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills Covered</label>
                                <div className="flex gap-2">
                                    <input id="cert-skill-input" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                                        placeholder="Type a skill & press Enter"
                                        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" />
                                    <button type="button" onClick={addSkill}
                                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition cursor-pointer">Add</button>
                                </div>
                                {formData.skills_covered.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.skills_covered.map((s) => (
                                            <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800">
                                                {s}
                                                <button type="button" onClick={() => removeSkill(s)} className="hover:text-blue-900 dark:hover:text-blue-100 cursor-pointer"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {errors.skills_covered && <p className="text-xs text-red-500 mt-1">{errors.skills_covered}</p>}
                            </div>

                            <FloatingInput label="Certificate File URL" name="certificate_url" value={formData.certificate_url} onChange={handleChange} error={errors.certificate_url} inputMode="url" placeholder="https://drive.google.com/..." />
                        </div>
            </ModalWrapper>

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={!!pendingDeleteId}
                onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
                onConfirm={() => { if (pendingDeleteId) { handleDelete(pendingDeleteId); setPendingDeleteId(null); } }}
                isDeleting={deleting === pendingDeleteId}
                itemLabel="certificate"
            />
        </div>
    );
};

export default CertificatesForm;

/* ================= Certificate Card ================= */

const CertificateCard = memo(function CertificateCard({
    certificate: cert, onEdit, onDelete, isDeleting, shouldReduce,
}: {
    certificate: CertificateData;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
    shouldReduce: boolean | null;
}) {
    const visibleSkills = cert.skills_covered?.slice(0, MAX_VISIBLE_CHIPS) ?? [];
    const hiddenSkillCount = (cert.skills_covered?.length ?? 0) - MAX_VISIBLE_CHIPS;
    const expiryLabel = cert.does_not_expire ? null : getDaysUntilExpiry(cert.expiry_date);
    const isExpired = expiryLabel === "Expired";

    return (
        <motion.div
            variants={shouldReduce ? undefined : staggerItem}
            role="article"
            className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 overflow-hidden transition-shadow hover:shadow-md"
        >
            {/* Accent strip */}
            <div className={`h-1 ${isExpired ? "bg-red-500" : "bg-emerald-500"}`} />

            <div className="p-5">
                {/* Header: Icon + Title + Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-900/20">
                            <Award size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{cert.certificate_name}</h3>
                            {cert.issuing_organization && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{cert.issuing_organization}</p>
                            )}
                        </div>
                    </div>
                    {/* Actions — always visible on mobile */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                        <button type="button" onClick={onEdit} aria-label="Edit certificate"
                            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition cursor-pointer">
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={onDelete} disabled={isDeleting} aria-label="Delete certificate" aria-busy={isDeleting}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition cursor-pointer disabled:opacity-50">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {cert.certificate_type && (
                        <output className="text-xs px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">
                            {CERTIFICATE_TYPE_LABELS[cert.certificate_type] || cert.certificate_type}
                        </output>
                    )}
                    {cert.issuing_platform && cert.issuing_platform !== cert.issuing_organization && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{cert.issuing_platform}</span>
                    )}
                </div>

                {/* Meta: dates + expiry */}
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
                        <span>
                            {cert.issue_date ? `Issued: ${formatDate(cert.issue_date)}` : ""}
                            {(() => {
                                if (cert.does_not_expire) return <span className="ml-1 inline-flex items-center gap-1"><InfinityIcon size={12} className="inline" /> No Expiry</span>;
                                return cert.expiry_date ? ` · Expires: ${formatDate(cert.expiry_date)}` : "";
                            })()}
                        </span>
                    </div>
                    {expiryLabel && (
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                isExpired
                                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                            }`}>
                                {expiryLabel}
                            </span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {cert.certificate_description && <ExpandableDescription text={cert.certificate_description} />}

                {/* Skills */}
                {visibleSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {visibleSkills.map((skill: string) => (
                            <span key={skill} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                                {skill}
                            </span>
                        ))}
                        {hiddenSkillCount > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                                +{hiddenSkillCount} more
                            </span>
                        )}
                    </div>
                )}

                {/* Links + Verified */}
                <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-gray-100 dark:border-gray-700">
                    {cert.credential_url && (
                        <a href={cert.credential_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            <LinkIcon className="h-3.5 w-3.5" /> Verify Credential
                        </a>
                    )}
                    {cert.certificate_url && (
                        <a href={cert.certificate_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ExternalLink className="h-3.5 w-3.5" /> View Certificate
                        </a>
                    )}
                    {cert.verification_status === "approved" && (
                        <output className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </output>
                    )}
                    {cert.verification_status === "pending" && (
                        <output className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="h-3.5 w-3.5" /> Pending verification
                        </output>
                    )}
                    {cert.verification_status === "rejected" && (
                        <output className="inline-flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-medium">
                            <XCircle className="h-3.5 w-3.5" /> Rejected
                        </output>
                    )}
                </div>
                {cert.verification_status === "rejected" && cert.rejection_reason && (
                    <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40">
                        <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-red-700 dark:text-red-300">Reason: {cert.rejection_reason}</p>
                            <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">Edit this item to resubmit for review.</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
});
