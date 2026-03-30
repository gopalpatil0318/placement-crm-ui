import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    X,
    Loader2,
    SlidersHorizontal,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    AlertTriangle,
    Pencil,
    Award,
    Users,
    Building2,
    BarChart3,
    TrendingUp,
    TrendingDown,
    ShieldCheck,
    FileText,
    ExternalLink,
    Briefcase,
    Clock,
    IndianRupee,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import {
    useViewPlacements,
    type PlacementListItem,
    type PlacementStats,
} from "@/hooks/collegeadmin/placements/useViewPlacements";
import { useUpdatePlacement } from "@/hooks/collegeadmin/placements/useUpdatePlacement";
import { useUpdatePlacementStatus } from "@/hooks/collegeadmin/placements/useUpdatePlacementStatus";
import { useVerifyOfferLetter } from "@/hooks/collegeadmin/placements/useVerifyOfferLetter";
import {
    PLACEMENT_STATUS_COLORS,
    PLACEMENT_STATUS_LABELS,
    PLACEMENT_TYPE_OPTIONS,
    PLACEMENT_TYPE_LABELS,
    PLACEMENT_STATUS_TRANSITIONS,
    type PlacementStatus,
    type PlacementType,
} from "@/validators/PlacementSchema";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const STATUS_MODAL_CONFIG: Record<
    string,
    {
        title: string;
        iconBg: string;
        iconColor: string;
        boxBg: string;
        boxBorder: string;
        boxText: string;
        confirmBg: string;
        consequences: string[];
    }
> = {
    accepted: {
        title: "Accept Placement",
        iconBg: "bg-amber-50 dark:bg-amber-900/20",
        iconColor: "text-amber-600 dark:text-amber-400",
        boxBg: "bg-amber-50 dark:bg-amber-900/20",
        boxBorder: "border-amber-200 dark:border-amber-800",
        boxText: "text-amber-700 dark:text-amber-400",
        confirmBg: "bg-amber-600 hover:bg-amber-700",
        consequences: [
            "Acceptance status will be set to 'accepted'",
            "Student will be marked as having accepted the offer",
            "You can still update to 'joined' or 'cancelled' later",
        ],
    },
    joined: {
        title: "Mark as Joined",
        iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        boxBg: "bg-emerald-50 dark:bg-emerald-900/20",
        boxBorder: "border-emerald-200 dark:border-emerald-800",
        boxText: "text-emerald-700 dark:text-emerald-400",
        confirmBg: "bg-emerald-600 hover:bg-emerald-700",
        consequences: [
            "Student will be marked as having joined the company",
            "Acceptance status will be set to 'accepted'",
            "Can be cancelled if the student leaves later",
        ],
    },
    rejected: {
        title: "Reject Placement",
        iconBg: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
        boxBg: "bg-red-50 dark:bg-red-900/20",
        boxBorder: "border-red-200 dark:border-red-800",
        boxText: "text-red-700 dark:text-red-400",
        confirmBg: "bg-red-600 hover:bg-red-700",
        consequences: [
            "Student's offer will be marked as rejected",
            "Acceptance status will be set to 'rejected'",
            "This action is permanent and cannot be reversed",
        ],
    },
    cancelled: {
        title: "Cancel Placement",
        iconBg: "bg-gray-100 dark:bg-gray-800",
        iconColor: "text-gray-600 dark:text-gray-400",
        boxBg: "bg-gray-50 dark:bg-gray-800/60",
        boxBorder: "border-gray-200 dark:border-gray-700",
        boxText: "text-gray-700 dark:text-gray-300",
        confirmBg: "bg-gray-600 hover:bg-gray-700",
        consequences: [
            "Placement record will be cancelled",
            "This action is permanent and cannot be reversed",
            "Student can receive a new placement for a different application",
        ],
    },
};

// ========================
// HELPERS
// ========================

const formatPackage = (value: number | null): string => {
    if (value === null || value === undefined) return "—";
    if (value >= 100000) return `${(value / 100000).toFixed(2)} LPA`;
    return `₹${value.toLocaleString("en-IN")}`;
};

const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
};

// ========================
// STATUS BADGE
// ========================

const StatusBadge = ({ status }: { status: PlacementStatus }) => {
    const colors = PLACEMENT_STATUS_COLORS[status];
    const label = PLACEMENT_STATUS_LABELS[status];
    if (!colors) return <span className="text-xs text-gray-500">{status}</span>;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {label}
        </span>
    );
};

// ========================
// PLACEMENT TYPE BADGE
// ========================

const TypeBadge = ({ type }: { type: PlacementType }) => {
    const colors: Record<PlacementType, string> = {
        "full-time": "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
        internship: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
        both: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[type] || "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
            {PLACEMENT_TYPE_LABELS[type] || type}
        </span>
    );
};

// ========================
// VERIFIED BADGE
// ========================

const VerifiedBadge = ({ verified }: { verified: boolean }) => (
    <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
            verified
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
        }`}
    >
        {verified ? (
            <ShieldCheck className="h-3 w-3" />
        ) : (
            <FileText className="h-3 w-3" />
        )}
        {verified ? "Verified" : "Unverified"}
    </span>
);

// ========================
// STATS DASHBOARD
// ========================

const StatsDashboard = ({
    stats,
    loading,
}: {
    stats: PlacementStats | null;
    loading: boolean;
}) => {
    if (loading) return <SkeletonStats />;
    if (!stats) return null;

    const cards = [
        {
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-100 dark:border-blue-900/40",
            iconBg: "bg-blue-100 dark:bg-blue-900/30",
            iconColor: "text-blue-600 dark:text-blue-400",
            value: stats.total_placements,
            label: "Total Placements",
            Icon: Award,
        },
        {
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            border: "border-emerald-100 dark:border-emerald-900/40",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            value: stats.unique_students,
            label: "Students Placed",
            Icon: Users,
        },
        {
            bg: "bg-purple-50 dark:bg-purple-900/20",
            border: "border-purple-100 dark:border-purple-900/40",
            iconBg: "bg-purple-100 dark:bg-purple-900/30",
            iconColor: "text-purple-600 dark:text-purple-400",
            value: stats.unique_companies,
            label: "Companies",
            Icon: Building2,
        },
        {
            bg: "bg-orange-50 dark:bg-orange-900/20",
            border: "border-orange-100 dark:border-orange-900/40",
            iconBg: "bg-orange-100 dark:bg-orange-900/30",
            iconColor: "text-orange-600 dark:text-orange-400",
            value: stats.avg_package !== null ? formatPackage(stats.avg_package) : "—",
            label: "Avg Package",
            Icon: BarChart3,
        },
        {
            bg: "bg-cyan-50 dark:bg-cyan-900/20",
            border: "border-cyan-100 dark:border-cyan-900/40",
            iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
            iconColor: "text-cyan-600 dark:text-cyan-400",
            value: stats.highest_package !== null ? formatPackage(stats.highest_package) : "—",
            label: "Highest",
            Icon: TrendingUp,
        },
        {
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-100 dark:border-amber-900/40",
            iconBg: "bg-amber-100 dark:bg-amber-900/30",
            iconColor: "text-amber-600 dark:text-amber-400",
            value: stats.lowest_package !== null ? formatPackage(stats.lowest_package) : "—",
            label: "Lowest",
            Icon: TrendingDown,
        },
        {
            bg: "bg-teal-50 dark:bg-teal-900/20",
            border: "border-teal-100 dark:border-teal-900/40",
            iconBg: "bg-teal-100 dark:bg-teal-900/30",
            iconColor: "text-teal-600 dark:text-teal-400",
            value: stats.verified_offers,
            label: "Verified Offers",
            Icon: ShieldCheck,
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {cards.map(({ bg, border, iconBg, iconColor, value, label, Icon }) => (
                <div key={label} className={`rounded-xl border p-3 ${bg} ${border} flex items-center gap-2.5`}>
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                        <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-base font-bold ${iconColor} truncate`}>{value}</p>
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SkeletonStats = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
            <div key={`stat-skeleton-${String(i)}`} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 p-3 flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                <div className="space-y-1">
                    <div className="h-4 w-10 bg-gray-100 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-14 bg-gray-50 dark:bg-gray-800 rounded" />
                </div>
            </div>
        ))}
    </div>
);

// ========================
// STATUS PILLS
// ========================

const StatusPills = ({
    stats,
    activeFilter,
    onFilter,
}: {
    stats: PlacementStats | null;
    activeFilter: string;
    onFilter: (status: string) => void;
}) => {
    if (!stats) return null;

    const pills: { key: string; label: string; count: number }[] = [
        { key: "offered", label: "Offered", count: stats.offered_count },
        { key: "accepted", label: "Accepted", count: stats.accepted_count },
        { key: "joined", label: "Joined", count: stats.joined_count },
        { key: "rejected", label: "Rejected", count: stats.rejected_count },
        { key: "cancelled", label: "Cancelled", count: stats.cancelled_count },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={() => onFilter("")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    !activeFilter
                        ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
            >
                All
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    !activeFilter ? "bg-white/20 text-white dark:bg-gray-900/30 dark:text-gray-900" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                    {stats.total_placements}
                </span>
            </button>

            {pills.map(({ key, label, count }) => {
                const isActive = activeFilter === key;
                const colors = PLACEMENT_STATUS_COLORS[key as PlacementStatus];

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onFilter(isActive ? "" : key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isActive
                                ? `${colors?.bg} ${colors?.text} ring-2 ring-offset-1 ring-current shadow-sm dark:ring-offset-gray-900`
                                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        {label}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                                ? "bg-white/60 dark:bg-white/20 text-current"
                                : "bg-gray-200/80 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}>
                            {count}
                        </span>
                    </button>
                );
            })}

            {/* Verified count pill */}
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="h-3 w-3" />
                {stats.verified_offers} Verified
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
    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
            {label}
            {(() => {
                if (!isActive) return <ArrowUpDown className="h-3 w-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500" />;
                if (currentOrder === "asc") return <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
                return <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
            })()}
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
            <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map((p, idx) =>
                p === "ellipsis" ? (
                    <span key={`ell-${idx}`} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">...</span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        aria-current={p === page ? "page" : undefined}
                        className={`min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition ${
                            p === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        } disabled:cursor-not-allowed`}
                    >
                        {p}
                    </button>
                ),
            )}
            <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Next page">
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
            <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No placements match your filters</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search, status, type, or year filter.</p>
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <Award className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No placement records yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Create placement records for students who have been selected or offered positions.
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
                <td className="px-4 py-3.5 w-10"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5" /></td>
                <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-36" />
                        <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-48" />
                    </div>
                </td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-24" /></td>
                <td className="px-4 py-3.5"><div className="h-5 bg-gray-50 dark:bg-gray-800 rounded-full w-16" /></td>
                <td className="px-4 py-3.5"><div className="h-5 bg-gray-50 dark:bg-gray-800 rounded w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-5 bg-gray-50 dark:bg-gray-800 rounded-full w-16" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-24" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-8" /></td>
            </tr>
        ))}
    </>
);

// ========================
// EDIT PLACEMENT MODAL
// ========================

const EditPlacementModal = ({
    placement,
    onClose,
    onSuccess,
}: {
    placement: PlacementListItem;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleSubmit, loadPlacement, reset } =
        useUpdatePlacement(onSuccess);

    useEffect(() => {
        loadPlacement(placement);
    }, [placement, loadPlacement]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const showFulltime =
        formData.placement_type === "full-time" ||
        formData.placement_type === "both";
    const showInternship =
        formData.placement_type === "internship" ||
        formData.placement_type === "both";

    return (
        <ModalWrapper
            isOpen
            onClose={handleClose}
            disabled={loading}
            title="Edit Placement"
            titleIcon={<div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center"><Pencil className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>}
            size="xl"
        >
            <div className="px-6 py-5 space-y-4">
                {/* Student info banner */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{placement.student_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{placement.student_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{placement.company_name} · {placement.job_title}</p>
                    </div>
                </div>

                {/* Placement Type */}
                <FloatingSelect
                    label="Placement Type"
                    name="placement_type"
                    value={formData.placement_type}
                    onChange={handleChange}
                    disabled={loading}
                    options={PLACEMENT_TYPE_OPTIONS.map((t) => ({ value: t, label: PLACEMENT_TYPE_LABELS[t] }))}
                />

                {showFulltime && (
                    <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/40">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Full-Time</p>
                        <div className="grid grid-cols-2 gap-3">
                            <FloatingInput
                                label="Package (₹)"
                                name="fulltime_package"
                                type="number"
                                inputMode="numeric"
                                value={formData.fulltime_package}
                                onChange={handleChange}
                                placeholder="(clear to remove)"
                                disabled={loading}
                                error={errors.fulltime_package}
                            />
                            <FloatingInput
                                label="Designation"
                                name="fulltime_designation"
                                value={formData.fulltime_designation}
                                onChange={handleChange}
                                maxLength={200}
                                disabled={loading}
                            />
                        </div>
                        <FloatingInput
                            label="Joining Date"
                            name="fulltime_joining_date"
                            type="date"
                            value={formData.fulltime_joining_date}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                )}

                {showInternship && (
                    <div className="space-y-3 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/40">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Internship</p>
                        <div className="grid grid-cols-2 gap-3">
                            <FloatingInput
                                label="Stipend (₹/month)"
                                name="internship_stipend"
                                type="number"
                                inputMode="numeric"
                                value={formData.internship_stipend}
                                onChange={handleChange}
                                disabled={loading}
                                error={errors.internship_stipend}
                            />
                            <FloatingInput
                                label="Duration"
                                name="internship_duration"
                                value={formData.internship_duration}
                                onChange={handleChange}
                                maxLength={100}
                                disabled={loading}
                            />
                        </div>
                        <FloatingInput
                            label="Start Date"
                            name="internship_start_date"
                            type="date"
                            value={formData.internship_start_date}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                )}

                {/* Offer letter URL */}
                <FloatingInput
                    label="Offer Letter URL"
                    name="offer_letter_url"
                    type="url"
                    value={formData.offer_letter_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    disabled={loading}
                />

                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50">Cancel</button>
                    <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// STATUS CHANGE MODAL
// ========================

const StatusChangeModal = ({
    placement,
    newStatus,
    onClose,
    onSuccess,
}: {
    placement: PlacementListItem;
    newStatus: PlacementStatus;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { loading, updateStatus } = useUpdatePlacementStatus(onSuccess);
    const [remarks, setRemarks] = useState("");
    const config = STATUS_MODAL_CONFIG[newStatus];

    if (!config) return null;

    return (
        <ModalWrapper
            isOpen
            onClose={onClose}
            disabled={loading}
            title={config.title}
            titleIcon={<div className={`h-9 w-9 rounded-xl ${config.iconBg} flex items-center justify-center`}><AlertTriangle className={`h-5 w-5 ${config.iconColor}`} /></div>}
            size="md"
        >
            <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Are you sure you want to change the status of <span className="font-semibold">{placement.student_name}</span>&apos;s
                    placement at <span className="font-semibold">{placement.company_name}</span> to{" "}
                    <span className="font-semibold">{PLACEMENT_STATUS_LABELS[newStatus]}</span>?
                </p>

                <div className={`rounded-xl border p-4 ${config.boxBg} ${config.boxBorder}`}>
                    <p className={`text-xs font-semibold ${config.boxText} mb-2`}>This action will:</p>
                    <ul className={`space-y-1 text-xs ${config.boxText}`}>
                        {config.consequences.map((c) => (
                            <li key={c} className="flex items-start gap-1.5">
                                <span className="mt-0.5">•</span>
                                <span>{c}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <FloatingTextarea
                    label="Remarks (optional)"
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    maxLength={2000}
                    disabled={loading}
                />

                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50">Cancel</button>
                    <button
                        type="button"
                        onClick={() => updateStatus(placement.placement_id, newStatus, remarks)}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${config.confirmBg}`}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Updating..." : config.title}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// VERIFY OFFER MODAL
// ========================

const VerifyOfferModal = ({
    placement,
    onClose,
    onSuccess,
}: {
    placement: PlacementListItem;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { loading, verifyOffer } = useVerifyOfferLetter(onSuccess);
    const [remarks, setRemarks] = useState("");
    const willVerify = !placement.offer_letter_verified;

    return (
        <ModalWrapper
            isOpen
            onClose={onClose}
            disabled={loading}
            title={willVerify ? "Verify Offer Letter" : "Remove Verification"}
            titleIcon={<div className={`h-9 w-9 rounded-xl ${willVerify ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-100 dark:bg-gray-800"} flex items-center justify-center`}><ShieldCheck className={`h-5 w-5 ${willVerify ? "text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400"}`} /></div>}
            size="md"
        >
            <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{placement.student_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{placement.student_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{placement.company_name} · {placement.job_title}</p>
                    </div>
                </div>

                {placement.offer_letter_url && /^https?:\/\//i.test(placement.offer_letter_url) ? (
                    <a
                        href={placement.offer_letter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                    >
                        <ExternalLink className="h-4 w-4" />
                        View Offer Letter
                    </a>
                ) : (
                    <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 text-sm text-amber-700 dark:text-amber-400">
                        No offer letter URL uploaded yet.
                    </div>
                )}

                <FloatingTextarea
                    label="Remarks (optional)"
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    maxLength={2000}
                    disabled={loading}
                />

                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50">Cancel</button>
                    <button
                        type="button"
                        onClick={() => verifyOffer(placement.placement_id, willVerify, remarks)}
                        disabled={loading || (!placement.offer_letter_url && willVerify)}
                        className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
                            willVerify ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-600 hover:bg-gray-700"
                        }`}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {(() => {
                            if (loading) return "Processing...";
                            return willVerify ? "Verify" : "Remove Verification";
                        })()}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// PLACEMENT ROW (expandable)
// ========================

const PlacementRow = ({
    placement,
    index,
    isExpanded,
    onToggleExpand,
    onEdit,
    onStatusChange,
    onVerify,
    onNavigate,
}: {
    placement: PlacementListItem;
    index: number;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    onEdit: (p: PlacementListItem) => void;
    onStatusChange: (p: PlacementListItem, status: PlacementStatus) => void;
    onVerify: (p: PlacementListItem) => void;
    onNavigate: (p: PlacementListItem) => void;
}) => {
    const transitions = PLACEMENT_STATUS_TRANSITIONS[placement.placement_status as PlacementStatus] || [];
    const isTerminal = transitions.length === 0;

    return (
        <>
            <tr
                className={`group border-b border-gray-50 dark:border-gray-800 transition-colors cursor-pointer ${
                    isExpanded ? "bg-gray-50/50 dark:bg-gray-800/30" : "hover:bg-blue-50/40 dark:hover:bg-blue-900/10"
                }`}
                onClick={() => onNavigate(placement)}
            >
                <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-sm w-10">{index}</td>

                {/* Student + email + dept */}
                <td className="px-4 py-3.5">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {placement.student_name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {placement.enrollment_number} · {placement.dept_name}
                        </p>
                    </div>
                </td>

                {/* Company + Job */}
                <td className="px-4 py-3.5">
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{placement.company_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{placement.job_title}</p>
                    </div>
                </td>

                {/* Type */}
                <td className="px-4 py-3.5">
                    <TypeBadge type={placement.placement_type as PlacementType} />
                </td>

                {/* Package/Stipend */}
                <td className="px-4 py-3.5">
                    <div>
                        {placement.fulltime_package !== null && (
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                {formatPackage(placement.fulltime_package)}
                            </p>
                        )}
                        {placement.internship_stipend !== null && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                ₹{placement.internship_stipend?.toLocaleString("en-IN")}/mo
                            </p>
                        )}
                        {placement.fulltime_package === null && placement.internship_stipend === null && (
                            <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                        )}
                    </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                    <StatusBadge status={placement.placement_status as PlacementStatus} />
                </td>

                {/* Verified */}
                <td className="px-4 py-3.5">
                    <VerifiedBadge verified={placement.offer_letter_verified} />
                </td>

                {/* Date */}
                <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(placement.created_at)}</span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                        {!isTerminal && (
                            <button
                                type="button"
                                onClick={() => onEdit(placement)}
                                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                                aria-label={`Edit ${placement.student_name}`}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => onToggleExpand(placement.placement_id)}
                            className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition"
                            aria-label={isExpanded ? "Collapse details" : "Expand details"}
                        >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expanded detail panel */}
            {isExpanded && (
                <PlacementDetailPanel
                    placement={placement}
                    onStatusChange={(s) => onStatusChange(placement, s)}
                    onVerify={() => onVerify(placement)}
                    onEdit={() => onEdit(placement)}
                />
            )}
        </>
    );
};

// ========================
// PLACEMENT DETAIL PANEL
// ========================

const PlacementDetailPanel = ({
    placement,
    onStatusChange,
    onVerify,
    onEdit,
}: {
    placement: PlacementListItem;
    onStatusChange: (status: PlacementStatus) => void;
    onVerify: () => void;
    onEdit: () => void;
}) => {
    const transitions = PLACEMENT_STATUS_TRANSITIONS[placement.placement_status as PlacementStatus] || [];
    const isTerminal = transitions.length === 0;

    const STATUS_ACTION_COLORS: Record<string, { bg: string; text: string; hover: string }> = {
        accepted: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", hover: "hover:bg-amber-100 dark:hover:bg-amber-900/30" },
        joined: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900/30" },
        rejected: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", hover: "hover:bg-red-100 dark:hover:bg-red-900/30" },
        cancelled: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", hover: "hover:bg-gray-200 dark:hover:bg-gray-700" },
    };

    return (
        <tr className="bg-gray-50/50 dark:bg-gray-800/30">
            <td colSpan={9} className="px-4 py-0">
                <div className="py-4 pl-6 border-l-2 border-blue-200 dark:border-blue-800 ml-4 space-y-4">
                    {/* Student & company info */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{placement.student_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{placement.student_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{placement.student_email} · {placement.dept_name} · {placement.passout_year}</p>
                        </div>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                            <StatusBadge status={placement.placement_status as PlacementStatus} />
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Type</p>
                            <TypeBadge type={placement.placement_type as PlacementType} />
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Package</p>
                            <p className={`text-base font-bold ${placement.fulltime_package !== null ? "text-emerald-700 dark:text-emerald-400" : "text-gray-300 dark:text-gray-600"}`}>
                                {formatPackage(placement.fulltime_package)}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Offer Letter</p>
                            <VerifiedBadge verified={placement.offer_letter_verified} />
                        </div>
                    </div>

                    {/* Full-time details */}
                    {(placement.fulltime_designation || placement.fulltime_joining_date) && (
                        <div className="flex flex-wrap gap-3">
                            {placement.fulltime_designation && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                                    <Briefcase className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Designation:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{placement.fulltime_designation}</span>
                                </div>
                            )}
                            {placement.fulltime_joining_date && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                                    <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Joining:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(placement.fulltime_joining_date)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Internship details */}
                    {(placement.internship_stipend !== null || placement.internship_duration || placement.internship_start_date) && (
                        <div className="flex flex-wrap gap-3">
                            {placement.internship_stipend !== null && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                                    <IndianRupee className="h-3.5 w-3.5 text-purple-400" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Stipend:</span>
                                    <span className="text-sm text-purple-700 dark:text-purple-400">₹{placement.internship_stipend.toLocaleString("en-IN")}/mo</span>
                                </div>
                            )}
                            {placement.internship_duration && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                                    <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{placement.internship_duration}</span>
                                </div>
                            )}
                            {placement.internship_start_date && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                                    <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Start:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(placement.internship_start_date)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Offer letter link */}
                    {placement.offer_letter_url && /^https?:\/\//i.test(placement.offer_letter_url) && (
                        <a
                            href={placement.offer_letter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Offer Letter
                        </a>
                    )}

                    {/* Remarks */}
                    {placement.remarks && (
                        <div className="rounded-xl border border-blue-100 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-900/10 p-4">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1.5">Remarks</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{placement.remarks}</p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex-wrap">
                        {!isTerminal && (
                            <button
                                type="button"
                                onClick={onEdit}
                                className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onVerify}
                            className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                        >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {placement.offer_letter_verified ? "Un-verify" : "Verify Offer"}
                        </button>
                        {transitions.map((status) => {
                            const colors = STATUS_ACTION_COLORS[status] || { bg: "bg-gray-100", text: "text-gray-700", hover: "hover:bg-gray-200" };
                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => onStatusChange(status)}
                                    className={`min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${colors.bg} ${colors.text} ${colors.hover}`}
                                >
                                    {PLACEMENT_STATUS_LABELS[status]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </td>
        </tr>
    );
};

// ========================
// MAIN COMPONENT
// ========================

const PlacementManager = () => {
    const navigate = useNavigate();
    const {
        placements,
        stats,
        loading,
        error,
        pagination,
        search,
        placementStatus,
        placementType,
        acceptanceStatus,
        offerLetterVerified,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleSortChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        handleAcceptanceFilterChange,
        handleVerifiedFilterChange,
        clearFilters,
        refresh,
    } = useViewPlacements();

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingPlacement, setEditingPlacement] = useState<PlacementListItem | null>(null);
    const [statusChangeModal, setStatusChangeModal] = useState<{ placement: PlacementListItem; status: PlacementStatus } | null>(null);
    const [verifyModal, setVerifyModal] = useState<PlacementListItem | null>(null);

    const validExpandedId = expandedId && placements.some(p => p.placement_id === expandedId) ? expandedId : null;

    const toggleExpand = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleSuccess = useCallback(() => {
        setEditingPlacement(null);
        setStatusChangeModal(null);
        setVerifyModal(null);
        refresh();
    }, [refresh]);

    const handleNavigate = useCallback(
        (p: PlacementListItem) => {
            navigate(`/college/job/${p.job_id}`);
        },
        [navigate],
    );

    const hasFilters = !!(search || placementStatus || placementType || acceptanceStatus || offerLetterVerified);

    const startEntry = placements.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    // Error state
    if (error && !loading && placements.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">Failed to load placements</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                <button type="button" onClick={() => void refresh()} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats dashboard */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="px-6 pt-5 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Placement Dashboard</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    All batches
                                </p>
                            </div>
                        </div>
                    </div>
                    <StatsDashboard stats={stats} loading={loading} />
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                {/* Status pills */}
                <div className="px-6 pt-5 pb-3">
                    <StatusPills
                        stats={stats}
                        activeFilter={placementStatus}
                        onFilter={handleStatusFilterChange}
                    />
                </div>

                {/* Filter bar */}
                <div className="px-6 py-3 border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search students, companies..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                maxLength={200}
                                aria-label="Search placements"
                                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                            />
                        </div>

                        {/* Type filter */}
                        <select
                            value={placementType}
                            onChange={(e) => handleTypeFilterChange(e.target.value)}
                            aria-label="Filter by placement type"
                            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none"
                        >
                            <option value="">All Types</option>
                            {PLACEMENT_TYPE_OPTIONS.map((t) => (
                                <option key={t} value={t}>{PLACEMENT_TYPE_LABELS[t]}</option>
                            ))}
                        </select>

                        {/* Acceptance filter */}
                        <select
                            value={acceptanceStatus}
                            onChange={(e) => handleAcceptanceFilterChange(e.target.value)}
                            aria-label="Filter by acceptance status"
                            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none"
                        >
                            <option value="">All Acceptance</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* Verified filter */}
                        <select
                            value={offerLetterVerified}
                            onChange={(e) => handleVerifiedFilterChange(e.target.value)}
                            aria-label="Filter by offer letter verification"
                            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none"
                        >
                            <option value="">All Verification</option>
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </select>

                        {/* Page size */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ml-auto">
                            Show
                            <select
                                value={pagination.limit}
                                onChange={(e) => handleLimitChange(Number(e.target.value))}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

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

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 dark:bg-gray-800/50 text-left text-gray-500 dark:text-gray-400">
                                <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-10">#</th>
                                <th scope="col" className="px-4 py-3">
                                    <SortHeader label="Student" field="student_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    <SortHeader label="Company" field="company_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                </th>
                                <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-4 py-3">
                                    <SortHeader label="Package" field="fulltime_package" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    <SortHeader label="Status" field="placement_status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                </th>
                                <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Verified</th>
                                <th scope="col" className="px-4 py-3">
                                    <SortHeader label="Date" field="created_at" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                </th>
                                <th scope="col" className="px-4 py-3 w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                if (loading) return <SkeletonTable />;
                                if (placements.length > 0) {
                                    return placements.map((p, i) => (
                                        <PlacementRow
                                            key={p.placement_id}
                                            placement={p}
                                            index={(pagination.page - 1) * pagination.limit + i + 1}
                                            isExpanded={validExpandedId === p.placement_id}
                                            onToggleExpand={toggleExpand}
                                            onEdit={setEditingPlacement}
                                            onStatusChange={(placement, status) => setStatusChangeModal({ placement, status })}
                                            onVerify={setVerifyModal}
                                            onNavigate={handleNavigate}
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

                {/* Mobile card layout */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {(() => {
                        if (loading) {
                            return Array.from({ length: 6 }).map((_, i) => (
                                <div key={`mob-skel-${String(i)}`} className="p-4 animate-pulse space-y-2">
                                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-36" />
                                    <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-48" />
                                    <div className="flex gap-2 mt-2">
                                        <div className="h-5 bg-gray-50 dark:bg-gray-800 rounded-full w-16" />
                                        <div className="h-5 bg-gray-50 dark:bg-gray-800 rounded-full w-20" />
                                    </div>
                                </div>
                            ));
                        }
                        if (placements.length > 0) {
                            return placements.map((p) => (
                                <button
                                    key={p.placement_id}
                                    type="button"
                                    onClick={() => handleNavigate(p)}
                                    className="w-full text-left p-4 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.student_name}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{p.enrollment_number} · {p.dept_name}</p>
                                        </div>
                                        <StatusBadge status={p.placement_status as PlacementStatus} />
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Building2 className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{p.company_name} · {p.job_title}</span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <TypeBadge type={p.placement_type as PlacementType} />
                                        <VerifiedBadge verified={p.offer_letter_verified} />
                                        {p.fulltime_package !== null && (
                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{formatPackage(p.fulltime_package)}</span>
                                        )}
                                        {p.internship_stipend !== null && (
                                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">₹{p.internship_stipend.toLocaleString("en-IN")}/mo</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">{formatDate(p.created_at)}</p>
                                </button>
                            ));
                        }
                        return <EmptyState hasFilters={hasFilters} />;
                    })()}
                </div>

                {/* Pagination footer */}
                {!loading && placements.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startEntry}–{endEntry}</span> of{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span> placements
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

            {/* Modals */}
            {editingPlacement && (
                <EditPlacementModal
                    placement={editingPlacement}
                    onClose={() => setEditingPlacement(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {statusChangeModal && (
                <StatusChangeModal
                    placement={statusChangeModal.placement}
                    newStatus={statusChangeModal.status}
                    onClose={() => setStatusChangeModal(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {verifyModal && (
                <VerifyOfferModal
                    placement={verifyModal}
                    onClose={() => setVerifyModal(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default PlacementManager;
