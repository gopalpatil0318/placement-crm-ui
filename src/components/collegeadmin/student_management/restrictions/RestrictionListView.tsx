import { useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import {
    Search, ShieldAlert, ShieldCheck, Filter, ArrowUpDown, ArrowUp, ArrowDown,
    ChevronLeft, ChevronRight, Calendar,
} from "lucide-react";
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList";
import { useViewRestrictions } from "@/hooks/collegeadmin/student_management/restrictions/useViewRestrictions";
import {
    RESTRICTION_TYPE_OPTIONS,
    RESTRICTION_TYPE_LABELS,
    RESTRICTION_TYPE_COLORS,
    BLOCKING_TYPES,
    RESTRICTION_STATUS_TABS,
    RESTRICTION_STATUS_LABELS,
    RESTRICTION_SORT_OPTIONS,
    type CollegeRestrictionListItem,
    type RestrictionType,
    type RestrictionSortField,
} from "@/validators/RestrictionSchema";
import AddRestrictionModal from "./AddRestrictionModal";
import RestrictionDetailModal from "./RestrictionDetailModal";

// ========================
// HELPERS
// ========================

const currentYear = new Date().getFullYear();
const PASSOUT_YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const PAGE_SIZE_OPTIONS = [10, 20, 50];

function formatDate(d: string | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getDaysLeft(validUntil: string | null): { text: string; color: string } | null {
    if (!validUntil) return null;
    const diff = new Date(validUntil).getTime() - Date.now();
    if (diff <= 0) return { text: "Expired", color: "text-red-600 dark:text-red-400" };
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 7) return { text: `${days}d left`, color: "text-amber-600 dark:text-amber-400" };
    return { text: `${days}d left`, color: "text-emerald-600 dark:text-emerald-400" };
}

// ========================
// SUB-COMPONENTS
// ========================

function SortHeader({
    label,
    field,
    currentSort,
    currentOrder,
    onSort,
}: {
    label: string;
    field: RestrictionSortField;
    currentSort: string;
    currentOrder: string;
    onSort: (field: RestrictionSortField) => void;
}) {
    const isActive = currentSort === field;
    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
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
}

function TableSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="space-y-3 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ========================
// MAIN COMPONENT
// ========================

export default function RestrictionListView() {
    const shouldReduce = useReducedMotion();

    const {
        restrictions, loading, error, pagination,
        search, passoutYear, statusFilter, typeFilter, sortBy, sortOrder,
        handleSearchChange, handlePageChange, handleLimitChange,
        handlePassoutYearChange, handleStatusFilterChange,
        handleTypeFilterChange, handleSortFieldChange, handleSortOrderToggle,
        refresh,
    } = useViewRestrictions();

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRestriction, setSelectedRestriction] = useState<CollegeRestrictionListItem | null>(null);

    const handleRowClick = useCallback((restriction: CollegeRestrictionListItem) => {
        setSelectedRestriction(restriction);
    }, []);

    const handleAddSuccess = useCallback(() => {
        setShowAddModal(false);
        refresh();
    }, [refresh]);

    const handleDetailClose = useCallback(() => {
        setSelectedRestriction(null);
        refresh();
    }, [refresh]);

    const handleColumnSort = useCallback((field: RestrictionSortField) => {
        if (sortBy === field) {
            handleSortOrderToggle();
        } else {
            handleSortFieldChange(field);
        }
    }, [sortBy, handleSortFieldChange, handleSortOrderToggle]);

    // Pagination helpers
    const totalPages = pagination.totalPages;
    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (pagination.page > 3) pages.push("...");
            for (let i = Math.max(2, pagination.page - 1); i <= Math.min(totalPages - 1, pagination.page + 1); i++) {
                pages.push(i);
            }
            if (pagination.page < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    const showStart = (pagination.page - 1) * pagination.limit + 1;
    const showEnd = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Restrictions</h2>
                                {!loading && pagination.total > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 tabular-nums">
                                        {pagination.total}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage student placement restrictions</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition shadow-sm cursor-pointer"
                    >
                        <ShieldAlert className="h-4 w-4" />
                        Add Restriction
                    </button>
                </div>

                {/* Passout Year Selector */}
                <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Passout Year:</span>
                        <div className="flex gap-1.5">
                            {PASSOUT_YEARS.map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => handlePassoutYearChange(year)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        passoutYear === year
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
                                    }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="px-6 border-b border-gray-100 dark:border-gray-800">
                    <nav className="flex gap-1 -mb-px" aria-label="Status tabs">
                        {RESTRICTION_STATUS_TABS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => handleStatusFilterChange(tab)}
                                className={`relative px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                                    statusFilter === tab
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                            >
                                {RESTRICTION_STATUS_LABELS[tab]}
                                {statusFilter === tab && (
                                    shouldReduce ? (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                    ) : (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full transition-all" />
                                    )
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Filter Bar */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center gap-1.5">
                        <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <select
                            value={typeFilter}
                            onChange={(e) => handleTypeFilterChange(e.target.value as RestrictionType | "")}
                            className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
                        >
                            <option value="">All Types</option>
                            {RESTRICTION_TYPE_OPTIONS.map((type) => (
                                <option key={type} value={type}>{RESTRICTION_TYPE_LABELS[type]}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort (mobile-friendly dropdown fallback) */}
                    <div className="flex items-center gap-1.5 sm:hidden">
                        <ArrowUpDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortFieldChange(e.target.value as RestrictionSortField)}
                            className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
                        >
                            {RESTRICTION_SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleSortOrderToggle}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                            aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
                        >
                            {sortOrder === "asc" ? (
                                <ArrowUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <ArrowDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            )}
                        </button>
                    </div>

                    {/* Page Size */}
                    <select
                        value={pagination.limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>Show {size}</option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                {loading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <ShieldAlert className="h-12 w-12 text-red-400 dark:text-red-500 mb-4" />
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            type="button"
                            onClick={() => refresh()}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                ) : restrictions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            {search || typeFilter ? (
                                <Search className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                            ) : (
                                <ShieldCheck className="h-7 w-7 text-emerald-400 dark:text-emerald-500" />
                            )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {search || typeFilter ? "No restrictions match your filters" : "No restrictions found"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            {search || typeFilter
                                ? "Try adjusting your search or filter criteria"
                                : `No students have been restricted for ${passoutYear}`}
                        </p>
                        {!(search || typeFilter) && (
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition shadow-sm cursor-pointer"
                            >
                                <ShieldAlert className="h-4 w-4" />
                                Add Restriction
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[48px]">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">Student</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dept</th>
                                        <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400">
                                            <SortHeader label="Type" field="restriction_type" currentSort={sortBy} currentOrder={sortOrder} onSort={handleColumnSort} />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[140px]">Reason</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Applied By</th>
                                        <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400">
                                            <SortHeader label="Applied" field="applied_on" currentSort={sortBy} currentOrder={sortOrder} onSort={handleColumnSort} />
                                        </th>
                                        <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            <SortHeader label="Valid Until" field="valid_until" currentSort={sortBy} currentOrder={sortOrder} onSort={handleColumnSort} />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <AnimatedTableBody>
                                    {restrictions.map((r, idx) => {
                                        const typeColor = RESTRICTION_TYPE_COLORS[r.restriction_type];
                                        const daysLeft = getDaysLeft(r.valid_until);
                                        const isBlocking = BLOCKING_TYPES.has(r.restriction_type);

                                        return (
                                            <AnimatedRow
                                                key={r.restriction_id}
                                                onClick={() => handleRowClick(r)}
                                                className={`group border-b transition-colors cursor-pointer ${
                                                    r.is_active
                                                        ? "border-l-[3px] border-l-red-400 dark:border-l-red-500 border-b-gray-50 dark:border-b-gray-800/50 hover:bg-red-50/30 dark:hover:bg-red-900/10"
                                                        : "border-l-[3px] border-l-transparent border-b-gray-50 dark:border-b-gray-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 opacity-75 hover:opacity-100"
                                                }`}
                                            >
                                                    <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                                                        {(pagination.page - 1) * pagination.limit + idx + 1}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                                                                {r.student_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {r.student_email}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                        {r.dept_name}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${typeColor.bg} ${typeColor.text}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
                                                                {RESTRICTION_TYPE_LABELS[r.restriction_type]}
                                                            </span>
                                                            {r.is_active && isBlocking && (
                                                                <span className="relative flex h-2 w-2" title="Blocks placements">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 max-w-[180px]">
                                                        <span className="truncate block" title={r.reason}>
                                                            {r.reason.length > 50 ? `${r.reason.slice(0, 50)}…` : r.reason}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                        {r.restricted_by_name}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                        {formatDate(r.applied_on)}
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {r.valid_until ? formatDate(r.valid_until) : "No expiry"}
                                                            </p>
                                                            {r.is_active && daysLeft && (
                                                                <p className={`text-xs font-medium ${daysLeft.color}`}>
                                                                    {daysLeft.text}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        {r.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                Resolved
                                                            </span>
                                                        )}
                                                    </td>
                                            </AnimatedRow>
                                        );
                                    })}
                                </AnimatedTableBody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing <span className="font-medium text-gray-700 dark:text-gray-300">{showStart}–{showEnd}</span> of{" "}
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span> results
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {getPageNumbers().map((p, i) =>
                                        p === "..." ? (
                                            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 dark:text-gray-500">…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => handlePageChange(p)}
                                                className={`h-8 w-8 rounded-lg text-sm font-medium transition cursor-pointer ${
                                                    pagination.page === p
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ),
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === totalPages}
                                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Restriction Modal */}
            <AddRestrictionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
            />

            {/* Restriction Detail Modal */}
            <RestrictionDetailModal
                restriction={selectedRestriction}
                onClose={handleDetailClose}
            />

        </>
    );
}
