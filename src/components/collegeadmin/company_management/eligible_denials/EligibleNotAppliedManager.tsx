import { useState, useCallback, useMemo } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    UserX,
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
    Bell,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Send,
    BarChart3,
} from "lucide-react";
import { useViewEligibleNotApplied } from "@/hooks/collegeadmin/company_management/eligible_denials/useViewEligibleNotApplied";
import { useNotifyStudents } from "@/hooks/collegeadmin/company_management/eligible_denials/useNotifyStudents";
import { type EligibleNotAppliedStudent } from "@/hooks/collegeadmin/company_management/eligible_denials/useViewEligibleNotApplied";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingTextarea from "@/components/ui/FloatingTextarea";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ========================
// HELPERS
// ========================

const cgpaColor = (val: number | null) => {
    if (val === null) return "text-gray-400 dark:text-gray-500";
    if (val >= 8) return "text-emerald-600 dark:text-emerald-400";
    if (val >= 6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
};

const ktBadge = (val: number) => {
    if (val === 0)
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
    return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
};

// ========================
// DEADLINE BADGE
// ========================

const DeadlineBadge = ({ deadline }: { deadline: string | null }) => {
    if (!deadline) return <span className="text-xs text-gray-400 dark:text-gray-500">No deadline</span>;

    const now = new Date();
    const dl = new Date(deadline);
    const diffMs = dl.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <Clock className="h-3 w-3" />
                Expired
            </span>
        );
    }
    if (diffDays === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <Clock className="h-3 w-3" />
                Due today
            </span>
        );
    }
    if (diffDays <= 3) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <Clock className="h-3 w-3" />
                {diffDays} day{diffDays === 1 ? "" : "s"} left
            </span>
        );
    }
    if (diffDays <= 7) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <Clock className="h-3 w-3" />
                {diffDays} days left
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Clock className="h-3 w-3" />
            {diffDays} days left
        </span>
    );
};

// ========================
// STATS BAR
// ========================

const StatsBar = ({
    notAppliedCount,
    appliedCount,
    deadline,
}: {
    notAppliedCount: number;
    appliedCount: number;
    deadline: string | null;
}) => (
    <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
            <UserX className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
                <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">Not Applied</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{notAppliedCount}</p>
            </div>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div>
                <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">Applied</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{appliedCount}</p>
            </div>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <BarChart3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Deadline</p>
                <DeadlineBadge deadline={deadline} />
            </div>
        </div>
    </div>
);

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
            {(() => {
                if (isActive && currentOrder === "asc") return <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
                if (isActive) return <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
                return <ArrowUpDown className="h-3 w-3 text-gray-300 group-hover:text-gray-400 dark:text-gray-600 dark:group-hover:text-gray-500" />;
            })()}
        </button>
    );
};

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
                    <span key={`ellipsis-${String(idx)}`} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or department filter.</p>
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">All eligible students have applied!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">There are no eligible students who haven&apos;t applied to this job yet.</p>
        </div>
    );

// ========================
// SKELETON TABLE
// ========================

const SkeletonTable = () => (
    <>
        {Array.from({ length: 8 }).map((_, i) => (
            <tr key={`skel-${String(i)}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                <td className="px-4 py-3.5 w-10"><div className="h-4 w-4 bg-gray-100 dark:bg-gray-700 rounded" /></td>
                <td className="px-4 py-3.5 w-10"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5" /></td>
                <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-36" />
                        <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-48" />
                    </div>
                </td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-12" /></td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-10" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-14" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-14" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-8" /></td>
            </tr>
        ))}
    </>
);

// ========================
// NOTIFY MODAL
// ========================

const NotifyModal = ({
    studentCount,
    selectedCount,
    mode,
    onClose,
    onSuccess,
    jobId,
    selectedIds,
}: {
    studentCount: number;
    selectedCount: number;
    mode: "all" | "selected";
    onClose: () => void;
    onSuccess: () => void;
    jobId: string;
    selectedIds?: string[];
}) => {
    const { title, body, errors, loading, notifyResult, handleTitleChange, handleBodyChange, handleSubmit, reset } =
        useNotifyStudents(onSuccess);

    const targetCount = mode === "selected" ? selectedCount : studentCount;

    const handleConfirm = async () => {
        handleSubmit(jobId, mode === "selected" ? selectedIds : undefined);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <ModalWrapper
            isOpen={true}
            onClose={handleClose}
            disabled={loading}
            title={mode === "selected" ? "Notify Selected Students" : "Notify All Students"}
            titleIcon={<Bell className="h-5 w-5 text-blue-600" />}
            size="md"
        >
            <div className="space-y-5">
                {/* Result banner */}
                {notifyResult && (
                    <div className="rounded-xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Notification Sent</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-2 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/30">
                                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{notifyResult.notified_count}</p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Notified</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{notifyResult.skipped_count}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Skipped</p>
                            </div>
                        </div>
                    </div>
                )}

                {!notifyResult && (
                    <>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Send a deadline reminder to{" "}
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {targetCount} student{targetCount === 1 ? "" : "s"}
                            </span>
                            {" "}who haven&apos;t applied yet.
                        </p>

                        {/* Consequences */}
                        <div className="rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">This action will:</p>
                            <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-400">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                                    <span>Send a notification to each student&apos;s notification feed</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                                    <span>Students who were already notified will be skipped (no duplicates)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                                    <span>You can send reminders again later with a different message</span>
                                </li>
                            </ul>
                        </div>

                        {/* Title */}
                        <FloatingInput
                            label="Notification Title"
                            name="title"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            error={errors.title}
                            placeholder="e.g. Reminder: Application deadline approaching"
                            maxLength={200}
                            disabled={loading}
                            required
                        />

                        {/* Body */}
                        <FloatingTextarea
                            label="Message Body"
                            name="body"
                            value={body}
                            onChange={(e) => handleBodyChange(e.target.value)}
                            error={errors.body}
                            placeholder="Write a message to remind students about this opportunity..."
                            rows={5}
                            maxLength={2000}
                            disabled={loading}
                            required
                        />
                    </>
                )}

                {/* Footer */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        {notifyResult ? "Close" : "Cancel"}
                    </button>
                    {!notifyResult && (
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send to {targetCount} Student{targetCount === 1 ? "" : "s"}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// MAIN COMPONENT
// ========================

interface EligibleNotAppliedManagerProps {
    jobId: string;
    onRefresh: () => void;
}

const EligibleNotAppliedManager = ({ jobId, onRefresh }: EligibleNotAppliedManagerProps) => {
    const {
        students,
        job,
        criteria,
        eligibleNotAppliedCount,
        totalApplied,
        loading,
        error,
        pagination,
        search,
        deptFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleDeptFilterChange,
        handleSortChange,
        handlePageChange,
        handleLimitChange,
        refresh,
        clearFilters,
    } = useViewEligibleNotApplied(jobId);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [notifyMode, setNotifyMode] = useState<"all" | "selected" | null>(null);

    // Unique departments — prefer criteria from API, fallback to current page
    const departments = useMemo(() => {
        if (criteria?.allowed_departments && criteria.allowed_departments.length > 0) {
            return [...criteria.allowed_departments].sort((a, b) => a.localeCompare(b));
        }
        const depts = new Set<string>();
        students.forEach((s) => {
            if (s.dept_name) depts.add(s.dept_name);
        });
        return Array.from(depts).sort((a, b) => a.localeCompare(b));
    }, [criteria, students]);

    // Wrap page/limit handlers to clear selection
    const wrappedPageChange = useCallback((page: number) => {
        setSelectedIds(new Set());
        handlePageChange(page);
    }, [handlePageChange]);

    const wrappedLimitChange = useCallback((limit: number) => {
        setSelectedIds(new Set());
        handleLimitChange(limit);
    }, [handleLimitChange]);

    const hasFilters = !!(search || deptFilter);
    const startEntry = students.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    // Selection helpers
    const allOnPageSelected = students.length > 0 && students.every((s) => selectedIds.has(s.student_id));
    const someOnPageSelected = students.some((s) => selectedIds.has(s.student_id));

    const toggleSelectAll = useCallback(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allOnPageSelected) {
                students.forEach((s) => next.delete(s.student_id));
            } else {
                students.forEach((s) => next.add(s.student_id));
            }
            return next;
        });
    }, [allOnPageSelected, students]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleDeselectAll = useCallback(() => setSelectedIds(new Set()), []);

    const handleNotifySuccess = useCallback(() => {
        setSelectedIds(new Set());
        refresh();
        onRefresh();
    }, [refresh, onRefresh]);

    // Error state
    if (error && !loading && students.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">Failed to load eligible students</p>
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
                            <UserX className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Eligible Not Applied</h2>
                            {job && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {eligibleNotAppliedCount} student{eligibleNotAppliedCount === 1 ? "" : "s"} haven&apos;t applied yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Notify buttons */}
                    <div className="flex items-center gap-2">
                        {selectedIds.size > 0 && (
                            <button
                                type="button"
                                onClick={() => setNotifyMode("selected")}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                            >
                                <Bell className="h-4 w-4" />
                                Notify Selected ({selectedIds.size})
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setNotifyMode("all")}
                            disabled={eligibleNotAppliedCount === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <Bell className="h-4 w-4" />
                            Notify All
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                {job && (
                    <StatsBar
                        notAppliedCount={eligibleNotAppliedCount}
                        appliedCount={totalApplied}
                        deadline={job.application_deadline}
                    />
                )}
            </div>

            {/* Filters */}
            <div className="px-6 py-3 border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            id="eligible-search"
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            aria-label="Search students by name or email"
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                        />
                    </div>

                    {/* Department filter */}
                    <select
                        id="eligible-dept-filter"
                        value={deptFilter}
                        onChange={(e) => handleDeptFilterChange(e.target.value)}
                        aria-label="Filter by department"
                        className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    {/* Page size */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ml-auto">
                        <span>Show</span>
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
                            <th scope="col" className="px-4 py-3 w-10">
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    disabled={loading || students.length === 0}
                                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition disabled:opacity-30"
                                    aria-label="Select all"
                                >
                                    {(() => {
                                        if (allOnPageSelected) return <CheckSquare className="h-4 w-4 text-blue-600" />;
                                        if (someOnPageSelected) return <Minus className="h-4 w-4 text-blue-400" />;
                                        return <Square className="h-4 w-4" />;
                                    })()}
                                </button>
                            </th>
                            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-10">#</th>
                            <th scope="col" className="px-4 py-3">
                                <SortHeader label="Student" field="student_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th scope="col" className="px-4 py-3">
                                <SortHeader label="Department" field="dept_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th scope="col" className="px-4 py-3">
                                <SortHeader label="CGPA" field="overall_cgpa" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">KTs</th>
                            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">10th %</th>
                            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                                12th / Dip %
                            </th>
                            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Gen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            if (loading) return <SkeletonTable />;
                            if (students.length > 0) {
                                return students.map((student, index) => (
                                    <StudentRow
                                        key={student.student_id}
                                        student={student}
                                        index={(pagination.page - 1) * pagination.limit + index + 1}
                                        isSelected={selectedIds.has(student.student_id)}
                                        onToggle={() => toggleSelect(student.student_id)}
                                    />
                                ));
                            }
                            return (
                                <tr>
                                    <td colSpan={9}>
                                        <EmptyState hasFilters={hasFilters} />
                                    </td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!loading && students.length > 0 && (
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

            {/* Selection bar */}
            {selectedIds.size > 0 && (
                <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t-2 border-blue-100 dark:border-blue-900 px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{selectedIds.size}</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            student{selectedIds.size === 1 ? "" : "s"} selected
                        </span>
                        <button type="button" onClick={handleDeselectAll} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1">
                            <X className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setNotifyMode("selected")}
                            className="ml-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
                        >
                            <Bell className="h-4 w-4" />
                            Notify Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Notify modal */}
            {notifyMode && (
                <NotifyModal
                    studentCount={eligibleNotAppliedCount}
                    selectedCount={selectedIds.size}
                    mode={notifyMode}
                    onClose={() => setNotifyMode(null)}
                    onSuccess={handleNotifySuccess}
                    jobId={jobId}
                    selectedIds={notifyMode === "selected" ? Array.from(selectedIds) : undefined}
                />
            )}
        </div>
    );
};

// ========================
// STUDENT ROW (extracted for readability)
// ========================

const StudentRow = ({
    student,
    index,
    isSelected,
    onToggle,
}: {
    student: EligibleNotAppliedStudent;
    index: number;
    isSelected: boolean;
    onToggle: () => void;
}) => {
    const twelfthOrDiploma = student.twelfth_or_diploma === "diploma"
        ? student.diploma_percentage
        : student.twelfth_percentage;

    return (
        <tr className={`group border-b border-gray-50 dark:border-gray-800 transition-colors ${isSelected ? "bg-blue-50/60 dark:bg-blue-900/20" : "hover:bg-gray-50/60 dark:hover:bg-gray-800/60"}`}>
            {/* Checkbox */}
            <td className="px-4 py-3.5 w-10">
                <button
                    type="button"
                    onClick={onToggle}
                    className="text-gray-400 hover:text-blue-600 transition"
                    aria-label={`Select ${student.student_name}`}
                >
                    {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                        <Square className="h-4 w-4" />
                    )}
                </button>
            </td>

            {/* Row number */}
            <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-sm w-10">{index}</td>

            {/* Student name + email */}
            <td className="px-4 py-3.5">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.student_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{student.student_email}</p>
                </div>
            </td>

            {/* Department (purple pill) */}
            <td className="px-4 py-3.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                    {student.dept_name}
                </span>
            </td>

            {/* CGPA (color-coded) */}
            <td className="px-4 py-3.5">
                <span className={`text-sm font-semibold ${cgpaColor(student.overall_cgpa)}`}>
                    {student.overall_cgpa?.toFixed(2) ?? "—"}
                </span>
            </td>

            {/* KTs (badge) */}
            <td className="px-4 py-3.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ktBadge(student.total_live_kts)}`}>
                    {student.total_live_kts}
                </span>
            </td>

            {/* 10th % */}
            <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                {student.tenth_percentage == null ? "—" : `${student.tenth_percentage}%`}
            </td>

            {/* 12th / Diploma % */}
            <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                {twelfthOrDiploma == null ? "—" : `${twelfthOrDiploma}%`}
            </td>

            {/* Gender */}
            <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                {student.gender?.charAt(0) || "—"}
            </td>
        </tr>
    );
};

export default EligibleNotAppliedManager;
