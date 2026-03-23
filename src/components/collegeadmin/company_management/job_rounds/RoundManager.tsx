import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Pencil,
    ListOrdered,
    Loader2,
    AlertTriangle,
    Ban,
    PlayCircle,
    CheckCircle2,
    XCircle,
    MapPin,
    Calendar,
    ClipboardList,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import { useAddRound } from "@/hooks/collegeadmin/company_management/job_rounds/useAddRound";
import { useUpdateRound } from "@/hooks/collegeadmin/company_management/job_rounds/useUpdateRound";
import {
    useUpdateRoundStatus,
    ALLOWED_TRANSITIONS,
} from "@/hooks/collegeadmin/company_management/job_rounds/useUpdateRoundStatus";
import { ROUND_TYPE_OPTIONS } from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

interface Round {
    round_id: string;
    job_id: string;
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
    jobStatus: string;
    rounds: Round[];
    onRefresh: () => void;
}

// ========================
// CONSTANTS
// ========================

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    in_progress: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
    completed: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    cancelled: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", dot: "bg-red-400" },
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

const ROUND_TYPE_LABELS: Record<string, string> = {
    aptitude: "Aptitude",
    technical: "Technical",
    hr: "HR",
    group_discussion: "Group Discussion",
    coding: "Coding",
    other: "Other",
};

const TRANSITION_ACTIONS: Record<
    string,
    {
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        hoverBg: string;
        hoverText: string;
    }
> = {
    in_progress: {
        label: "Start Round",
        icon: PlayCircle,
        hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
        hoverText: "hover:text-blue-600 dark:hover:text-blue-400",
    },
    completed: {
        label: "Mark Complete",
        icon: CheckCircle2,
        hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
        hoverText: "hover:text-emerald-600 dark:hover:text-emerald-400",
    },
    cancelled: {
        label: "Cancel Round",
        icon: XCircle,
        hoverBg: "hover:bg-red-50 dark:hover:bg-red-900/20",
        hoverText: "hover:text-red-600 dark:hover:text-red-400",
    },
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
        confirmLabel: string;
        bullets: string[];
    }
> = {
    in_progress: {
        title: "Start Round",
        icon: PlayCircle,
        iconBg: "bg-blue-50 dark:bg-blue-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
        boxBg: "bg-blue-50 dark:bg-blue-900/20",
        boxBorder: "border-blue-100 dark:border-blue-800",
        boxText: "text-blue-700 dark:text-blue-300",
        confirmBg: "bg-blue-600 hover:bg-blue-700",
        confirmLabel: "Start Round",
        bullets: [
            "Round begins for students",
            "Students can be evaluated for this round",
            "You can complete or cancel the round later",
        ],
    },
    completed: {
        title: "Complete Round",
        icon: CheckCircle2,
        iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        boxBg: "bg-emerald-50 dark:bg-emerald-900/20",
        boxBorder: "border-emerald-100 dark:border-emerald-800",
        boxText: "text-emerald-700 dark:text-emerald-300",
        confirmBg: "bg-emerald-600 hover:bg-emerald-700",
        confirmLabel: "Mark Complete",
        bullets: [
            "Round will be marked as finished",
            "Results can be recorded for this round",
            "This action cannot be undone",
        ],
    },
    cancelled: {
        title: "Cancel Round",
        icon: XCircle,
        iconBg: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
        boxBg: "bg-amber-50 dark:bg-amber-900/20",
        boxBorder: "border-amber-100 dark:border-amber-800",
        boxText: "text-amber-700 dark:text-amber-300",
        confirmBg: "bg-red-600 hover:bg-red-700",
        confirmLabel: "Cancel Round",
        bullets: [
            "This round will be permanently cancelled",
            "Students will not be evaluated for this round",
            "This action cannot be reversed",
        ],
    },
};

const PIPELINE_COLORS: Record<string, { dot: string; ring: string; line: string; pulse?: boolean }> = {
    pending: { dot: "bg-gray-300 dark:bg-gray-600", ring: "ring-gray-200 dark:ring-gray-700", line: "bg-gray-200 dark:bg-gray-700" },
    in_progress: { dot: "bg-blue-500", ring: "ring-blue-200 dark:ring-blue-800", line: "bg-blue-300 dark:bg-blue-700", pulse: true },
    completed: { dot: "bg-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-800", line: "bg-emerald-300 dark:bg-emerald-700" },
    cancelled: { dot: "bg-red-400", ring: "ring-red-200 dark:ring-red-800", line: "bg-red-200 dark:bg-red-700" },
};

const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition ${
        hasError
            ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
    }`;

// ========================
// STATUS PIPELINE
// ========================

const StatusPipeline = ({ rounds }: { rounds: Round[] }) => {
    if (rounds.length === 0) return null;

    return (
        <div className="mb-6 overflow-x-auto">
            <div className="flex items-center gap-0 min-w-max px-1 py-3">
                {rounds.map((round, i) => {
                    const colors = PIPELINE_COLORS[round.round_status] || PIPELINE_COLORS.pending;
                    return (
                        <div key={round.round_id} className="flex items-center">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className={`relative h-4 w-4 rounded-full ${colors.dot} ring-4 ${colors.ring}`}>
                                    {colors.pulse && (
                                        <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-40" />
                                    )}
                                </div>
                                <span
                                    className="text-[10px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap max-w-[72px] truncate"
                                    title={round.round_name}
                                >
                                    R{round.round_number}
                                </span>
                            </div>
                            {i < rounds.length - 1 && (
                                <div className={`h-0.5 w-10 mx-1 ${colors.line} rounded-full`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ========================
// ROUND CARD
// ========================

const RoundCard = ({
    round,
    isLast,
    isCancelled,
    onEdit,
    onStatusChange,
    onViewResults,
}: {
    round: Round;
    isLast: boolean;
    isCancelled: boolean;
    onEdit: () => void;
    onStatusChange: (newStatus: string) => void;
    onViewResults: () => void;
}) => {
    const badge = STATUS_BADGE[round.round_status] || STATUS_BADGE.pending;
    const transitions = ALLOWED_TRANSITIONS[round.round_status] || [];
    const canEdit = !isCancelled && round.round_status !== "completed" && round.round_status !== "cancelled";
    const canChangeStatus = !isCancelled && transitions.length > 0;

    return (
        <div className="flex gap-4">
            {/* Left: number badge + connector */}
            <div className="flex flex-col items-center flex-shrink-0">
                <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        round.round_status === "completed"
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
                            : round.round_status === "in_progress"
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400"
                            : round.round_status === "cancelled"
                            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-400 dark:text-red-500"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                >
                    {round.round_number}
                </div>
                {!isLast && (
                    <div
                        className={`w-0.5 flex-1 min-h-[24px] mt-1 rounded-full ${
                            round.round_status === "completed"
                                ? "bg-emerald-200 dark:bg-emerald-700"
                                : round.round_status === "in_progress"
                                ? "bg-blue-200 dark:bg-blue-700"
                                : "bg-gray-200 dark:bg-gray-700"
                        }`}
                    />
                )}
            </div>

            {/* Right: card content */}
            <div
                className={`flex-1 p-4 rounded-xl border transition-all mb-3 ${
                    round.round_status === "cancelled"
                        ? "bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-60"
                        : round.round_status === "completed"
                        ? "bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800 shadow-sm"
                        : round.round_status === "in_progress"
                        ? "bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 shadow-sm"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm"
                }`}
            >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                {round.round_name}
                            </h4>
                            {round.round_type && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                                    {ROUND_TYPE_LABELS[round.round_type] || round.round_type}
                                </span>
                            )}
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            {round.round_date && (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    {new Date(round.round_date).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            )}
                            {round.round_venue && (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="max-w-[200px] truncate">{round.round_venue}</span>
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {round.round_description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                {round.round_description}
                            </p>
                        )}
                    </div>

                    {/* Status badge */}
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${badge.bg} ${badge.text}`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                        {STATUS_LABELS[round.round_status] || round.round_status}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onViewResults}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        aria-label={`View results for ${round.round_name}`}
                    >
                        <ClipboardList className="h-3.5 w-3.5" />
                        Results
                    </button>
                    {canEdit && (
                            <button
                                type="button"
                                onClick={onEdit}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition"
                                aria-label={`Edit ${round.round_name}`}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        )}
                        {canChangeStatus &&
                            transitions.map((status) => {
                                const action = TRANSITION_ACTIONS[status];
                                if (!action) return null;
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => onStatusChange(status)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-lg transition ${action.hoverBg} ${action.hoverText}`}
                                        title={action.label}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {action.label}
                                    </button>
                                );
                            })}
                </div>
            </div>
        </div>
    );
};

// ========================
// MAIN COMPONENT
// ========================

const RoundManager = ({ jobId, jobStatus, rounds, onRefresh }: RoundManagerProps) => {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRound, setEditingRound] = useState<Round | null>(null);
    const [statusChange, setStatusChange] = useState<{ round: Round; newStatus: string } | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const isCancelled = jobStatus === "cancelled";

    // Sort rounds by round_number for correct timeline order
    const sortedRounds = useMemo(
        () => [...rounds].sort((a, b) => a.round_number - b.round_number),
        [rounds]
    );

    // Stats
    const totalCount = rounds.length;
    const pendingCount = rounds.filter((r) => r.round_status === "pending").length;
    const inProgressCount = rounds.filter((r) => r.round_status === "in_progress").length;
    const completedCount = rounds.filter((r) => r.round_status === "completed").length;

    const handleAddSuccess = useCallback(() => {
        setShowAddModal(false);
        onRefresh();
        // Scroll to last round after DOM updates with new data
        requestAnimationFrame(() => {
            const container = timelineRef.current;
            if (container) {
                const lastCard = container.lastElementChild as HTMLElement | null;
                lastCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        });
    }, [onRefresh]);

    const handleEditSuccess = useCallback(() => {
        setEditingRound(null);
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
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Rounds cannot be added or modified.</p>
                    </div>
                </div>
            )}

            {/* Header with stats and Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                        <ListOrdered className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Selection Rounds</h3>
                        {totalCount > 0 && (
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {totalCount} total
                                </span>
                                {completedCount > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                                        {completedCount} completed
                                    </span>
                                )}
                                {inProgressCount > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                        {inProgressCount} in progress
                                    </span>
                                )}
                                {pendingCount > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                                        {pendingCount} pending
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!isCancelled && (
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Round
                    </button>
                )}
            </div>

            {/* Pipeline + cards or empty state */}
            {sortedRounds.length === 0 ? (
                <EmptyState isCancelled={isCancelled} onAdd={() => setShowAddModal(true)} />
            ) : (
                <>
                    <StatusPipeline rounds={sortedRounds} />
                    <div ref={timelineRef}>
                        {sortedRounds.map((round, i) => (
                            <RoundCard
                                key={round.round_id}
                                round={round}
                                isLast={i === sortedRounds.length - 1}
                                isCancelled={isCancelled}
                                onEdit={() => setEditingRound(round)}
                                onStatusChange={(newStatus) =>
                                    setStatusChange({ round, newStatus })
                                }
                                onViewResults={() =>
                                    navigate(`/college/job/${jobId}/round/${round.round_id}/results`)
                                }
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Add Round Modal */}
            {showAddModal && (
                <AddRoundModal
                    jobId={jobId}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}

            {/* Edit Round Modal */}
            {editingRound && (
                <EditRoundModal
                    round={editingRound}
                    jobId={jobId}
                    onClose={() => setEditingRound(null)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Status Change Consequence Modal */}
            {statusChange && (
                <StatusChangeModal
                    round={statusChange.round}
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
            <ListOrdered className="h-7 w-7 text-gray-400 dark:text-gray-500" />
        </div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {isCancelled ? "No rounds" : "No selection rounds yet"}
        </h4>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mb-5">
            {isCancelled
                ? "Rounds cannot be added to cancelled jobs."
                : "Define the hiring process by adding selection rounds such as aptitude tests, technical interviews, and HR rounds."}
        </p>
        {!isCancelled && (
            <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
                <Plus className="h-4 w-4" />
                Add First Round
            </button>
        )}
    </div>
);

// ========================
// STATUS CHANGE CONSEQUENCE MODAL
// ========================

const StatusChangeModal = ({
    round,
    newStatus,
    jobId,
    onClose,
    onSuccess,
}: {
    round: Round;
    newStatus: string;
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { updateStatus, loading } = useUpdateRoundStatus(jobId, onSuccess);
    const config = STATUS_MODAL_CONFIG[newStatus];

    if (!config) return null;

    const Icon = config.icon;

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            disabled={loading}
            title={config.title}
            titleIcon={<Icon className={`h-5 w-5 ${config.iconColor}`} />}
            size="md"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{config.confirmLabel.toLowerCase()}</span>{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-100">"{round.round_name}"</span>?
                </p>

                <div className={`flex items-start gap-3 p-3 rounded-lg ${config.boxBg} border ${config.boxBorder}`}>
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                    <div className={`text-xs ${config.boxText} space-y-1`}>
                        <p className="font-medium">This action will:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                            {config.bullets.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
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
                    onClick={() => updateStatus(round.round_id, newStatus)}
                    disabled={loading}
                    className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${config.confirmBg}`}
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Updating..." : config.confirmLabel}
                </button>
            </div>
        </ModalWrapper>
    );
};

// ========================
// ADD ROUND MODAL
// ========================

const AddRoundModal = ({
    jobId,
    onClose,
    onSuccess,
}: {
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleSubmit, resetForm } = useAddRound(jobId, onSuccess);

    const handleCancel = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    return (
        <ModalWrapper
            isOpen={true}
            onClose={handleCancel}
            disabled={loading}
            title="Add Selection Round"
            titleIcon={<ListOrdered className="h-5 w-5 text-blue-600" />}
            size="md"
        >
            <div className="space-y-5">
                {/* Round Name */}
                <FloatingInput
                    label="Round Name"
                    name="round_name"
                    value={formData.round_name}
                    onChange={handleChange}
                    error={errors.round_name}
                    placeholder="e.g. Aptitude Test"
                    maxLength={200}
                    required
                />

                {/* Round Type */}
                <FloatingSelect
                    label="Round Type"
                    name="round_type"
                    value={formData.round_type}
                    onChange={handleChange}
                    options={ROUND_TYPE_OPTIONS.map((t) => ({
                        value: t,
                        label: ROUND_TYPE_LABELS[t] || t,
                    }))}
                />

                {/* Date & Venue row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Date & Time <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            type="datetime-local"
                            name="round_date"
                            value={formData.round_date}
                            onChange={handleChange}
                            className={inputClass(false)}
                        />
                    </div>
                    <FloatingInput
                        label="Venue"
                        name="round_venue"
                        value={formData.round_venue}
                        onChange={handleChange}
                        error={errors.round_venue}
                        placeholder="e.g. Computer Lab - Block A"
                        maxLength={500}
                    />
                </div>

                {/* Description */}
                <FloatingTextarea
                    label="Description"
                    name="round_description"
                    value={formData.round_description}
                    onChange={handleChange}
                    error={errors.round_description}
                    placeholder="Describe the round format, duration, topics covered..."
                    rows={3}
                    maxLength={1000}
                />

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
                        {loading ? "Adding..." : "Add Round"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// EDIT ROUND MODAL
// ========================

const EditRoundModal = ({
    round,
    jobId,
    onClose,
    onSuccess,
}: {
    round: Round;
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleSubmit, loadRound } = useUpdateRound(jobId, onSuccess);

    useEffect(() => {
        loadRound(round as unknown as Record<string, unknown>);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            disabled={loading}
            title="Edit Round"
            titleIcon={<Pencil className="h-5 w-5 text-amber-600" />}
            size="md"
        >
            <div className="space-y-5">
                {/* Round Name */}
                <FloatingInput
                    label="Round Name"
                    name="round_name"
                    value={formData.round_name}
                    onChange={handleChange}
                    error={errors.round_name}
                    placeholder="e.g. Aptitude Test"
                    maxLength={200}
                />

                {/* Round Type */}
                <FloatingSelect
                    label="Round Type"
                    name="round_type"
                    value={formData.round_type}
                    onChange={handleChange}
                    options={ROUND_TYPE_OPTIONS.map((t) => ({
                        value: t,
                        label: ROUND_TYPE_LABELS[t] || t,
                    }))}
                />

                {/* Date & Venue row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            name="round_date"
                            value={formData.round_date}
                            onChange={handleChange}
                            className={inputClass(false)}
                        />
                    </div>
                    <FloatingInput
                        label="Venue"
                        name="round_venue"
                        value={formData.round_venue}
                        onChange={handleChange}
                        error={errors.round_venue}
                        placeholder="e.g. Computer Lab - Block A"
                        maxLength={500}
                    />
                </div>

                {/* Description */}
                <FloatingTextarea
                    label="Description"
                    name="round_description"
                    value={formData.round_description}
                    onChange={handleChange}
                    error={errors.round_description}
                    placeholder="Describe the round format, duration, topics covered..."
                    rows={3}
                    maxLength={1000}
                />

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
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Updating..." : "Update Round"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default RoundManager;
