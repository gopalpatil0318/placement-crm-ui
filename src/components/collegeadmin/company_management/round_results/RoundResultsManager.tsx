import { useState, useCallback, useEffect, useMemo } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    ClipboardList,
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
    Plus,
    Pencil,
    Clock,
    BarChart3,
    UserCheck,
    UserX,
    Calendar,
    Award,
    Users,
    ListChecks,
    Hash,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import { useViewRoundResults } from "@/hooks/collegeadmin/company_management/round_results/useViewRoundResults";
import { useAddRoundResult } from "@/hooks/collegeadmin/company_management/round_results/useAddRoundResult";
import { useBulkAddRoundResults } from "@/hooks/collegeadmin/company_management/round_results/useBulkAddRoundResults";
import { useUpdateRoundResult } from "@/hooks/collegeadmin/company_management/round_results/useUpdateRoundResult";
import { useApplicationPicker, type PickerApplication } from "@/hooks/collegeadmin/company_management/applications/useApplicationPicker";
import {
    RESULT_STATUS_COLORS,
    RESULT_STATUS_LABELS,
    RESULT_STATUS_OPTIONS,
    type ResultStatus,
} from "@/validators/RoundResultSchema";
import {
    type RoundResult,
    type RoundInfo,
    type StatusSummary,
} from "@/hooks/collegeadmin/company_management/round_results/useViewRoundResults";
import { type BulkResultItem, type BulkAddResult } from "@/hooks/collegeadmin/company_management/round_results/useBulkAddRoundResults";

// ========================
// TYPES
// ========================

interface RoundResultsManagerProps {
    roundId: string;
    jobId: string;
    onResultLoaded?: (roundName: string, jobTitle: string) => void;
}

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const STATUS_PILL_ORDER: ResultStatus[] = ["pending", "passed", "failed", "on_hold", "absent"];



const SCORE_THRESHOLDS = {
    high: 80,
    medium: 50,
};

// ========================
// HELPERS
// ========================

const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }) + " IST";
};

const getScoreColor = (score: number | null): string => {
    if (score === null || score === undefined) return "text-gray-400 dark:text-gray-500";
    if (score >= SCORE_THRESHOLDS.high) return "text-emerald-600 dark:text-emerald-400";
    if (score >= SCORE_THRESHOLDS.medium) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
};

const getScoreBg = (score: number | null): string => {
    if (score === null || score === undefined) return "bg-gray-50 dark:bg-gray-800";
    if (score >= SCORE_THRESHOLDS.high) return "bg-emerald-50 dark:bg-emerald-900/20";
    if (score >= SCORE_THRESHOLDS.medium) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-red-50 dark:bg-red-900/20";
};

// ========================
// STATUS BADGE
// ========================

const StatusBadge = ({ status }: { status: ResultStatus }) => {
    const colors = RESULT_STATUS_COLORS[status];
    const label = RESULT_STATUS_LABELS[status];
    if (!colors) return <span className="text-xs text-gray-500">{status}</span>;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {label}
        </span>
    );
};

// ========================
// ATTENDED BADGE
// ========================

const AttendedBadge = ({ attended }: { attended: boolean }) => (
    <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
            attended
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
    >
        {attended ? (
            <UserCheck className="h-3 w-3" />
        ) : (
            <UserX className="h-3 w-3" />
        )}
        {attended ? "Yes" : "No"}
    </span>
);

// ========================
// STATUS PILLS (summary filter bar)
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

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* All pill */}
            <button
                type="button"
                onClick={() => onFilter("")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeFilter
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                        : "bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900"
                }`}
            >
                All
                {" "}
                <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeFilter
                            ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            : "bg-white/20 text-white dark:bg-gray-900/30 dark:text-gray-900"
                    }`}
                >
                    {summary.total}
                </span>
            </button>

            {STATUS_PILL_ORDER.map((key) => {
                const count = summary[key];
                const colors = RESULT_STATUS_COLORS[key];
                const label = RESULT_STATUS_LABELS[key];
                const isActive = activeFilter === key;

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onFilter(isActive ? "" : key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isActive
                                ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current shadow-sm dark:ring-offset-gray-900`
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                    >
                        {label}
                        <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                isActive
                                    ? "bg-white/60 text-current dark:bg-white/20"
                                    : "bg-gray-200/80 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}

            {/* Avg score pill */}
            {summary.avg_score !== null && summary.avg_score !== undefined && (
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-semibold">
                    <BarChart3 className="h-3 w-3" />
                    Avg: {Number(summary.avg_score).toFixed(1)}
                </div>
            )}
        </div>
    );
};

// ========================
// SUMMARY STATS BAR
// ========================

const SummaryStatsBar = ({ summary, loading }: { summary: StatusSummary | null; loading: boolean }) => {
    if (loading) return <SkeletonStats />;
    if (!summary) return null;

    const cards: {
        key: string;
        bg: string;
        border: string;
        iconBg: string;
        iconColor: string;
        value: number | string;
        label: string;
        Icon: React.ComponentType<{ className?: string }>;
    }[] = [
        {
            key: "total",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-100 dark:border-blue-800",
            iconBg: "bg-blue-100 dark:bg-blue-900/40",
            iconColor: "text-blue-600 dark:text-blue-400",
            value: summary.total,
            label: "Total Results",
            Icon: Users,
        },
        {
            key: "passed",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            border: "border-emerald-100 dark:border-emerald-800",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            value: summary.passed,
            label: "Passed",
            Icon: CheckCircle2,
        },
        {
            key: "failed",
            bg: "bg-red-50 dark:bg-red-900/20",
            border: "border-red-100 dark:border-red-800",
            iconBg: "bg-red-100 dark:bg-red-900/40",
            iconColor: "text-red-600 dark:text-red-400",
            value: summary.failed,
            label: "Failed",
            Icon: XCircle,
        },
        {
            key: "pending",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-100 dark:border-amber-800",
            iconBg: "bg-amber-100 dark:bg-amber-900/40",
            iconColor: "text-amber-600 dark:text-amber-400",
            value: summary.pending,
            label: "Pending",
            Icon: Clock,
        },
        {
            key: "avg",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            border: "border-purple-100 dark:border-purple-800",
            iconBg: "bg-purple-100 dark:bg-purple-900/40",
            iconColor: "text-purple-600 dark:text-purple-400",
            value: summary.avg_score === null ? "—" : Number(summary.avg_score).toFixed(1),
            label: "Avg Score",
            Icon: BarChart3,
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cards.map(({ key, bg, border, iconBg, iconColor, value, label, Icon }) => (
                <div key={key} className={`rounded-xl border p-3.5 ${bg} ${border} flex items-center gap-3`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div>
                        <p className={`text-xl font-bold ${iconColor}`}>{value}</p>
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SkeletonStats = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={`stat-skel-${i}`} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3.5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700" />
                <div className="space-y-1.5">
                    <div className="h-5 w-12 bg-gray-100 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-16 bg-gray-50 dark:bg-gray-800 rounded" />
                </div>
            </div>
        ))}
    </div>
);

// ========================
// ROUND INFO HEADER
// ========================

const RoundInfoHeader = ({
    roundInfo,
    loading,
}: {
    roundInfo: RoundInfo | null;
    loading: boolean;
}) => {
    if (loading || !roundInfo) {
        return (
            <div className="flex items-center gap-3 animate-pulse">
                <div className="h-11 w-11 rounded-xl bg-gray-100 dark:bg-gray-700" />
                <div className="space-y-1.5">
                    <div className="h-5 w-48 bg-gray-100 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-32 bg-gray-50 dark:bg-gray-800 rounded" />
                </div>
            </div>
        );
    }

    const roundStatusColors: Record<string, string> = {
        scheduled: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
        in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
        completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
        cancelled: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <ClipboardList className="h-5.5 w-5.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {roundInfo.round_name}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs font-medium">
                            <Hash className="h-3 w-3" />
                            Round {roundInfo.round_number}
                        </span>
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${
                                roundStatusColors[roundInfo.round_status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                        >
                            {roundInfo.round_status.replaceAll("_", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {roundInfo.job_title} · {roundInfo.company_name}
                    </p>
                </div>
            </div>
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
    let sortIcon;
    if (!isActive) {
        sortIcon = <ArrowUpDown className="h-3 w-3 text-gray-300 group-hover:text-gray-400 dark:text-gray-600 dark:group-hover:text-gray-500" />;
    } else if (currentOrder === "asc") {
        sortIcon = <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
    } else {
        sortIcon = <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
    }
    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
            {label}
            {sortIcon}
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
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map((p, idx) =>
                p === "ellipsis" ? (
                    <span key={`ell-${idx}`} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        aria-current={p === page ? "page" : undefined}
                        className={`min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
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
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
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

const EmptyState = ({
    hasFilters,
    roundStatus,
}: {
    hasFilters: boolean;
    roundStatus?: string;
}) =>
    hasFilters ? (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">
                No results match your filters
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search, status, or attended filter.
            </p>
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-7 w-7 text-blue-400 dark:text-blue-500" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">
                No round results yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {roundStatus === "cancelled"
                    ? "This round has been cancelled. No results can be added."
                    : "Add individual results or use bulk entry to record results for multiple students at once."}
            </p>
        </div>
    );

// ========================
// SKELETON TABLE
// ========================

const SkeletonTable = () => (
    <>
        {Array.from({ length: 8 }).map((_, i) => (
            <tr key={`skel-${i}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                <td className="px-4 py-3.5 w-10">
                    <div className="h-4 w-4 bg-gray-100 dark:bg-gray-700 rounded" />
                </td>
                <td className="px-4 py-3.5 w-10">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5" />
                </td>
                <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-36" />
                        <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-48" />
                    </div>
                </td>
                <td className="px-4 py-3.5">
                    <div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-20" />
                </td>
                <td className="px-4 py-3.5">
                    <div className="h-5 bg-gray-50 dark:bg-gray-800 rounded w-14" />
                </td>
                <td className="px-4 py-3.5">
                    <div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-20" />
                </td>
                <td className="px-4 py-3.5">
                    <div className="h-5 bg-gray-50 dark:bg-gray-800 rounded-full w-12" />
                </td>
                <td className="px-4 py-3.5">
                    <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-24" />
                </td>
                <td className="px-4 py-3.5">
                    <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-8" />
                </td>
            </tr>
        ))}
    </>
);

// ========================
// ADD RESULT MODAL
// ========================

const APPLICATION_PICKER_STATUSES = ["shortlisted", "under_review", "selected", "offered"];

const APP_STATUS_COLORS: Record<string, string> = {
    shortlisted: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    under_review: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
    selected: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    offered: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

const ApplicationPickerDropdown = ({
    jobId,
    selectedApp,
    onSelect,
    excludeIds,
    disabled,
    error,
}: {
    jobId: string;
    selectedApp: PickerApplication | null;
    onSelect: (app: PickerApplication | null) => void;
    excludeIds: Set<string>;
    disabled?: boolean;
    error?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { applications, search, setSearch, loading } = useApplicationPicker(
        jobId,
        APPLICATION_PICKER_STATUSES,
        excludeIds,
    );

    // If a student is already selected, show the selected banner
    if (selectedApp) {
        return (
            <div className="space-y-1.5">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300" id="student-label">
                    Student <span className="text-red-500">*</span>
                </span>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                            {selectedApp.student_name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {selectedApp.student_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {selectedApp.enrollment_number} · {selectedApp.dept_name}
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium ${APP_STATUS_COLORS[selectedApp.application_status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {selectedApp.application_status.replaceAll("_", " ")}
                    </span>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => onSelect(null)}
                            className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 transition"
                            aria-label="Change student"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5 relative">
            <label htmlFor="student-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Student <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                    id="student-search"
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search by name or enrollment..."
                    disabled={disabled}
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${
                        error ? "border-red-300 bg-red-50/30 dark:border-red-700 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-600"
                    }`}
                />
            </div>
            {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

            {/* Dropdown */}
            {isOpen && (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default bg-transparent border-none p-0"
                        aria-label="Close dropdown"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-60 overflow-y-auto">
                        {(() => {
                            if (loading) {
                                return (
                                    <div className="px-4 py-6 text-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Loading applications...</p>
                                    </div>
                                );
                            }
                            if (applications.length === 0) {
                                return (
                                    <div className="px-4 py-6 text-center">
                                        <Users className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            {search ? "No students match your search" : "No eligible applications"}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            {search ? "Try a different name or enrollment number" : "Students must be shortlisted or above"}
                                        </p>
                                    </div>
                                );
                            }
                            return applications.map((app) => (
                                <button
                                    key={app.application_id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(app);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                            {app.student_name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                            {app.student_name}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                            {app.enrollment_number} · {app.dept_name}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium flex-shrink-0 ${APP_STATUS_COLORS[app.application_status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                                        {app.application_status.replaceAll("_", " ")}
                                    </span>
                                </button>
                            ));
                        })()}
                    </div>
                </>
            )}
        </div>
    );
};

const AddResultModal = ({
    roundId,
    jobId,
    existingApplicationIds,
    onClose,
    onSuccess,
}: {
    roundId: string;
    jobId: string;
    existingApplicationIds: Set<string>;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleSubmit, reset } =
        useAddRoundResult(roundId, onSuccess);
    const [selectedApp, setSelectedApp] = useState<PickerApplication | null>(null);

    const handleSelectApp = useCallback(
        (app: PickerApplication | null) => {
            setSelectedApp(app);
            // Sync hidden application_id into formData
            const syntheticEvent = {
                target: { name: "application_id", value: app?.application_id || "", type: "text" },
            } as React.ChangeEvent<HTMLInputElement>;
            handleChange(syntheticEvent);
        },
        [handleChange],
    );

    const handleClose = () => {
        reset();
        setSelectedApp(null);
        onClose();
    };

    return (
        <ModalWrapper
            isOpen
            onClose={handleClose}
            disabled={loading}
            title="Add Round Result"
            titleIcon={<Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            size="lg"
        >
            <div className="px-6 py-5 space-y-4">
                {/* Application Picker */}
                <ApplicationPickerDropdown
                    jobId={jobId}
                    selectedApp={selectedApp}
                    onSelect={handleSelectApp}
                    excludeIds={existingApplicationIds}
                    disabled={loading}
                    error={errors.application_id}
                />

                {/* Status + Score row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FloatingSelect
                        label="Status"
                        name="result_status"
                        value={formData.result_status}
                        onChange={handleChange}
                        disabled={loading}
                        options={RESULT_STATUS_OPTIONS.map((s) => ({
                            value: s,
                            label: RESULT_STATUS_LABELS[s],
                        }))}
                    />
                    <div>
                        <label htmlFor="add-score" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Score
                        </label>
                        <input
                            id="add-score"
                            type="number"
                            name="score"
                            value={formData.score}
                            onChange={handleChange}
                            placeholder="0–100000"
                            min={0}
                            max={100000}
                            step="0.01"
                            inputMode="decimal"
                            disabled={loading}
                            className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${
                                errors.score
                                    ? "border-red-300 bg-red-50/30 dark:border-red-700 dark:bg-red-900/10"
                                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                        />
                        {errors.score && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.score}</p>
                        )}
                    </div>
                </div>

                {/* Attended */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        name="attended"
                        checked={formData.attended}
                        onChange={handleChange}
                        disabled={loading}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Student attended this round
                    </span>
                </label>

                {/* Remarks */}
                <FloatingTextarea
                    label="Remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Notes about the student's performance..."
                    rows={3}
                    maxLength={2000}
                    disabled={loading}
                />

                {/* Schedule dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="add-scheduled-at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Scheduled At
                        </label>
                        <input
                            id="add-scheduled-at"
                            type="datetime-local"
                            name="scheduled_at"
                            value={formData.scheduled_at}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 hover:border-gray-400 dark:hover:border-gray-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="add-completed-at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Completed At
                        </label>
                        <input
                            id="add-completed-at"
                            type="datetime-local"
                            name="completed_at"
                            value={formData.completed_at}
                            onChange={handleChange}
                            disabled={loading}
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${
                                errors.completed_at
                                    ? "border-red-300 bg-red-50/30 dark:border-red-700 dark:bg-red-900/10"
                                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                        />
                        {errors.completed_at && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                {errors.completed_at}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
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
                        onClick={handleSubmit}
                        disabled={loading || !selectedApp}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Adding..." : "Add Result"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// EDIT RESULT MODAL
// ========================

const EditResultModal = ({
    result,
    roundId,
    onClose,
    onSuccess,
}: {
    result: RoundResult;
    roundId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleSubmit, loadResult, reset } =
        useUpdateRoundResult(roundId, onSuccess);

    useEffect(() => {
        loadResult(result);
    }, [result, loadResult]);

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <ModalWrapper
            isOpen
            onClose={handleClose}
            disabled={loading}
            title="Edit Round Result"
            titleIcon={<Pencil className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            size="lg"
        >
            <div className="px-6 py-5 space-y-4">
                {/* Student info banner */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                            {result.student_name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {result.student_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {result.enrollment_number} · {result.dept_name}
                        </p>
                    </div>
                </div>

                {/* Status + Score row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FloatingSelect
                        label="Status"
                        name="result_status"
                        value={formData.result_status}
                        onChange={handleChange}
                        disabled={loading}
                        options={RESULT_STATUS_OPTIONS.map((s) => ({
                            value: s,
                            label: RESULT_STATUS_LABELS[s],
                        }))}
                    />
                    <div>
                        <label htmlFor="edit-score" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Score
                        </label>
                        <input
                            id="edit-score"
                            type="number"
                            name="score"
                            value={formData.score}
                            onChange={handleChange}
                            placeholder="(clear to remove)"
                            min={0}
                            max={100000}
                            step="0.01"
                            inputMode="decimal"
                            disabled={loading}
                            className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${
                                errors.score
                                    ? "border-red-300 bg-red-50/30 dark:border-red-700 dark:bg-red-900/10"
                                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                        />
                        {errors.score && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.score}</p>
                        )}
                    </div>
                </div>

                {/* Attended */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        name="attended"
                        checked={formData.attended}
                        onChange={handleChange}
                        disabled={loading}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Student attended this round
                    </span>
                </label>

                {/* Remarks */}
                <FloatingTextarea
                    label="Remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Notes about performance..."
                    rows={3}
                    maxLength={2000}
                    disabled={loading}
                />

                {/* Schedule dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="edit-scheduled-at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Scheduled At
                        </label>
                        <input
                            id="edit-scheduled-at"
                            type="datetime-local"
                            name="scheduled_at"
                            value={formData.scheduled_at}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 hover:border-gray-400 dark:hover:border-gray-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-completed-at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Completed At
                        </label>
                        <input
                            id="edit-completed-at"
                            type="datetime-local"
                            name="completed_at"
                            value={formData.completed_at}
                            onChange={handleChange}
                            disabled={loading}
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${
                                errors.completed_at
                                    ? "border-red-300 bg-red-50/30 dark:border-red-700 dark:bg-red-900/10"
                                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                        />
                        {errors.completed_at && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                {errors.completed_at}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
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
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// BULK ENTRY PANEL (two-step: select students → fill results)
// ========================

interface BulkEntryRow {
    application_id: string;
    student_name: string;
    dept_name: string;
    enrollment_number: string;
    result_status: string;
    score: string;
    attended: boolean;
    remarks: string;
    scheduled_at: string;
    completed_at: string;
}

const BulkEntryPanel = ({
    roundId,
    jobId,
    existingApplicationIds,
    onClose,
    onSuccess,
}: {
    roundId: string;
    jobId: string;
    existingApplicationIds: Set<string>;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { loading, bulkResult, handleSubmit, resetResult } = useBulkAddRoundResults(roundId, onSuccess);
    const { applications, search, setSearch, loading: pickerLoading } = useApplicationPicker(
        jobId,
        APPLICATION_PICKER_STATUSES,
        existingApplicationIds,
    );

    const [step, setStep] = useState<"select" | "fill">("select");
    const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
    const [rows, setRows] = useState<BulkEntryRow[]>([]);

    // Toggle individual selection
    const toggleApp = useCallback((appId: string) => {
        setSelectedApps((prev) => {
            const next = new Set(prev);
            if (next.has(appId)) next.delete(appId);
            else next.add(appId);
            return next;
        });
    }, []);

    // Select all / deselect all
    const toggleSelectAll = useCallback(() => {
        setSelectedApps((prev) => {
            if (prev.size === applications.length) return new Set();
            return new Set(applications.map((a) => a.application_id));
        });
    }, [applications]);

    // Move from Step A → Step B
    const proceedToFill = useCallback(() => {
        const selected = applications.filter((a) => selectedApps.has(a.application_id));
        setRows(
            selected.map((a) => ({
                application_id: a.application_id,
                student_name: a.student_name,
                dept_name: a.dept_name,
                enrollment_number: a.enrollment_number,
                result_status: "pending",
                score: "",
                attended: true,
                remarks: "",
                scheduled_at: "",
                completed_at: "",
            })),
        );
        setStep("fill");
    }, [applications, selectedApps]);

    const updateRow = useCallback(
        (index: number, field: keyof BulkEntryRow, value: string | boolean) => {
            setRows((prev) =>
                prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
            );
        },
        [],
    );

    const removeRow = useCallback((index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // Apply same status to all rows
    const applyStatusToAll = useCallback((status: string) => {
        setRows((prev) => prev.map((r) => ({ ...r, result_status: status })));
    }, []);

    // Apply same attended to all rows
    const applyAttendedToAll = useCallback((attended: boolean) => {
        setRows((prev) => prev.map((r) => ({ ...r, attended })));
    }, []);

    const handleBulkSubmit = useCallback(() => {
        if (rows.length === 0) return;

        const items: BulkResultItem[] = rows.map((r) => ({
            application_id: r.application_id,
            result_status: r.result_status || undefined,
            score: r.score === "" ? undefined : Number(r.score),
            attended: r.attended,
            remarks: r.remarks?.trim() || undefined,
            scheduled_at: r.scheduled_at || undefined,
            completed_at: r.completed_at || undefined,
        }));

        handleSubmit(items);
    }, [rows, handleSubmit]);

    const handleCloseResult = () => {
        resetResult();
        onClose();
    };

    return (
        <>
            <ModalWrapper
                isOpen
                onClose={onClose}
                disabled={loading}
                title={step === "select" ? "Bulk Entry — Select Students" : "Bulk Entry — Set Results"}
                titleIcon={<ListChecks className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                size="4xl"
            >
                <div className="px-6 py-5">
                {step === "select" ? (
                    /* ────────── STEP A: Select Students ────────── */
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Select the students you want to add results for. Students who already have results in this round are excluded.
                        </p>

                        {/* Search */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or enrollment..."
                                aria-label="Search students by name or enrollment number"
                                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                            />
                        </div>

                        {/* Select all + count */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                disabled={applications.length === 0}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition disabled:opacity-50"
                            >
                                {selectedApps.size === applications.length && applications.length > 0 ? (
                                    <><CheckSquare className="h-3.5 w-3.5" /> Deselect all</>
                                ) : (
                                    <><Square className="h-3.5 w-3.5" /> Select all</>
                                )}
                            </button>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {selectedApps.size} of {applications.length} selected
                            </span>
                        </div>

                        {/* Student list */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                            {(() => {
                                if (pickerLoading) {
                                    return (
                                        <div className="px-4 py-10 text-center">
                                            <Loader2 className="h-5 w-5 animate-spin text-purple-500 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Loading eligible applications...</p>
                                        </div>
                                    );
                                }
                                if (applications.length === 0) {
                                    return (
                                        <div className="px-4 py-10 text-center">
                                            <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                {search ? "No students match your search" : "No eligible applications found"}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                {search
                                                    ? "Try a different name or enrollment number"
                                                    : "All applications already have results for this round"}
                                            </p>
                                        </div>
                                    );
                                }
                                return applications.map((app) => {
                                    const isChecked = selectedApps.has(app.application_id);
                                    return (
                                        <button
                                            key={app.application_id}
                                            type="button"
                                            onClick={() => toggleApp(app.application_id)}
                                            className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors ${
                                                isChecked ? "bg-purple-50/60 dark:bg-purple-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            }`}
                                        >
                                            <span className="flex-shrink-0">
                                                {isChecked ? (
                                                    <CheckSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                ) : (
                                                    <Square className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                                )}
                                            </span>
                                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                                    {app.student_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                    {app.student_name}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                    {app.enrollment_number} · {app.dept_name}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium flex-shrink-0 ${APP_STATUS_COLORS[app.application_status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                                                {app.application_status.replaceAll("_", " ")}
                                            </span>
                                        </button>
                                    );
                                })
                            })()}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={proceedToFill}
                                disabled={selectedApps.size === 0}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                            >
                                Continue with {selectedApps.size} Student{selectedApps.size === 1 ? "" : "s"}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ────────── STEP B: Fill Results ────────── */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setStep("select")}
                                disabled={loading}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Back to selection
                            </button>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {rows.length} student{rows.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        {/* Quick apply controls */}
                        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Apply to all:</span>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) applyStatusToAll(e.target.value);
                                }}
                                className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
                                defaultValue=""
                            >
                                <option value="" disabled>Set status...</option>
                                {RESULT_STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{RESULT_STATUS_LABELS[s]}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => applyAttendedToAll(true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
                            >
                                <UserCheck className="h-3 w-3" />
                                All Attended
                            </button>
                            <button
                                type="button"
                                onClick={() => applyAttendedToAll(false)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            >
                                <UserX className="h-3 w-3" />
                                None Attended
                            </button>
                            <div className="flex items-center gap-1.5">
                                <label htmlFor="bulk-scheduled" className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Scheduled:</label>
                                <input
                                    id="bulk-scheduled"
                                    type="datetime-local"
                                    onChange={(e) => {
                                        if (e.target.value) setRows((prev) => prev.map((r) => ({ ...r, scheduled_at: e.target.value })));
                                    }}
                                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <label htmlFor="bulk-completed" className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Completed:</label>
                                <input
                                    id="bulk-completed"
                                    type="datetime-local"
                                    onChange={(e) => {
                                        if (e.target.value) setRows((prev) => prev.map((r) => ({ ...r, completed_at: e.target.value })));
                                    }}
                                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Results entry table — bulk grid stays raw */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-left text-gray-500 dark:text-gray-400">
                                            <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider w-10">
                                                #
                                            </th>
                                            <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider min-w-[200px]">
                                                Student
                                            </th>
                                            <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider min-w-[140px]">
                                                Status
                                            </th>
                                            <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider min-w-[100px]">
                                                Score
                                            </th>
                                            <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-center w-20">
                                                Attended
                                            </th>
                                            <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider min-w-[160px]">
                                                Remarks
                                            </th>
                                            <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider min-w-[180px]">
                                                Scheduled At
                                            </th>
                                            <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider min-w-[180px]">
                                                Completed At
                                            </th>
                                            <th scope="col" className="px-3 py-2.5 w-10" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, idx) => (
                                            <tr
                                                key={row.application_id}
                                                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                            >
                                                <td className="px-3 py-2.5 text-gray-400 dark:text-gray-500 text-xs font-medium">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                            {row.student_name}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            {row.enrollment_number} · {row.dept_name}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <select
                                                        value={row.result_status}
                                                        onChange={(e) =>
                                                            updateRow(idx, "result_status", e.target.value)
                                                        }
                                                        disabled={loading}
                                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
                                                    >
                                                        {RESULT_STATUS_OPTIONS.map((s) => (
                                                            <option key={s} value={s}>
                                                                {RESULT_STATUS_LABELS[s]}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <input
                                                        type="number"
                                                        value={row.score}
                                                        onChange={(e) =>
                                                            updateRow(idx, "score", e.target.value)
                                                        }
                                                        placeholder="—"
                                                        min={0}
                                                        max={100000}
                                                        step="0.01"
                                                        inputMode="decimal"
                                                        disabled={loading}
                                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                                                    />
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={row.attended}
                                                        onChange={(e) =>
                                                            updateRow(idx, "attended", e.target.checked)
                                                        }
                                                        disabled={loading}
                                                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <input
                                                        type="text"
                                                        value={row.remarks}
                                                        onChange={(e) =>
                                                            updateRow(idx, "remarks", e.target.value)
                                                        }
                                                        placeholder="Optional"
                                                        disabled={loading}
                                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                                                    />
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <input
                                                        type="datetime-local"
                                                        value={row.scheduled_at}
                                                        onChange={(e) =>
                                                            updateRow(idx, "scheduled_at", e.target.value)
                                                        }
                                                        disabled={loading}
                                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                                                    />
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <input
                                                        type="datetime-local"
                                                        value={row.completed_at}
                                                        onChange={(e) =>
                                                            updateRow(idx, "completed_at", e.target.value)
                                                        }
                                                        disabled={loading}
                                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                                                    />
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRow(idx)}
                                                        disabled={loading}
                                                        className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition disabled:opacity-50"
                                                        aria-label="Remove row"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {rows.length === 0 && (
                            <div className="text-center py-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400">All students removed. Go back to select more.</p>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkSubmit}
                                disabled={loading || rows.length === 0}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                            >{(() => {
                                const suffix = rows.length === 1 ? "" : "s";
                                const label = loading ? "Submitting..." : `Submit ${rows.length} Result${suffix}`;
                                return (
                                    <>
                                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {label}
                                    </>
                                );
                            })()}
                            </button>
                        </div>
                    </div>
                )}
                </div>
            </ModalWrapper>

            {/* Bulk result modal */}
            {bulkResult && (
                <BulkResultModal result={bulkResult} onClose={handleCloseResult} />
            )}
        </>
    );
};

// ========================
// BULK RESULT MODAL
// ========================

const BulkResultModal = ({
    result,
    onClose,
}: {
    result: BulkAddResult;
    onClose: () => void;
}) => (
    <ModalWrapper
        isOpen
        onClose={onClose}
        title="Bulk Add Results"
        titleIcon={<ListChecks className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        size="md"
    >
        <div className="px-6 py-5 space-y-5">
            {/* Summary counts */}
            <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                        {result.summary.created}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Created</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                    <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                        {result.summary.skipped}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">Skipped</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {result.summary.errors}
                    </p>
                    <p className="text-xs text-red-500 dark:text-red-400 font-medium">Errors</p>
                </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
                Round: <span className="font-medium text-gray-800 dark:text-gray-200">{result.round_name}</span>{" "}
                · {result.job_title}
            </p>

            {/* Created list */}
            {result.created.length > 0 && (
                <div className="rounded-xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            Created ({result.created.length})
                        </p>
                    </div>
                    <div className="divide-y divide-emerald-100 dark:divide-emerald-800 max-h-40 overflow-y-auto">
                        {result.created.map((c) => (
                            <div key={c.result_id} className="px-4 py-2.5 flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.student_name}</p>
                                <StatusBadge status={c.result_status as ResultStatus} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skipped list */}
            {result.skipped.length > 0 && (
                <div className="rounded-xl border border-amber-100 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-amber-100 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                            Skipped ({result.skipped.length})
                        </p>
                    </div>
                    <div className="divide-y divide-amber-100 dark:divide-amber-800 max-h-40 overflow-y-auto">
                        {result.skipped.map((s) => (
                            <div key={s.application_id} className="px-4 py-2.5">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.student_name}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{s.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Errors list */}
            {result.errors.length > 0 && (
                <div className="rounded-xl border border-red-100 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                            Errors ({result.errors.length})
                        </p>
                    </div>
                    <div className="divide-y divide-red-100 dark:divide-red-800 max-h-40 overflow-y-auto">
                        {result.errors.map((e, i) => (
                            <div key={`err-${i}`} className="px-4 py-2.5">
                                <p className="text-sm text-red-600 dark:text-red-400">{e.error}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
                Close
            </button>
        </div>
    </ModalWrapper>
);

// ========================
// RESULT DETAIL PANEL (expandable row)
// ========================

const ResultDetailPanel = ({ result }: { result: RoundResult }) => (
    <tr className="bg-gray-50/50 dark:bg-gray-800/50">
        <td colSpan={9} className="px-4 py-0">
            <div className="py-4 pl-6 border-l-2 border-blue-200 dark:border-blue-800 ml-4 space-y-4">
                {/* Student info */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                            {result.student_name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {result.student_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {result.enrollment_number} · {result.dept_name} · {result.student_email}
                        </p>
                    </div>
                </div>

                {/* Result details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Status
                        </p>
                        <StatusBadge status={result.result_status} />
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Score
                        </p>
                        {result.score !== null && result.score !== undefined ? (
                            <p className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                                {result.score}
                            </p>
                        ) : (
                            <p className="text-lg font-bold text-gray-300 dark:text-gray-600">—</p>
                        )}
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Attended
                        </p>
                        <AttendedBadge attended={result.attended} />
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Recorded
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {formatDate(result.created_at)}
                        </p>
                    </div>
                </div>

                {/* Schedule/Completion times */}
                {(result.scheduled_at || result.completed_at) && (
                    <div className="flex flex-wrap gap-4">
                        {result.scheduled_at && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Scheduled:</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {formatDateTime(result.scheduled_at)}
                                </span>
                            </div>
                        )}
                        {result.completed_at && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed:</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {formatDateTime(result.completed_at)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Remarks */}
                {result.remarks && (
                    <div className="rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 p-4">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5" />
                            Remarks
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {result.remarks}
                        </p>
                    </div>
                )}
            </div>
        </td>
    </tr>
);

// ========================
// RESULT ROW (extracted component)
// ========================

const ResultRow = ({
    result,
    index,
    isSelected,
    isExpanded,
    isCancelled,
    onToggleSelect,
    onToggleExpand,
    onEdit,
}: {
    result: RoundResult;
    index: number;
    isSelected: boolean;
    isExpanded: boolean;
    isCancelled: boolean;
    onToggleSelect: (id: string) => void;
    onToggleExpand: (id: string) => void;
    onEdit: (result: RoundResult) => void;
}) => {
    let rowBg;
    if (isSelected) {
        rowBg = "bg-blue-50/60 dark:bg-blue-900/20";
    } else if (isExpanded) {
        rowBg = "bg-gray-50/50 dark:bg-gray-800/50";
    } else {
        rowBg = "hover:bg-blue-50/40 dark:hover:bg-blue-900/10";
    }
    return (
    <>
        <tr
            className={`group border-b border-gray-50 dark:border-gray-800 transition-colors cursor-pointer ${rowBg}`}
            onClick={() => onToggleExpand(result.result_id)}
        >
            {/* Checkbox */}
            <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    onClick={() => onToggleSelect(result.result_id)}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    aria-label={`Select ${result.student_name}`}
                >
                    {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                        <Square className="h-4 w-4" />
                    )}
                </button>
            </td>

            {/* Row number */}
            <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-sm w-10">{index}</td>

            {/* Student + email + dept */}
            <td className="px-4 py-3.5">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {result.student_name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {result.student_email}
                    </p>
                </div>
            </td>

            {/* Department */}
            <td className="px-4 py-3.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {result.dept_name}
                </span>
            </td>

            {/* Score */}
            <td className="px-4 py-3.5">
                {result.score !== null && result.score !== undefined ? (
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${getScoreColor(result.score)} ${getScoreBg(result.score)}`}
                    >
                        {result.score}
                    </span>
                ) : (
                    <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                )}
            </td>

            {/* Status */}
            <td className="px-4 py-3.5">
                <StatusBadge status={result.result_status} />
            </td>

            {/* Attended */}
            <td className="px-4 py-3.5">
                <AttendedBadge attended={result.attended} />
            </td>

            {/* Date */}
            <td className="px-4 py-3.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(result.created_at)}
                </span>
            </td>

            {/* Actions + expand */}
            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                    {!isCancelled && (
                        <button
                            type="button"
                            onClick={() => onEdit(result)}
                            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                            aria-label={`Edit ${result.student_name}`}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onToggleExpand(result.result_id)}
                        className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition"
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </td>
        </tr>

        {/* Expanded detail panel */}
        {isExpanded && <ResultDetailPanel result={result} />}
    </>
);
};

// ========================
// MAIN COMPONENT
// ========================

const RoundResultsManager = ({
    roundId,
    jobId,
    onResultLoaded,
}: RoundResultsManagerProps) => {
    const {
        results,
        roundInfo,
        statusSummary,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        attendedFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleStatusFilterChange,
        handleAttendedFilterChange,
        handleSortChange,
        handlePageChange,
        handleLimitChange,
        refresh,
        clearFilters,
    } = useViewRoundResults(roundId);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedId, setExpandedId] = useState<string | null>(null);
    // Derive effective expanded ID: auto-clear when result no longer exists
    const effectiveExpandedId = expandedId && results.some(r => r.result_id === expandedId) ? expandedId : null;
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingResult, setEditingResult] = useState<RoundResult | null>(null);
    const [showBulkEntry, setShowBulkEntry] = useState(false);

    // Build set of application IDs that already have results (to exclude from picker)
    const existingApplicationIds = useMemo(
        () => new Set(results.map((r) => r.application_id)),
        [results],
    );

    // Notify parent of loaded round info
    useEffect(() => {
        if (roundInfo && onResultLoaded) {
            onResultLoaded(roundInfo.round_name, roundInfo.job_title);
        }
    }, [roundInfo, onResultLoaded]);

    // Clear selection on page/filter changes
    const wrappedPageChange = useCallback(
        (page: number) => {
            setSelectedIds(new Set());
            handlePageChange(page);
        },
        [handlePageChange],
    );

    const wrappedLimitChange = useCallback(
        (limit: number) => {
            setSelectedIds(new Set());
            handleLimitChange(limit);
        },
        [handleLimitChange],
    );

    const wrappedStatusFilterChange = useCallback(
        (status: string) => {
            setSelectedIds(new Set());
            handleStatusFilterChange(status);
        },
        [handleStatusFilterChange],
    );

    const wrappedAttendedFilterChange = useCallback(
        (attended: string) => {
            setSelectedIds(new Set());
            handleAttendedFilterChange(attended);
        },
        [handleAttendedFilterChange],
    );

    // Selection
    const allSelected =
        results.length > 0 && results.every((r) => selectedIds.has(r.result_id));
    const someSelected = results.some((r) => selectedIds.has(r.result_id));

    const toggleSelectAll = useCallback(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelected) {
                results.forEach((r) => next.delete(r.result_id));
            } else {
                results.forEach((r) => next.add(r.result_id));
            }
            return next;
        });
    }, [allSelected, results]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleExpand = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleEditResult = useCallback((result: RoundResult) => {
        setEditingResult(result);
    }, []);

    const handleSuccess = useCallback(() => {
        setShowAddModal(false);
        setEditingResult(null);
        setShowBulkEntry(false);
        refresh();
    }, [refresh]);

    const isCancelled = roundInfo?.round_status === "cancelled";
    const hasFilters = !!(search || statusFilter || attendedFilter);
    const startEntry =
        results.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(
        pagination.page * pagination.limit,
        pagination.total,
    );

    // Error state
    if (error && !loading && results.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">
                    Failed to load round results
                </p>
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
        <div className="space-y-6">
            {/* Top: Round info + action buttons */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="px-6 pt-5 pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                        <RoundInfoHeader roundInfo={roundInfo} loading={loading} />

                        {/* Action buttons */}
                        {!isCancelled && !loading && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowBulkEntry(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
                                >
                                    <ListChecks className="h-4 w-4" />
                                    Bulk Entry
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Result
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Cancelled banner */}
                    {isCancelled && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 mb-5">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    Round Cancelled
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    This round has been cancelled. Results cannot be added or modified.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stats bar */}
                    <SummaryStatsBar summary={statusSummary} loading={loading} />
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                {/* Status pills + filter bar */}
                <div className="px-6 pt-5 pb-3">
                    <StatusPills
                        summary={statusSummary}
                        activeFilter={statusFilter}
                        onFilter={wrappedStatusFilterChange}
                    />
                </div>

                <div className="px-6 py-3 border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                            />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                aria-label="Search round results by student name or email"
                                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                            />
                        </div>
                        {/* Attended filter */}
                        <select
                            value={attendedFilter}
                            onChange={(e) =>
                                wrappedAttendedFilterChange(e.target.value)
                            }
                            className="border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-colors appearance-none [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
                        >
                            <option value="">All Attendance</option>
                            <option value="true">Attended</option>
                            <option value="false">Not Attended</option>
                        </select>

                        {/* Page size */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ml-auto">
                            {"Show "}
                            <select
                                value={pagination.limit}
                                onChange={(e) =>
                                    wrappedLimitChange(Number(e.target.value))
                                }
                                className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
                            >
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear filters */}
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition whitespace-nowrap"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Table (desktop) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 dark:bg-gray-800/70 text-left text-gray-500 dark:text-gray-400">
                                <th scope="col" className="px-4 py-3 w-10">
                                    <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        disabled={loading || results.length === 0}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition disabled:opacity-30"
                                        aria-label="Select all"
                                    >{(() => {
                                        if (allSelected) return <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
                                        if (someSelected) return <Minus className="h-4 w-4 text-blue-400" />;
                                        return <Square className="h-4 w-4" />;
                                    })()}
                                    </button>
                                </th>
                                <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-10">
                                    #
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    <SortHeader
                                        label="Student"
                                        field="student_name"
                                        currentSort={sortBy}
                                        currentOrder={sortOrder}
                                        onSort={handleSortChange}
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                                    Dept
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    <SortHeader
                                        label="Score"
                                        field="score"
                                        currentSort={sortBy}
                                        currentOrder={sortOrder}
                                        onSort={handleSortChange}
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    <SortHeader
                                        label="Status"
                                        field="result_status"
                                        currentSort={sortBy}
                                        currentOrder={sortOrder}
                                        onSort={handleSortChange}
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                                    Attended
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    <SortHeader
                                        label="Date"
                                        field="created_at"
                                        currentSort={sortBy}
                                        currentOrder={sortOrder}
                                        onSort={handleSortChange}
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                if (loading) return <SkeletonTable />;
                                if (results.length > 0) {
                                    return results.map((result, index) => (
                                        <ResultRow
                                            key={result.result_id}
                                            result={result}
                                            index={
                                                (pagination.page - 1) * pagination.limit +
                                                index +
                                                1
                                            }
                                            isSelected={selectedIds.has(result.result_id)}
                                            isExpanded={effectiveExpandedId === result.result_id}
                                            isCancelled={!!isCancelled}
                                            onToggleSelect={toggleSelect}
                                            onToggleExpand={toggleExpand}
                                            onEdit={handleEditResult}
                                        />
                                    ));
                                }
                                return (
                                    <tr>
                                        <td colSpan={9}>
                                            <EmptyState
                                                hasFilters={hasFilters}
                                            roundStatus={roundInfo?.round_status}
                                        />
                                    </td>
                                </tr>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {(() => {
                        if (loading) {
                            return Array.from({ length: 5 }).map((_, i) => (
                                <div key={`card-skel-${i}`} className="p-4 space-y-3 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                                <div className="flex gap-2">
                                    <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-16" />
                                    <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-12" />
                                </div>
                            </div>
                        ));
                        }
                        if (results.length > 0) {
                            return results.map((result, index) => (
                            <div
                                key={result.result_id}
                                className="p-4 space-y-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            <span className="text-gray-400 dark:text-gray-500 mr-1.5">
                                                {(pagination.page - 1) * pagination.limit + index + 1}.
                                            </span>
                                            {result.student_name}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                            {result.student_email}
                                        </p>
                                    </div>
                                    <StatusBadge status={result.result_status} />
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                        {result.dept_name}
                                    </span>
                                    {result.score !== null && result.score !== undefined && (
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getScoreColor(result.score)} ${getScoreBg(result.score)}`}
                                        >
                                            Score: {result.score}
                                        </span>
                                    )}
                                    <AttendedBadge attended={result.attended} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {formatDate(result.created_at)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {!isCancelled && (
                                            <button
                                                type="button"
                                                onClick={() => handleEditResult(result)}
                                                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                                                aria-label={`Edit ${result.student_name}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ));
                        }
                        return (
                            <EmptyState
                                hasFilters={hasFilters}
                                roundStatus={roundInfo?.round_status}
                            />
                        );
                    })()}
                </div>

                {/* Pagination footer */}
                {!loading && results.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {startEntry}–{endEntry}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {pagination.total}
                            </span>{" "}
                            results
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

                {/* Selection info bar */}
                {selectedIds.size > 0 && (
                    <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t-2 border-blue-100 dark:border-blue-800 px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                                        {selectedIds.size}
                                    </span>
                                </div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    result{selectedIds.size === 1 ? "" : "s"} selected
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedIds(new Set())}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1"
                                    aria-label="Deselect all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                                Use bulk entry to manage multiple results at once
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add result modal */}
            {showAddModal && (
                <AddResultModal
                    roundId={roundId}
                    jobId={jobId}
                    existingApplicationIds={existingApplicationIds}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {/* Edit result modal */}
            {editingResult && (
                <EditResultModal
                    result={editingResult}
                    roundId={roundId}
                    onClose={() => setEditingResult(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {/* Bulk entry panel */}
            {showBulkEntry && (
                <BulkEntryPanel
                    roundId={roundId}
                    jobId={jobId}
                    existingApplicationIds={existingApplicationIds}
                    onClose={() => setShowBulkEntry(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default RoundResultsManager;
