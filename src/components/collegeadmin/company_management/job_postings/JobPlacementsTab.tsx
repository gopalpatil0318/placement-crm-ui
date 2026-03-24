import { useState, useCallback, useEffect, useMemo } from "react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
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
    Plus,
    Pencil,
    Award,
    Users,
    BarChart3,
    TrendingUp,
    ShieldCheck,
    FileText,
    ExternalLink,
    Briefcase,
    GraduationCap,
    Clock,
    IndianRupee,
} from "lucide-react";
import {
    useViewPlacements,
    type PlacementListItem,
    type PlacementStats,
} from "@/hooks/collegeadmin/placements/useViewPlacements";
import { useCreatePlacement } from "@/hooks/collegeadmin/placements/useCreatePlacement";
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
import {
    useApplicationPicker,
    type PickerApplication,
} from "@/hooks/collegeadmin/company_management/applications/useApplicationPicker";

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
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        boxBg: "bg-amber-50",
        boxBorder: "border-amber-200",
        boxText: "text-amber-700",
        confirmBg: "bg-amber-600 hover:bg-amber-700",
        consequences: [
            "Acceptance status will be set to 'accepted'",
            "Student will be marked as having accepted the offer",
            "You can still update to 'joined' or 'cancelled' later",
        ],
    },
    joined: {
        title: "Mark as Joined",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        boxBg: "bg-emerald-50",
        boxBorder: "border-emerald-200",
        boxText: "text-emerald-700",
        confirmBg: "bg-emerald-600 hover:bg-emerald-700",
        consequences: [
            "Student will be marked as having joined the company",
            "Acceptance status will be set to 'accepted'",
            "Can be cancelled if the student leaves later",
        ],
    },
    rejected: {
        title: "Reject Placement",
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        boxBg: "bg-red-50",
        boxBorder: "border-red-200",
        boxText: "text-red-700",
        confirmBg: "bg-red-600 hover:bg-red-700",
        consequences: [
            "Student's offer will be marked as rejected",
            "Acceptance status will be set to 'rejected'",
            "This action is permanent and cannot be reversed",
        ],
    },
    cancelled: {
        title: "Cancel Placement",
        iconBg: "bg-gray-100",
        iconColor: "text-gray-600",
        boxBg: "bg-gray-50",
        boxBorder: "border-gray-200",
        boxText: "text-gray-700",
        confirmBg: "bg-gray-600 hover:bg-gray-700",
        consequences: [
            "Placement record will be cancelled",
            "This action is permanent and cannot be reversed",
            "Student can receive a new placement for a different application",
        ],
    },
};

const PICKER_STATUSES = ["selected", "offered"];

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
    });
};

// ========================
// BADGES
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

const TypeBadge = ({ type }: { type: PlacementType }) => {
    const colors: Record<PlacementType, string> = {
        "full-time": "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
        internship: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
        both: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[type] || "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
            {PLACEMENT_TYPE_LABELS[type] || type}
        </span>
    );
};

const VerifiedBadge = ({ verified }: { verified: boolean }) => (
    <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
            verified ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
        }`}
    >
        {verified ? <ShieldCheck className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
        {verified ? "Verified" : "Unverified"}
    </span>
);

// ========================
// MINI STATS (job-scoped)
// ========================

const MiniStats = ({ stats, loading: statsLoading }: { stats: PlacementStats | null; loading: boolean }) => {
    if (statsLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                        <div className="space-y-1">
                            <div className="h-4 w-10 bg-gray-100 dark:bg-gray-700 rounded" />
                            <div className="h-3 w-14 bg-gray-50 dark:bg-gray-800 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    if (!stats) return null;

    const cards = [
        { bg: "bg-blue-50", border: "border-blue-100", iconBg: "bg-blue-100", iconColor: "text-blue-600", value: stats.total_placements, label: "Total", Icon: Award },
        { bg: "bg-emerald-50", border: "border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", value: stats.unique_students, label: "Students", Icon: Users },
        { bg: "bg-orange-50", border: "border-orange-100", iconBg: "bg-orange-100", iconColor: "text-orange-600", value: stats.avg_package !== null ? formatPackage(stats.avg_package) : "—", label: "Avg Package", Icon: BarChart3 },
        { bg: "bg-cyan-50", border: "border-cyan-100", iconBg: "bg-cyan-100", iconColor: "text-cyan-600", value: stats.highest_package !== null ? formatPackage(stats.highest_package) : "—", label: "Highest", Icon: TrendingUp },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cards.map(({ bg, border, iconBg, iconColor, value, label, Icon }) => (
                <div key={label} className={`rounded-xl border p-3 ${bg} ${border} flex items-center gap-2.5`}>
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                        <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-base font-bold ${iconColor} truncate`}>{value}</p>
                        <p className="text-[10px] font-medium text-gray-500 truncate">{label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

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

    const pills = [
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
                    !activeFilter ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
                All
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    !activeFilter ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
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
                                ? `${colors?.bg} ${colors?.text} ring-2 ring-offset-1 ring-current shadow-sm`
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                    >
                        {label}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-white/60 text-current" : "bg-gray-200/80 text-gray-500"
                        }`}>
                            {count}
                        </span>
                    </button>
                );
            })}
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:text-blue-600 transition-colors group"
        >
            {label}
            {isActive ? (
                currentOrder === "asc" ? <ArrowUp className="h-3 w-3 text-blue-600" /> : <ArrowDown className="h-3 w-3 text-blue-600" />
            ) : (
                <ArrowUpDown className="h-3 w-3 text-gray-300 group-hover:text-gray-400" />
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
    loading: pLoading,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    loading: boolean;
    onPageChange: (p: number) => void;
}) => {
    if (totalPages <= 1) return null;

    const pages: (number | "ellipsis")[] = [];
    const addPage = (p: number) => { if (!pages.includes(p)) pages.push(p); };

    addPage(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) addPage(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) addPage(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || pLoading} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map((p, idx) =>
                p === "ellipsis" ? (
                    <span key={`ell-${idx}`} className="px-1.5 text-gray-400 text-sm select-none">...</span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={pLoading}
                        aria-current={p === page ? "page" : undefined}
                        className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition ${
                            p === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                        } disabled:cursor-not-allowed`}
                    >
                        {p}
                    </button>
                ),
            )}
            <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || pLoading} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Next page">
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
                <SlidersHorizontal className="h-7 w-7 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No placements match your filters</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or status filter.</p>
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <Award className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No placement records for this job</p>
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
        {Array.from({ length: 6 }).map((_, i) => (
            <tr key={`skel-${i}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                <td className="px-4 py-3.5 w-10"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5" /></td>
                <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-36" />
                        <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-48" />
                    </div>
                </td>
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
// APPLICATION PICKER FOR CREATE
// ========================

const ApplicationPickerDropdown = ({
    jobId,
    existingApplicationIds,
    selectedApp,
    onSelect,
}: {
    jobId: string;
    existingApplicationIds: Set<string>;
    selectedApp: PickerApplication | null;
    onSelect: (app: PickerApplication | null) => void;
}) => {
    const { applications, search: pickerSearch, setSearch: setPickerSearch, loading: pickerLoading } =
        useApplicationPicker(jobId, PICKER_STATUSES, existingApplicationIds);

    if (selectedApp) {
        return (
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                        {selectedApp.student_name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{selectedApp.student_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {selectedApp.student_email}
                        {selectedApp.enrollment_number && ` · ${selectedApp.enrollment_number}`}
                        {selectedApp.dept_name && ` · ${selectedApp.dept_name}`}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onSelect(null)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition px-2 py-1 rounded-lg hover:bg-blue-100"
                    aria-label="Select a different student"
                >
                    Change
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Student <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Search by name, email, enrollment..."
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
            </div>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700">
                {pickerLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
                        {pickerSearch ? "No matching students" : "No eligible students (selected/offered)"}
                    </div>
                ) : (
                    applications.map((app) => (
                        <button
                            key={app.application_id}
                            type="button"
                            onClick={() => onSelect(app)}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-left border-b border-gray-50 dark:border-gray-800 last:border-0"
                        >
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                    {app.student_name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{app.student_name}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                    {app.enrollment_number}
                                    {app.dept_name && ` · ${app.dept_name}`}
                                </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                app.application_status === "selected" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                            }`}>
                                {app.application_status}
                            </span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

// ========================
// CREATE PLACEMENT MODAL (with picker)
// ========================

const CreatePlacementModal = ({
    jobId,
    existingApplicationIds,
    onClose,
    onSuccess,
}: {
    jobId: string;
    existingApplicationIds: Set<string>;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const [selectedApp, setSelectedApp] = useState<PickerApplication | null>(null);

    const { formData, errors, loading, handleChange, handleSubmit, reset } =
        useCreatePlacement(onSuccess, selectedApp?.application_id);

    const showFulltime = formData.placement_type === "full-time" || formData.placement_type === "both";
    const showInternship = formData.placement_type === "internship" || formData.placement_type === "both";

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
            title="Create Placement Record"
            titleIcon={<Award className="h-5 w-5 text-emerald-600" />}
            size="xl"
        >
            <div className="space-y-4">
                {/* Application picker */}
                <ApplicationPickerDropdown
                    jobId={jobId}
                    existingApplicationIds={existingApplicationIds}
                    selectedApp={selectedApp}
                    onSelect={setSelectedApp}
                />

                {/* Placement Type */}
                <FloatingSelect
                    label="Placement Type"
                    name="placement_type"
                    value={formData.placement_type}
                    onChange={handleChange}
                    disabled={loading}
                    options={PLACEMENT_TYPE_OPTIONS.map((t) => ({ value: t, label: PLACEMENT_TYPE_LABELS[t] }))}
                    required
                />

                {/* Full-time fields */}
                {showFulltime && (
                    <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5" />
                            Full-Time Details
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Package (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="fulltime_package"
                                    value={formData.fulltime_package}
                                    onChange={handleChange}
                                    placeholder="e.g. 650000"
                                    min={0}
                                    step="0.01"
                                    disabled={loading}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${
                                        errors.fulltime_package ? "border-red-300 dark:border-red-600" : "border-gray-200 dark:border-gray-700"
                                    }`}
                                />
                                {errors.fulltime_package && <p className="text-xs text-red-500 mt-1">{errors.fulltime_package}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Designation</label>
                                <input
                                    type="text"
                                    name="fulltime_designation"
                                    value={formData.fulltime_designation}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Engineer"
                                    maxLength={200}
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Joining Date</label>
                            <input
                                type="date"
                                name="fulltime_joining_date"
                                value={formData.fulltime_joining_date}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                            />
                        </div>
                    </div>
                )}

                {/* Internship fields */}
                {showInternship && (
                    <div className="space-y-3 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Internship Details
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Stipend (₹/month) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="internship_stipend"
                                    value={formData.internship_stipend}
                                    onChange={handleChange}
                                    placeholder="e.g. 25000"
                                    min={0}
                                    disabled={loading}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${
                                        errors.internship_stipend ? "border-red-300 dark:border-red-600" : "border-gray-200 dark:border-gray-700"
                                    }`}
                                />
                                {errors.internship_stipend && <p className="text-xs text-red-500 mt-1">{errors.internship_stipend}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Duration</label>
                                <input
                                    type="text"
                                    name="internship_duration"
                                    value={formData.internship_duration}
                                    onChange={handleChange}
                                    placeholder="e.g. 6 months"
                                    maxLength={100}
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                            <input
                                type="date"
                                name="internship_start_date"
                                value={formData.internship_start_date}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                            />
                        </div>
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

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !selectedApp}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Creating..." : "Create Placement"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

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

    const showFulltime = formData.placement_type === "full-time" || formData.placement_type === "both";
    const showInternship = formData.placement_type === "internship" || formData.placement_type === "both";

    return (
        <ModalWrapper
            isOpen
            onClose={handleClose}
            disabled={loading}
            title="Edit Placement"
            titleIcon={<Pencil className="h-5 w-5 text-amber-600" />}
            size="xl"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{placement.student_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{placement.student_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{placement.company_name} · {placement.job_title}</p>
                    </div>
                </div>

                <FloatingSelect
                    label="Placement Type"
                    name="placement_type"
                    value={formData.placement_type}
                    onChange={handleChange}
                    disabled={loading}
                    options={PLACEMENT_TYPE_OPTIONS.map((t) => ({ value: t, label: PLACEMENT_TYPE_LABELS[t] }))}
                />

                {showFulltime && (
                    <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Full-Time</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Package (₹)</label>
                                <input type="number" name="fulltime_package" value={formData.fulltime_package} onChange={handleChange} placeholder="(clear to remove)" min={0} step="0.01" disabled={loading} className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${errors.fulltime_package ? "border-red-300 dark:border-red-600" : "border-gray-200 dark:border-gray-700"}`} />
                                {errors.fulltime_package && <p className="text-xs text-red-500 mt-1">{errors.fulltime_package}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Designation</label>
                                <input type="text" name="fulltime_designation" value={formData.fulltime_designation} onChange={handleChange} maxLength={200} disabled={loading} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Joining Date</label>
                            <input type="date" name="fulltime_joining_date" value={formData.fulltime_joining_date} onChange={handleChange} disabled={loading} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50" />
                        </div>
                    </div>
                )}

                {showInternship && (
                    <div className="space-y-3 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Internship</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stipend (₹/month)</label>
                                <input type="number" name="internship_stipend" value={formData.internship_stipend} onChange={handleChange} min={0} disabled={loading} className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${errors.internship_stipend ? "border-red-300 dark:border-red-600" : "border-gray-200 dark:border-gray-700"}`} />
                                {errors.internship_stipend && <p className="text-xs text-red-500 mt-1">{errors.internship_stipend}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Duration</label>
                                <input type="text" name="internship_duration" value={formData.internship_duration} onChange={handleChange} maxLength={100} disabled={loading} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                            <input type="date" name="internship_start_date" value={formData.internship_start_date} onChange={handleChange} disabled={loading} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50" />
                        </div>
                    </div>
                )}

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
                    <button type="button" onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50">Cancel</button>
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
            titleIcon={<AlertTriangle className={`h-5 w-5 ${config.iconColor}`} />}
            size="lg"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Are you sure you want to change the status of <span className="font-semibold">{placement.student_name}</span>&apos;s
                    placement to <span className="font-semibold">{PLACEMENT_STATUS_LABELS[newStatus]}</span>?
                </p>

                <div className={`rounded-xl border p-4 ${config.boxBg} ${config.boxBorder}`}>
                    <p className={`text-xs font-semibold ${config.boxText} mb-2`}>This action will:</p>
                    <ul className={`space-y-1 text-xs ${config.boxText}`}>
                        {config.consequences.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                                <span className="mt-0.5">•</span>
                                <span>{c}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <FloatingTextarea
                    label="Remarks"
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add a note about this status change..."
                    rows={2}
                    maxLength={2000}
                    disabled={loading}
                />

                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50">Cancel</button>
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
            titleIcon={<ShieldCheck className={`h-5 w-5 ${willVerify ? "text-emerald-600" : "text-gray-600"}`} />}
            size="lg"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{placement.student_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{placement.student_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{placement.enrollment_number} · {placement.dept_name}</p>
                    </div>
                </div>

                {placement.offer_letter_url && /^https?:\/\//i.test(placement.offer_letter_url) ? (
                    <a
                        href={placement.offer_letter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                    >
                        <ExternalLink className="h-4 w-4" />
                        View Offer Letter
                    </a>
                ) : (
                    <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
                        No offer letter URL uploaded yet.
                    </div>
                )}

                <FloatingTextarea
                    label="Remarks"
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={willVerify ? "Verified with HR department..." : "Reason for removing verification..."}
                    rows={2}
                    maxLength={2000}
                    disabled={loading}
                />

                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50">Cancel</button>
                    <button
                        type="button"
                        onClick={() => verifyOffer(placement.placement_id, willVerify, remarks)}
                        disabled={loading || (!placement.offer_letter_url && willVerify)}
                        className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
                            willVerify ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-600 hover:bg-gray-700"
                        }`}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Processing..." : willVerify ? "Verify" : "Remove Verification"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// PLACEMENT ROW (job-scoped — no company column)
// ========================

const PlacementRow = ({
    placement,
    index,
    isExpanded,
    onToggleExpand,
    onEdit,
    onStatusChange,
    onVerify,
}: {
    placement: PlacementListItem;
    index: number;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    onEdit: (p: PlacementListItem) => void;
    onStatusChange: (p: PlacementListItem, status: PlacementStatus) => void;
    onVerify: (p: PlacementListItem) => void;
}) => {
    const transitions = PLACEMENT_STATUS_TRANSITIONS[placement.placement_status as PlacementStatus] || [];
    const isTerminal = transitions.length === 0;

    return (
        <>
            <tr
                className={`group border-b border-gray-50 dark:border-gray-800 transition-colors cursor-pointer ${
                    isExpanded ? "bg-gray-50/50 dark:bg-gray-800/50" : "hover:bg-blue-50/40 dark:hover:bg-blue-900/10"
                }`}
                onClick={() => onToggleExpand(placement.placement_id)}
            >
                <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-sm w-10">{index}</td>

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

                <td className="px-4 py-3.5">
                    <TypeBadge type={placement.placement_type as PlacementType} />
                </td>

                <td className="px-4 py-3.5">
                    <div>
                        {placement.fulltime_package !== null && (
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatPackage(placement.fulltime_package)}</p>
                        )}
                        {placement.internship_stipend !== null && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">₹{placement.internship_stipend?.toLocaleString("en-IN")}/mo</p>
                        )}
                        {placement.fulltime_package === null && placement.internship_stipend === null && (
                            <span className="text-sm text-gray-300">—</span>
                        )}
                    </div>
                </td>

                <td className="px-4 py-3.5">
                    <StatusBadge status={placement.placement_status as PlacementStatus} />
                </td>

                <td className="px-4 py-3.5">
                    <VerifiedBadge verified={placement.offer_letter_verified} />
                </td>

                <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(placement.created_at)}</span>
                </td>

                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                        {!isTerminal && (
                            <button
                                type="button"
                                onClick={() => onEdit(placement)}
                                className="p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-amber-50 hover:text-amber-600 transition-all"
                                aria-label={`Edit ${placement.student_name}`}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => onToggleExpand(placement.placement_id)}
                            className="p-1 text-gray-300 hover:text-gray-500 transition"
                            aria-label={isExpanded ? "Collapse details" : "Expand details"}
                        >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                </td>
            </tr>

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
        accepted: { bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" },
        joined: { bg: "bg-emerald-50", text: "text-emerald-700", hover: "hover:bg-emerald-100" },
        rejected: { bg: "bg-red-50", text: "text-red-700", hover: "hover:bg-red-100" },
        cancelled: { bg: "bg-gray-100", text: "text-gray-700", hover: "hover:bg-gray-200" },
    };

    return (
        <tr className="bg-gray-50/50 dark:bg-gray-800/50">
            <td colSpan={8} className="px-4 py-0">
                <div className="py-4 pl-6 border-l-2 border-blue-200 dark:border-blue-700 ml-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{placement.student_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{placement.student_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{placement.student_email} · {placement.dept_name} · {placement.passout_year}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                            <StatusBadge status={placement.placement_status as PlacementStatus} />
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Type</p>
                            <TypeBadge type={placement.placement_type as PlacementType} />
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Package</p>
                            <p className={`text-base font-bold ${placement.fulltime_package !== null ? "text-emerald-700 dark:text-emerald-400" : "text-gray-300 dark:text-gray-600"}`}>
                                {formatPackage(placement.fulltime_package)}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Offer Letter</p>
                            <VerifiedBadge verified={placement.offer_letter_verified} />
                        </div>
                    </div>

                    {(placement.fulltime_designation || placement.fulltime_joining_date) && (
                        <div className="flex flex-wrap gap-3">
                            {placement.fulltime_designation && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Designation:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{placement.fulltime_designation}</span>
                                </div>
                            )}
                            {placement.fulltime_joining_date && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Joining:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(placement.fulltime_joining_date)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {(placement.internship_stipend !== null || placement.internship_duration || placement.internship_start_date) && (
                        <div className="flex flex-wrap gap-3">
                            {placement.internship_stipend !== null && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <IndianRupee className="h-3.5 w-3.5 text-purple-400" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Stipend:</span>
                                    <span className="text-sm text-purple-700 dark:text-purple-400">₹{placement.internship_stipend.toLocaleString("en-IN")}/mo</span>
                                </div>
                            )}
                            {placement.internship_duration && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{placement.internship_duration}</span>
                                </div>
                            )}
                            {placement.internship_start_date && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Start:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(placement.internship_start_date)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {placement.offer_letter_url && /^https?:\/\//i.test(placement.offer_letter_url) && (
                        <a
                            href={placement.offer_letter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Offer Letter
                        </a>
                    )}

                    {placement.remarks && (
                        <div className="rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-4">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1.5">Remarks</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{placement.remarks}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex-wrap">
                        {!isTerminal && (
                            <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                        )}
                        <button type="button" onClick={onVerify} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition">
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
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${colors.bg} ${colors.text} ${colors.hover}`}
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

interface JobPlacementsTabProps {
    jobId: string;
    jobStatus: string;
    onRefresh: () => void;
}

const JobPlacementsTab = ({ jobId, jobStatus, onRefresh }: JobPlacementsTabProps) => {
    const {
        placements,
        stats,
        loading,
        error,
        pagination,
        search,
        placementStatus,
        placementType,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleSortChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        clearFilters,
        refresh,
    } = useViewPlacements(jobId);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPlacement, setEditingPlacement] = useState<PlacementListItem | null>(null);
    const [statusChangeModal, setStatusChangeModal] = useState<{ placement: PlacementListItem; status: PlacementStatus } | null>(null);
    const [verifyModal, setVerifyModal] = useState<PlacementListItem | null>(null);

    const isJobInactive = jobStatus === "cancelled";

    const existingApplicationIds = useMemo(
        () => new Set(placements.map((p) => p.application_id)),
        [placements],
    );

    useEffect(() => {
        setExpandedId(null);
    }, [placements]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleSuccess = useCallback(() => {
        setShowCreateModal(false);
        setEditingPlacement(null);
        setStatusChangeModal(null);
        setVerifyModal(null);
        refresh();
        onRefresh();
    }, [refresh, onRefresh]);

    const hasFilters = !!(search || placementStatus || placementType);
    const startEntry = placements.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

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
        <div className="space-y-5">
            {/* Mini stats + Create button */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                    <MiniStats stats={stats} loading={loading} />
                </div>
                {!isJobInactive && (
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition shadow-sm flex-shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        Create Placement
                    </button>
                )}
            </div>

            {/* Status pills */}
            <StatusPills stats={stats} activeFilter={placementStatus} onFilter={handleStatusFilterChange} />

            {/* Filter bar */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 py-3 px-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    />
                </div>

                <select
                    value={placementType}
                    onChange={(e) => handleTypeFilterChange(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none"
                >
                    <option value="">All Types</option>
                    {PLACEMENT_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{PLACEMENT_TYPE_LABELS[t]}</option>
                    ))}
                </select>

                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ml-auto">
                    Show
                    <select
                        value={pagination.limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {hasFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition whitespace-nowrap"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50/70 dark:bg-gray-800/70 text-left text-gray-500 dark:text-gray-400">
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-10">#</th>
                            <th className="px-4 py-3">
                                <SortHeader label="Student" field="student_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3">
                                <SortHeader label="Package" field="fulltime_package" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th className="px-4 py-3">
                                <SortHeader label="Status" field="placement_status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Verified</th>
                            <th className="px-4 py-3">
                                <SortHeader label="Date" field="created_at" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                            </th>
                            <th className="px-4 py-3 w-16" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <SkeletonTable />
                        ) : placements.length > 0 ? (
                            placements.map((p, i) => (
                                <PlacementRow
                                    key={p.placement_id}
                                    placement={p}
                                    index={(pagination.page - 1) * pagination.limit + i + 1}
                                    isExpanded={expandedId === p.placement_id}
                                    onToggleExpand={toggleExpand}
                                    onEdit={setEditingPlacement}
                                    onStatusChange={(placement, status) => setStatusChangeModal({ placement, status })}
                                    onVerify={setVerifyModal}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8}>
                                    <EmptyState hasFilters={hasFilters} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && placements.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
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

            {/* Modals */}
            {showCreateModal && (
                <CreatePlacementModal
                    jobId={jobId}
                    existingApplicationIds={existingApplicationIds}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleSuccess}
                />
            )}

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

export default JobPlacementsTab;
