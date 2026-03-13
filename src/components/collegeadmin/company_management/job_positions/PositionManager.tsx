import { useState, useCallback, useEffect } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { useAddPosition } from "@/hooks/collegeadmin/company_management/job_positions/useAddPosition";
import { useUpdatePosition } from "@/hooks/collegeadmin/company_management/job_positions/useUpdatePosition";
import { useUpdatePositionStatus } from "@/hooks/collegeadmin/company_management/job_positions/useUpdatePositionStatus";

// ========================
// TYPES
// ========================

interface Position {
    position_id: string;
    position_name: string;
    position_description: string | null;
    vacancies: number;
    position_status: string;
    created_at: string;
}

interface PositionManagerProps {
    jobId: string;
    jobStatus: string;
    positions: Position[];
    onRefresh: () => void;
}

// ========================
// STATUS HELPERS
// ========================

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    inactive: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    filled: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
};

const STATUS_OPTIONS = ["active", "inactive", "filled"];

// ========================
// MAIN COMPONENT
// ========================

const PositionManager = ({ jobId, jobStatus, positions, onRefresh }: PositionManagerProps) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);

    const isCancelled = jobStatus === "cancelled";

    // Total active vacancies
    const totalActiveVacancies = positions
        .filter((p) => p.position_status === "active")
        .reduce((sum, p) => sum + (p.vacancies || 0), 0);

    const handleAddSuccess = useCallback(() => {
        setShowAddModal(false);
        onRefresh();
    }, [onRefresh]);

    const handleEditSuccess = useCallback(() => {
        setEditingPosition(null);
        onRefresh();
    }, [onRefresh]);

    return (
        <div>
            {/* Header with stats and Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-600">
                        {positions.length} Position{positions.length !== 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {totalActiveVacancies} active vacancies
                    </span>
                </div>

                {!isCancelled && (
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={14} /> Add Position
                    </button>
                )}
            </div>

            {/* Positions Table */}
            {positions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No positions defined. Click "Add Position" to add one.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">POSITION</th>
                                <th className="px-4 py-3">DESCRIPTION</th>
                                <th className="px-4 py-3">VACANCIES</th>
                                <th className="px-4 py-3">STATUS</th>
                                {!isCancelled && <th className="px-4 py-3">ACTIONS</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {positions.map((p, i) => {
                                const badge = STATUS_BADGE[p.position_status] || STATUS_BADGE.active;
                                return (
                                    <tr key={p.position_id} className="border-b text-sm hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{p.position_name}</td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[250px] truncate">
                                            {p.position_description || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                {p.vacancies}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                {p.position_status.charAt(0).toUpperCase() + p.position_status.slice(1)}
                                            </span>
                                        </td>
                                        {!isCancelled && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingPosition(p)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                                        title="Edit position"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <StatusDropdown
                                                        positionId={p.position_id}
                                                        currentStatus={p.position_status}
                                                        onSuccess={onRefresh}
                                                    />
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Position Modal */}
            {showAddModal && (
                <AddPositionModal
                    jobId={jobId}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}

            {/* Edit Position Modal */}
            {editingPosition && (
                <EditPositionModal
                    position={editingPosition}
                    onClose={() => setEditingPosition(null)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

// ========================
// STATUS DROPDOWN
// ========================

const StatusDropdown = ({
    positionId,
    currentStatus,
    onSuccess,
}: {
    positionId: string;
    currentStatus: string;
    onSuccess: () => void;
}) => {
    const { updateStatus, loading } = useUpdatePositionStatus(onSuccess);

    return (
        <select
            value={currentStatus}
            onChange={(e) => {
                if (e.target.value !== currentStatus) {
                    updateStatus(positionId, e.target.value);
                }
            }}
            disabled={loading}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
        >
            {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
            ))}
        </select>
    );
};

// ========================
// ADD POSITION MODAL
// ========================

const AddPositionModal = ({
    jobId,
    onClose,
    onSuccess,
}: {
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleSubmit } = useAddPosition(jobId, onSuccess);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !loading && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Add New Position</h2>
                    <button type="button" onClick={onClose} disabled={loading} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition disabled:opacity-40">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="position_name"
                            value={formData.position_name}
                            onChange={handleChange}
                            placeholder="e.g. Data Analyst"
                            maxLength={200}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.position_name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.position_name && <p className="text-xs text-red-500 mt-1">{errors.position_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <textarea
                            name="position_description"
                            value={formData.position_description}
                            onChange={handleChange}
                            placeholder="Brief description of the position..."
                            rows={3}
                            maxLength={1000}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.position_description ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.position_description && <p className="text-xs text-red-500 mt-1">{errors.position_description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vacancies <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            type="number"
                            name="vacancies"
                            value={formData.vacancies}
                            onChange={handleChange}
                            placeholder="e.g. 10"
                            min={1}
                            max={9999}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vacancies ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.vacancies && <p className="text-xs text-red-500 mt-1">{errors.vacancies}</p>}
                    </div>
                </div>

                <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-40">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-40 flex items-center gap-2"
                    >
                        {loading && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {loading ? "Adding..." : "Add Position"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ========================
// EDIT POSITION MODAL
// ========================

const EditPositionModal = ({
    position,
    onClose,
    onSuccess,
}: {
    position: Position;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleSubmit, loadPosition } = useUpdatePosition(onSuccess);

    // Load position data on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        loadPosition(position);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !loading && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Edit Position</h2>
                    <button type="button" onClick={onClose} disabled={loading} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition disabled:opacity-40">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position Name</label>
                        <input
                            name="position_name"
                            value={formData.position_name}
                            onChange={handleChange}
                            placeholder="e.g. Data Analyst"
                            maxLength={200}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.position_name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.position_name && <p className="text-xs text-red-500 mt-1">{errors.position_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="position_description"
                            value={formData.position_description}
                            onChange={handleChange}
                            placeholder="Brief description..."
                            rows={3}
                            maxLength={1000}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.position_description ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.position_description && <p className="text-xs text-red-500 mt-1">{errors.position_description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vacancies</label>
                        <input
                            type="number"
                            name="vacancies"
                            value={formData.vacancies}
                            onChange={handleChange}
                            placeholder="e.g. 10"
                            min={1}
                            max={9999}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vacancies ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.vacancies && <p className="text-xs text-red-500 mt-1">{errors.vacancies}</p>}
                    </div>
                </div>

                <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-40">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit(position.position_id)}
                        disabled={loading}
                        className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-40 flex items-center gap-2"
                    >
                        {loading && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {loading ? "Updating..." : "Update Position"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PositionManager;
