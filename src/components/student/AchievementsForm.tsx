import { useState } from "react";
import { useAchievements, VALID_ACHIEVEMENT_TYPES, ACHIEVEMENT_TYPE_LABELS, VALID_ACHIEVEMENT_LEVELS, ACHIEVEMENT_LEVEL_LABELS } from "@/hooks/student/useAchievements";
import { Plus, X, Pencil, Trash2, Trophy, CheckCircle, ExternalLink, Star, AlertCircle } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const LEVEL_COLORS: Record<string, string> = {
    international: "bg-amber-50 text-amber-700 border-amber-200",
    national: "bg-slate-100 text-slate-700 border-slate-200",
    state: "bg-orange-50 text-orange-700 border-orange-200",
    university: "bg-purple-50 text-purple-700 border-purple-200",
    college: "bg-teal-50 text-teal-700 border-teal-200",
    departmental: "bg-gray-50 text-gray-600 border-gray-200",
};

const AchievementsForm = ({ }: Props) => {
    const {
        achievements, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        maxAchievements, openAddForm, openEditForm, closeForm,
        handleChange, handleSubmit, handleDelete,
    } = useAchievements();

    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-xl border">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-3 text-gray-500">Loading achievements...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">My Achievements</h2>
                    <p className="text-sm text-gray-500 mt-1">{achievements.length}/{maxAchievements} entries</p>
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
                <div className="text-center py-12 text-gray-400">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium mb-1">No achievements added yet</p>
                    <p className="text-sm">Add hackathon wins, competitions, certifications, and more</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {achievements.map((ach) => (
                        <AchievementCard
                            key={ach.achievement_id}
                            achievement={ach}
                            onEdit={() => openEditForm(ach)}
                            onDelete={() => ach.achievement_id && setPendingDeleteId(ach.achievement_id)}
                            isDeleting={deleting === ach.achievement_id}
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
                            <h3 className="text-lg font-semibold text-gray-800">{editingId ? "Edit" : "Add"} Achievement</h3>
                            <button type="button" onClick={closeForm} className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Achievement Title <span className="text-red-500">*</span>
                                </label>
                                <input name="achievement_title" value={formData.achievement_title} onChange={handleChange}
                                    placeholder="e.g. 1st Place — Smart India Hackathon 2024"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {errors.achievement_title && <p className="text-xs text-red-500 mt-1">{errors.achievement_title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="achievement_description" value={formData.achievement_description} onChange={handleChange} rows={3}
                                    placeholder="Brief description of the achievement"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {errors.achievement_description && <p className="text-xs text-red-500 mt-1">{errors.achievement_description}</p>}
                            </div>

                            {/* Type + Level */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Type</label>
                                    <select name="achievement_type" value={formData.achievement_type} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select</option>
                                        {VALID_ACHIEVEMENT_TYPES.map((t) => <option key={t} value={t}>{ACHIEVEMENT_TYPE_LABELS[t]}</option>)}
                                    </select>
                                    {errors.achievement_type && <p className="text-xs text-red-500 mt-1">{errors.achievement_type}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Level</label>
                                    <select name="achievement_level" value={formData.achievement_level} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select</option>
                                        {VALID_ACHIEVEMENT_LEVELS.map((l) => <option key={l} value={l}>{ACHIEVEMENT_LEVEL_LABELS[l]}</option>)}
                                    </select>
                                    {errors.achievement_level && <p className="text-xs text-red-500 mt-1">{errors.achievement_level}</p>}
                                </div>
                            </div>

                            {/* Organization + Event */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                                    <input name="issuing_organization" value={formData.issuing_organization} onChange={handleChange}
                                        placeholder="e.g. Ministry of Education"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                    <input name="event_name" value={formData.event_name} onChange={handleChange}
                                        placeholder="e.g. Smart India Hackathon 2024"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            {/* Position + Participants + Date */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position / Rank</label>
                                    <input name="position_rank" value={formData.position_rank} onChange={handleChange}
                                        placeholder="e.g. 1st Place"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                                    <input name="participants_count" type="number" value={formData.participants_count} onChange={handleChange}
                                        placeholder="e.g. 5000"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.participants_count && <p className="text-xs text-red-500 mt-1">{errors.participants_count}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input name="achievement_date" type="date" value={formData.achievement_date} onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.achievement_date && <p className="text-xs text-red-500 mt-1">{errors.achievement_date}</p>}
                                </div>
                            </div>

                            {/* Certificate + Proof URLs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
                                    <input name="certificate_url" value={formData.certificate_url} onChange={handleChange} placeholder="https://..."
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.certificate_url && <p className="text-xs text-red-500 mt-1">{errors.certificate_url}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Proof URL</label>
                                    <input name="proof_url" value={formData.proof_url} onChange={handleChange} placeholder="https://..."
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.proof_url && <p className="text-xs text-red-500 mt-1">{errors.proof_url}</p>}
                                </div>
                            </div>

                            {/* Featured + Display Order */}
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-700">⭐ Featured Achievement</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Display Order</label>
                                    <input name="display_order" type="number" min="1" max="10" value={formData.display_order} onChange={handleChange}
                                        placeholder="#"
                                        className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                                {saving ? "Saving..." : editingId ? "Update" : "Add Achievement"}
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
                itemLabel="achievement"
            />
        </div>
    );
};

export default AchievementsForm;

/* ================= Achievement Card ================= */

const AchievementCard = ({
    achievement: ach, onEdit, onDelete, isDeleting,
}: {
    achievement: any;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) => (
    <div className="relative p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition group">
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-1">
                    {ach.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                    <h3 className="text-base font-semibold text-gray-800 truncate">{ach.achievement_title}</h3>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {ach.achievement_type && (
                        <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {ACHIEVEMENT_TYPE_LABELS[ach.achievement_type] || ach.achievement_type}
                        </span>
                    )}
                    {ach.achievement_level && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${LEVEL_COLORS[ach.achievement_level] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {ACHIEVEMENT_LEVEL_LABELS[ach.achievement_level] || ach.achievement_level}
                        </span>
                    )}
                    {ach.issuing_organization && (
                        <span className="text-xs text-gray-400">· {ach.issuing_organization}</span>
                    )}
                </div>

                {/* Date + Participants */}
                <p className="text-xs text-gray-400 mb-2">
                    {ach.achievement_date?.substring(0, 10)}
                    {ach.event_name ? ` · ${ach.event_name}` : ""}
                    {ach.participants_count ? ` · ${ach.participants_count.toLocaleString()}+ participants` : ""}
                </p>

                {/* Description */}
                {ach.achievement_description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ach.achievement_description}</p>
                )}

                {/* Position + Links + Verified */}
                <div className="flex items-center gap-3 flex-wrap">
                    {ach.position_rank && (
                        <span className="text-xs font-medium px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                            🏆 {ach.position_rank}
                        </span>
                    )}
                    {ach.certificate_url && (
                        <a href={ach.certificate_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> Certificate
                        </a>
                    )}
                    {ach.proof_url && (
                        <a href={ach.proof_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-3.5 w-3.5" /> Proof
                        </a>
                    )}
                    {ach.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </span>
                    )}
                    {ach.is_verified === false && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Please verify this achievement from admin
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
