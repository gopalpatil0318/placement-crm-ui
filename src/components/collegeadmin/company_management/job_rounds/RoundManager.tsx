import { useState } from "react";
import { Plus, Pencil, X, Calendar, MapPin } from "lucide-react";
import { useAddRound } from "@/hooks/collegeadmin/company_management/job_rounds/useAddRound";
import { useUpdateRound } from "@/hooks/collegeadmin/company_management/job_rounds/useUpdateRound";
import {
    useUpdateRoundStatus,
    ALLOWED_TRANSITIONS,
    TRANSITION_LABELS,
} from "@/hooks/collegeadmin/company_management/job_rounds/useUpdateRoundStatus";

// ========================
// TYPES
// ========================

interface Round {
    round_id: string;
    round_number: number;
    round_name: string;
    round_description: string | null;
    round_type: string | null;
    round_date: string | null;
    round_venue: string | null;
    round_status: string;
    created_at: string;
}

interface RoundManagerProps {
    jobId: string;
    rounds: Round[];
    onRefresh: () => void;
}

const ROUND_TYPE_OPTIONS = [
    { label: "Aptitude", value: "aptitude" },
    { label: "Technical", value: "technical" },
    { label: "HR", value: "hr" },
    { label: "Group Discussion", value: "group_discussion" },
    { label: "Coding", value: "coding" },
    { label: "Other", value: "other" },
];

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
    in_progress: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
    completed: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

const TYPE_LABELS: Record<string, string> = {
    aptitude: "Aptitude",
    technical: "Technical",
    hr: "HR",
    group_discussion: "Group Discussion",
    coding: "Coding",
    other: "Other",
};

// ========================
// MAIN COMPONENT
// ========================

const RoundManager = ({ jobId, rounds, onRefresh }: RoundManagerProps) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const addRound = useAddRound(jobId, () => {
        setShowAddModal(false);
        onRefresh();
    });

    const updateRound = useUpdateRound(() => {
        setShowEditModal(false);
        onRefresh();
    });

    const { loading: statusLoading, updateStatus } = useUpdateRoundStatus(onRefresh);

    const openEditModal = (round: Round) => {
        updateRound.loadRound(round as unknown as Record<string, unknown>);
        setShowEditModal(true);
    };

    const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">Selection Rounds</h3>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {rounds.length} Round{rounds.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        addRound.resetForm();
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={16} /> Add Round
                </button>
            </div>

            {/* Rounds Table */}
            {sortedRounds.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">ROUND NAME</th>
                                <th className="px-4 py-3">TYPE</th>
                                <th className="px-4 py-3">DATE</th>
                                <th className="px-4 py-3">VENUE</th>
                                <th className="px-4 py-3">STATUS</th>
                                <th className="px-4 py-3">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRounds.map((round) => {
                                const badge = STATUS_BADGE[round.round_status] || STATUS_BADGE.pending;
                                const transitions = ALLOWED_TRANSITIONS[round.round_status] || [];
                                const canEdit = round.round_status === "pending" || round.round_status === "in_progress";

                                return (
                                    <tr key={round.round_id} className="border-b hover:bg-blue-50 text-sm transition-colors">
                                        <td className="px-4 py-3 text-gray-500 font-semibold">
                                            {round.round_number}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{round.round_name}</p>
                                                {round.round_description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                                        {round.round_description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {round.round_type ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                    {TYPE_LABELS[round.round_type] || round.round_type}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {round.round_date ? (
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <Calendar size={13} className="text-gray-400" />
                                                    <span className="text-xs">
                                                        {new Date(round.round_date).toLocaleDateString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {round.round_venue ? (
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <MapPin size={13} className="text-gray-400" />
                                                    <span className="text-xs line-clamp-1">{round.round_venue}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                {STATUS_LABELS[round.round_status] || round.round_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(round)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                                                    >
                                                        <Pencil size={12} /> Edit
                                                    </button>
                                                )}
                                                {transitions.length > 0 && (
                                                    <select
                                                        value=""
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                updateStatus(round.round_id, e.target.value);
                                                            }
                                                        }}
                                                        disabled={statusLoading}
                                                        className="text-xs border rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                                                    >
                                                        <option value="">Change Status</option>
                                                        {transitions.map((t) => (
                                                            <option key={t} value={t}>
                                                                {TRANSITION_LABELS[t] || t}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No selection rounds yet</p>
                    <p className="text-xs text-gray-300 mt-1">Click "Add Round" to create the first round</p>
                </div>
            )}

            {/* Add Round Modal */}
            {showAddModal && (
                <RoundFormModal
                    title="Add Selection Round"
                    formData={addRound.formData}
                    errors={addRound.errors}
                    loading={addRound.loading}
                    onChange={addRound.handleChange}
                    onSubmit={addRound.handleSubmit}
                    onClose={() => setShowAddModal(false)}
                    submitLabel="Add Round"
                />
            )}

            {/* Edit Round Modal */}
            {showEditModal && (
                <RoundFormModal
                    title="Edit Round"
                    formData={updateRound.formData}
                    errors={updateRound.errors}
                    loading={updateRound.loading}
                    onChange={updateRound.handleChange}
                    onSubmit={updateRound.handleSubmit}
                    onClose={() => setShowEditModal(false)}
                    submitLabel="Update Round"
                />
            )}
        </div>
    );
};

// ========================
// FORM MODAL
// ========================

interface RoundFormModalProps {
    title: string;
    formData: {
        round_name: string;
        round_description: string;
        round_type: string;
        round_date: string;
        round_venue: string;
    };
    errors: Record<string, string>;
    loading: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    onClose: () => void;
    submitLabel: string;
}

const RoundFormModal = ({
    title,
    formData,
    errors,
    loading,
    onChange,
    onSubmit,
    onClose,
    submitLabel,
}: RoundFormModalProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Form Body */}
            <div className="p-5 space-y-4">
                {/* Round Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Round Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="round_name"
                        value={formData.round_name}
                        onChange={onChange}
                        placeholder="e.g. Aptitude Test"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.round_name ? "border-red-400 bg-red-50" : "border-gray-300"
                        }`}
                    />
                    {errors.round_name && (
                        <p className="text-xs text-red-500 mt-1">{errors.round_name}</p>
                    )}
                </div>

                {/* Round Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Round Type
                    </label>
                    <select
                        name="round_type"
                        value={formData.round_type}
                        onChange={onChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="">Select type (optional)</option>
                        {ROUND_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Round Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Description
                    </label>
                    <textarea
                        name="round_description"
                        value={formData.round_description}
                        onChange={onChange}
                        placeholder="Brief description of the round..."
                        rows={3}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${
                            errors.round_description ? "border-red-400 bg-red-50" : "border-gray-300"
                        }`}
                    />
                    {errors.round_description && (
                        <p className="text-xs text-red-500 mt-1">{errors.round_description}</p>
                    )}
                </div>

                {/* Round Date */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        name="round_date"
                        value={formData.round_date}
                        onChange={onChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                {/* Round Venue */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Venue
                    </label>
                    <input
                        type="text"
                        name="round_venue"
                        value={formData.round_venue}
                        onChange={onChange}
                        placeholder="e.g. Computer Lab - Block A"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.round_venue ? "border-red-400 bg-red-50" : "border-gray-300"
                        }`}
                    />
                    {errors.round_venue && (
                        <p className="text-xs text-red-500 mt-1">{errors.round_venue}</p>
                    )}
                </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border rounded-lg hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading}
                    className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-40 flex items-center gap-2"
                >
                    {loading && (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {loading ? "Saving..." : submitLabel}
                </button>
            </div>
        </div>
    </div>
);

export default RoundManager;
