import { useState, useCallback, useEffect, useMemo } from "react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
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
    XCircle,
    AlertTriangle,
    FileText,
    GraduationCap,
} from "lucide-react";
import { useViewJobOverrides } from "@/hooks/collegeadmin/company_management/overrides/useViewJobOverrides";
import { useReviewOverride } from "@/hooks/collegeadmin/company_management/overrides/useReviewOverride";
import { useBulkReviewOverrides } from "@/hooks/collegeadmin/company_management/overrides/useBulkReviewOverrides";
import {
    OVERRIDE_STATUS_COLORS,
    OVERRIDE_STATUS_LABELS,
    type OverrideStatus,
} from "@/validators/OverrideSchema";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { type OverrideRequest, type OverrideSummary } from "@/hooks/collegeadmin/company_management/overrides/useViewJobOverrides";

// ========================
// TYPES
// ========================

interface OverrideManagerProps {
    jobId: string;
    onRefresh: () => void;
}

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_PILL_ORDER: OverrideStatus[] = ["pending", "approved", "rejected"];

const REVIEW_MODAL_CONFIG: Record<
    "approve" | "reject",
    {
        iconBg: string;
        iconColor: string;
        boxBg: string;
        boxBorder: string;
        boxText: string;
        confirmBg: string;
        consequences: string[];
    }
> = {
    approve: {
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        boxBg: "bg-emerald-50",
        boxBorder: "border-emerald-100",
        boxText: "text-emerald-700",
        confirmBg: "bg-emerald-600 hover:bg-emerald-700",
        consequences: [
            "Student will be allowed to apply for this job despite not meeting criteria",
            "An override approval notification will be sent to the student",
            "This action can be reviewed later but the student may have already applied",
        ],
    },
    reject: {
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        boxBg: "bg-amber-50",
        boxBorder: "border-amber-100",
        boxText: "text-amber-700",
        confirmBg: "bg-red-600 hover:bg-red-700",
        consequences: [
            "Student will NOT be able to apply for this job",
            "A rejection notification will be sent to the student with your reason",
            "The student will see why they were rejected",
        ],
    },
};



// ========================
// STATUS BADGE
// ========================

const StatusBadge = ({ status }: { status: OverrideStatus }) => {
    const colors = OVERRIDE_STATUS_COLORS[status];
    const label = OVERRIDE_STATUS_LABELS[status];
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
    summary: OverrideSummary | null;
    activeFilter: string;
    onFilter: (status: string) => void;
}) => {
    if (!summary) return null;
    const total = summary.pending + summary.approved + summary.rejected;

    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => onFilter("")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeFilter
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm"
                }`}
            >
                All
                {" "}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFilter ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300" : "bg-white/20 text-white dark:bg-gray-900/30 dark:text-gray-900"
                }`}>
                    {total}
                </span>
            </button>

            {STATUS_PILL_ORDER.map((key) => {
                const count = summary[key];
                const colors = OVERRIDE_STATUS_COLORS[key];
                const label = OVERRIDE_STATUS_LABELS[key];
                const isActive = activeFilter === key;

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onFilter(isActive ? "" : key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isActive
                                ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current shadow-sm dark:ring-offset-gray-900`
                                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        {label}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-white/60 dark:bg-white/20 text-current" : "bg-gray-200/80 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
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
    let SortIcon = ArrowUpDown;
    let iconClass = "h-3 w-3 text-gray-300 group-hover:text-gray-400";
    if (isActive && currentOrder === "asc") { SortIcon = ArrowUp; iconClass = "h-3 w-3 text-blue-600"; }
    else if (isActive) { SortIcon = ArrowDown; iconClass = "h-3 w-3 text-blue-600"; }

    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:text-blue-600 transition-colors group"
        >
            {label}
            <SortIcon className={iconClass} />
        </button>
    );
};

// ========================
// PAGINATION
// ========================

const PaginationControls = ({
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
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) addPage(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) addPage(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map((p, idx) => {
                const ellipsisKey = idx < pages.indexOf(page) ? "ellipsis-before" : "ellipsis-after";
                return p === "ellipsis" ? (
                    <span key={ellipsisKey} className="px-1.5 text-gray-400 text-sm select-none">...</span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        aria-current={p === page ? "page" : undefined}
                        className={`min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium transition ${
                            p === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                        } disabled:cursor-not-allowed`}
                    >
                        {p}
                    </button>
                );
            })}
            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
                <SlidersHorizontal className="h-7 w-7 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No results match your filters</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search, status, or department filter.</p>
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No override requests</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Students who don&apos;t meet eligibility criteria can request an override to apply.</p>
        </div>
    );

// ========================
// SKELETON TABLE
// ========================

const SKELETON_ROW_IDS = ["s1","s2","s3","s4","s5","s6","s7","s8"] as const;
const SkeletonTable = () => (
    <>
        {SKELETON_ROW_IDS.map((id) => (
            <tr key={id} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                <td className="px-4 py-3.5 w-10"><div className="h-4 w-4 bg-gray-100 dark:bg-gray-700 rounded" /></td>
                <td className="px-4 py-3.5 w-10"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5" /></td>
                <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-36" />
                        <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-24" />
                    </div>
                </td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-12" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-10" /></td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-32" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-16" /></td>
            </tr>
        ))}
    </>
);

// ========================
// STUDENT ACADEMIC CARD (for modals)
// ========================

const StudentAcademicCard = ({ req }: { req: OverrideRequest }) => (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Student Academic Profile</p>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <p className={`text-lg font-bold ${Number.parseFloat(req.overall_cgpa) < 7 ? "text-amber-600 dark:text-amber-400" : "text-gray-800 dark:text-gray-200"}`}>
                    {req.overall_cgpa}
                </p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CGPA</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <p className={`text-lg font-bold ${req.total_live_kts > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {req.total_live_kts}
                </p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Live KTs</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{req.tenth_percentage}%</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">10th</p>
            </div>
        </div>
        {req.twelfth_percentage && (
            <div className="px-4 pb-3">
                <div className="text-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 max-w-[120px]">
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{req.twelfth_percentage}%</p>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {req.twelfth_or_diploma === "diploma" ? "Diploma" : "12th"}
                    </p>
                </div>
            </div>
        )}
    </div>
);

// ========================
// REVIEW MODAL
// ========================

const ReviewModal = ({
    request,
    initialAction,
    jobId,
    onClose,
    onSuccess,
}: {
    request: OverrideRequest;
    initialAction: "approve" | "reject";
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const {
        action, reviewNotes, rejectionReason, errors, loading,
        handleActionChange, handleReviewNotesChange, handleRejectionReasonChange,
        handleSubmit, reset,
    } = useReviewOverride(jobId, onSuccess);

    useEffect(() => {
        handleActionChange(initialAction);
    }, [initialAction, handleActionChange]);

    const handleConfirm = () => {
        handleSubmit(request.override_id);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const config = action ? REVIEW_MODAL_CONFIG[action] : null;
    const actionLabel = action === "approve" ? "Approve" : "Reject";
    const ActionIcon = action === "approve" ? CheckCircle2 : XCircle;

    return (
        <ModalWrapper
            isOpen
            onClose={handleClose}
            disabled={loading}
            title={`${actionLabel} Override Request`}
            titleIcon={config ? <ActionIcon className={`h-5 w-5 ${config.iconColor}`} /> : <ShieldAlert className="h-5 w-5 text-gray-600" />}
            size="lg"
        >
            <div className="space-y-5">
                {/* Student info */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                            {request.student_name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{request.student_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{request.enrollment_number} · {request.dept_name}</p>
                    </div>
                </div>

                {/* Academic card */}
                <StudentAcademicCard req={request} />

                {/* Ineligibility reasons */}
                <div className="rounded-xl border border-red-100 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 p-4">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Why they&apos;re ineligible
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">{request.ineligibility_reasons}</p>
                </div>

                {/* Student's reason */}
                <div className="rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-4">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1.5 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Student&apos;s reason for override
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">{request.request_reason}</p>
                </div>

                {/* Action toggle */}
                <div>
                    <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action</p>
                    <fieldset className="grid grid-cols-2 gap-2" aria-label="Review action">
                        <button
                            type="button"
                            onClick={() => handleActionChange("approve")}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                action === "approve"
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-600"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
                            }`}
                        >
                            <CheckCircle2 className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                            Approve
                        </button>
                        <button
                            type="button"
                            onClick={() => handleActionChange("reject")}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                action === "reject"
                                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
                            }`}
                        >
                            <XCircle className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                            Reject
                        </button>
                    </fieldset>
                    {errors.action && <p className="text-xs text-red-500 mt-1">{errors.action}</p>}
                </div>

                {/* Review notes */}
                <FloatingTextarea
                    label="Review Notes"
                    name="review_notes"
                    value={reviewNotes}
                    onChange={(e) => handleReviewNotesChange(e.target.value)}
                    placeholder="Internal notes about this decision..."
                    rows={2}
                    maxLength={1000}
                    disabled={loading}
                    error={errors.review_notes}
                />

                {/* Rejection reason (only when reject) */}
                {action === "reject" && (
                    <FloatingTextarea
                        label="Rejection Reason"
                        name="rejection_reason"
                        value={rejectionReason}
                        onChange={(e) => handleRejectionReasonChange(e.target.value)}
                        placeholder="Explain why this override request is being rejected..."
                        rows={3}
                        maxLength={500}
                        disabled={loading}
                        error={errors.rejection_reason}
                        required
                    />
                )}

                {/* Consequences */}
                {config && (
                    <div className={`rounded-xl border p-4 ${config.boxBg} ${config.boxBorder}`}>
                        <p className={`text-sm font-medium mb-2 ${config.boxText}`}>This action will:</p>
                        <ul className={`text-sm space-y-1 ${config.boxText}`}>
                            {config.consequences.map((c) => (
                                <li key={c} className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || !action}
                        className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
                            config?.confirmBg || "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Processing..." : actionLabel}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// BULK ACTION BAR
// ========================

const BulkActionBar = ({
    selectedIds,
    pendingCount,
    jobId,
    onDeselectAll,
    onBulkSuccess,
    initialAction,
    onInitialActionConsumed,
}: {
    selectedIds: Set<string>;
    pendingCount: number;
    jobId: string;
    onDeselectAll: () => void;
    onBulkSuccess: () => void;
    initialAction?: "approve" | "reject" | null;
    onInitialActionConsumed?: () => void;
}) => {
    const {
        action, reviewNotes, rejectionReason, errors, loading, bulkResult,
        handleActionChange, handleReviewNotesChange, handleRejectionReasonChange,
        handleSubmit, reset,
    } = useBulkReviewOverrides(jobId, onBulkSuccess);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- show modal when bulk result arrives
        if (bulkResult) setShowResultModal(true);
    }, [bulkResult]);

    // Handle header bulk action trigger
    useEffect(() => {
        if (initialAction) {
            handleActionChange(initialAction);
            // eslint-disable-next-line react-hooks/set-state-in-effect -- prop-triggered modal open
            setShowConfirmModal(true);
            onInitialActionConsumed?.();
        }
    }, [initialAction, handleActionChange, onInitialActionConsumed]);

    const handleBulkSubmit = () => {
        if (!action) return;
        setShowConfirmModal(true);
    };

    const handleConfirmBulk = () => {
        setShowConfirmModal(false);
        handleSubmit(Array.from(selectedIds));
    };

    const handleCloseResult = () => {
        setShowResultModal(false);
        reset();
        onDeselectAll();
    };

    const config = action ? REVIEW_MODAL_CONFIG[action] : null;

    return (
        <>
            <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t-2 border-blue-100 dark:border-blue-800 px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{selectedIds.size}</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {selectedIds.size === 1 ? "request" : "requests"} selected
                        </span>
                        <button type="button" onClick={onDeselectAll} className="text-gray-400 hover:text-gray-600 transition p-1">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto flex-1 sm:flex-initial">
                        <select
                            value={action}
                            onChange={(e) => handleActionChange(e.target.value as "approve" | "reject")}
                            disabled={loading}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none flex-1 sm:flex-initial sm:w-40 disabled:opacity-50"
                        >
                            <option value="">Select action...</option>
                            <option value="approve">Approve All</option>
                            <option value="reject">Reject All</option>
                        </select>

                        {action === "reject" && (
                            <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => handleRejectionReasonChange(e.target.value)}
                                placeholder="Rejection reason (required)"
                                maxLength={500}
                                disabled={loading}
                                className={`border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 hidden sm:block disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 ${
                                    errors.rejection_reason ? "border-red-300 dark:border-red-600" : "border-gray-200 dark:border-gray-700"
                                }`}
                            />
                        )}

                        <input
                            type="text"
                            value={reviewNotes}
                            onChange={(e) => handleReviewNotesChange(e.target.value)}
                            placeholder="Notes (optional)"
                            maxLength={1000}
                            disabled={loading}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 hidden sm:block disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200"
                        />

                        <button
                            type="button"
                            onClick={handleBulkSubmit}
                            disabled={loading || !action}
                            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 inline-flex items-center gap-2 whitespace-nowrap"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? "Processing..." : "Apply"}
                        </button>
                    </div>
                </div>
                {pendingCount === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-2">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        No pending requests selected. Only pending requests can be reviewed.
                    </p>
                )}
            </div>

            {/* Bulk confirm modal */}
            {showConfirmModal && action && config && (
                <ModalWrapper
                    isOpen
                    onClose={() => setShowConfirmModal(false)}
                    disabled={loading}
                    title="Confirm Bulk Review"
                    titleIcon={action === "approve"
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        : <XCircle className="h-5 w-5 text-red-600" />}
                    size="lg"
                >
                    <div className="space-y-5">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            You are about to <span className="font-semibold text-gray-800 dark:text-gray-200">{action}</span>{" "}
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedIds.size}</span>{" "}
                            {selectedIds.size === 1 ? "override request" : "override requests"}.
                        </p>

                        <div className={`rounded-xl border p-4 ${config.boxBg} ${config.boxBorder}`}>
                            <p className={`text-sm font-medium mb-2 ${config.boxText}`}>This action will:</p>
                            <ul className={`text-sm space-y-1 ${config.boxText}`}>
                                {config.consequences.map((c) => (
                                    <li key={c} className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {reviewNotes.trim() && (
                            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{reviewNotes}</p>
                            </div>
                        )}

                        {action === "reject" && rejectionReason.trim() && (
                            <div className="rounded-xl border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
                                <p className="text-xs font-medium text-red-500 dark:text-red-400 mb-1">Rejection Reason:</p>
                                <p className="text-sm text-red-700 dark:text-red-300">{rejectionReason}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmBulk}
                                disabled={loading}
                                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${config.confirmBg}`}
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {(() => {
                                    if (loading) return "Processing...";
                                    const verb = action === "approve" ? "Approve" : "Reject";
                                    const noun = selectedIds.size === 1 ? "Request" : "Requests";
                                    return `${verb} ${selectedIds.size} ${noun}`;
                                })()}
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* Bulk result modal */}
            {showResultModal && bulkResult && (
                <ModalWrapper
                    isOpen
                    onClose={handleCloseResult}
                    title="Bulk Review Results"
                    titleIcon={<ShieldAlert className="h-5 w-5 text-blue-600" />}
                    size="lg"
                >
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{bulkResult.processed}</p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Processed</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                                <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{bulkResult.skipped}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Skipped</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Action: <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{bulkResult.action}</span>
                        </p>

                        {bulkResult.skipped_ids.length > 0 && (
                            <div className="rounded-xl border border-amber-100 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20 overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-amber-100 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30">
                                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Skipped (already reviewed)</p>
                                </div>
                                <div className="px-4 py-3 max-h-32 overflow-y-auto">
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-mono break-all">
                                        {bulkResult.skipped_ids.join(", ")}
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleCloseResult}
                            className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            Close
                        </button>
                    </div>
                </ModalWrapper>
            )}
        </>
    );
};

// ========================
// REQUEST DETAIL PANEL (expandable row)
// ========================

const RequestDetailPanel = ({ req, onReview }: { req: OverrideRequest; onReview?: (req: OverrideRequest, action: "approve" | "reject") => void }) => (
    <tr className="bg-gray-50/50 dark:bg-gray-800/50">
        <td colSpan={9} className="px-4 py-0">
            <div className="py-4 pl-6 border-l-2 border-blue-200 dark:border-blue-700 ml-4 space-y-4">
                {/* Student's reason */}
                <div className="rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-4">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Override Reason
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{req.request_reason}</p>
                </div>

                {/* Ineligibility breakdown */}
                <div className="rounded-xl border border-red-100 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 p-4">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Ineligibility Reasons
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{req.ineligibility_reasons}</p>
                </div>

                {/* Academic snapshot */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">CGPA</span>
                        <span className={`text-sm font-bold ${Number.parseFloat(req.overall_cgpa) < 7 ? "text-amber-600 dark:text-amber-400" : "text-gray-800 dark:text-gray-200"}`}>
                            {req.overall_cgpa}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">KTs</span>
                        <span className={`text-sm font-bold ${req.total_live_kts > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {req.total_live_kts}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">10th</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{req.tenth_percentage}%</span>
                    </div>
                    {req.twelfth_percentage && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {req.twelfth_or_diploma === "diploma" ? "Diploma" : "12th"}
                            </span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{req.twelfth_percentage}%</span>
                        </div>
                    )}
                </div>

                {/* Review info (if reviewed) */}
                {req.override_status !== "pending" && (
                    <div className={`rounded-xl border p-4 ${
                        req.override_status === "approved"
                            ? "border-emerald-100 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20"
                            : "border-red-100 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20"
                    }`}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{
                            color: req.override_status === "approved" ? "rgb(4,120,87)" : "rgb(220,38,38)",
                        }}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Review Details
                        </p>
                        <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                            {req.reviewed_by_name && (
                                <p>Reviewed by: <span className="font-medium">{req.reviewed_by_name}</span></p>
                            )}
                            {req.reviewed_at && (
                                <p>
                                    Date:{" "}
                                    <span className="font-medium">
                                        {new Date(req.reviewed_at).toLocaleDateString("en-IN", {
                                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
                                        })}
                                    </span>
                                </p>
                            )}
                            {req.review_notes && <p>Notes: <span className="font-medium">{req.review_notes}</span></p>}
                            {req.rejection_reason && <p>Rejection Reason: <span className="font-medium text-red-600 dark:text-red-400">{req.rejection_reason}</span></p>}
                        </div>
                    </div>
                )}

                {/* Review action buttons for pending (accessible on mobile/touch) */}
                {req.override_status === "pending" && onReview && (
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="button"
                            onClick={() => onReview(req, "approve")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                        </button>
                        <button
                            type="button"
                            onClick={() => onReview(req, "reject")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition"
                        >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                        </button>
                    </div>
                )}
            </div>
        </td>
    </tr>
);

// ========================
// OVERRIDE MANAGER — MAIN COMPONENT
// ========================

const OverrideManager = ({ jobId, onRefresh }: OverrideManagerProps) => {
    const {
        overrides,
        summary,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        deptFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleStatusFilterChange,
        handleDeptFilterChange,
        handleSortChange,
        handlePageChange,
        handleLimitChange,
        refresh,
        clearFilters,
    } = useViewJobOverrides(jobId);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [reviewModal, setReviewModal] = useState<{
        request: OverrideRequest;
        action: "approve" | "reject";
    } | null>(null);
    const [headerBulkAction, setHeaderBulkAction] = useState<"approve" | "reject" | null>(null);

    // Reset expanded and selection when data changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on data refresh
        setExpandedId(null);
    }, [overrides]);

    // Clear selection on page/limit change
    const wrappedPageChange = useCallback((page: number) => {
        setSelectedIds(new Set());
        handlePageChange(page);
    }, [handlePageChange]);

    const wrappedLimitChange = useCallback((limit: number) => {
        setSelectedIds(new Set());
        handleLimitChange(limit);
    }, [handleLimitChange]);

    // Only pending requests can be selected for bulk actions
    const pendingOnPage = useMemo(
        () => overrides.filter((o) => o.override_status === "pending"),
        [overrides],
    );

    const allPendingSelected = pendingOnPage.length > 0 && pendingOnPage.every((o) => selectedIds.has(o.override_id));
    const somePendingSelected = pendingOnPage.some((o) => selectedIds.has(o.override_id));

    const toggleSelectAll = useCallback(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allPendingSelected) {
                pendingOnPage.forEach((o) => next.delete(o.override_id));
            } else {
                pendingOnPage.forEach((o) => next.add(o.override_id));
            }
            return next;
        });
    }, [allPendingSelected, pendingOnPage]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleDeselectAll = useCallback(() => setSelectedIds(new Set()), []);

    // Wrap filter handlers to clear selection
    const wrappedStatusFilterChange = useCallback((status: string) => {
        setSelectedIds(new Set());
        handleStatusFilterChange(status);
    }, [handleStatusFilterChange]);

    const wrappedDeptFilterChange = useCallback((dept: string) => {
        setSelectedIds(new Set());
        handleDeptFilterChange(dept);
    }, [handleDeptFilterChange]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleReviewAction = useCallback((req: OverrideRequest, action: "approve" | "reject") => {
        setReviewModal({ request: req, action });
    }, []);

    const handleReviewSuccess = useCallback(() => {
        setReviewModal(null);
        refresh();
        onRefresh();
    }, [refresh, onRefresh]);

    const handleBulkSuccess = useCallback(() => {
        refresh();
        onRefresh();
    }, [refresh, onRefresh]);

    const hasFilters = !!(search || statusFilter || deptFilter);
    const startEntry = overrides.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    // Fetch departments from API for filter dropdown
    const [departments, setDepartments] = useState<string[]>([]);

    useEffect(() => {
        let cancelled = false;
        CollegeAdminService.getDepartments({ is_active: true, limit: 500 }).then((res) => {
            if (cancelled) return;
            const depts: string[] = (res.data?.departments ?? res.departments ?? [])
                .map((d: { dept_name: string }) => d.dept_name)
                .sort();
            setDepartments(depts);
        }).catch(() => {});
        return () => { cancelled = true; };
    }, []);

    // Error state
    if (error && !loading && overrides.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">Failed to load override requests</p>
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
            {/* Header */}
            <div className="px-6 pt-5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Override Requests</h2>
                            {!loading && summary && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {summary.pending + summary.approved + summary.rejected} total {(summary.pending + summary.approved + summary.rejected) === 1 ? "request" : "requests"}
                                    {summary.pending > 0 && (
                                        <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">· {summary.pending} pending</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Quick bulk actions for pending */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setHeaderBulkAction("approve")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve ({selectedIds.size})
                            </button>
                            <button
                                type="button"
                                onClick={() => setHeaderBulkAction("reject")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition"
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject ({selectedIds.size})
                            </button>
                        </div>
                    )}
                </div>

                <StatusPills summary={summary} activeFilter={statusFilter} onFilter={wrappedStatusFilterChange} />
            </div>

            {/* Filters */}
            <div className="px-6 py-3 border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, enrollment..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            aria-label="Search override requests"
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                        />
                    </div>

                    <select
                        value={deptFilter}
                        onChange={(e) => wrappedDeptFilterChange(e.target.value)}
                        aria-label="Filter by department"
                        className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ml-auto">
                        <span>Show</span>
                        <select
                            value={pagination.limit}
                            onChange={(e) => wrappedLimitChange(Number(e.target.value))}
                            aria-label="Results per page"
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition whitespace-nowrap"
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
                            <th scope="col" className="px-4 py-3 w-10">
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    disabled={loading || pendingOnPage.length === 0}
                                    className="text-gray-400 hover:text-gray-600 transition disabled:opacity-30"
                                    aria-label="Select all pending"
                                >
                                    {(() => {
                                        if (allPendingSelected) return <CheckSquare className="h-4 w-4 text-blue-600" />;
                                        if (somePendingSelected) return <Minus className="h-4 w-4 text-blue-400" />;
                                        return <Square className="h-4 w-4" />;
                                    })()}
                                </button>
                            </th>
                            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-10">#</th>
                            <th scope="col" className="px-4 py-3">
                                <SortHeader label="Student" field="student_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th scope="col" className="px-4 py-3">
                                <SortHeader label="Dept" field="dept_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">CGPA</th>
                            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">KTs</th>
                            <th scope="col" className="px-4 py-3">
                                <SortHeader label="Status" field="override_status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Reason</th>
                            <th scope="col" className="px-4 py-3">
                                <SortHeader label="Requested" field="requested_at" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <SkeletonTable />}
                        {!loading && overrides.length > 0 && overrides.map((req, index) => {
                            const isSelected = selectedIds.has(req.override_id);
                            const isPending = req.override_status === "pending";
                            const isExpanded = expandedId === req.override_id;

                            return (
                                <OverrideRow
                                    key={req.override_id}
                                    req={req}
                                    index={(pagination.page - 1) * pagination.limit + index + 1}
                                    isSelected={isSelected}
                                    isPending={isPending}
                                    isExpanded={isExpanded}
                                    onToggleSelect={toggleSelect}
                                    onToggleExpand={toggleExpand}
                                    onReview={handleReviewAction}
                                />
                            );
                        })}
                        {!loading && overrides.length === 0 && (
                            <tr>
                                <td colSpan={9}>
                                    <EmptyState hasFilters={hasFilters} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!loading && overrides.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startEntry}–{endEntry}</span> of{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span> results
                    </p>
                    <div className="mt-2 sm:mt-0">
                        <PaginationControls
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
                    pendingCount={Array.from(selectedIds).filter((id) => overrides.find((o) => o.override_id === id)?.override_status === "pending").length}
                    jobId={jobId}
                    onDeselectAll={handleDeselectAll}
                    onBulkSuccess={handleBulkSuccess}
                    initialAction={headerBulkAction}
                    onInitialActionConsumed={() => setHeaderBulkAction(null)}
                />
            )}

            {/* Review modal */}
            {reviewModal && (
                <ReviewModal
                    request={reviewModal.request}
                    initialAction={reviewModal.action}
                    jobId={jobId}
                    onClose={() => setReviewModal(null)}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
};

// ========================
// OVERRIDE ROW (extracted for performance)
// ========================

const OverrideRow = ({
    req,
    index,
    isSelected,
    isPending,
    isExpanded,
    onToggleSelect,
    onToggleExpand,
    onReview,
}: {
    req: OverrideRequest;
    index: number;
    isSelected: boolean;
    isPending: boolean;
    isExpanded: boolean;
    onToggleSelect: (id: string) => void;
    onToggleExpand: (id: string) => void;
    onReview: (req: OverrideRequest, action: "approve" | "reject") => void;
}) => {
    let rowBg = "hover:bg-blue-50/40 dark:hover:bg-blue-900/10";
    if (isSelected) rowBg = "bg-blue-50/60 dark:bg-blue-900/20";
    else if (isExpanded) rowBg = "bg-gray-50/50 dark:bg-gray-800/50";

    return (
    <>
        <tr
            className={`group border-b border-gray-50 dark:border-gray-800 transition-colors cursor-pointer ${rowBg}`}
            onClick={() => onToggleExpand(req.override_id)}
        >
            {/* Checkbox */}
            <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                {isPending ? (
                    <button
                        type="button"
                        onClick={() => onToggleSelect(req.override_id)}
                        className="text-gray-400 hover:text-blue-600 transition"
                        aria-label={`Select ${req.student_name}`}
                    >
                        {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                            <Square className="h-4 w-4" />
                        )}
                    </button>
                ) : (
                    <span className="h-4 w-4 block" />
                )}
            </td>

            {/* Row number */}
            <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-sm w-10">{index}</td>

            {/* Student */}
            <td className="px-4 py-3.5">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {req.student_name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{req.enrollment_number} · {req.student_passout_year}</p>
                </div>
            </td>

            {/* Dept */}
            <td className="px-4 py-3.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {req.dept_name}
                </span>
            </td>

            {/* CGPA */}
            <td className="px-4 py-3.5">
                <span className={`text-sm font-semibold ${Number.parseFloat(req.overall_cgpa) < 7 ? "text-amber-600 dark:text-amber-400" : "text-gray-800 dark:text-gray-200"}`}>
                    {req.overall_cgpa}
                </span>
            </td>

            {/* KTs */}
            <td className="px-4 py-3.5">
                <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold ${
                    req.total_live_kts > 0
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                }`}>
                    {req.total_live_kts}
                </span>
            </td>

            {/* Status */}
            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    <StatusBadge status={req.override_status} />
                    {/* Quick actions on hover — only for pending */}
                    {isPending && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onReview(req, "approve")}
                                className="p-1 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition"
                                aria-label="Approve"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onReview(req, "reject")}
                                className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                                aria-label="Reject"
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </td>

            {/* Reason (truncated) */}
            <td className="px-4 py-3.5">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]" title={req.request_reason}>
                    {req.request_reason}
                </p>
            </td>

            {/* Requested at + expand icon */}
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(req.requested_at).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", timeZone: "Asia/Kolkata",
                        })}
                    </span>
                    <span className="text-gray-300 ml-auto">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                </div>
            </td>
        </tr>

        {/* Expanded detail panel */}
        {isExpanded && <RequestDetailPanel req={req} onReview={onReview} />}
    </>
    );
};

export default OverrideManager;
