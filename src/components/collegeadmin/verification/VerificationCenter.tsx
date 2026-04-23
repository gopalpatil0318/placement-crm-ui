import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    ShieldCheck, UserCheck, Briefcase, Trophy, Award,
    Search, ChevronDown, Check, X, AlertTriangle,
    Loader2, Square, CheckSquare, Minus, ArrowUpDown,
    ArrowUp, ArrowDown, PartyPopper, FileText,
} from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList";
import ModalWrapper from "@/components/ui/ModalWrapper";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { useVerificationCounts } from "@/hooks/collegeadmin/verification/useVerificationCounts";
import {
    useViewPendingItems,
    type PendingProfile,
    type PendingExperience,
    type PendingAchievement,
    type PendingCertificate,
    type PendingItem,
} from "@/hooks/collegeadmin/verification/useViewPendingItems";
import { useVerifyItem } from "@/hooks/collegeadmin/verification/useVerifyItem";
import { useBulkVerify } from "@/hooks/collegeadmin/verification/useBulkVerify";
import {
    type VerificationCategory,
    VERIFICATION_CATEGORIES,
    CATEGORY_LABELS,
} from "@/validators/VerificationSchema";
import PendingItemSheet from "./PendingItemSheet";
import { usePermissions } from "@/hooks/usePermissions";

// ========================
// CONSTANTS
// ========================

const CATEGORY_ICONS: Record<VerificationCategory, React.ComponentType<{ className?: string }>> = {
    profiles: UserCheck,
    experiences: Briefcase,
    achievements: Trophy,
    certificates: Award,
};

const CATEGORY_COLORS: Record<VerificationCategory, { bg: string; icon: string; border: string; activeBg: string }> = {
    profiles: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        icon: "text-blue-600 dark:text-blue-400",
        border: "border-blue-100 dark:border-blue-800",
        activeBg: "bg-blue-100 dark:bg-blue-900/40",
    },
    experiences: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        icon: "text-purple-600 dark:text-purple-400",
        border: "border-purple-100 dark:border-purple-800",
        activeBg: "bg-purple-100 dark:bg-purple-900/40",
    },
    achievements: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        icon: "text-amber-600 dark:text-amber-400",
        border: "border-amber-100 dark:border-amber-800",
        activeBg: "bg-amber-100 dark:bg-amber-900/40",
    },
    certificates: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        icon: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-100 dark:border-emerald-800",
        activeBg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
};

const PAGE_SIZES = [10, 20, 50] as const;

const SKELETON_ROWS = ['sr-0', 'sr-1', 'sr-2', 'sr-3', 'sr-4'] as const;

// ========================
// HELPERS
// ========================

const getItemId = (item: PendingItem, category: VerificationCategory): string => {
    if (category === "profiles") return (item as PendingProfile).student_id;
    if (category === "experiences") return (item as PendingExperience).experience_id;
    if (category === "achievements") return (item as PendingAchievement).achievement_id;
    return (item as PendingCertificate).certificate_id;
};

const getStudentId = (item: PendingItem, category: VerificationCategory): string => {
    if (category === "profiles") return (item as PendingProfile).student_id;
    return (item as PendingExperience | PendingAchievement | PendingCertificate).student_id;
};

const getStudentName = (item: PendingItem): string => {
    const p = item as { first_name: string; last_name: string };
    return `${p.first_name} ${p.last_name}`;
};

const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatDateRange = (start: string, end: string | null, isCurrent: boolean) => {
    const s = new Date(start).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    let e: string;
    if (isCurrent) {
        e = "Present";
    } else if (end) {
        e = new Date(end).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    } else {
        e = "—";
    }
    return `${s} – ${e}`;
};

const countDocs = (item: PendingItem, category: VerificationCategory): number => {
    if (category === "experiences") {
        const exp = item as PendingExperience;
        return (exp.offer_letter_url ? 1 : 0) + (exp.completion_certificate_url ? 1 : 0);
    }
    if (category === "achievements") {
        const ach = item as PendingAchievement;
        return (ach.certificate_url ? 1 : 0) + (ach.proof_url ? 1 : 0);
    }
    if (category === "certificates") {
        const cert = item as PendingCertificate;
        return cert.certificate_url ? 1 : 0;
    }
    return 0;
};

// ========================
// SUB-COMPONENTS
// ========================

// ─── Dashboard Count Cards ─────────────────────────────────────────────────

function CountCardSkeleton() {
    return (
        <div className="animate-pulse flex items-center gap-4 p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2 flex-1">
                <div className="h-7 w-12 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
        </div>
    );
}

function CountCard({
    category,
    count,
    isActive,
    onClick,
}: Readonly<{
    category: VerificationCategory;
    count: number;
    isActive: boolean;
    onClick: () => void;
}>) {
    const Icon = CATEGORY_ICONS[category];
    const colors = CATEGORY_COLORS[category];
    const hasItems = count > 0;

    let stateClass: string;
    if (isActive) {
        stateClass = `${colors.activeBg} ${colors.border} ring-2 ring-blue-400/30 shadow-sm`;
    } else if (hasItems) {
        stateClass = `${colors.bg} ${colors.border} hover:shadow-md hover:scale-[1.01]`;
    } else {
        stateClass = "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800";
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 cursor-pointer text-left w-full ${stateClass}`}
        >
            <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    hasItems ? colors.bg : "bg-gray-100 dark:bg-gray-800"
                }`}
            >
                <Icon
                    className={`h-5 w-5 ${hasItems ? colors.icon : "text-gray-400 dark:text-gray-500"}`}
                />
            </div>
            <div>
                <p
                    className={`text-2xl font-bold ${
                        hasItems
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400 dark:text-gray-500"
                    }`}
                >
                    {count}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {CATEGORY_LABELS[category]}
                </p>
            </div>
            {hasItems && (
                <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    Pending
                </span>
            )}
        </button>
    );
}

// ─── All Caught Up Empty State ───────────────────────────────────────────

function AllCaughtUpState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-5">
                <PartyPopper className="h-9 w-9 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                All caught up!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                No items pending verification. New submissions will appear here
                automatically.
            </p>
        </div>
    );
}

// ─── Table Skeleton ─────────────────────────────────────────────────────

function TableSkeleton({ columns }: Readonly<{ columns: number }>) {
    const colKeys = useMemo(
        () => Array.from({ length: columns }, (_, i) => `sc-${i}`),
        [columns],
    );

    return (
        <div className="animate-pulse">
            <div className="h-12 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg mb-1" />
            {SKELETON_ROWS.map((rowKey) => (
                <div
                    key={rowKey}
                    className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 dark:border-gray-800"
                >
                    <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                    {colKeys.map((ck) => (
                        <div
                            key={ck}
                            className="h-4 rounded bg-gray-200 dark:bg-gray-700"
                            style={{ width: `${80}px` }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── Empty States ────────────────────────────────────────────────────────

function EmptyState({
    category,
    hasFilters,
}: Readonly<{
    category: VerificationCategory;
    hasFilters: boolean;
}>) {
    const Icon = CATEGORY_ICONS[category];

    if (hasFilters) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
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
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                No pending {CATEGORY_LABELS[category].toLowerCase()}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
                All {CATEGORY_LABELS[category].toLowerCase()} have been reviewed
            </p>
        </div>
    );
}

// ─── Sort Header ─────────────────────────────────────────────────────────

function SortHeader({
    label,
    field,
    currentSort,
    currentOrder,
    onSort,
}: Readonly<{
    label: string;
    field: string;
    currentSort: string;
    currentOrder: string;
    onSort: (field: string) => void;
}>) {
    const isActive = currentSort === field;

    let sortIcon: React.ReactNode;
    if (isActive && currentOrder === "ASC") {
        sortIcon = <ArrowUp className="h-3 w-3" />;
    } else if (isActive) {
        sortIcon = <ArrowDown className="h-3 w-3" />;
    } else {
        sortIcon = <ArrowUpDown className="h-3 w-3 opacity-40" />;
    }

    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
            {label}
            {sortIcon}
        </button>
    );
}

// ─── Reject Modal ────────────────────────────────────────────────────────

function RejectModal({
    isOpen,
    onClose,
    onConfirm,
    entityLabel,
    isLoading,
}: Readonly<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    entityLabel: string;
    isLoading: boolean;
}>) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on modal open
            setReason("");
            setError("");
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (reason.trim().length < 5) {
            setError("Rejection reason must be at least 5 characters");
            return;
        }
        setError("");
        onConfirm(reason);
    };

    const handleClose = () => {
        if (isLoading) return;
        setReason("");
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalWrapper isOpen onClose={handleClose}>
            <div className="px-6 py-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Reject {entityLabel}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Send back for corrections
                        </p>
                    </div>
                </div>

                {/* Consequences */}
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 mb-4">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5">
                        This action will:
                    </p>
                    <ul className="space-y-1">
                        <li className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                            <span className="mt-1 h-1 w-1 rounded-full bg-amber-400 flex-shrink-0" />
                            <span>Student will be notified of the rejection</span>
                        </li>
                        <li className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                            <span className="mt-1 h-1 w-1 rounded-full bg-amber-400 flex-shrink-0" />
                            <span>Item will be hidden from the student&apos;s public profile</span>
                        </li>
                        <li className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                            <span className="mt-1 h-1 w-1 rounded-full bg-amber-400 flex-shrink-0" />
                            <span>Student can edit and resubmit for review</span>
                        </li>
                    </ul>
                </div>

                {/* Reason textarea */}
                <div>
                    <label htmlFor="reject-reason" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="reject-reason"
                        rows={3}
                        maxLength={500}
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            if (error) setError("");
                        }}
                        placeholder="Explain what needs to be corrected..."
                        className={`w-full px-3 py-2.5 rounded-lg text-sm border transition-colors resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                            error
                                ? "border-red-300 dark:border-red-700 focus:ring-red-200"
                                : "border-gray-200 dark:border-gray-700 focus:ring-blue-200 dark:focus:ring-blue-800"
                        }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                        {error ? (
                            <p className="text-[11px] text-red-500">{error}</p>
                        ) : (
                            <span />
                        )}
                        <p className="text-[11px] text-gray-400">
                            {reason.length}/500
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || reason.trim().length < 5}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send Back for Corrections
                </button>
            </div>
        </ModalWrapper>
    );
}

// ─── Bulk Action Bar ─────────────────────────────────────────────────────

function BulkActionBar({
    selectedCount,
    onApprove,
    onReject,
    onClear,
    isProcessing,
}: Readonly<{
    selectedCount: number;
    onApprove: () => void;
    onReject: () => void;
    onClear: () => void;
    isProcessing: boolean;
}>) {
    return (
        <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t-2 border-blue-100 dark:border-blue-900 px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
        >
            <div className="flex items-center gap-3 flex-wrap">
                {/* Count badge */}
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        {selectedCount}
                    </span>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    selected
                </span>

                <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* Approve */}
                <button
                    type="button"
                    onClick={onApprove}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="h-4 w-4" />
                    )}
                    Approve All
                </button>

                {/* Reject */}
                <button
                    type="button"
                    onClick={onReject}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    <X className="h-4 w-4" />
                    Reject All
                </button>

                {/* Clear */}
                <button
                    type="button"
                    onClick={onClear}
                    disabled={isProcessing}
                    className="ml-auto text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                >
                    Clear selection
                </button>
            </div>
        </motion.div>
    );
}

// ─── Pagination ──────────────────────────────────────────────────────────

function Pagination({
    page,
    totalPages,
    total,
    limit,
    onPageChange,
}: Readonly<{
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (p: number) => void;
}>) {
    if (totalPages <= 1) return null;

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push("ellipsis-start");
        for (
            let i = Math.max(2, page - 1);
            i <= Math.min(totalPages - 1, page + 1);
            i++
        )
            pages.push(i);
        if (page < totalPages - 2) pages.push("ellipsis-end");
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {start}–{end} of {total}
            </p>
            <div className="flex items-center gap-1">
                {pages.map((p) =>
                    typeof p === "string" ? (
                        <span
                            key={p}
                            className="px-2 text-xs text-gray-400"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p)}
                            className={`min-h-[44px] min-w-[44px] px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                p === page
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            {p}
                        </button>
                    ),
                )}
            </div>
        </div>
    );
}

// ========================
// MAIN COMPONENT
// ========================

export default function VerificationCenter() {
    const navigate = useNavigate();
    const shouldReduce = useReducedMotion();
    const { hasPermission } = usePermissions();
    const canVerify = hasPermission("verification.verify");

    // ─── Verification Settings (hide bypassed categories) ──────────────
    const settingsQuery = useQuery<{ data: { bypass: Record<string, boolean> } }>({
        queryKey: queryKeys.verifications.settings(),
        queryFn: () => CollegeAdminService.getVerificationSettings(),
        staleTime: 5 * 60 * 1000,
    });
    const settingsBypass = settingsQuery.data?.data?.bypass;
    const enabledCategories = useMemo(() => {
        if (!settingsBypass) return VERIFICATION_CATEGORIES;
        return VERIFICATION_CATEGORIES.filter((cat) => {
            // Backend uses singular "experience"; frontend uses plural "experiences"
            const key = cat === "experiences" ? "experience" : cat;
            return !settingsBypass[key];
        });
    }, [settingsBypass]);

    // ─── State ───────────────────────────────────────────────────────────
    const [selectedCategory, setSelectedCategory] = useState<VerificationCategory>("profiles");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<{
        type: "single" | "bulk";
        id?: string;
    } | null>(null);
    const [sheetItem, setSheetItem] = useState<PendingItem | null>(null);

    // Derive active category: use selected if it's still enabled, otherwise first enabled
    const activeCategory: VerificationCategory = enabledCategories.includes(selectedCategory)
        ? selectedCategory
        : (enabledCategories[0] ?? "profiles");

    // ─── Hooks ───────────────────────────────────────────────────────────
    const { counts, isLoading: countsLoading } = useVerificationCounts();

    // Departments for filter dropdown
    const deptQuery = useQuery({
        queryKey: queryKeys.departments.all({ is_active: true, limit: 100 }),
        queryFn: () => CollegeAdminService.getDepartments({ is_active: true, limit: 100 }),
    });
    const deptData = deptQuery.data;
    let departments: { dept_id: string; dept_name: string }[] = [];
    if (Array.isArray(deptData?.data)) departments = deptData.data;
    else if (Array.isArray(deptData)) departments = deptData;

    const {
        items,
        pagination,
        isLoading,
        isFetching,
        search,
        deptId,
        sortBy,
        sortOrder,
        page,
        limit,
        setPage,
        handleSearchChange,
        handleDeptChange,
        handleSortChange,
        handleLimitChange,
    } = useViewPendingItems(activeCategory);

    const { approve, reject, isApproving, isRejecting, processingId } =
        useVerifyItem(activeCategory);

    const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

    const { bulkApprove, bulkReject, isProcessing } = useBulkVerify(
        activeCategory,
        clearSelection,
    );

    // ─── Selection handlers ──────────────────────────────────────────────

    const handleCategoryChange = useCallback(
        (cat: VerificationCategory) => {
            setSelectedCategory(cat);
            setSelectedIds(new Set());
        },
        [],
    );

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        const allIds = items.map((item) => getItemId(item, activeCategory));
        const allSelected = allIds.every((id) => selectedIds.has(id));
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(allIds));
        }
    }, [items, activeCategory, selectedIds]);

    // ─── Reject modal flow ──────────────────────────────────────────────
    const openRejectSingle = useCallback((id: string) => {
        setRejectTarget({ type: "single", id });
        setRejectModalOpen(true);
    }, []);

    const openRejectBulk = useCallback(() => {
        setRejectTarget({ type: "bulk" });
        setRejectModalOpen(true);
    }, []);

    const handleRejectConfirm = useCallback(
        (reason: string) => {
            if (rejectTarget?.type === "single" && rejectTarget.id) {
                reject(rejectTarget.id, reason);
            } else if (rejectTarget?.type === "bulk") {
                bulkReject(Array.from(selectedIds), reason);
            }
            // Modal stays open — will close via useEffect when isRejecting/isProcessing finishes
        },
        [rejectTarget, reject, bulkReject, selectedIds],
    );

    // Close reject modal when mutation completes (true→false transition)
    const isRejectPending = isRejecting || isProcessing;
    const wasRejectingRef = useRef(false);
    useEffect(() => {
        if (wasRejectingRef.current && !isRejectPending) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- async operation completion sync
            setRejectModalOpen(false);
            setRejectTarget(null);
        }
        wasRejectingRef.current = isRejectPending;
    }, [isRejectPending]);

    const handleBulkApprove = useCallback(() => {
        bulkApprove(Array.from(selectedIds));
    }, [selectedIds, bulkApprove]);

    // ─── Navigate to student review ──────────────────────────────────────
    const navigateToReview = useCallback(
        (studentId: string) => {
            navigate(`/college/student/${studentId}?review=true`);
        },
        [navigate],
    );

    // ─── Sheet handlers ──────────────────────────────────────────────────
    const openSheet = useCallback((item: PendingItem) => {
        setSheetItem(item);
    }, []);

    const closeSheet = useCallback(() => {
        setSheetItem(null);
    }, []);

    const handleSheetApprove = useCallback(
        (id: string) => {
            approve(id);
            closeSheet();
        },
        [approve, closeSheet],
    );

    const handleSheetReject = useCallback(
        (id: string) => {
            openRejectSingle(id);
            closeSheet();
        },
        [openRejectSingle, closeSheet],
    );

    // ─── Check states ────────────────────────────────────────────────────
    const allOnPageSelected = useMemo(
        () =>
            items.length > 0 &&
            items.every((item) =>
                selectedIds.has(getItemId(item, activeCategory)),
            ),
        [items, selectedIds, activeCategory],
    );

    const someOnPageSelected = useMemo(
        () =>
            items.some((item) =>
                selectedIds.has(getItemId(item, activeCategory)),
            ),
        [items, selectedIds, activeCategory],
    );

    const hasFilters = !!(search || deptId);
    const rejectEntityLabel =
        rejectTarget?.type === "bulk"
            ? `${selectedIds.size} ${CATEGORY_LABELS[activeCategory].toLowerCase()}`
            : CATEGORY_LABELS[activeCategory].slice(0, -1);

    // ─── Column config per category ──────────────────────────────────────
    const renderRow = useCallback(
        (item: PendingItem, idx: number) => {
            const itemId = getItemId(item, activeCategory);
            const studentId = getStudentId(item, activeCategory);
            const isSelected = selectedIds.has(itemId);

            return (
                <AnimatedRow
                    key={itemId}
                    onClick={() => openSheet(item)}
                    className={`group transition-colors cursor-pointer ${
                        isSelected
                            ? "bg-blue-50/50 dark:bg-blue-900/10"
                            : "hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                    }`}
                >
                    {/* Checkbox */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => toggleSelect(itemId)}
                            className="cursor-pointer"
                            aria-label={isSelected ? "Deselect" : "Select"}
                        >
                            {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                                <Square className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                            )}
                        </button>
                    </td>

                    {/* Row number */}
                    <td className="px-3 py-3 text-xs text-gray-400">
                        {(page - 1) * limit + idx + 1}
                    </td>

                    {/* Student Name + Email (always first data column) */}
                    <td className="px-3 py-3">
                        <button
                            type="button"
                            onClick={() => navigateToReview(studentId)}
                            className="text-left cursor-pointer group/name"
                        >
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover/name:text-blue-600 transition-colors">
                                {getStudentName(item)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {(item as { student_email?: string }).student_email || ""}
                            </p>
                        </button>
                    </td>

                    {/* Category-specific columns */}
                    {activeCategory === "profiles" && (
                        <>
                            <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">
                                {(item as PendingProfile).dept_name}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">
                                {(item as PendingProfile).student_passout_year}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                {formatDate((item as PendingProfile).updated_at)}
                            </td>
                        </>
                    )}

                    {activeCategory === "experiences" && (() => { const exp = item as PendingExperience; const docs = countDocs(item, activeCategory); return (
                        <>
                            <td className="px-3 py-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                                {exp.company_name}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">
                                {exp.position_title}
                            </td>
                            <td className="px-3 py-3">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {exp.employment_type?.replace("_", " ")}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                {exp.dept_name}
                            </td>
                            <td className="px-3 py-3">
                                {docs > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                                        <FileText className="h-3 w-3" /> {docs}
                                    </span>
                                )}
                            </td>
                        </>
                    ); })()}

                    {activeCategory === "achievements" && (() => { const ach = item as PendingAchievement; const docs = countDocs(item, activeCategory); return (
                        <>
                            <td className="px-3 py-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                                {ach.achievement_title}
                            </td>
                            <td className="px-3 py-3">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {ach.achievement_type?.replace("_", " ")}
                                </span>
                            </td>
                            <td className="px-3 py-3">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                    {ach.achievement_level}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {formatDate(ach.achievement_date)}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                {ach.dept_name}
                            </td>
                            <td className="px-3 py-3">
                                {docs > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                                        <FileText className="h-3 w-3" /> {docs}
                                    </span>
                                )}
                            </td>
                        </>
                    ); })()}

                    {activeCategory === "certificates" && (() => { const cert = item as PendingCertificate; const docs = countDocs(item, activeCategory); return (
                        <>
                            <td className="px-3 py-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                                {cert.certificate_name}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">
                                {cert.issuing_organization}
                            </td>
                            <td className="px-3 py-3">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {cert.certificate_type?.replace("_", " ")}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {formatDate(cert.issue_date)}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                {cert.dept_name}
                            </td>
                            <td className="px-3 py-3">
                                {docs > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                                        <FileText className="h-3 w-3" /> {docs}
                                    </span>
                                )}
                            </td>
                        </>
                    ); })()}

                    {/* Actions removed — use bulk action bar or side sheet */}
                </AnimatedRow>
            );
        },
        [
            activeCategory,
            selectedIds,
            page,
            limit,
            toggleSelect,
            navigateToReview,
            openSheet,
        ],
    );

    // ─── Column headers per category ─────────────────────────────────────
    const columnHeaders = useMemo(() => {
        const base = [
            { label: "#", field: "", sortable: false, width: "w-10" },
            { label: "Student", field: "first_name", sortable: true, width: "min-w-[180px]" },
        ];

        switch (activeCategory) {
            case "profiles":
                return [
                    ...base,
                    { label: "Department", field: "dept_name", sortable: false, width: "" },
                    { label: "Year", field: "student_passout_year", sortable: true, width: "w-20" },
                    { label: "Submitted", field: "updated_at", sortable: true, width: "w-28" },
                ];
            case "experiences":
                return [
                    ...base,
                    { label: "Company", field: "company_name", sortable: false, width: "min-w-[120px]" },
                    { label: "Position", field: "position_title", sortable: false, width: "min-w-[120px]" },
                    { label: "Type", field: "", sortable: false, width: "w-24" },
                    { label: "Duration", field: "", sortable: false, width: "w-32" },
                    { label: "Department", field: "", sortable: false, width: "" },
                    { label: "Docs", field: "", sortable: false, width: "w-14" },
                ];
            case "achievements":
                return [
                    ...base,
                    { label: "Title", field: "", sortable: false, width: "min-w-[150px]" },
                    { label: "Type", field: "", sortable: false, width: "w-24" },
                    { label: "Level", field: "", sortable: false, width: "w-24" },
                    { label: "Date", field: "", sortable: false, width: "w-28" },
                    { label: "Department", field: "", sortable: false, width: "" },
                    { label: "Docs", field: "", sortable: false, width: "w-14" },
                ];
            case "certificates":
                return [
                    ...base,
                    { label: "Certificate", field: "", sortable: false, width: "min-w-[150px]" },
                    { label: "Organization", field: "", sortable: false, width: "min-w-[120px]" },
                    { label: "Type", field: "", sortable: false, width: "w-24" },
                    { label: "Issued", field: "", sortable: false, width: "w-28" },
                    { label: "Department", field: "", sortable: false, width: "" },
                    { label: "Docs", field: "", sortable: false, width: "w-14" },
                ];
            default:
                return base;
        }
    }, [activeCategory]);

    // ========================
    // RENDER
    // ========================

    const Wrapper = shouldReduce ? "div" : motion.div;
    const wrapperProps = shouldReduce
        ? {}
        : { variants: fadeInUp, initial: "initial" as const, animate: "animate" as const };

    return (
        <div className="space-y-6">
            {/* ═══════════════════════ Header ═══════════════════════ */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Verification Center
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Review and verify student submissions
                        </p>
                    </div>
                </div>
                {counts.total > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {counts.total} pending
                    </span>
                )}
            </div>

            {/* ═══════════════════════ Count Cards ═══════════════════════ */}
            <Wrapper {...wrapperProps}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {countsLoading
                        ? enabledCategories.map((cat) => (
                              <CountCardSkeleton key={cat} />
                          ))
                        : enabledCategories.map((cat) => (
                              <CountCard
                                  key={cat}
                                  category={cat}
                                  count={counts[cat]}
                                  isActive={activeCategory === cat}
                                  onClick={() => handleCategoryChange(cat)}
                              />
                          ))}
                </div>
            </Wrapper>

            {/* ═══════════════════════ Tab Bar ═══════════════════════ */}
            {!countsLoading && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {counts.total === 0 ? (
                    <AllCaughtUpState />
                ) : (<>
                    {/* Tabs */}
                    <div
                        className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto"
                        role="tablist"
                    >
                        {enabledCategories.map((cat) => {
                            const Icon = CATEGORY_ICONS[cat];
                            const isActive = activeCategory === cat;
                            const count = counts[cat];
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-label={CATEGORY_LABELS[cat]}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                                        isActive
                                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {CATEGORY_LABELS[cat]}
                                    {count > 0 && (
                                        <span
                                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                isActive
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ═══════════════════════ Filters ═══════════════════════ */}
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors"
                            />
                        </div>

                        {/* Department filter */}
                        <div className="relative">
                            <select
                                value={deptId}
                                onChange={(e) => handleDeptChange(e.target.value)}
                                aria-label="Filter by department"
                                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors cursor-pointer min-h-[44px]"
                            >
                                <option value="">All Departments</option>
                                {departments.map((d) => (
                                    <option key={d.dept_id} value={d.dept_id}>
                                        {d.dept_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Per page */}
                        <div className="ml-auto flex items-center gap-2">
                            {isFetching && !isLoading && (
                                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                            )}
                            <div className="relative">
                                <select
                                    value={limit}
                                    onChange={(e) =>
                                        handleLimitChange(Number(e.target.value))
                                    }
                                    aria-label="Items per page"
                                    className="appearance-none pl-3 pr-7 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 focus:outline-none cursor-pointer min-h-[44px]"
                                >
                                    {PAGE_SIZES.map((s) => (
                                        <option key={s} value={s}>
                                            {s} / page
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════ Table ═══════════════════════ */}
                    {isLoading && (
                        <TableSkeleton columns={columnHeaders.length + 1} />
                    )}
                    {!isLoading && items.length === 0 && (
                        <EmptyState category={activeCategory} hasFilters={hasFilters} />
                    )}
                    {!isLoading && items.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/80 dark:bg-gray-800/50">
                                        {/* Checkbox header */}
                                        <th scope="col" className="px-4 py-3 w-10">
                                            <button
                                                type="button"
                                                onClick={toggleSelectAll}
                                                className="cursor-pointer"
                                                aria-label="Select all"
                                            >
                                                {allOnPageSelected && (
                                                    <CheckSquare className="h-4 w-4 text-blue-600" />
                                                )}
                                                {!allOnPageSelected && someOnPageSelected && (
                                                    <Minus className="h-4 w-4 text-blue-400" />
                                                )}
                                                {!allOnPageSelected && !someOnPageSelected && (
                                                    <Square className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                                )}
                                            </button>
                                        </th>
                                        {columnHeaders.map((col) => (
                                            <th
                                                scope="col"
                                                key={col.label}
                                                className={`px-3 py-3 text-left ${col.width}`}
                                            >
                                                {col.sortable ? (
                                                    <SortHeader
                                                        label={col.label}
                                                        field={col.field}
                                                        currentSort={sortBy}
                                                        currentOrder={sortOrder}
                                                        onSort={handleSortChange}
                                                    />
                                                ) : (
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                        {col.label}
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <AnimatedTableBody>
                                    {items.map((item, idx) => renderRow(item, idx))}
                                </AnimatedTableBody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <Pagination
                        page={page}
                        totalPages={pagination.totalPages}
                        total={pagination.total}
                        limit={limit}
                        onPageChange={setPage}
                    />

                    {/* ═══════════════ Bulk Action Bar ═══════════════ */}
                    <AnimatePresence>
                        {canVerify && selectedIds.size > 0 && (
                            <BulkActionBar
                                selectedCount={selectedIds.size}
                                onApprove={handleBulkApprove}
                                onReject={openRejectBulk}
                                onClear={clearSelection}
                                isProcessing={isProcessing}
                            />
                        )}
                    </AnimatePresence>
                </>)}
                </div>
            )}

            {/* ═══════════════════════ Reject Modal ═══════════════════════ */}
            <RejectModal
                isOpen={rejectModalOpen}
                onClose={() => {
                    setRejectModalOpen(false);
                    setRejectTarget(null);
                }}
                onConfirm={handleRejectConfirm}
                entityLabel={rejectEntityLabel}
                isLoading={isRejecting || isProcessing}
            />

            {/* ═══════════════════════ Detail Sheet ═══════════════════════ */}
            <PendingItemSheet
                open={!!sheetItem}
                onClose={closeSheet}
                item={sheetItem}
                category={activeCategory}
                onApprove={canVerify ? handleSheetApprove : undefined}
                onReject={canVerify ? handleSheetReject : undefined}
                isApproving={isApproving}
                isRejecting={isRejecting}
                processingId={processingId}
            />
        </div>
    );
}
