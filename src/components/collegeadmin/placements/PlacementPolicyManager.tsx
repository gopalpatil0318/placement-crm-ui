import { useState, useCallback, useEffect, useRef } from "react";
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
    Trash2,
    Plus,
    FileText,
    CheckCircle2,
    XCircle,
    Calendar,
    ScrollText,
    Clock,
    User,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import {
    useViewPlacementPolicies,
    type PolicyListItem,
    type PolicySummary,
} from "@/hooks/collegeadmin/placements/placement_policies/useViewPlacementPolicies";
import { createPlacementPolicySchema, updatePlacementPolicySchema } from "@/validators/PlacementPolicySchema";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const currentYear = new Date().getFullYear();
const PASSOUT_YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

// ========================
// HELPERS
// ========================

const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// ========================
// STATUS BADGE
// ========================

const StatusBadge = ({ isActive }: { isActive: boolean }) =>
    isActive ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Inactive
        </span>
    );

// ========================
// STATS DASHBOARD
// ========================

const StatsDashboard = ({
    summary,
    loading,
}: {
    summary: PolicySummary | null;
    loading: boolean;
}) => {
    if (loading) return <SkeletonStats />;
    if (!summary) return null;

    const cards = [
        {
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-100 dark:border-blue-800/40",
            iconBg: "bg-blue-100 dark:bg-blue-900/30",
            iconColor: "text-blue-600 dark:text-blue-400",
            value: summary.total_policies,
            label: "Total Policies",
            Icon: FileText,
        },
        {
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            border: "border-emerald-100 dark:border-emerald-800/40",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            value: summary.active_count,
            label: "Active",
            Icon: CheckCircle2,
        },
        {
            bg: "bg-red-50 dark:bg-red-900/20",
            border: "border-red-100 dark:border-red-800/40",
            iconBg: "bg-red-100 dark:bg-red-900/30",
            iconColor: "text-red-600 dark:text-red-400",
            value: summary.inactive_count,
            label: "Inactive",
            Icon: XCircle,
        },
        {
            bg: "bg-purple-50 dark:bg-purple-900/20",
            border: "border-purple-100 dark:border-purple-800/40",
            iconBg: "bg-purple-100 dark:bg-purple-900/30",
            iconColor: "text-purple-600 dark:text-purple-400",
            value: summary.year_count,
            label: "Years Covered",
            Icon: Calendar,
        },
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
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SkeletonStats = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 p-3 flex items-center gap-2.5">
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
    summary,
    activeFilter,
    onFilter,
}: {
    summary: PolicySummary | null;
    activeFilter: string;
    onFilter: (status: string) => void;
}) => {
    if (!summary) return null;

    const pills: { key: string; label: string; count: number; activeBg: string; activeText: string }[] = [
        { key: "true", label: "Active", count: summary.active_count, activeBg: "bg-emerald-50", activeText: "text-emerald-700" },
        { key: "false", label: "Inactive", count: summary.inactive_count, activeBg: "bg-red-50", activeText: "text-red-600" },
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
                    {summary.total_policies}
                </span>
            </button>

            {pills.map(({ key, label, count, activeBg, activeText }) => {
                const isActive = activeFilter === key;

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onFilter(isActive ? "" : key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isActive
                                ? `${activeBg} ${activeText} ring-2 ring-offset-1 ring-current shadow-sm dark:ring-offset-gray-900`
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
            {isActive ? (
                currentOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                ) : (
                    <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                )
            ) : (
                <ArrowUpDown className="h-3 w-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500" />
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
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) addPage(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) addPage(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Previous page">
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
                        className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition ${
                            p === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        } disabled:cursor-not-allowed`}
                    >
                        {p}
                    </button>
                ),
            )}
            <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

// ========================
// EMPTY STATE
// ========================

const EmptyState = ({
    hasFilters,
    onCreateClick,
}: {
    hasFilters: boolean;
    onCreateClick: () => void;
}) =>
    hasFilters ? (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No policies match your filters</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search, status, or year filter.</p>
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No placement policies yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
                Create your first policy to define rules and guidelines for placement drives.
            </p>
            <button
                type="button"
                onClick={onCreateClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
                <Plus className="h-4 w-4" />
                Create Policy
            </button>
        </div>
    );

// ========================
// SKELETON TABLE
// ========================

const SkeletonTable = () => (
    <>
        {Array.from({ length: 5 }).map((_, i) => (
            <tr key={`skel-${i}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                <td className="px-4 py-3.5 w-10"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5" /></td>
                <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-44" />
                        <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-64" />
                    </div>
                </td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-12" /></td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-16" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-6" /></td>
            </tr>
        ))}
    </>
);

// ========================
// CREATE POLICY MODAL
// ========================

interface FormErrors {
    passout_year?: string;
    policy_title?: string;
    policy_description?: string;
}

const CreatePolicyModal = ({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const [formData, setFormData] = useState({
        passout_year: currentYear,
        policy_title: "",
        policy_description: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: name === "passout_year" ? Number(value) : value,
            }));
            setErrors((prev) => {
                if (!prev[name as keyof FormErrors]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const handleSubmit = async () => {
        // Trim before validation so whitespace-only strings fail min(2)
        const trimmed = {
            passout_year: formData.passout_year,
            policy_title: formData.policy_title.trim(),
            policy_description: formData.policy_description.trim(),
        };
        const result = createPlacementPolicySchema.safeParse(trimmed);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof FormErrors;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            }
            setErrors(fieldErrors);
            showToast({
                type: "warning",
                title: "Validation Failed",
                description: result.error.issues[0].message,
            });
            return;
        }
        setErrors({});
        setLoading(true);

        try {
            const response = await CollegeAdminService.createPlacementPolicy(trimmed);
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Policy created successfully",
            });
            onSuccess();
        } catch (error: unknown) {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ policy_title: message });
            }
            showToast({ type: "error", title: "Error", description: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper
            isOpen
            onClose={onClose}
            disabled={loading}
            title="Create Placement Policy"
            titleIcon={<div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>}
            size="md"
        >
            <div className="px-6 py-5 space-y-5">
                {/* Passout Year */}
                <FloatingSelect
                    label="Passout Year"
                    name="passout_year"
                    value={String(formData.passout_year)}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    options={PASSOUT_YEARS.map((y) => ({ value: String(y), label: String(y) }))}
                    error={errors.passout_year}
                />

                {/* Policy Title */}
                <FloatingInput
                    label="Policy Title"
                    name="policy_title"
                    value={formData.policy_title}
                    onChange={handleChange}
                    placeholder="e.g., Maximum Offer Acceptance Limit"
                    maxLength={200}
                    disabled={loading}
                    required
                    error={errors.policy_title}
                />

                {/* Policy Description */}
                <FloatingTextarea
                    label="Policy Description"
                    name="policy_description"
                    value={formData.policy_description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={2000}
                    disabled={loading}
                    error={errors.policy_description}
                />

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Creating..." : "Create Policy"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// EDIT POLICY MODAL
// ========================

const EditPolicyModal = ({
    policy,
    onClose,
    onSuccess,
}: {
    policy: PolicyListItem;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    // Initialize from prop data — no network fetch needed (list already has all fields)
    const [formData, setFormData] = useState({
        policy_title: policy.policy_title,
        policy_description: policy.policy_description,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const originalDataRef = useRef({
        policy_title: policy.policy_title,
        policy_description: policy.policy_description,
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof FormErrors]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const handleSubmit = async () => {
        // Trim before validation so whitespace-only strings fail min(2)
        const trimmed = {
            policy_title: formData.policy_title.trim(),
            policy_description: formData.policy_description.trim(),
        };
        const result = updatePlacementPolicySchema.safeParse(trimmed);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof FormErrors;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            }
            setErrors(fieldErrors);
            showToast({
                type: "warning",
                title: "Validation Failed",
                description: result.error.issues[0].message,
            });
            return;
        }
        setErrors({});

        // Diff-based payload — only send changed fields
        const orig = originalDataRef.current;
        const payload: Record<string, unknown> = {};
        if (trimmed.policy_title !== orig.policy_title.trim()) {
            payload.policy_title = trimmed.policy_title;
        }
        if (trimmed.policy_description !== orig.policy_description.trim()) {
            payload.policy_description = trimmed.policy_description;
        }

        if (Object.keys(payload).length === 0) {
            showToast({
                type: "warning",
                title: "No Changes",
                description: "Nothing has been changed.",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await CollegeAdminService.updatePlacementPolicy(policy.policy_id, payload);
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Policy updated successfully",
            });
            onSuccess();
        } catch (error: unknown) {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ policy_title: message });
            }
            showToast({ type: "error", title: "Error", description: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper
            isOpen
            onClose={onClose}
            disabled={loading}
            title="Edit Policy"
            titleIcon={<div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center"><Pencil className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>}
            size="md"
        >
            <div className="px-6 py-5 space-y-5">
                {/* Policy info banner */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                    <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Passout Year {policy.passout_year}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Year cannot be changed after creation</p>
                    </div>
                </div>

                {/* Policy Title */}
                <FloatingInput
                    label="Policy Title"
                    name="policy_title"
                    value={formData.policy_title}
                    onChange={handleChange}
                    maxLength={200}
                    disabled={loading}
                    required
                    error={errors.policy_title}
                />

                {/* Policy Description */}
                <FloatingTextarea
                    label="Policy Description"
                    name="policy_description"
                    value={formData.policy_description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={2000}
                    disabled={loading}
                    error={errors.policy_description}
                />

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// TOGGLE POLICY MODAL
// ========================

const TogglePolicyModal = ({
    policy,
    onClose,
    onSuccess,
}: {
    policy: PolicyListItem;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const [loading, setLoading] = useState(false);
    const willActivate = !policy.is_active;

    const config = willActivate
        ? {
            iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            boxBg: "bg-emerald-50 dark:bg-emerald-900/10",
            boxBorder: "border-emerald-200 dark:border-emerald-800/40",
            boxText: "text-emerald-700 dark:text-emerald-400",
            confirmBg: "bg-emerald-600 hover:bg-emerald-700",
            consequences: [
                "Policy will become visible to students",
                "Will be enforced during placement drives",
                "You can deactivate it again at any time",
            ],
        }
        : {
            iconBg: "bg-amber-50 dark:bg-amber-900/20",
            iconColor: "text-amber-600 dark:text-amber-400",
            boxBg: "bg-amber-50 dark:bg-amber-900/10",
            boxBorder: "border-amber-200 dark:border-amber-800/40",
            boxText: "text-amber-700 dark:text-amber-400",
            confirmBg: "bg-amber-600 hover:bg-amber-700",
            consequences: [
                "Policy will no longer be visible to students",
                "Will not be enforced during placement drives",
                "You can reactivate it at any time",
            ],
        };

    const handleToggle = async () => {
        setLoading(true);
        try {
            const response = await CollegeAdminService.togglePlacementPolicyStatus(
                policy.policy_id,
                { is_active: willActivate },
            );
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || `Policy ${willActivate ? "activated" : "deactivated"} successfully`,
            });
            onSuccess();
        } catch (error: unknown) {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            showToast({ type: "error", title: "Error", description: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper
            isOpen
            onClose={onClose}
            disabled={loading}
            title={willActivate ? "Activate Policy" : "Deactivate Policy"}
            titleIcon={<div className={`h-9 w-9 rounded-xl ${config.iconBg} flex items-center justify-center`}>{willActivate
                ? <ToggleRight className={`h-5 w-5 ${config.iconColor}`} />
                : <ToggleLeft className={`h-5 w-5 ${config.iconColor}`} />
            }</div>}
            size="md"
        >
            <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Are you sure you want to {willActivate ? "activate" : "deactivate"}{" "}
                    <span className="font-semibold">&quot;{policy.policy_title}&quot;</span>?
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

                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${config.confirmBg}`}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Processing..." : willActivate ? "Activate" : "Deactivate"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// DELETE POLICY MODAL
// ========================

const DeletePolicyModal = ({
    policy,
    onClose,
    onSuccess,
}: {
    policy: PolicyListItem;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await CollegeAdminService.deletePlacementPolicy(policy.policy_id);
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Policy deleted successfully",
            });
            onSuccess();
        } catch (error: unknown) {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            showToast({ type: "error", title: "Error", description: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper
            isOpen
            onClose={onClose}
            disabled={loading}
            title="Delete Policy"
            titleIcon={<div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" /></div>}
            size="md"
        >
            <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-semibold">&quot;{policy.policy_title}&quot;</span>?
                </p>

                <div className="rounded-xl border p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">This action will:</p>
                    <ul className="space-y-1 text-xs text-red-700 dark:text-red-400">
                        <li className="flex items-start gap-1.5">
                            <span className="mt-0.5">•</span>
                            <span>Permanently remove this policy from the system</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="mt-0.5">•</span>
                            <span>This action cannot be undone</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="mt-0.5">•</span>
                            <span>Consider deactivating instead if you may need it later</span>
                        </li>
                    </ul>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Deleting..." : "Delete Permanently"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// POLICY ROW (expandable)
// ========================

const PolicyRow = ({
    policy,
    index,
    isExpanded,
    onToggleExpand,
    onEdit,
    onToggleStatus,
    onDelete,
}: {
    policy: PolicyListItem;
    index: number;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    onEdit: (p: PolicyListItem) => void;
    onToggleStatus: (p: PolicyListItem) => void;
    onDelete: (p: PolicyListItem) => void;
}) => (
    <>
        <tr
            className={`group border-b border-gray-50 dark:border-gray-800 transition-colors cursor-pointer ${
                isExpanded ? "bg-gray-50/50 dark:bg-gray-800/30" : "hover:bg-blue-50/40 dark:hover:bg-blue-900/10"
            }`}
            onClick={() => onToggleExpand(policy.policy_id)}
        >
            <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-sm w-10">{index}</td>

            {/* Title + truncated description */}
            <td className="px-4 py-3.5">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {policy.policy_title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                        {policy.policy_description}
                    </p>
                </div>
            </td>

            {/* Year */}
            <td className="px-4 py-3.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                    {policy.passout_year}
                </span>
            </td>

            {/* Status */}
            <td className="px-4 py-3.5">
                <StatusBadge isActive={policy.is_active} />
            </td>

            {/* Created By */}
            <td className="px-4 py-3.5">
                <span className="text-sm text-gray-600 dark:text-gray-400">{policy.created_by_name}</span>
            </td>

            {/* Created */}
            <td className="px-4 py-3.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(policy.created_at)}</span>
            </td>

            {/* Updated */}
            <td className="px-4 py-3.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(policy.updated_at)}</span>
            </td>

            {/* Expand */}
            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    onClick={() => onToggleExpand(policy.policy_id)}
                    className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition"
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
            </td>
        </tr>

        {/* Expanded detail panel */}
        {isExpanded && (
            <PolicyDetailPanel
                policy={policy}
                onEdit={() => onEdit(policy)}
                onToggleStatus={() => onToggleStatus(policy)}
                onDelete={() => onDelete(policy)}
            />
        )}
    </>
);

// ========================
// POLICY DETAIL PANEL
// ========================

const PolicyDetailPanel = ({
    policy,
    onEdit,
    onToggleStatus,
    onDelete,
}: {
    policy: PolicyListItem;
    onEdit: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
}) => (
    <tr className="bg-gray-50/50 dark:bg-gray-800/30">
        <td colSpan={8} className="px-4 py-0">
            <div className="py-4 pl-6 border-l-2 border-blue-200 dark:border-blue-800 ml-4 space-y-4">
                {/* Policy info */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <ScrollText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{policy.policy_title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Passout Year {policy.passout_year} · {policy.is_active ? "Active" : "Inactive"}</p>
                    </div>
                </div>

                {/* Full description */}
                <div className="rounded-xl border border-blue-100 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-900/10 p-4">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1.5">Policy Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{policy.policy_description}</p>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Created by:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{policy.created_by_name}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                        <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Created:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(policy.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                        <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Updated:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(policy.updated_at)}</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex-wrap">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={onToggleStatus}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                            policy.is_active
                                ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                        }`}
                    >
                        {policy.is_active
                            ? <><ToggleLeft className="h-3.5 w-3.5" /> Deactivate</>
                            : <><ToggleRight className="h-3.5 w-3.5" /> Activate</>
                        }
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>
                </div>
            </div>
        </td>
    </tr>
);

// ========================
// MAIN COMPONENT
// ========================

const PlacementPolicyManager = () => {
    const {
        policies,
        summary,
        loading,
        error,
        pagination,
        search,
        passoutYear,
        isActive,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleSortChange,
        handlePassoutYearChange,
        handleStatusFilterChange,
        clearFilters,
        refresh,
    } = useViewPlacementPolicies();

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<PolicyListItem | null>(null);
    const [togglePolicy, setTogglePolicy] = useState<PolicyListItem | null>(null);
    const [deletingPolicy, setDeletingPolicy] = useState<PolicyListItem | null>(null);

    useEffect(() => {
        setExpandedId(null);
    }, [policies]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleSuccess = useCallback(() => {
        setCreateModalOpen(false);
        setEditingPolicy(null);
        setTogglePolicy(null);
        setDeletingPolicy(null);
        refresh();
    }, [refresh]);

    const hasFilters = !!(search || passoutYear || isActive);

    const startEntry = policies.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    // Error state
    if (error && !loading && policies.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">Failed to load policies</p>
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
                                <ScrollText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Policy Dashboard</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {passoutYear ? `Class of ${passoutYear}` : "All batches"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Create Policy
                        </button>
                    </div>
                    <StatsDashboard summary={summary} loading={loading} />
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                {/* Status pills */}
                <div className="px-6 pt-5 pb-3">
                    <StatusPills
                        summary={summary}
                        activeFilter={isActive}
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
                                placeholder="Search policies..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                            />
                        </div>

                        {/* Year filter */}
                        <select
                            value={passoutYear}
                            onChange={(e) => handlePassoutYearChange(e.target.value)}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none"
                        >
                            <option value="">All Years</option>
                            {PASSOUT_YEARS.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 dark:bg-gray-800/50 text-left text-gray-500 dark:text-gray-400">
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-10">#</th>
                                <th className="px-4 py-3">
                                    <SortHeader label="Policy Title" field="policy_title" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                </th>
                                <th className="px-4 py-3">
                                    <SortHeader label="Year" field="passout_year" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Created By</th>
                                <th className="px-4 py-3">
                                    <SortHeader label="Created" field="created_at" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                </th>
                                <th className="px-4 py-3">
                                    <SortHeader label="Updated" field="updated_at" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                </th>
                                <th className="px-4 py-3 w-12" />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <SkeletonTable />
                            ) : policies.length > 0 ? (
                                policies.map((p, i) => (
                                    <PolicyRow
                                        key={p.policy_id}
                                        policy={p}
                                        index={(pagination.page - 1) * pagination.limit + i + 1}
                                        isExpanded={expandedId === p.policy_id}
                                        onToggleExpand={toggleExpand}
                                        onEdit={setEditingPolicy}
                                        onToggleStatus={setTogglePolicy}
                                        onDelete={setDeletingPolicy}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8}>
                                        <EmptyState hasFilters={hasFilters} onCreateClick={() => setCreateModalOpen(true)} />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {!loading && policies.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startEntry}–{endEntry}</span> of{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span> policies
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
            {createModalOpen && (
                <CreatePolicyModal
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {editingPolicy && (
                <EditPolicyModal
                    policy={editingPolicy}
                    onClose={() => setEditingPolicy(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {togglePolicy && (
                <TogglePolicyModal
                    policy={togglePolicy}
                    onClose={() => setTogglePolicy(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {deletingPolicy && (
                <DeletePolicyModal
                    policy={deletingPolicy}
                    onClose={() => setDeletingPolicy(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default PlacementPolicyManager;
