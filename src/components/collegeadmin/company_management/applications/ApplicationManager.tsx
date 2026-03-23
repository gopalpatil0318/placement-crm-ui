import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Users,
    X,
    Loader2,
    SlidersHorizontal,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    CheckSquare,
    Square,
    Minus,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    Info,
    Award,
    Briefcase,
    GraduationCap,
} from "lucide-react";
import { useViewApplications, type ApplicationListItem, type StatusSummary } from "@/hooks/collegeadmin/company_management/applications/useViewApplications";
import { useUpdateApplicationStatus } from "@/hooks/collegeadmin/company_management/applications/useUpdateApplicationStatus";
import { useBulkUpdateStatus, type BulkUpdateResult } from "@/hooks/collegeadmin/company_management/applications/useBulkUpdateStatus";
import { useCreatePlacement } from "@/hooks/collegeadmin/placements/useCreatePlacement";
import {
    APPLICATION_STATUS_COLORS,
    APPLICATION_STATUS_LABELS,
    VALID_TRANSITIONS,
} from "@/validators/ApplicationSchema";
import {
    PLACEMENT_TYPE_OPTIONS,
    PLACEMENT_TYPE_LABELS,
} from "@/validators/PlacementSchema";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import FloatingSelect from "@/components/ui/FloatingSelect";

// ========================
// TYPES
// ========================

interface Position {
    position_id: string;
    position_name: string;
}

interface ApplicationManagerProps {
    jobId: string;
    jobStatus: string;
    positions: Position[];
    onRefresh: () => void;
}

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_PILL_ORDER: (keyof StatusSummary)[] = [
    "pending",
    "under_review",
    "shortlisted",
    "selected",
    "offered",
    "rejected",
    "withdrawn",
];

const STATUS_MODAL_CONFIG: Record<string, {
    iconBg: string;
    iconColor: string;
    boxBg: string;
    boxBorder: string;
    boxText: string;
    confirmBg: string;
    consequences: string[];
}> = {
    under_review: {
        iconBg: "bg-cyan-50", iconColor: "text-cyan-600",
        boxBg: "bg-cyan-50", boxBorder: "border-cyan-100", boxText: "text-cyan-700",
        confirmBg: "bg-cyan-600 hover:bg-cyan-700",
        consequences: [
            "Application will be moved to review queue",
            "Student will be notified of the status change",
            "You can shortlist or reject after review",
        ],
    },
    shortlisted: {
        iconBg: "bg-blue-50", iconColor: "text-blue-600",
        boxBg: "bg-blue-50", boxBorder: "border-blue-100", boxText: "text-blue-700",
        confirmBg: "bg-blue-600 hover:bg-blue-700",
        consequences: [
            "Student will be marked as shortlisted for this job",
            "Student will be eligible for selection rounds",
            "You can select or reject later",
        ],
    },
    selected: {
        iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
        boxBg: "bg-emerald-50", boxBorder: "border-emerald-100", boxText: "text-emerald-700",
        confirmBg: "bg-emerald-600 hover:bg-emerald-700",
        consequences: [
            "Student has been selected for the position",
            "You can create a placement record or offer later",
            "Student will be notified of selection",
        ],
    },
    offered: {
        iconBg: "bg-purple-50", iconColor: "text-purple-600",
        boxBg: "bg-purple-50", boxBorder: "border-purple-100", boxText: "text-purple-700",
        confirmBg: "bg-purple-600 hover:bg-purple-700",
        consequences: [
            "An offer has been extended to the student",
            "Placement record should be created separately",
            "Student will be notified about the offer",
        ],
    },
    rejected: {
        iconBg: "bg-red-50", iconColor: "text-red-600",
        boxBg: "bg-amber-50", boxBorder: "border-amber-100", boxText: "text-amber-700",
        confirmBg: "bg-red-600 hover:bg-red-700",
        consequences: [
            "Student's application will be permanently rejected",
            "Student will be notified of the rejection",
            "This action cannot be undone",
        ],
    },
};

// ========================
// STATUS BADGE
// ========================

const StatusBadge = ({ status }: { status: string }) => {
    const colors = APPLICATION_STATUS_COLORS[status] || APPLICATION_STATUS_COLORS.pending;
    const label = APPLICATION_STATUS_LABELS[status] || status;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {label}
        </span>
    );
};

// ========================
// STATUS PILLS (filter bar)
// ========================

const StatusPills = ({
    summary,
    activeFilter,
    onFilter,
}: {
    summary: StatusSummary | null;
    activeFilter: string;
    onFilter: (status: string) => void;
}) => {
    if (!summary) return null;

    const total = summary.total;

    return (
        <div className="flex flex-wrap gap-2">
            {/* "All" pill */}
            <button
                type="button"
                onClick={() => onFilter("")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    !activeFilter
                        ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
            >
                All
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    !activeFilter ? "bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}>
                    {total}
                </span>
            </button>

            {STATUS_PILL_ORDER.map((key) => {
                const count = summary[key] as number;
                const statusKey = key as string;
                const colors = APPLICATION_STATUS_COLORS[statusKey];
                const label = APPLICATION_STATUS_LABELS[statusKey];
                const isActive = activeFilter === statusKey;

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onFilter(isActive ? "" : statusKey)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isActive
                                ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current shadow-sm`
                                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        {label}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                                ? "bg-white/60 text-current"
                                : "bg-gray-200/80 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

// ========================
// SORT HEADER
// ========================

const SortHeader = ({
    label,
    field,
    currentSort,
    currentOrder,
    onSort,
}: {
    label: string;
    field: string;
    currentSort: string;
    currentOrder: string;
    onSort: (field: string) => void;
}) => {
    const isActive = currentSort === field;
    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
            {label}
            {isActive ? (
                currentOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                ) : (
                    <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                )
            ) : (
                <ArrowUpDown className="h-3 w-3 text-gray-300 group-hover:text-gray-400 dark:text-gray-600 dark:group-hover:text-gray-500" />
            )}
        </button>
    );
};

// ========================
// PAGINATION
// ========================

const Pagination = ({
    page,
    totalPages,
    loading,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    loading: boolean;
    onPageChange: (p: number) => void;
}) => {
    if (totalPages <= 1) return null;

    const pages: (number | "ellipsis")[] = [];
    const addPage = (p: number) => {
        if (!pages.includes(p)) pages.push(p);
    };

    addPage(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        addPage(i);
    }
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) addPage(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((p, idx) =>
                p === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        aria-current={p === page ? "page" : undefined}
                        className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition ${
                            p === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        } disabled:cursor-not-allowed`}
                    >
                        {p}
                    </button>
                ),
            )}

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

// ========================
// EMPTY STATE
// ========================

const EmptyState = ({ hasFilters }: { hasFilters: boolean }) =>
    hasFilters ? (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No results match your filters</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search, status filter, or date range.</p>
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No applications yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Students can apply once the job is published and the deadline hasn't passed.</p>
        </div>
    );

// ========================
// SKELETON TABLE
// ========================

const SkeletonTable = () => (
    <>
        {Array.from({ length: 8 }).map((_, i) => (
            <tr key={`skel-${i}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                <td className="px-4 py-3.5 w-10"><div className="h-4 w-4 bg-gray-100 dark:bg-gray-700 rounded" /></td>
                <td className="px-4 py-3.5 w-10"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5" /></td>
                <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-36" />
                        <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-48" />
                    </div>
                </td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-28" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-24" /></td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-20" /></td>
            </tr>
        ))}
    </>
);

// ========================
// STATUS CHANGE MODAL
// ========================

const StatusChangeModal = ({
    applicationId,
    studentName,
    currentStatus,
    targetStatus,
    jobId,
    onClose,
    onSuccess,
}: {
    applicationId: string;
    studentName: string;
    currentStatus: string;
    targetStatus: string;
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { status, remarks, loading, setStatus, setRemarks, handleSubmit, reset } =
        useUpdateApplicationStatus(jobId, onSuccess);

    useEffect(() => {
        setStatus(targetStatus);
    }, [targetStatus, setStatus]);

    const config = STATUS_MODAL_CONFIG[targetStatus];
    const label = APPLICATION_STATUS_LABELS[targetStatus] || targetStatus;

    const handleConfirm = async () => {
        await handleSubmit(applicationId);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!config) return null;

    return (
        <ModalWrapper
            isOpen={true}
            onClose={handleClose}
            disabled={loading}
            title={`Mark as ${label}`}
            titleIcon={<CheckCircle2 className={`h-5 w-5 ${config.iconColor}`} />}
            size="md"
        >
            <div className="space-y-5">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to change <span className="font-semibold text-gray-800 dark:text-gray-200">{studentName}</span>&apos;s
                    application from <StatusBadge status={currentStatus} /> to <StatusBadge status={targetStatus} />?
                </p>

                <div className={`rounded-xl border p-4 ${config.boxBg} ${config.boxBorder}`}>
                    <p className={`text-sm font-medium mb-2 ${config.boxText}`}>This action will:</p>
                    <ul className={`text-sm space-y-1 ${config.boxText}`}>
                        {config.consequences.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>

                <FloatingTextarea
                    label="Remarks"
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add notes about this decision..."
                    rows={3}
                    maxLength={1000}
                    disabled={loading}
                />

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || !status}
                        className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${config.confirmBg}`}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Updating..." : `Mark as ${label}`}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// BULK RESULT MODAL
// ========================

const BulkResultModal = ({
    result,
    onClose,
}: {
    result: BulkUpdateResult;
    onClose: () => void;
}) => {
    const { summary, skipped, errors: resultErrors } = result;

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            title="Bulk Update Results"
            titleIcon={<Info className="h-5 w-5 text-blue-600" />}
            size="md"
        >
            <div className="space-y-5">
                {/* Summary counts */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{summary.updated}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Updated</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{summary.skipped}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Skipped</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">{summary.errors}</p>
                        <p className="text-xs text-red-500 dark:text-red-400 font-medium">Errors</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Target status: <StatusBadge status={result.new_status} />
                </p>

                {/* Skipped details */}
                {skipped.length > 0 && (
                    <div className="rounded-xl border border-amber-100 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-amber-100 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Skipped Applications</p>
                        </div>
                        <div className="divide-y divide-amber-100 dark:divide-amber-800 max-h-48 overflow-y-auto">
                            {skipped.map((s) => (
                                <div key={s.application_id} className="px-4 py-2.5">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.student_name}</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{s.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error details */}
                {resultErrors.length > 0 && (
                    <div className="rounded-xl border border-red-100 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Errors</p>
                        </div>
                        <div className="divide-y divide-red-100 dark:divide-red-800 max-h-48 overflow-y-auto">
                            {resultErrors.map((e) => (
                                <div key={e.application_id} className="px-4 py-2.5">
                                    <p className="text-sm text-red-600 dark:text-red-400">{e.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    Close
                </button>
            </div>
        </ModalWrapper>
    );
};

// ========================
// BULK ACTION BAR
// ========================

const BulkActionBar = ({
    selectedIds,
    applications,
    jobId,
    onDeselectAll,
    onBulkSuccess,
}: {
    selectedIds: Set<string>;
    applications: ApplicationListItem[];
    jobId: string;
    onDeselectAll: () => void;
    onBulkSuccess: () => void;
}) => {
    const { status, remarks, loading, bulkResult, setStatus, setRemarks, handleSubmit, reset } =
        useBulkUpdateStatus(jobId, onBulkSuccess);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Compute valid transitions = intersection of all selected apps' valid transitions
    const validTargets = useMemo(() => {
        const selected = applications.filter((a) => selectedIds.has(a.application_id));
        if (selected.length === 0) return [] as string[];

        let intersection = VALID_TRANSITIONS[selected[0].application_status] || [];
        for (let i = 1; i < selected.length; i++) {
            const allowed = VALID_TRANSITIONS[selected[i].application_status] || [];
            intersection = intersection.filter((s) => allowed.includes(s));
        }
        return intersection;
    }, [selectedIds, applications]);

    useEffect(() => {
        if (bulkResult) {
            setShowResultModal(true);
        }
    }, [bulkResult]);

    const handleBulkSubmit = () => {
        if (!status) return;
        setShowConfirmModal(true);
    };

    const handleConfirmBulk = async () => {
        setShowConfirmModal(false);
        await handleSubmit(Array.from(selectedIds));
    };

    const handleCloseResult = () => {
        setShowResultModal(false);
        reset();
        onDeselectAll();
    };

    return (
        <>
            <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t-2 border-blue-100 dark:border-blue-900 px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{selectedIds.size}</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                            application{selectedIds.size !== 1 ? "s" : ""} selected
                        </span>
                        <button type="button" onClick={onDeselectAll} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto flex-1 sm:flex-initial">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={loading || validTargets.length === 0}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none flex-1 sm:flex-initial sm:w-44 disabled:opacity-50"
                        >
                            <option value="">
                                {validTargets.length === 0 ? "No common transition" : "Select status..."}
                            </option>
                            {validTargets.map((s) => (
                                <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Remarks (optional)"
                            maxLength={1000}
                            disabled={loading}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 hidden sm:block disabled:opacity-50"
                        />

                        <button
                            type="button"
                            onClick={handleBulkSubmit}
                            disabled={loading || !status}
                            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 inline-flex items-center gap-2 whitespace-nowrap"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? "Updating..." : "Apply"}
                        </button>
                    </div>
                </div>
                {validTargets.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-2">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        Selected applications have different statuses with no shared transitions. Try selecting applications with the same status.
                    </p>
                )}
            </div>

            {showConfirmModal && status && (
                <ModalWrapper
                    isOpen={true}
                    onClose={() => setShowConfirmModal(false)}
                    disabled={loading}
                    title="Confirm Bulk Update"
                    titleIcon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
                    size="md"
                >
                    <div className="space-y-5">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            You are about to update{" "}
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedIds.size}</span>{" "}
                            application{selectedIds.size !== 1 ? "s" : ""} to <StatusBadge status={status} />
                        </p>

                        {STATUS_MODAL_CONFIG[status] && (
                            <div className={`rounded-xl border p-4 ${STATUS_MODAL_CONFIG[status].boxBg} ${STATUS_MODAL_CONFIG[status].boxBorder}`}>
                                <p className={`text-sm font-medium mb-2 ${STATUS_MODAL_CONFIG[status].boxText}`}>This action will:</p>
                                <ul className={`text-sm space-y-1 ${STATUS_MODAL_CONFIG[status].boxText}`}>
                                    {STATUS_MODAL_CONFIG[status].consequences.map((c, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {remarks.trim() && (
                            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Remarks:</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{remarks}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmBulk}
                                disabled={loading}
                                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${STATUS_MODAL_CONFIG[status]?.confirmBg || "bg-blue-600 hover:bg-blue-700"}`}
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loading ? "Updating..." : `Update ${selectedIds.size} Application${selectedIds.size !== 1 ? "s" : ""}`}
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {showResultModal && bulkResult && (
                <BulkResultModal result={bulkResult} onClose={handleCloseResult} />
            )}
        </>
    );
};

// ========================
// CREATE PLACEMENT MODAL (from application context)
// ========================

const CreatePlacementFromAppModal = ({
    application,
    onClose,
    onSuccess,
}: {
    application: ApplicationListItem;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleSubmit, reset } =
        useCreatePlacement(onSuccess, application.application_id);

    const showFulltime =
        formData.placement_type === "full-time" || formData.placement_type === "both";
    const showInternship =
        formData.placement_type === "internship" || formData.placement_type === "both";

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <ModalWrapper
            isOpen={true}
            onClose={handleClose}
            disabled={loading}
            title="Create Placement Record"
            titleIcon={<Award className="h-5 w-5 text-emerald-600" />}
            size="md"
        >
            <div className="space-y-4">
                {/* Student info banner */}
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                            {application.student_name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {application.student_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {application.student_email}
                            {application.prn_no && ` · ${application.prn_no}`}
                            {application.dept_name && ` · ${application.dept_name}`}
                        </p>
                    </div>
                    <StatusBadge status={application.application_status} />
                </div>

                {/* Placement Type */}
                <FloatingSelect
                    label="Placement Type"
                    name="placement_type"
                    value={formData.placement_type}
                    onChange={handleChange}
                    options={PLACEMENT_TYPE_OPTIONS.map((t) => ({ value: t, label: PLACEMENT_TYPE_LABELS[t] }))}
                    disabled={loading}
                    required
                />

                {/* Full-time fields */}
                {showFulltime && (
                    <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5" />
                            Full-Time Details
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Package (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="fulltime_package"
                                    value={formData.fulltime_package}
                                    onChange={handleChange}
                                    placeholder="e.g. 650000"
                                    min={0}
                                    step="0.01"
                                    disabled={loading}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${
                                        errors.fulltime_package ? "border-red-300 dark:border-red-600" : "border-gray-200 dark:border-gray-700"
                                    }`}
                                />
                                {errors.fulltime_package && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.fulltime_package}</p>}
                            </div>
                            <FloatingInput
                                label="Designation"
                                name="fulltime_designation"
                                value={formData.fulltime_designation}
                                onChange={handleChange}
                                placeholder="e.g. Software Engineer"
                                maxLength={200}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Joining Date</label>
                            <input
                                type="date"
                                name="fulltime_joining_date"
                                value={formData.fulltime_joining_date}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                            />
                        </div>
                    </div>
                )}

                {/* Internship fields */}
                {showInternship && (
                    <div className="space-y-3 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Internship Details
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Stipend (₹/month) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="internship_stipend"
                                    value={formData.internship_stipend}
                                    onChange={handleChange}
                                    placeholder="e.g. 25000"
                                    min={0}
                                    disabled={loading}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${
                                        errors.internship_stipend ? "border-red-300 dark:border-red-600" : "border-gray-200 dark:border-gray-700"
                                    }`}
                                />
                                {errors.internship_stipend && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.internship_stipend}</p>}
                            </div>
                            <FloatingInput
                                label="Duration"
                                name="internship_duration"
                                value={formData.internship_duration}
                                onChange={handleChange}
                                placeholder="e.g. 6 months"
                                maxLength={100}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                            <input
                                type="date"
                                name="internship_start_date"
                                value={formData.internship_start_date}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                            />
                        </div>
                    </div>
                )}

                {/* Offer letter URL */}
                <FloatingInput
                    label="Offer Letter URL"
                    name="offer_letter_url"
                    value={formData.offer_letter_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    type="url"
                    disabled={loading}
                />

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Creating..." : "Create Placement"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// APPLICATION MANAGER — MAIN COMPONENT
// ========================

const ApplicationManager = ({ jobId, jobStatus, positions, onRefresh }: ApplicationManagerProps) => {
    const navigate = useNavigate();
    const {
        applications,
        statusSummary,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        eligibilityFilter,
        positionFilter,
        appliedAfter,
        appliedBefore,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleEligibilityFilterChange,
        handlePositionFilterChange,
        handleAppliedAfterChange,
        handleAppliedBeforeChange,
        handleSortChange,
        refresh,
        clearFilters,
    } = useViewApplications(jobId);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Status change modal state
    const [statusModal, setStatusModal] = useState<{
        applicationId: string;
        studentName: string;
        currentStatus: string;
        targetStatus: string;
    } | null>(null);

    // Create placement modal state
    const [placementApp, setPlacementApp] = useState<ApplicationListItem | null>(null);

    const handlePlacementSuccess = useCallback(() => {
        setPlacementApp(null);
        refresh();
        onRefresh();
    }, [refresh, onRefresh]);

    // Wrap page/limit handlers to clear selection on navigation
    const wrappedPageChange = useCallback((page: number) => {
        setSelectedIds(new Set());
        handlePageChange(page);
    }, [handlePageChange]);

    const wrappedLimitChange = useCallback((limit: number) => {
        setSelectedIds(new Set());
        handleLimitChange(limit);
    }, [handleLimitChange]);

    const hasFilters = !!(search || statusFilter || eligibilityFilter || positionFilter || appliedAfter || appliedBefore);
    const startEntry = applications.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    const isJobInactive = jobStatus === "cancelled" || jobStatus === "draft";

    // Select all / deselect all for current page
    const allOnPageSelected = applications.length > 0 && applications.every((a) => selectedIds.has(a.application_id));
    const someOnPageSelected = applications.some((a) => selectedIds.has(a.application_id));

    const toggleSelectAll = useCallback(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allOnPageSelected) {
                applications.forEach((a) => next.delete(a.application_id));
            } else {
                applications.forEach((a) => next.add(a.application_id));
            }
            return next;
        });
    }, [allOnPageSelected, applications]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleDeselectAll = useCallback(() => setSelectedIds(new Set()), []);

    const handleRowClick = useCallback(
        (applicationId: string) => {
            navigate(`/college/job/${jobId}/application/${applicationId}`);
        },
        [navigate, jobId],
    );

    const handleStatusAction = useCallback((app: ApplicationListItem, targetStatus: string) => {
        setStatusModal({
            applicationId: app.application_id,
            studentName: app.student_name,
            currentStatus: app.application_status,
            targetStatus,
        });
    }, []);

    const handleStatusSuccess = useCallback(() => {
        setStatusModal(null);
        refresh();
        onRefresh();
    }, [refresh, onRefresh]);

    const handleBulkSuccess = useCallback(() => {
        refresh();
        onRefresh();
    }, [refresh, onRefresh]);

    // Error state
    if (error && !loading && applications.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">Failed to load applications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                <button
                    type="button"
                    onClick={refresh}
                    className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-0 relative">
            {/* Banner for inactive jobs */}
            {isJobInactive && (
                <div className="mx-6 mt-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-5 py-3 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        This job is <span className="font-semibold">{jobStatus}</span>. Application management is limited.
                    </p>
                </div>
            )}

            {/* Header with stats */}
            <div className="px-6 pt-5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Applications</h2>
                            {statusSummary && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{statusSummary.total} total application{statusSummary.total !== 1 ? "s" : ""}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status pills */}
                <StatusPills
                    summary={statusSummary}
                    activeFilter={statusFilter}
                    onFilter={handleStatusFilterChange}
                />
            </div>

            {/* Filters */}
            <div className="px-6 py-3 border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, PRN..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                        />
                    </div>

                    {/* Position filter */}
                    {positions.length > 0 && (
                        <select
                            value={positionFilter}
                            onChange={(e) => handlePositionFilterChange(e.target.value)}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none"
                        >
                            <option value="">All Positions</option>
                            {positions.map((p) => (
                                <option key={p.position_id} value={p.position_id}>{p.position_name}</option>
                            ))}
                        </select>
                    )}

                    {/* Eligibility filter */}
                    <select
                        value={eligibilityFilter}
                        onChange={(e) => handleEligibilityFilterChange(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none"
                    >
                        <option value="">All Eligibility</option>
                        <option value="true">Eligible</option>
                        <option value="false">Not Eligible</option>
                    </select>

                    {/* Date range */}
                    <div className="flex items-center gap-2">
                        <div>
                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">From</p>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={appliedAfter}
                                    onChange={(e) => handleAppliedAfterChange(e.target.value)}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                                    title="Applied after"
                                />
                            </div>
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 text-xs mt-4">—</span>
                        <div>
                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">To</p>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={appliedBefore}
                                    onChange={(e) => handleAppliedBeforeChange(e.target.value)}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                                    title="Applied before"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Page size */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ml-auto">
                        Show
                        <select
                            value={pagination.limit}
                            onChange={(e) => wrappedLimitChange(Number(e.target.value))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear filters */}
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition whitespace-nowrap"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className={`overflow-x-auto${selectedIds.size > 0 ? " pb-20" : ""}`}>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50/70 dark:bg-gray-800/70 text-left text-gray-500 dark:text-gray-400">
                            <th className="px-4 py-3 w-10">
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    disabled={loading || applications.length === 0}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition disabled:opacity-30"
                                    aria-label="Select all"
                                >
                                    {allOnPageSelected ? (
                                        <CheckSquare className="h-4 w-4 text-blue-600" />
                                    ) : someOnPageSelected ? (
                                        <Minus className="h-4 w-4 text-blue-400" />
                                    ) : (
                                        <Square className="h-4 w-4" />
                                    )}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-10">#</th>
                            <th className="px-4 py-3">
                                <SortHeader label="Student" field="student_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Department</th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Position</th>
                            <th className="px-4 py-3">
                                <SortHeader label="Status" field="application_status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th className="px-4 py-3">
                                <SortHeader label="Applied" field="applied_at" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <SkeletonTable />
                        ) : applications.length > 0 ? (
                            applications.map((app, index) => {
                                const isSelected = selectedIds.has(app.application_id);
                                const transitions = VALID_TRANSITIONS[app.application_status] || [];

                                return (
                                    <tr
                                        key={app.application_id}
                                        className={`group border-b border-gray-50 dark:border-gray-800 transition-colors cursor-pointer ${
                                            isSelected ? "bg-blue-50/60 dark:bg-blue-900/20" : "hover:bg-blue-50/40 dark:hover:bg-gray-800/60"
                                        }`}
                                        onClick={() => handleRowClick(app.application_id)}
                                    >
                                        {/* Checkbox */}
                                        <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                onClick={() => toggleSelect(app.application_id)}
                                                className="text-gray-400 hover:text-blue-600 transition"
                                                aria-label={`Select ${app.student_name}`}
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <Square className="h-4 w-4" />
                                                )}
                                            </button>
                                        </td>

                                        {/* Row number */}
                                        <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-sm w-10">
                                            {(pagination.page - 1) * pagination.limit + index + 1}
                                        </td>

                                        {/* Student */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {app.student_name}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    {app.student_email}
                                                    {app.prn_no && <span className="ml-2 text-gray-300 dark:text-gray-600">|</span>}
                                                    {app.prn_no && <span className="ml-2">{app.prn_no}</span>}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Department */}
                                        <td className="px-4 py-3.5">
                                            {app.dept_name ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                    {app.dept_name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>

                                        {/* Position */}
                                        <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                                            {app.position_name || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>

                                        {/* Status + Quick action */}
                                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={app.application_status} />
                                                {transitions.length > 0 && !isJobInactive && (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <select
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value) handleStatusAction(app, e.target.value);
                                                            }}
                                                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-0.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition"
                                                        >
                                                            <option value="">Change</option>
                                                            {transitions.map((t) => (
                                                                <option key={t} value={t}>{APPLICATION_STATUS_LABELS[t]}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                {(app.application_status === "selected" || app.application_status === "offered") && !isJobInactive && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPlacementApp(app)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap"
                                                        title="Create placement record for this student"
                                                    >
                                                        <Award className="h-3 w-3" />
                                                        Placement
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        {/* Applied date */}
                                        <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(app.applied_at).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7}>
                                    <EmptyState hasFilters={hasFilters} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!loading && applications.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startEntry}–{endEntry}</span> of{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span> results
                    </p>
                    <div className="mt-2 sm:mt-0">
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            loading={loading}
                            onPageChange={wrappedPageChange}
                        />
                    </div>
                </div>
            )}

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <BulkActionBar
                    selectedIds={selectedIds}
                    applications={applications}
                    jobId={jobId}
                    onDeselectAll={handleDeselectAll}
                    onBulkSuccess={handleBulkSuccess}
                />
            )}

            {/* Status change modal */}
            {statusModal && (
                <StatusChangeModal
                    applicationId={statusModal.applicationId}
                    studentName={statusModal.studentName}
                    currentStatus={statusModal.currentStatus}
                    targetStatus={statusModal.targetStatus}
                    jobId={jobId}
                    onClose={() => setStatusModal(null)}
                    onSuccess={handleStatusSuccess}
                />
            )}

            {/* Create Placement modal */}
            {placementApp && (
                <CreatePlacementFromAppModal
                    application={placementApp}
                    onClose={() => setPlacementApp(null)}
                    onSuccess={handlePlacementSuccess}
                />
            )}
        </div>
    );
};

export default ApplicationManager;
