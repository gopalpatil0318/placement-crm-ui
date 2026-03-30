import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    Search, Check, X, Loader2,
    HelpCircle, ChevronDown, ChevronUp,
    CheckSquare, Square, Minus, Tag,
} from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { useViewInterviewQuestions } from "@/hooks/collegeadmin/interview_questions/useViewInterviewQuestions";
import { useApproveInterviewQuestion } from "@/hooks/collegeadmin/interview_questions/useApproveInterviewQuestion";
import {
    APPROVAL_STATUS_OPTIONS,
    APPROVAL_STATUS_LABELS,
    APPROVAL_STATUS_COLORS,
    SORT_OPTIONS_QUESTIONS,
    type InterviewQuestion,
} from "@/validators/FeedbackSchema";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZES = [10, 20, 50] as const;

const TOPIC_SUGGESTIONS = [
    "DSA", "DBMS", "OS", "CN", "HR",
    "Aptitude", "Coding", "System Design",
    "OOPs", "Web Dev",
] as const;

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5"] as const;

// ========================
// HELPERS
// ========================

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

function TopicBadge({ topic }: Readonly<{ topic: string | null }>) {
    if (!topic) return null;
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
            <Tag className="h-3 w-3" />
            {topic}
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
                        <div className="h-5 w-20 rounded-full bg-purple-100 dark:bg-purple-900/20" />
                        <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-4 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
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
                <HelpCircle className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                No interview questions yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Questions will appear here when students share their interview experiences.
            </p>
        </div>
    );
}

function QuestionCard({
    item,
    isSelected,
    onToggleSelect,
    onApprove,
    onReject,
    isProcessing,
}: Readonly<{
    item: InterviewQuestion;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isProcessing: boolean;
}>) {
    const [answerExpanded, setAnswerExpanded] = useState(false);
    const shouldReduce = useReducedMotion();
    const hasSampleAnswer = !!item.sample_answer;

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
                    aria-label={isSelected ? "Deselect question" : "Select question"}
                    onClick={() => onToggleSelect(item.question_id)}
                    className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                >
                    {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                        <Square className="h-5 w-5" />
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header: Topic + Status */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <TopicBadge topic={item.topic} />
                        <StatusBadge isApproved={item.is_approved} />
                    </div>

                    {/* Question text */}
                    <p className="mb-3 text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                        {item.question_description}
                    </p>

                    {/* Sample answer (collapsible) */}
                    {hasSampleAnswer && (
                        <div className="mb-3">
                            <button
                                type="button"
                                onClick={() => setAnswerExpanded(!answerExpanded)}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                                {answerExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                )}
                                {answerExpanded ? "Hide sample answer" : "Show sample answer"}
                            </button>
                            {answerExpanded && (
                                <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 leading-relaxed dark:bg-gray-800 dark:text-gray-400">
                                    {item.sample_answer}
                                </div>
                            )}
                        </div>
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
                                    aria-label="Approve question"
                                    onClick={() => onApprove(item.question_id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                aria-label={item.is_approved ? "Revoke approval" : "Reject question"}
                                onClick={() => onReject(item.question_id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
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
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                        Approve Selected
                    </button>
                    <button
                        type="button"
                        onClick={onBulkReject}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                    >
                        Reject Selected
                    </button>
                    <button
                        type="button"
                        onClick={onClearSelection}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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

export default function InterviewQuestionManager() {
    const {
        questions,
        isLoading,
        isFetching,
        pagination,
        search,
        approvalFilter,
        companyFilter,
        topicFilter,
        sortIndex,
        handleSearchChange,
        handleTopicFilterChange,
        handlePageChange,
        handleLimitChange,
        handleApprovalFilterChange,
        handleCompanyFilterChange,
        handleSortChange,
    } = useViewInterviewQuestions();

    const {
        approve,
        reject,
        bulkAction,
        processingId,
        bulkProcessing,
        bulkProgress,
    } = useApproveInterviewQuestion();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Fetch companies for filter dropdown
    const { data: companiesData } = useQuery({
        queryKey: queryKeys.companies.all({ limit: 200 }),
        queryFn: () => CollegeAdminService.getAllCompanies({ limit: 200 }),
    });
    const companies: { company_id: string; company_name: string }[] = Array.isArray(companiesData?.data) ? companiesData.data : [];

    // Counts from current page data
    const pendingCount = useMemo(() => questions.filter((q) => !q.is_approved).length, [questions]);
    const approvedCount = useMemo(() => questions.filter((q) => q.is_approved).length, [questions]);

    const hasFilters = !!(search || companyFilter || topicFilter || approvalFilter !== "pending");

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
        if (selectedIds.size === questions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(questions.map((q) => q.question_id)));
        }
    }, [questions, selectedIds.size]);

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
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Interview Questions
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Review and approve interview questions shared by students
                    </p>
                </div>
            </div>

            {/* Stats */}
            <StatsBar
                total={pagination.total}
                pending={pendingCount}
                approved={approvedCount}
            />

            {/* Topic quick-filter chips */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Quick filter:</span>
                {TOPIC_SUGGESTIONS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => handleTopicFilterChange(topicFilter === t ? "" : t)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            topicFilter === t
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search questions..."
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

                {/* Topic input */}
                <div className="relative min-w-[140px]">
                    <input
                        type="text"
                        list="topic-suggestions"
                        value={topicFilter}
                        onChange={(e) => handleTopicFilterChange(e.target.value)}
                        placeholder="Filter by topic..."
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:ring-blue-900/30"
                    />
                    <datalist id="topic-suggestions">
                        {TOPIC_SUGGESTIONS.map((t) => (
                            <option key={t} value={t} />
                        ))}
                    </datalist>
                </div>

                {/* Sort */}
                <select
                    value={sortIndex}
                    onChange={(e) => handleSortChange(Number(e.target.value))}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    {SORT_OPTIONS_QUESTIONS.map((opt) => (
                        <option key={opt.label} value={SORT_OPTIONS_QUESTIONS.indexOf(opt)}>
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
            {questions.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <button
                        type="button"
                        aria-label={selectedIds.size === questions.length ? "Deselect all" : "Select all"}
                        onClick={toggleSelectAll}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        {(() => {
                            if (selectedIds.size === questions.length && questions.length > 0) {
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
                            ? `${selectedIds.size} of ${questions.length} selected`
                            : `Select all ${questions.length} on this page`}
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
                if (questions.length === 0) {
                    return <EmptyState hasFilters={hasFilters} />;
                }
                return (
                    <div className="space-y-3">
                        {questions.map((item) => (
                            <QuestionCard
                                key={item.question_id}
                                item={item}
                                isSelected={selectedIds.has(item.question_id)}
                                onToggleSelect={toggleSelect}
                                onApprove={approve}
                                onReject={reject}
                                isProcessing={processingId === item.question_id}
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
