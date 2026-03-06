import { useState } from "react";
import { useActivities, VALID_ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS } from "@/hooks/student/useActivities";
import { Plus, X, Pencil, Trash2, Activity, CheckCircle, ExternalLink } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const ActivitiesForm = ({ }: Props) => {
    const {
        activities, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        proofInput, setProofInput,
        maxActivities, openAddForm, openEditForm, closeForm,
        handleChange, addProofUrl, removeProofUrl, handleSubmit, handleDelete,
    } = useActivities();

    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-xl border">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-3 text-gray-500">Loading activities...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">My Activities</h2>
                    <p className="text-sm text-gray-500 mt-1">{activities.length}/{maxActivities} entries</p>
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
                <div className="text-center py-12 text-gray-400">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium mb-1">No activities added yet</p>
                    <p className="text-sm">Add clubs, sports, NSS, NCC, volunteer work, and more</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((act) => (
                        <ActivityCard
                            key={act.activity_id}
                            activity={act}
                            onEdit={() => openEditForm(act)}
                            onDelete={() => act.activity_id && setPendingDeleteId(act.activity_id)}
                            isDeleting={deleting === act.activity_id}
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
                            <h3 className="text-lg font-semibold text-gray-800">{editingId ? "Edit" : "Add"} Activity</h3>
                            <button type="button" onClick={closeForm} className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Activity Name <span className="text-red-500">*</span>
                                </label>
                                <input name="activity_name" value={formData.activity_name} onChange={handleChange}
                                    placeholder="e.g. NSS Special Camp — Rural Development"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {errors.activity_name && <p className="text-xs text-red-500 mt-1">{errors.activity_name}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="activity_description" value={formData.activity_description} onChange={handleChange} rows={3}
                                    placeholder="Brief description of the activity"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {errors.activity_description && <p className="text-xs text-red-500 mt-1">{errors.activity_description}</p>}
                            </div>

                            {/* Type + Organization + Role */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                                    <select name="activity_type" value={formData.activity_type} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select</option>
                                        {VALID_ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{ACTIVITY_TYPE_LABELS[t]}</option>)}
                                    </select>
                                    {errors.activity_type && <p className="text-xs text-red-500 mt-1">{errors.activity_type}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organizing Body</label>
                                    <input name="organizing_body" value={formData.organizing_body} onChange={handleChange}
                                        placeholder="e.g. NSS Unit, IEEE"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role / Position</label>
                                    <input name="role_position" value={formData.role_position} onChange={handleChange}
                                        placeholder="e.g. Volunteer, Captain"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            {/* Dates + Ongoing */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input name="start_date" type="date" value={formData.start_date} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                {!formData.is_ongoing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input name="end_date" type="date" value={formData.end_date} onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date}</p>}
                                    </div>
                                )}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="is_ongoing" checked={formData.is_ongoing} onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-700">This activity is ongoing</span>
                            </label>

                            {/* Hours + Certificate URL */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours Contributed</label>
                                    <input name="hours_contributed" type="number" value={formData.hours_contributed} onChange={handleChange}
                                        placeholder="e.g. 120"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.hours_contributed && <p className="text-xs text-red-500 mt-1">{errors.hours_contributed}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
                                    <input name="certificate_url" value={formData.certificate_url} onChange={handleChange} placeholder="https://..."
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.certificate_url && <p className="text-xs text-red-500 mt-1">{errors.certificate_url}</p>}
                                </div>
                            </div>

                            {/* Proof URLs */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proof URLs (max 5)</label>
                                <div className="flex gap-2">
                                    <input value={proofInput} onChange={(e) => setProofInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addProofUrl(); } }}
                                        placeholder="Paste URL & press Enter"
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <button type="button" onClick={addProofUrl}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition cursor-pointer">Add</button>
                                </div>
                                {formData.proof_urls.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {formData.proof_urls.map((url, i) => (
                                            <li key={i} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <span className="truncate mr-2">🔗 {url}</span>
                                                <button type="button" onClick={() => removeProofUrl(url)} className="text-red-400 hover:text-red-600 cursor-pointer flex-shrink-0"><X className="h-3 w-3" /></button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.proof_urls && <p className="text-xs text-red-500 mt-1">{errors.proof_urls}</p>}
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
                                {saving ? "Saving..." : editingId ? "Update" : "Add Activity"}
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
                itemLabel="activity"
            />
        </div>
    );
};

export default ActivitiesForm;

/* ================= Activity Card ================= */

const ActivityCard = ({
    activity: act, onEdit, onDelete, isDeleting,
}: {
    activity: any;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) => (
    <div className="relative p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition group">
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-1">
                    {act.is_ongoing && <span className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />}
                    <h3 className="text-base font-semibold text-gray-800 truncate">{act.activity_name}</h3>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {act.activity_type && (
                        <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {ACTIVITY_TYPE_LABELS[act.activity_type] || act.activity_type}
                        </span>
                    )}
                    {act.organizing_body && (
                        <span className="text-xs text-gray-500 font-medium">{act.organizing_body}</span>
                    )}
                    {act.role_position && (
                        <span className="text-xs text-gray-400">· {act.role_position}</span>
                    )}
                </div>

                {/* Date + Hours */}
                <p className="text-xs text-gray-400 mb-2">
                    {act.start_date?.substring(0, 10)}
                    {act.is_ongoing ? " – Ongoing" : act.end_date ? ` – ${act.end_date.substring(0, 10)}` : ""}
                    {act.hours_contributed ? ` · ⏱️ ${act.hours_contributed} hrs` : ""}
                </p>

                {/* Description */}
                {act.activity_description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{act.activity_description}</p>
                )}

                {/* Links + Verified */}
                <div className="flex items-center gap-3 flex-wrap">
                    {act.certificate_url && (
                        <a href={act.certificate_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> Certificate
                        </a>
                    )}
                    {act.proof_urls?.length > 0 && act.proof_urls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> Proof {i + 1}
                        </a>
                    ))}
                    {act.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
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
