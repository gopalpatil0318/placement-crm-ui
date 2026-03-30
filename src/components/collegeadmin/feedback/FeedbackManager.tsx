import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    Search, Star, Check, X, Loader2,
    MessageSquare, EyeOff,
    CheckSquare, Square, Minus,
} from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { useViewFeedback } from "@/hooks/collegeadmin/feedback/useViewFeedback";
import { useApproveFeedback } from "@/hooks/collegeadmin/feedback/useApproveFeedback";
import {
    APPROVAL_STATUS_OPTIONS,
    APPROVAL_STATUS_LABELS,
    APPROVAL_STATUS_COLORS,
    SORT_OPTIONS_FEEDBACK,
    type Feedback,
} from "@/validators/FeedbackSchema";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZES = [10, 20, 50] as const;

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5"] as const;

// ========================
// HELPERS
// ========================

function StarRating({ rating, size = "sm" }: Readonly<{ rating: number; size?: "sm" | "md" }>) {
    const dim = size === "md" ? "h-5 w-5" : "h-4 w-4";
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`${dim} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                />
            ))}
        </div>
    );
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

// ========================
// SUB-COMPONENTS
// ========================

function StatsBar({
    total,
    pending,
    approved,
}: Readonly<{
    total: number;
    pending: number;
    approved: number;
}>) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Total: {total}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Pending: {pending}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Approved: {approved}
            </span>
        </div>
    );
}

function StatusBadge({ isApproved }: Readonly<{ isApproved: boolean }>) {
    const status = isApproved ? "approved" : "pending";
    const colors = APPROVAL_STATUS_COLORS[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {isApproved ? "Approved" : "Pending"}
        </span>
    );
}

function CardSkeleton() {
    return (
        <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start gap-4">
                <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 mt-0.5" />
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="flex items-center gap-4">
                        <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ hasFilters }: Readonly<{ hasFilters: boolean }>) {
    if (hasFilters) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800">
                    <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    No results match your filters
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Try adjusting your search or filters
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                <MessageSquare className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                No feedback yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Feedback will appear here when students submit ratings for placement drives.
            </p>
        </div>
    );
}

function FeedbackCard({
    item,
    isSelected,
    onToggleSelect,
    onApprove,
    onReject,
    isProcessing,
}: Readonly<{
    item: Feedback;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isProcessing: boolean;
}>) {
    const [expanded, setExpanded] = useState(false);
    const shouldReduce = useReducedMotion();
    const textTruncated = item.feedback_text && item.feedback_text.length > 200;

    const Wrapper = shouldReduce ? "div" : motion.div;
    const wrapperProps = shouldReduce ? {} : { variants: fadeInUp, initial: "initial", animate: "animate" };

    return (
        <Wrapper
            {...wrapperProps}
            className="rounded-xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
        >
            <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                    type="button"
                    aria-label={isSelected ? "Deselect feedback" : "Select feedback"}
                    onClick={() => onToggleSelect(item.feedback_id)}
                    className="mt-0.5 flex-shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors"
                >
                    {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                        <Square className="h-5 w-5" />
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header: Rating + Status */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <StarRating rating={item.rating} size="md" />
                        <StatusBadge isApproved={item.is_approved} />
                        {item.is_anonymous && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                <EyeOff className="h-3 w-3" />
                                Anonymous
                            </span>
                        )}
                    </div>

                    {/* Feedback text */}
                    {item.feedback_text ? (
                        <div className="mb-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {expanded || !textTruncated
                                    ? item.feedback_text
                                    : `${item.feedback_text.slice(0, 200)}...`}
                            </p>
                            {textTruncated && (
                                <button
                                    type="button"
                                    onClick={() => setExpanded(!expanded)}
                                    className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                    {expanded ? "Show less" : "Show more"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="mb-3 text-sm italic text-gray-400 dark:text-gray-500">
                            No feedback text provided
                        </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {item.company_name}
                        </span>
                        <span>·</span>
                        <span>{item.job_title}</span>
                        <span>·</span>
                        <span>{item.student_name}</span>
                        {item.department_name && (
                            <>
                                <span>·</span>
                                <span>{item.department_name}</span>
                            </>
                        )}
                        <span>·</span>
                        <span>{formatDate(item.created_at)}</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                        <>
                            {!item.is_approved && (
                                <button
                                    type="button"
                                    aria-label="Approve feedback"
                                    onClick={() => onApprove(item.feedback_id)}
                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                aria-label={item.is_approved ? "Revoke approval" : "Reject feedback"}
                                onClick={() => onReject(item.feedback_id)}
                                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Wrapper>
    );
}

function BulkActionBar({
    selectedCount,
    onBulkApprove,
    onBulkReject,
    onClearSelection,
    bulkProcessing,
    bulkProgress,
}: Readonly<{
    selectedCount: number;
    onBulkApprove: () => void;
    onBulkReject: () => void;
    onClearSelection: () => void;
    bulkProcessing: boolean;
    bulkProgress: { done: number; total: number };
}>) {
    const shouldReduce = useReducedMotion();
    const Wrapper = shouldReduce ? "div" : motion.div;

    return (
        <Wrapper
            {...(shouldReduce ? {} : { initial: { y: 80, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 80, opacity: 0 } })}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
            {bulkProcessing ? (
                <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Processing {bulkProgress.done}/{bulkProgress.total}...
                    </span>
                    <div className="h-1.5 w-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${bulkProgress.total > 0 ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedCount} selected
                    </span>
                    <button
                        type="button"
                        onClick={onBulkApprove}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 min-h-[44px] text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                        Approve Selected
                    </button>
                    <button
                        type="button"
                        onClick={onBulkReject}
                        className="rounded-lg bg-red-600 px-3 py-1.5 min-h-[44px] text-xs font-medium text-white transition-colors hover:bg-red-700"
                    >
                        Reject Selected
                    </button>
                    <button
                        type="button"
                        onClick={onClearSelection}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 min-h-[44px] text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Clear
                    </button>
                </>
            )}
        </Wrapper>
    );
}

function PaginationBar({
    page,
    totalPages,
    total,
    limit,
    onPageChange,
    onLimitChange,
}: Readonly<{
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (p: number) => void;
    onLimitChange: (l: number) => void;
}>) {
    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    const pageNumbers = useMemo(() => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push("...");
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                pages.push(i);
            }
            if (page < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    }, [page, totalPages]);

    if (totalPages <= 1 && total <= PAGE_SIZES[0]) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing {startItem}–{endItem} of {total} results
            </span>
            <div className="flex items-center gap-2">
                <select
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                    {PAGE_SIZES.map((s) => (
                        <option key={s} value={s}>
                            {s} / page
                        </option>
                    ))}
                </select>
                <div className="flex items-center gap-1">
                    {pageNumbers.map((p, i) =>
                        p === "..." ? (
                            <span key={`ellipsis-${i === 1 ? 'start' : 'end'}`} className="px-1 text-xs text-gray-400">
                                ...
                            </span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                                    p === page
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                }`}
                            >
                                {p}
                            </button>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}

// ========================
// MAIN COMPONENT
// ========================

export default function FeedbackManager() {
    const {
        feedback,
        isLoading,
        isFetching,
        pagination,
        search,
        approvalFilter,
        companyFilter,
        jobFilter,
        ratingFilter,
        sortIndex,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleApprovalFilterChange,
        handleCompanyFilterChange,
        handleJobFilterChange,
        handleRatingFilterChange,
        handleSortChange,
    } = useViewFeedback();

    const {
        approve,
        reject,
        bulkAction,
        processingId,
        bulkProcessing,
        bulkProgress,
    } = useApproveFeedback();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Fetch companies for the filter dropdown
    const { data: companiesData } = useQuery({
        queryKey: queryKeys.companies.all({ limit: 200 }),
        queryFn: () => CollegeAdminService.getAllCompanies({ limit: 200 }),
    });
    const companies: { company_id: string; company_name: string }[] = Array.isArray(companiesData?.data) ? companiesData.data : [];

    // Fetch jobs for the filter dropdown (filtered by selected company)
    const { data: jobsData } = useQuery({
        queryKey: queryKeys.jobs.all({ company_id: companyFilter || undefined, limit: 200 }),
        queryFn: () => CollegeAdminService.getAllJobs({ company_id: companyFilter || undefined, limit: 200 }),
        enabled: !!companyFilter,
    });
    const jobs: { job_id: string; job_title: string }[] = Array.isArray(jobsData?.data) ? jobsData.data : [];

    // Counts from current page data
    const pendingCount = useMemo(() => feedback.filter((f) => !f.is_approved).length, [feedback]);
    const approvedCount = useMemo(() => feedback.filter((f) => f.is_approved).length, [feedback]);

    const hasFilters = !!(search || companyFilter || jobFilter || ratingFilter || approvalFilter !== "pending");

    // Selection handlers
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (selectedIds.size === feedback.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(feedback.map((f) => f.feedback_id)));
        }
    }, [feedback, selectedIds.size]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const handleBulkApprove = useCallback(() => {
        bulkAction(Array.from(selectedIds), true).then(() => setSelectedIds(new Set()));
    }, [bulkAction, selectedIds]);

    const handleBulkReject = useCallback(() => {
        bulkAction(Array.from(selectedIds), false).then(() => setSelectedIds(new Set()));
    }, [bulkAction, selectedIds]);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Placement Feedback
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Review and approve student feedback for placement drives
                    </p>
                </div>
            </div>

            {/* Stats */}
            <StatsBar
                total={pagination.total}
                pending={pendingCount}
                approved={approvedCount}
            />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search feedback..."
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:ring-blue-900/30"
                    />
                </div>

                {/* Approval status */}
                <select
                    value={approvalFilter}
                    onChange={(e) => handleApprovalFilterChange(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    {APPROVAL_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                            {APPROVAL_STATUS_LABELS[status]}
                        </option>
                    ))}
                </select>

                {/* Company filter */}
                <select
                    value={companyFilter}
                    onChange={(e) => handleCompanyFilterChange(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    <option value="">All Companies</option>
                    {companies.map((c) => (
                        <option key={c.company_id} value={c.company_id}>
                            {c.company_name}
                        </option>
                    ))}
                </select>

                {/* Job filter (shows when company is selected) */}
                {companyFilter && (
                    <select
                        value={jobFilter}
                        onChange={(e) => handleJobFilterChange(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <option value="">All Jobs</option>
                        {jobs.map((j) => (
                            <option key={j.job_id} value={j.job_id}>
                                {j.job_title}
                            </option>
                        ))}
                    </select>
                )}

                {/* Rating filter */}
                <select
                    value={ratingFilter}
                    onChange={(e) => handleRatingFilterChange(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    <option value="">All Ratings</option>
                    {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={String(r)}>
                            {"★".repeat(r)}{"☆".repeat(5 - r)} ({r})
                        </option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    value={sortIndex}
                    onChange={(e) => handleSortChange(Number(e.target.value))}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    {SORT_OPTIONS_FEEDBACK.map((opt) => (
                        <option key={opt.label} value={SORT_OPTIONS_FEEDBACK.indexOf(opt)}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Fetching indicator */}
                {isFetching && !isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                )}
            </div>

            {/* Select All row */}
            {feedback.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <button
                        type="button"
                        aria-label={selectedIds.size === feedback.length ? "Deselect all" : "Select all"}
                        onClick={toggleSelectAll}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        {(() => {
                            if (selectedIds.size === feedback.length && feedback.length > 0) {
                                return <CheckSquare className="h-4.5 w-4.5 text-blue-600" />;
                            }
                            if (selectedIds.size > 0) {
                                return <Minus className="h-4.5 w-4.5 text-blue-500" />;
                            }
                            return <Square className="h-4.5 w-4.5" />;
                        })()}
                    </button>
                    <span>
                        {selectedIds.size > 0
                            ? `${selectedIds.size} of ${feedback.length} selected`
                            : `Select all ${feedback.length} on this page`}
                    </span>
                </div>
            )}

            {/* Content */}
            {(() => {
                if (isLoading) {
                    return (
                        <div className="space-y-4">
                            {SKELETON_IDS.map((id) => (
                                <CardSkeleton key={id} />
                            ))}
                        </div>
                    );
                }
                if (feedback.length === 0) {
                    return <EmptyState hasFilters={hasFilters} />;
                }
                return (
                    <div className="space-y-3">
                        {feedback.map((item) => (
                            <FeedbackCard
                                key={item.feedback_id}
                                item={item}
                                isSelected={selectedIds.has(item.feedback_id)}
                                onToggleSelect={toggleSelect}
                                onApprove={approve}
                                onReject={reject}
                                isProcessing={processingId === item.feedback_id}
                            />
                        ))}
                    </div>
                );
            })()}

            {/* Pagination */}
            <PaginationBar
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
            />

            {/* Bulk action bar */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <BulkActionBar
                        selectedCount={selectedIds.size}
                        onBulkApprove={handleBulkApprove}
                        onBulkReject={handleBulkReject}
                        onClearSelection={clearSelection}
                        bulkProcessing={bulkProcessing}
                        bulkProgress={bulkProgress}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
