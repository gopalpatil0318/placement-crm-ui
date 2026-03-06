import { useState } from "react";
import { useCertificates, VALID_CERTIFICATE_TYPES, CERTIFICATE_TYPE_LABELS } from "@/hooks/student/useCertificates";
import { Plus, X, Pencil, Trash2, Award, CheckCircle, ExternalLink, Link as LinkIcon, AlertCircle } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const CertificatesForm = ({ }: Props) => {
    const {
        certificates, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        skillInput, setSkillInput,
        maxCertificates, openAddForm, openEditForm, closeForm,
        handleChange, addSkill, removeSkill, handleSubmit, handleDelete,
    } = useCertificates();

    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-xl border">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-3 text-gray-500">Loading certificates...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">My Certificates</h2>
                    <p className="text-sm text-gray-500 mt-1">{certificates.length}/{maxCertificates} entries</p>
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
                <div className="text-center py-12 text-gray-400">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium mb-1">No certificates added yet</p>
                    <p className="text-sm">Add courses, certifications, workshops, and more</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {certificates.map((cert) => (
                        <CertificateCard
                            key={cert.certificate_id}
                            certificate={cert}
                            onEdit={() => openEditForm(cert)}
                            onDelete={() => cert.certificate_id && setPendingDeleteId(cert.certificate_id)}
                            isDeleting={deleting === cert.certificate_id}
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
                            <h3 className="text-lg font-semibold text-gray-800">{editingId ? "Edit" : "Add"} Certificate</h3>
                            <button type="button" onClick={closeForm} className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Name + Organization */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Certificate Name <span className="text-red-500">*</span>
                                    </label>
                                    <input name="certificate_name" value={formData.certificate_name} onChange={handleChange}
                                        placeholder="e.g. Google Cloud Professional Architect"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.certificate_name && <p className="text-xs text-red-500 mt-1">{errors.certificate_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Issuing Organization <span className="text-red-500">*</span>
                                    </label>
                                    <input name="issuing_organization" value={formData.issuing_organization} onChange={handleChange}
                                        placeholder="e.g. Google, Coursera"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.issuing_organization && <p className="text-xs text-red-500 mt-1">{errors.issuing_organization}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="certificate_description" value={formData.certificate_description} onChange={handleChange} rows={3}
                                    placeholder="Brief description of the certificate"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {errors.certificate_description && <p className="text-xs text-red-500 mt-1">{errors.certificate_description}</p>}
                            </div>

                            {/* Type + Platform */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type</label>
                                    <select name="certificate_type" value={formData.certificate_type} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select</option>
                                        {VALID_CERTIFICATE_TYPES.map((t) => <option key={t} value={t}>{CERTIFICATE_TYPE_LABELS[t]}</option>)}
                                    </select>
                                    {errors.certificate_type && <p className="text-xs text-red-500 mt-1">{errors.certificate_type}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Platform</label>
                                    <input name="issuing_platform" value={formData.issuing_platform} onChange={handleChange}
                                        placeholder="e.g. Coursera, Udemy, NPTEL"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            {/* Credential ID + URL */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
                                    <input name="credential_id" value={formData.credential_id} onChange={handleChange}
                                        placeholder="e.g. UC-abc123"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
                                    <input name="credential_url" value={formData.credential_url} onChange={handleChange} placeholder="https://..."
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.credential_url && <p className="text-xs text-red-500 mt-1">{errors.credential_url}</p>}
                                </div>
                            </div>

                            {/* Dates + Does Not Expire */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                    <input name="issue_date" type="date" value={formData.issue_date} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.issue_date && <p className="text-xs text-red-500 mt-1">{errors.issue_date}</p>}
                                </div>
                                {!formData.does_not_expire && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                        <input name="expiry_date" type="date" value={formData.expiry_date} onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        {errors.expiry_date && <p className="text-xs text-red-500 mt-1">{errors.expiry_date}</p>}
                                    </div>
                                )}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="does_not_expire" checked={formData.does_not_expire} onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-700">♾️ This certificate does not expire</span>
                            </label>

                            {/* Skills Covered */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skills Covered</label>
                                <div className="flex gap-2">
                                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                                        placeholder="Type a skill & press Enter"
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <button type="button" onClick={addSkill}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition cursor-pointer">Add</button>
                                </div>
                                {formData.skills_covered.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.skills_covered.map((s) => (
                                            <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                                                {s}
                                                <button type="button" onClick={() => removeSkill(s)} className="hover:text-blue-900 cursor-pointer"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {errors.skills_covered && <p className="text-xs text-red-500 mt-1">{errors.skills_covered}</p>}
                            </div>

                            {/* Certificate URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate File URL</label>
                                <input name="certificate_url" value={formData.certificate_url} onChange={handleChange} placeholder="https://drive.google.com/..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {errors.certificate_url && <p className="text-xs text-red-500 mt-1">{errors.certificate_url}</p>}
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
                                {saving ? "Saving..." : editingId ? "Update" : "Add Certificate"}
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
                itemLabel="certificate"
            />
        </div>
    );
};

export default CertificatesForm;

/* ================= Certificate Card ================= */

const CertificateCard = ({
    certificate: cert, onEdit, onDelete, isDeleting,
}: {
    certificate: any;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) => (
    <div className="relative p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition group">
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📜</span>
                    <h3 className="text-base font-semibold text-gray-800 truncate">{cert.certificate_name}</h3>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {cert.certificate_type && (
                        <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {CERTIFICATE_TYPE_LABELS[cert.certificate_type] || cert.certificate_type}
                        </span>
                    )}
                    {cert.issuing_organization && (
                        <span className="text-xs text-gray-500 font-medium">{cert.issuing_organization}</span>
                    )}
                    {cert.issuing_platform && cert.issuing_platform !== cert.issuing_organization && (
                        <span className="text-xs text-gray-400">· {cert.issuing_platform}</span>
                    )}
                </div>

                {/* Dates */}
                <p className="text-xs text-gray-400 mb-2">
                    {cert.issue_date ? `Issued: ${cert.issue_date.substring(0, 10)}` : ""}
                    {cert.does_not_expire
                        ? " · ♾️ No Expiry"
                        : cert.expiry_date ? ` · Expires: ${cert.expiry_date.substring(0, 10)}` : ""}
                </p>

                {/* Description */}
                {cert.certificate_description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{cert.certificate_description}</p>
                )}

                {/* Skills */}
                {cert.skills_covered?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {cert.skills_covered.map((skill: string) => (
                            <span key={skill} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* Links + Verified */}
                <div className="flex items-center gap-3">
                    {cert.credential_url && (
                        <a href={cert.credential_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                            <LinkIcon className="h-3.5 w-3.5" /> Verify Credential
                        </a>
                    )}
                    {cert.certificate_url && (
                        <a href={cert.certificate_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> View Certificate
                        </a>
                    )}
                    {cert.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </span>
                    )}
                    {cert.is_verified === false && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Please verify this certificate from admin
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
