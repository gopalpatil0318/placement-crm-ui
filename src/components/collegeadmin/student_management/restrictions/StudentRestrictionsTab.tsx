import { useState, useCallback, memo } from "react";
import { useReducedMotion, motion } from "framer-motion";
import {
    Shield, ShieldAlert, ShieldCheck, AlertTriangle, Calendar, User,
    CheckCircle, ChevronDown, Pencil,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useViewStudentRestrictions } from "@/hooks/collegeadmin/student_management/restrictions/useViewStudentRestrictions";

import {
    RESTRICTION_TYPE_LABELS,
    RESTRICTION_TYPE_COLORS,
    RESTRICTION_SEVERITY,
    RESTRICTION_STATUS_TABS,
    RESTRICTION_STATUS_LABELS,
    BLOCKING_TYPES,
    type StudentRestriction,
    type RestrictionType,
    type RestrictionStatusFilter,
} from "@/validators/RestrictionSchema";
import AddRestrictionModal from "./AddRestrictionModal";
import ResolveRestrictionModal from "./ResolveRestrictionModal";
import UpdateRestrictionModal from "./UpdateRestrictionModal";

// ========================
// HELPERS
// ========================

function formatDate(d: string | null): string {
    if (!d) return "No expiry";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getDaysLeft(validUntil: string | null): string | null {
    if (!validUntil) return null;
    const diff = new Date(validUntil).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days === 1 ? "1 day left" : `${days} days left`;
}

function getSeverityIcon(type: RestrictionType) {
    const severity = RESTRICTION_SEVERITY[type];
    if (severity === "high") return { Icon: Shield, color: "text-red-500 dark:text-red-400" };
    if (severity === "medium") return { Icon: AlertTriangle, color: "text-amber-500 dark:text-amber-400" };
    return { Icon: AlertTriangle, color: "text-yellow-500 dark:text-yellow-400" };
}

// ========================
// INTERFACES
// ========================

interface StudentRestrictionsTabProps {
    studentId: string;
    studentName?: string;
}

// ========================
// SUB-COMPONENTS
// ========================

const SUMMARY_SKELETON_KEYS = ["sum-1", "sum-2", "sum-3"];
const CARD_SKELETON_KEYS = ["card-1", "card-2", "card-3"];

function TabSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex gap-3">
                {SUMMARY_SKELETON_KEYS.map((id) => (
                    <div key={id} className="h-16 flex-1 rounded-xl bg-gray-100 dark:bg-gray-800" />
                ))}
            </div>
            {CARD_SKELETON_KEYS.map((id) => (
                <div key={id} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
        </div>
    );
}

const RestrictionCardItem = memo(function RestrictionCardItem({
    restriction,
    onResolve,
    onEdit,
}: {
    restriction: StudentRestriction;
    onResolve: (r: StudentRestriction) => void;
    onEdit: (r: StudentRestriction) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const typeColor = RESTRICTION_TYPE_COLORS[restriction.restriction_type];
    const severity = getSeverityIcon(restriction.restriction_type);
    const SeverityIcon = severity.Icon;
    const daysLeft = getDaysLeft(restriction.valid_until);
    const isBlocking = BLOCKING_TYPES.has(restriction.restriction_type);

    const statusBadge = restriction.is_active
        ? { label: "Active", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" }
        : { label: "Resolved", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" };

    return (
        <div className={`rounded-2xl border bg-white dark:bg-gray-800/60 overflow-hidden transition-shadow hover:shadow-md ${
            restriction.is_active ? typeColor.border : "border-gray-200 dark:border-gray-700"
        }`}>
            {restriction.is_active && <div className={`h-1 ${typeColor.dot}`} />}

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${typeColor.bg}`}>
                            <SeverityIcon size={16} className={severity.color} />
                        </div>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColor.bg} ${typeColor.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
                            {RESTRICTION_TYPE_LABELS[restriction.restriction_type]}
                        </span>
                        {restriction.is_active && isBlocking && (
                            <span className="relative flex h-2 w-2" title="Blocks placements">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                        )}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusBadge.bg} ${statusBadge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                    </span>
                </div>

                {/* Reason */}
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{restriction.reason}</p>

                {/* Expandable details */}
                {restriction.details && (
                    <div className="mb-3">
                        <p className={`text-xs text-gray-500 dark:text-gray-400 ${expanded ? "" : "line-clamp-2"}`}>
                            {restriction.details}
                        </p>
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                        >
                            {expanded ? "Show less" : "Show more"}
                            <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                )}

                {/* Meta */}
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
                        <span>
                            Applied: {formatDate(restriction.applied_on)}
                            {restriction.valid_until ? (
                                <span className="text-gray-400 dark:text-gray-500">
                                    {" "}· Until: {formatDate(restriction.valid_until)}
                                    {restriction.is_active && daysLeft && (
                                        <span className={`ml-1 font-medium ${
                                            daysLeft === "Expired"
                                                ? "text-red-500 dark:text-red-400"
                                                : "text-amber-500 dark:text-amber-400"
                                        }`}>
                                            ({daysLeft})
                                        </span>
                                    )}
                                </span>
                            ) : (
                                <span className="text-gray-400 dark:text-gray-500"> · No expiry</span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <User size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />
                        <span>By: {restriction.restricted_by_name}</span>
                    </div>
                    {restriction.resolved_by_name && (
                        <div className="flex items-center gap-2">
                            <CheckCircle size={13} className="shrink-0 text-emerald-500" />
                            <span>Resolved by: {restriction.resolved_by_name}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {restriction.is_active && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => onResolve(restriction)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition cursor-pointer"
                        >
                            <ShieldCheck size={14} />
                            Resolve
                        </button>
                        <button
                            type="button"
                            onClick={() => onEdit(restriction)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition cursor-pointer"
                        >
                            <Pencil size={14} />
                            Edit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

// ========================
// MAIN COMPONENT
// ========================

export default function StudentRestrictionsTab({ studentId, studentName }: Readonly<StudentRestrictionsTabProps>) {
    const shouldReduce = useReducedMotion();
    const [statusFilter, setStatusFilter] = useState<RestrictionStatusFilter>("all");

    let isActiveParam: string | undefined;
    if (statusFilter === "active") {
        isActiveParam = "true";
    } else if (statusFilter === "resolved") {
        isActiveParam = "false";
    }

    const { restrictions, totalRestrictions, activeRestrictions, loading, error, refresh } =
        useViewStudentRestrictions(studentId, isActiveParam);

    const [showAddModal, setShowAddModal] = useState(false);
    const [resolveTarget, setResolveTarget] = useState<StudentRestriction | null>(null);
    const [editTarget, setEditTarget] = useState<StudentRestriction | null>(null);

    const handleAddSuccess = useCallback(() => {
        setShowAddModal(false);
        refresh();
    }, [refresh]);

    const handleResolveSuccess = useCallback(() => {
        setResolveTarget(null);
        refresh();
    }, [refresh]);

    const handleEditSuccess = useCallback(() => {
        setEditTarget(null);
        refresh();
    }, [refresh]);

    const resolvedCount = totalRestrictions - activeRestrictions;

    if (loading) return <TabSkeleton />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <ShieldAlert className="h-10 w-10 text-red-400 dark:text-red-500 mb-3" />
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
                <button
                    type="button"
                    onClick={() => refresh()}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                    Try Again
                </button>
            </div>
        );
    }

    let restrictionContent: React.ReactNode;
    if (restrictions.length === 0) {
        restrictionContent = (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                    <ShieldCheck className="h-6 w-6 text-emerald-400 dark:text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {statusFilter === "all" ? "No restrictions" : `No ${statusFilter} restrictions`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {statusFilter === "all"
                        ? "This student has no restrictions on record"
                        : `No ${statusFilter} restrictions found`}
                </p>
                {statusFilter === "all" && (
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition shadow-sm cursor-pointer"
                    >
                        <ShieldAlert className="h-4 w-4" />
                        Add Restriction
                    </button>
                )}
            </div>
        );
    } else if (shouldReduce) {
        restrictionContent = (
            <div className="space-y-4">
                {restrictions.map((r) => (
                    <RestrictionCardItem
                        key={r.restriction_id}
                        restriction={r}
                        onResolve={setResolveTarget}
                        onEdit={setEditTarget}
                    />
                ))}
            </div>
        );
    } else {
        restrictionContent = (
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                {restrictions.map((r) => (
                    <motion.div key={r.restriction_id} variants={staggerItem}>
                        <RestrictionCardItem
                            restriction={r}
                            onResolve={setResolveTarget}
                            onEdit={setEditTarget}
                        />
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    return (
        <>
            <div className="space-y-5">
                {/* Summary Row */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{totalRestrictions}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
                            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm font-semibold text-red-700 dark:text-red-300">{activeRestrictions}</span>
                            <span className="text-xs text-red-500 dark:text-red-400">Active</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{resolvedCount}</span>
                            <span className="text-xs text-emerald-500 dark:text-emerald-400">Resolved</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition shadow-sm cursor-pointer"
                    >
                        <ShieldAlert className="h-4 w-4" />
                        Add Restriction
                    </button>
                </div>

                {/* Status Filter */}
                <div className="flex gap-1.5" role="tablist" aria-label="Restriction status filter">
                    {RESTRICTION_STATUS_TABS.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            role="tab"
                            aria-selected={statusFilter === tab}
                            tabIndex={statusFilter === tab ? 0 : -1}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                statusFilter === tab
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            {RESTRICTION_STATUS_LABELS[tab]}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {restrictionContent}
            </div>

            {/* Add Restriction Modal */}
            <AddRestrictionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
                preSelectedStudentId={studentId}
                preSelectedStudentName={studentName}
            />

            {/* Resolve Modal */}
            <ResolveRestrictionModal
                isOpen={!!resolveTarget}
                restriction={resolveTarget as never}
                onClose={() => setResolveTarget(null)}
                onSuccess={handleResolveSuccess}
            />

            {/* Edit modal */}
            <UpdateRestrictionModal
                isOpen={!!editTarget}
                restriction={editTarget as never}
                onClose={() => setEditTarget(null)}
                onSuccess={handleEditSuccess}
            />
        </>
    );
}
