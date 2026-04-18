import { useState, useCallback, useEffect } from "react";
import {
    Plus,
    Pencil,
    Target,
    Loader2,
    AlertTriangle,
    Power,
    CheckCircle2,
    RotateCcw,
    Users,
    Ban,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
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
    active: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    inactive: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", dot: "bg-red-400" },
    filled: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
};

interface StatusAction {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hoverBg: string;
    hoverText: string;
}

const getStatusActions = (currentStatus: string): StatusAction[] => {
    const actions: StatusAction[] = [];
    if (currentStatus !== "active") {
        actions.push({
            key: "active",
            label: "Reactivate",
            icon: RotateCcw,
            hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
            hoverText: "hover:text-emerald-600 dark:hover:text-emerald-400",
        });
    }
    if (currentStatus !== "inactive") {
        actions.push({
            key: "inactive",
            label: "Deactivate",
            icon: Power,
            hoverBg: "hover:bg-red-50 dark:hover:bg-red-900/20",
            hoverText: "hover:text-red-600 dark:hover:text-red-400",
        });
    }
    if (currentStatus !== "filled") {
        actions.push({
            key: "filled",
            label: "Mark Filled",
            icon: CheckCircle2,
            hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
            hoverText: "hover:text-blue-600 dark:hover:text-blue-400",
        });
    }
    return actions;
};

const STATUS_MODAL_CONFIG: Record<
    string,
    {
        title: string;
        icon: React.ComponentType<{ className?: string }>;
        iconBg: string;
        iconColor: string;
        boxBg: string;
        boxBorder: string;
        boxText: string;
        confirmBg: string;
        bullets: string[];
    }
> = {
    active: {
        title: "Reactivate Position",
        icon: RotateCcw,
        iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        boxBg: "bg-emerald-50 dark:bg-emerald-900/20",
        boxBorder: "border-emerald-100 dark:border-emerald-800",
        boxText: "text-emerald-700 dark:text-emerald-300",
        confirmBg: "bg-emerald-600 hover:bg-emerald-700",
        bullets: [
            "Position will be open for applications again",
            "Students will see this role as available",
            "You can deactivate or mark as filled later",
        ],
    },
    inactive: {
        title: "Deactivate Position",
        icon: Power,
        iconBg: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
        boxBg: "bg-amber-50 dark:bg-amber-900/20",
        boxBorder: "border-amber-100 dark:border-amber-800",
        boxText: "text-amber-700 dark:text-amber-300",
        confirmBg: "bg-red-600 hover:bg-red-700",
        bullets: [
            "Students won't see this position as available",
            "Existing applications will not be affected",
            "You can reactivate at any time",
        ],
    },
    filled: {
        title: "Mark Position as Filled",
        icon: CheckCircle2,
        iconBg: "bg-blue-50 dark:bg-blue-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
        boxBg: "bg-blue-50 dark:bg-blue-900/20",
        boxBorder: "border-blue-100 dark:border-blue-800",
        boxText: "text-blue-700 dark:text-blue-300",
        confirmBg: "bg-blue-600 hover:bg-blue-700",
        bullets: [
            "This position will show as filled to students",
            "No new applications will be expected for this role",
            "You can revert to active later if needed",
        ],
    },
};

// ========================
// MAIN COMPONENT
// ========================

const PositionManager = ({ jobId, jobStatus, positions, onRefresh }: PositionManagerProps) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);
    const [statusChange, setStatusChange] = useState<{ position: Position; newStatus: string } | null>(null);

    const isCancelled = jobStatus === "cancelled";

    // Stats
    const totalCount = positions.length;
    const activeCount = positions.filter((p) => p.position_status === "active").length;
    const filledCount = positions.filter((p) => p.position_status === "filled").length;
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

    const handleStatusSuccess = useCallback(() => {
        setStatusChange(null);
        onRefresh();
    }, [onRefresh]);

    return (
        <div>
            {/* Cancelled job banner */}
            {isCancelled && (
                <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                    <Ban className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">This job is cancelled</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Positions cannot be added or modified.</p>
                    </div>
                </div>
            )}

            {/* Header with stats and Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Positions</h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                {totalCount} total
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                                {activeCount} active
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                <Users className="h-3 w-3" />
                                {totalActiveVacancies} vacancies
                            </span>
                            {filledCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                    {filledCount} filled
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {!isCancelled && (
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Position
                    </button>
                )}
            </div>

            {/* Table or empty state */}
            {positions.length === 0 ? (
                <EmptyState isCancelled={isCancelled} onAdd={() => setShowAddModal(true)} />
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                    <th scope="col" className="px-4 py-3 w-10">#</th>
                                    <th scope="col" className="px-4 py-3">Position</th>
                                    <th scope="col" className="px-4 py-3">Description</th>
                                    <th scope="col" className="px-4 py-3">Vacancies</th>
                                    <th scope="col" className="px-4 py-3">Status</th>
                                    {!isCancelled && <th scope="col" className="px-4 py-3 text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {positions.map((p, i) => {
                                    const badge = STATUS_BADGE[p.position_status] || STATUS_BADGE.active;
                                    const actions = getStatusActions(p.position_status);
                                    return (
                                        <tr key={p.position_id} className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors text-sm">
                                            <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-xs">{i + 1}</td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {p.position_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={p.position_description || undefined}>
                                                {p.position_description || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                    <Users className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                    {p.vacancies}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                    {p.position_status.charAt(0).toUpperCase() + p.position_status.slice(1)}
                                                </span>
                                            </td>
                                            {!isCancelled && (
                                                <td className="px-4 py-3.5 text-center">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingPosition(p)}
                                                            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                                            aria-label={`Edit ${p.position_name}`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        {actions.map((action) => {
                                                            const Icon = action.icon;
                                                            return (
                                                                <button
                                                                    key={action.key}
                                                                    type="button"
                                                                    onClick={() => setStatusChange({ position: p, newStatus: action.key })}
                                                                    className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md text-gray-400 transition ${action.hoverBg} ${action.hoverText}`}
                                                                    aria-label={`${action.label} ${p.position_name}`}
                                                                    title={action.label}
                                                                >
                                                                    <Icon className="h-4 w-4" />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {positions.map((p, i) => {
                            const badge = STATUS_BADGE[p.position_status] || STATUS_BADGE.active;
                            const actions = getStatusActions(p.position_status);
                            return (
                                <div
                                    key={p.position_id}
                                    className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                                <span className="text-gray-400 dark:text-gray-500 mr-1.5">{i + 1}.</span>
                                                {p.position_name}
                                            </p>
                                            {p.position_description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {p.position_description}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${badge.bg} ${badge.text}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                            {p.position_status.charAt(0).toUpperCase() + p.position_status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                            <Users className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                            {p.vacancies} vacancies
                                        </span>

                                        {!isCancelled && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingPosition(p)}
                                                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                                    aria-label={`Edit ${p.position_name}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                {actions.map((action) => {
                                                    const Icon = action.icon;
                                                    return (
                                                        <button
                                                            key={action.key}
                                                            type="button"
                                                            onClick={() => setStatusChange({ position: p, newStatus: action.key })}
                                                            className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md text-gray-400 transition ${action.hoverBg} ${action.hoverText}`}
                                                            aria-label={`${action.label} ${p.position_name}`}
                                                            title={action.label}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
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
                    jobId={jobId}
                    onClose={() => setEditingPosition(null)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Status Change Consequence Modal */}
            {statusChange && (
                <StatusChangeModal
                    position={statusChange.position}
                    newStatus={statusChange.newStatus}
                    jobId={jobId}
                    onClose={() => setStatusChange(null)}
                    onSuccess={handleStatusSuccess}
                />
            )}
        </div>
    );
};

// ========================
// EMPTY STATE
// ========================

const EmptyState = ({ isCancelled, onAdd }: { isCancelled: boolean; onAdd: () => void }) => (
    <div className="flex flex-col items-center py-14 text-center">
        <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Target className="h-7 w-7 text-gray-400 dark:text-gray-500" />
        </div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {isCancelled ? "No positions" : "No positions yet"}
        </h4>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mb-5">
            {isCancelled
                ? "Positions cannot be added to cancelled jobs."
                : "Add your first position to define available roles for this job."}
        </p>
        {!isCancelled && (
            <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
                <Plus className="h-4 w-4" />
                Add First Position
            </button>
        )}
    </div>
);

// ========================
// STATUS CHANGE CONSEQUENCE MODAL
// ========================

const StatusChangeModal = ({
    position,
    newStatus,
    jobId,
    onClose,
    onSuccess,
}: {
    position: Position;
    newStatus: string;
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { updateStatus, loading } = useUpdatePositionStatus(jobId, onSuccess);
    const config = STATUS_MODAL_CONFIG[newStatus];

    if (!config) return null;

    const Icon = config.icon;
    const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            disabled={loading}
            title={config.title}
            titleIcon={<Icon className={`h-5 w-5 ${config.iconColor}`} />}
            size="md"
        >
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to mark{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{position.position_name}</span>{" "}
                    as <span className="font-semibold">{statusLabel}</span>?
                </p>

                <div className={`flex items-start gap-3 p-3 rounded-lg ${config.boxBg} border ${config.boxBorder}`}>
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                    <div className={`text-xs ${config.boxText} space-y-1`}>
                        <p className="font-medium">This action will:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                            {config.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => updateStatus(position.position_id, newStatus)}
                    disabled={loading}
                    className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${config.confirmBg}`}
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Updating..." : `Mark as ${statusLabel}`}
                </button>
            </div>
        </ModalWrapper>
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
    const { formData, errors, loading, handleChange, handleSubmit, resetForm } = useAddPosition(jobId, onSuccess);

    const handleCancel = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    return (
        <ModalWrapper
            isOpen={true}
            onClose={handleCancel}
            disabled={loading}
            title="Add New Position"
            titleIcon={<Target className="h-5 w-5 text-blue-600" />}
            size="md"
        >
            <div className="p-6 space-y-5">
                {/* Position Name */}
                <FloatingInput
                    label="Position Name"
                    name="position_name"
                    value={formData.position_name}
                    onChange={handleChange}
                    error={errors.position_name}
                    placeholder="e.g. Data Analyst"
                    maxLength={200}
                    required
                />

                {/* Description */}
                <FloatingTextarea
                    label="Description"
                    name="position_description"
                    value={formData.position_description}
                    onChange={handleChange}
                    error={errors.position_description}
                    placeholder="Brief description of the position responsibilities..."
                    rows={3}
                    maxLength={1000}
                />

                {/* Vacancies */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Vacancies <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">(optional)</span>
                    </label>
                    <input
                        type="number"
                        name="vacancies"
                        value={formData.vacancies}
                        onChange={handleChange}
                        placeholder="e.g. 10"
                        min={1}
                        max={9999}
                        inputMode="numeric"
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition ${
                            errors.vacancies
                                ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500"
                                : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                    />
                    {errors.vacancies && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.vacancies}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Adding..." : "Add Position"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// EDIT POSITION MODAL
// ========================

const EditPositionModal = ({
    position,
    jobId,
    onClose,
    onSuccess,
}: {
    position: Position;
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleSubmit, loadPosition } = useUpdatePosition(jobId, onSuccess);

    useEffect(() => {
        loadPosition(position);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            disabled={loading}
            title="Edit Position"
            titleIcon={<Pencil className="h-5 w-5 text-amber-600" />}
            size="md"
        >
            <div className="p-6 space-y-5">
                {/* Position Name */}
                <FloatingInput
                    label="Position Name"
                    name="position_name"
                    value={formData.position_name}
                    onChange={handleChange}
                    error={errors.position_name}
                    placeholder="e.g. Data Analyst"
                    maxLength={200}
                />

                {/* Description */}
                <FloatingTextarea
                    label="Description"
                    name="position_description"
                    value={formData.position_description}
                    onChange={handleChange}
                    error={errors.position_description}
                    placeholder="Brief description of the position responsibilities..."
                    rows={3}
                    maxLength={1000}
                />

                {/* Vacancies */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Vacancies
                    </label>
                    <input
                        type="number"
                        name="vacancies"
                        value={formData.vacancies}
                        onChange={handleChange}
                        placeholder="e.g. 10"
                        min={1}
                        max={9999}
                        inputMode="numeric"
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition ${
                            errors.vacancies
                                ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500"
                                : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                    />
                    {errors.vacancies && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.vacancies}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit(position.position_id)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Updating..." : "Update Position"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default PositionManager;
