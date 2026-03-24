import { useState, useCallback, useEffect } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Ban,
    SlidersHorizontal,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    AlertTriangle,
    MessageSquare,
} from "lucide-react";
import { useViewDenials } from "@/hooks/collegeadmin/company_management/eligible_denials/useViewDenials";
import { type DenialItem } from "@/hooks/collegeadmin/company_management/eligible_denials/useViewDenials";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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
                <ArrowUpDown className="h-3 w-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-400" />
            )}
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
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
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
            <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg mb-1">No results match your search</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search term.</p>
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                <Ban className="h-7 w-7 text-emerald-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg mb-1">No denials yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">No students have opted out of this job posting.</p>
        </div>
    );

// ========================
// SKELETON TABLE
// ========================

const SkeletonTable = () => (
    <>
        {Array.from({ length: 6 }).map((_, i) => (
            <tr key={`skel-${i}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                <td className="px-4 py-3.5 w-10"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5" /></td>
                <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36" />
                        <div className="h-3 bg-gray-50 dark:bg-gray-800/50 rounded w-48" />
                    </div>
                </td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800/50 rounded-full w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800/50 rounded w-40" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800/50 rounded w-20" /></td>
            </tr>
        ))}
    </>
);

// ========================
// DENIAL ROW (expandable)
// ========================

const DenialRow = ({
    denial,
    index,
    isExpanded,
    onToggle,
}: {
    denial: DenialItem;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
}) => (
    <>
        <tr
            className="group border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
            onClick={onToggle}
        >
            {/* Row number */}
            <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-sm w-10">{index}</td>

            {/* Student name + email */}
            <td className="px-4 py-3.5">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{denial.student_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{denial.student_email}</p>
                </div>
            </td>

            {/* Department */}
            <td className="px-4 py-3.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                    {denial.dept_name}
                </span>
            </td>

            {/* Denial reason (truncated) + expand icon */}
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[240px]">{denial.denial_reason}</p>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    )}
                </div>
            </td>

            {/* Date */}
            <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {new Date(denial.denied_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </td>
        </tr>

        {/* Expanded details */}
        {isExpanded && (
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                <td colSpan={5} className="px-4 py-4">
                    <div className="ml-8 space-y-3">
                        {/* Full denial reason */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Ban className="h-4 w-4 text-red-500 dark:text-red-400" />
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Denial Reason</p>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{denial.denial_reason}</p>
                        </div>

                        {/* Additional comments */}
                        {denial.additional_comments && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Additional Comments</p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
                                    &ldquo;{denial.additional_comments}&rdquo;
                                </p>
                            </div>
                        )}
                    </div>
                </td>
            </tr>
        )}
    </>
);

// ========================
// MAIN COMPONENT
// ========================

interface DenialsManagerProps {
    jobId: string;
}

const DenialsManager = ({ jobId }: DenialsManagerProps) => {
    const {
        denials,
        loading,
        error,
        pagination,
        search,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleSortChange,
        handlePageChange,
        handleLimitChange,
        refresh,
        clearFilters,
    } = useViewDenials(jobId);

    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Reset expanded row when denials list changes (filter/search/sort)
    useEffect(() => {
        setExpandedId(null);
    }, [denials]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const hasFilters = !!search;
    const startEntry = denials.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    // Error state
    if (error && !loading && denials.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg mb-1">Failed to load denials</p>
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
        <div className="space-y-0">
            {/* Header */}
            <div className="px-6 pt-5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <Ban className="h-5 w-5 text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Denials</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {pagination.total} student{pagination.total !== 1 ? "s" : ""} opted out of this job
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-3 border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or reason..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                        />
                    </div>

                    {/* Page size */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ml-auto">
                        Show
                        <select
                            value={pagination.limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
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
                            <Search className="h-3.5 w-3.5" />
                            Clear search
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50/70 dark:bg-gray-800/50 text-left text-gray-500 dark:text-gray-400">
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-10">#</th>
                            <th className="px-4 py-3">
                                <SortHeader label="Student" field="student_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Department</th>
                            <th className="px-4 py-3">
                                <SortHeader label="Reason" field="denial_reason" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th className="px-4 py-3">
                                <SortHeader label="Denied" field="denied_at" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <SkeletonTable />
                        ) : denials.length > 0 ? (
                            denials.map((denial, index) => (
                                <DenialRow
                                    key={denial.denial_id}
                                    denial={denial}
                                    index={(pagination.page - 1) * pagination.limit + index + 1}
                                    isExpanded={expandedId === denial.denial_id}
                                    onToggle={() => toggleExpand(denial.denial_id)}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5}>
                                    <EmptyState hasFilters={hasFilters} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!loading && denials.length > 0 && (
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
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DenialsManager;
