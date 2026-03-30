import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
    Search, Loader2, Bell,
    Send as SendIcon, Eye, Users, Calendar,
    ArrowUpDown, ChevronLeft, ChevronRight,
    BarChart3, BookOpen,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useViewSentNotifications } from "@/hooks/collegeadmin/notifications/useViewSentNotifications";
import {
    NOTIFICATION_TYPES,
    NOTIFICATION_TYPE_LABELS,
    NOTIFICATION_TYPE_COLORS,
    RECIPIENT_TYPE_LABELS,
    SORT_OPTIONS_NOTIFICATIONS,
    type SentNotification,
    type NotificationType,
    type NotificationSummary,
} from "@/validators/NotificationSchema";

// ========================
// SUB-COMPONENTS
// ========================

function SummaryCards({ summary }: Readonly<{ summary: NotificationSummary | null }>) {
    const shouldReduce = useReducedMotion();
    const motionProps = shouldReduce ? {} : staggerItem;

    if (!summary) return null;

    const readRate = summary.total_sent > 0
        ? Math.round((summary.total_read / (summary.total_read + summary.total_unread)) * 100)
        : 0;

    const cards = [
        { label: "Total Sent", value: summary.total_sent, icon: SendIcon, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Unique Recipients", value: summary.unique_recipients, icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
        { label: "Read Rate", value: `${readRate}%`, icon: Eye, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { label: "Unread", value: summary.total_unread, icon: Bell, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <motion.div
                    key={card.label}
                    {...motionProps}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                            <card.icon size={18} className={card.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                            <p className="text-xs text-gray-500">{card.label}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function TypeBreakdown({ summary }: Readonly<{ summary: NotificationSummary | null }>) {
    if (!summary?.by_type || Object.keys(summary.by_type).length === 0) return null;

    const entries = Object.entries(summary.by_type)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a);

    const total = entries.reduce((sum, [, count]) => sum + count, 0);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">By Type</span>
            </div>
            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                {entries.map(([type, count]) => {
                    const colors = NOTIFICATION_TYPE_COLORS[type as NotificationType];
                    const width = total > 0 ? (count / total) * 100 : 0;
                    return (
                        <div
                            key={type}
                            className={`${colors.dot}`}
                            style={{ width: `${width}%` }}
                            title={`${NOTIFICATION_TYPE_LABELS[type as NotificationType]}: ${count}`}
                        />
                    );
                })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
                {entries.map(([type, count]) => {
                    const colors = NOTIFICATION_TYPE_COLORS[type as NotificationType];
                    return (
                        <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                            {NOTIFICATION_TYPE_LABELS[type as NotificationType]}: {count}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function FilterBar({
    search,
    onSearchChange,
    notificationTypeFilter,
    onNotificationTypeFilterChange,
    recipientTypeFilter,
    onRecipientTypeFilterChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    sortIndex,
    onSortChange,
}: Readonly<{
    search: string;
    onSearchChange: (value: string) => void;
    notificationTypeFilter: string;
    onNotificationTypeFilterChange: (value: string) => void;
    recipientTypeFilter: string;
    onRecipientTypeFilterChange: (value: string) => void;
    dateFrom: string;
    onDateFromChange: (value: string) => void;
    dateTo: string;
    onDateToChange: (value: string) => void;
    sortIndex: number;
    onSortChange: (index: number) => void;
}>) {
    return (
        <div className="space-y-3">
            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        maxLength={100}
                        placeholder="Search by title or body..."
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900"
                    />
                </div>
                <div className="relative">
                    <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={sortIndex}
                        onChange={(e) => onSortChange(Number(e.target.value))}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-gray-900 appearance-none"
                    >
                        {SORT_OPTIONS_NOTIFICATIONS.map((opt) => (
                            <option key={opt.label} value={SORT_OPTIONS_NOTIFICATIONS.indexOf(opt)}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Dropdowns + Date Range */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={notificationTypeFilter}
                    onChange={(e) => onNotificationTypeFilterChange(e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                >
                    <option value="">All Types</option>
                    {NOTIFICATION_TYPES.map((t) => (
                        <option key={t} value={t}>{NOTIFICATION_TYPE_LABELS[t]}</option>
                    ))}
                </select>

                <select
                    value={recipientTypeFilter}
                    onChange={(e) => onRecipientTypeFilterChange(e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                >
                    <option value="">All Recipients</option>
                    <option value="student">{RECIPIENT_TYPE_LABELS.student}</option>
                    <option value="user">{RECIPIENT_TYPE_LABELS.user}</option>
                </select>

                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => onDateFromChange(e.target.value)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                    />
                    <span className="text-gray-400 text-xs">to</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => onDateToChange(e.target.value)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                    />
                </div>
            </div>
        </div>
    );
}

function NotificationBatchCard({ notification }: Readonly<{ notification: SentNotification }>) {
    const [expanded, setExpanded] = useState(false);
    const colors = NOTIFICATION_TYPE_COLORS[notification.notification_type];
    const typeLabel = NOTIFICATION_TYPE_LABELS[notification.notification_type];
    const readRate = notification.total_recipients > 0
        ? Math.round((notification.read_count / notification.total_recipients) * 100)
        : 0;

    const sentDate = useMemo(() => {
        const d = new Date(notification.sent_at);
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
        });
    }, [notification.sent_at]);

    const bodyTruncated = notification.body && notification.body.length > 200
        ? notification.body.slice(0, 200) + "..."
        : notification.body;

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex gap-3">
                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                    <Bell size={18} className={colors.text} />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {notification.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                    {typeLabel}
                                </span>
                                <span className="text-xs text-gray-400">{sentDate}</span>
                            </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 shrink-0">
                            {RECIPIENT_TYPE_LABELS[notification.recipient_type]}
                        </span>
                    </div>

                    {/* Body */}
                    {notification.body && (
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {expanded ? notification.body : bodyTruncated}
                            </p>
                            {notification.body.length > 200 && (
                                <button
                                    type="button"
                                    onClick={() => setExpanded(!expanded)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                                >
                                    {expanded ? "Show less" : "Show more"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-gray-500">
                            <Users size={12} className="inline mr-1" />
                            {notification.total_recipients} recipients
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            <Eye size={12} className="inline mr-1" />
                            {notification.read_count} read
                        </span>
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                            {notification.unread_count} unread
                        </span>
                        <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{readRate}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                    style={{ width: `${readRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ hasFilters }: Readonly<{ hasFilters: boolean }>) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                {hasFilters ? <Search size={24} className="text-gray-400" /> : <BookOpen size={24} className="text-gray-400" />}
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                {hasFilters ? "No matching notifications" : "No notifications sent yet"}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
                {hasFilters
                    ? "Try adjusting your filters or search terms."
                    : "Start by sending your first notification to students or college users."
                }
            </p>
        </div>
    );
}

function PaginationBar({
    page,
    totalPages,
    limit,
    total,
    onPageChange,
    onLimitChange,
}: Readonly<{
    page: number;
    totalPages: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}>) {
    const pages = useMemo(() => {
        const result: (number | "...")[] = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) result.push(i);
        } else {
            result.push(1);
            if (page > 3) result.push("...");
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) result.push(i);
            if (page < totalPages - 2) result.push("...");
            result.push(totalPages);
        }
        return result;
    }, [page, totalPages]);

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Rows:</span>
                <select
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="rounded border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs bg-white dark:bg-gray-900"
                >
                    {[10, 20, 50].map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <span className="text-xs text-gray-400">of {total}</span>
            </div>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={14} />
                </button>
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`dots-${String(i)}`} className="px-1 text-xs text-gray-400">...</span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p)}
                            className={`min-w-[44px] min-h-[44px] rounded text-xs font-medium transition-colors ${
                                p === page
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

// ========================
// SKELETON
// ========================

export function SentNotificationsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`summary-skeleton-${String(i)}`} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800" />
                            <div className="space-y-2">
                                <div className="w-16 h-6 rounded bg-gray-200 dark:bg-gray-800" />
                                <div className="w-20 h-3 rounded bg-gray-100 dark:bg-gray-800" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Filter bar */}
            <div className="flex gap-3">
                <div className="flex-1 h-10 rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="w-32 h-10 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
            {/* Cards */}
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={`card-skeleton-${String(i)}`} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="w-48 h-4 rounded bg-gray-200 dark:bg-gray-800" />
                            <div className="w-32 h-3 rounded bg-gray-100 dark:bg-gray-800" />
                            <div className="w-full h-3 rounded bg-gray-100 dark:bg-gray-800" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ========================
// MAIN COMPONENT
// ========================

export default function SentNotificationsManager() {
    const shouldReduce = useReducedMotion();
    const containerProps = shouldReduce ? {} : staggerContainer;

    const {
        notifications,
        summary,
        pagination,
        isLoading,
        isFetching,
        search,
        handleSearchChange,
        notificationTypeFilter,
        handleNotificationTypeFilterChange,
        recipientTypeFilter,
        handleRecipientTypeFilterChange,
        dateFrom,
        handleDateFromChange,
        dateTo,
        handleDateToChange,
        sortIndex,
        handleSortChange,
        handlePageChange,
        limit,
        handleLimitChange,
    } = useViewSentNotifications();

    const hasFilters = !!(search || notificationTypeFilter || recipientTypeFilter || dateFrom || dateTo);

    if (isLoading) {
        return <SentNotificationsSkeleton />;
    }

    return (
        <motion.div
            {...containerProps}
            className="space-y-6"
        >
            {/* Summary */}
            <SummaryCards summary={summary} />
            <TypeBreakdown summary={summary} />

            {/* Filters */}
            <FilterBar
                search={search}
                onSearchChange={handleSearchChange}
                notificationTypeFilter={notificationTypeFilter}
                onNotificationTypeFilterChange={handleNotificationTypeFilterChange}
                recipientTypeFilter={recipientTypeFilter}
                onRecipientTypeFilterChange={handleRecipientTypeFilterChange}
                dateFrom={dateFrom}
                onDateFromChange={handleDateFromChange}
                dateTo={dateTo}
                onDateToChange={handleDateToChange}
                sortIndex={sortIndex}
                onSortChange={handleSortChange}
            />

            {/* Loading indicator */}
            {isFetching && !isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    Updating...
                </div>
            )}

            {/* List */}
            {notifications.length === 0 ? (
                <EmptyState hasFilters={hasFilters} />
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <motion.div key={`${n.title}-${n.notification_type}-${n.sent_at}`} {...(shouldReduce ? {} : staggerItem)}>
                            <NotificationBatchCard notification={n} />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <PaginationBar
                page={pagination.page}
                totalPages={pagination.totalPages}
                limit={limit}
                total={pagination.total}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
            />
        </motion.div>
    );
}
