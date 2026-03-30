import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bell, Loader2, ExternalLink, Users, Eye } from "lucide-react";
import { useNotificationDropdown } from "@/hooks/collegeadmin/notifications/useNotificationDropdown";
import {
    NOTIFICATION_TYPE_LABELS,
    NOTIFICATION_TYPE_COLORS,
} from "@/validators/NotificationSchema";

// ========================
// COMPONENT
// ========================

export default function NotificationDropdown() {
    const { isOpen, toggle, close, dropdownRef, recentNotifications, summary, isLoading } = useNotificationDropdown();
    const shouldReduce = useReducedMotion();

    const readRate = useMemo(() => {
        if (!summary) return 0;
        const total = summary.total_read + summary.total_unread;
        return total > 0 ? Math.round((summary.total_read / total) * 100) : 0;
    }, [summary]);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}
            <button
                type="button"
                onClick={toggle}
                className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Sent notifications"
                aria-expanded={isOpen}
            >
                <Bell size={18} className="text-gray-600 dark:text-gray-400" />
                {summary && summary.total_sent > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-gray-900" />
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Sent Notifications
                            </h3>
                            <Link
                                to="/college/notification-history"
                                onClick={close}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                                View All
                                <ExternalLink size={10} />
                            </Link>
                        </div>

                        {/* Content */}
                        <div className="max-h-80 overflow-y-auto">
                            {isLoading && (
                                <div className="flex items-center justify-center py-8 text-gray-400">
                                    <Loader2 size={18} className="animate-spin" />
                                </div>
                            )}
                            {!isLoading && recentNotifications.length === 0 && (
                                <div className="py-8 text-center">
                                    <Bell size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                    <p className="text-sm text-gray-400">No notifications sent yet</p>
                                </div>
                            )}
                            {!isLoading && recentNotifications.length > 0 && (
                                recentNotifications.map((n) => {
                                    const colors = NOTIFICATION_TYPE_COLORS[n.notification_type];
                                    const timeAgo = getTimeAgo(n.sent_at);

                                    return (
                                        <div
                                            key={`${n.title}-${n.notification_type}-${n.sent_at}`}
                                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                                        >
                                            <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                <Bell size={14} className={colors.text} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {n.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] font-medium ${colors.text}`}>
                                                        {NOTIFICATION_TYPE_LABELS[n.notification_type]}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">{timeAgo}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                                    <span className="inline-flex items-center gap-0.5">
                                                        <Users size={10} />
                                                        {n.total_recipients}
                                                    </span>
                                                    <span className="inline-flex items-center gap-0.5 text-emerald-500">
                                                        <Eye size={10} />
                                                        {n.read_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {summary && summary.total_sent > 0 && (
                            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div className="flex items-center justify-between text-[11px] text-gray-500">
                                    <span>Total: {summary.total_sent} sent</span>
                                    <span>{readRate}% read rate</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ========================
// HELPERS
// ========================

function getTimeAgo(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
}
