import { useMemo } from "react";
import {
    Search,
    ChevronDown,
    ChevronRight,
    RefreshCw,
    X,
    Shield,
    AlertCircle,
    Loader2,
} from "lucide-react";
import AnimatedPage from "@/components/ui/AnimatedPage";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewAuditLogs, type AuditLog, type DatePreset } from "@/hooks/collegeadmin/useViewAuditLogs";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Audit Trail", active: true },
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "custom", label: "Custom" },
];

const ACTION_OPTIONS = [
    { value: "", label: "All Actions" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
    { value: "status_change", label: "Status Change" },
    { value: "bulk_import", label: "Bulk Import" },
    { value: "bulk_update", label: "Bulk Update" },
];

const RESOURCE_TYPE_OPTIONS = [
    { value: "", label: "All Resources" },
    { value: "application", label: "Application" },
    { value: "placement", label: "Placement" },
    { value: "restriction", label: "Restriction" },
    { value: "policy", label: "Policy" },
    { value: "override", label: "Override" },
    { value: "job", label: "Job" },
    { value: "student", label: "Student" },
    { value: "user", label: "User" },
    { value: "training", label: "Training" },
    { value: "company", label: "Company" },
    { value: "department", label: "Department" },
    { value: "skill", label: "Skill" },
];

const ACTION_BADGE_COLORS: Record<string, string> = {
    create: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    update: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    delete: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    status_change: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    bulk_import: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    bulk_update: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
};

const ROLE_BADGE_COLORS: Record<string, string> = {
    collegeadmin: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    tpo: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    tpc: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300",
    hod: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
    teacher: "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatDate(dateStr: string): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatAction(action: string): string {
    return action.replaceAll("_", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

function formatResourceType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ActionBadge({ action }: Readonly<{ action: string }>) {
    const color = ACTION_BADGE_COLORS[action] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300";
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
            {formatAction(action)}
        </span>
    );
}

function RoleBadge({ role }: Readonly<{ role: string }>) {
    const color = ROLE_BADGE_COLORS[role] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300";
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${color}`}>
            {role}
        </span>
    );
}

const MAX_JSON_DISPLAY_LENGTH = 10_000;

function formatDiffValue(val: unknown): string {
    const raw = JSON.stringify(val);
    if (raw.length <= MAX_JSON_DISPLAY_LENGTH) return raw;
    return `${raw.slice(0, MAX_JSON_DISPLAY_LENGTH)}… (truncated)`;
}

function AuditDiffViewer({
    oldValue,
    newValue,
    loading,
}: Readonly<{
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    loading: boolean;
}>) {
    if (loading) {
        return (
            <div className="flex items-center gap-2 py-4 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading changes…
            </div>
        );
    }

    if (!oldValue && !newValue) {
        return (
            <p className="py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                No change details recorded for this entry.
            </p>
        );
    }

    const allKeys = Array.from(
        new Set([
            ...Object.keys(oldValue ?? {}),
            ...Object.keys(newValue ?? {}),
        ])
    );

    if (allKeys.length === 0) {
        return (
            <p className="py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                No field-level changes to display.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300 w-1/4">Field</th>
                        <th className="text-left py-2 px-3 font-medium text-red-600 dark:text-red-400 w-[37.5%]">Old Value</th>
                        <th className="text-left py-2 px-3 font-medium text-emerald-600 dark:text-emerald-400 w-[37.5%]">New Value</th>
                    </tr>
                </thead>
                <tbody>
                    {allKeys.map((key) => {
                        const oldVal = oldValue?.[key];
                        const newVal = newValue?.[key];
                        return (
                            <tr key={key} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300 font-mono text-xs">
                                    {key}
                                </td>
                                <td className="py-2 px-3">
                                    {oldVal == null ? (
                                        <span className="text-gray-400 text-xs">—</span>
                                    ) : (
                                        <span className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded text-xs font-mono break-all">
                                            {formatDiffValue(oldVal)}
                                        </span>
                                    )}
                                </td>
                                <td className="py-2 px-3">
                                    {newVal == null ? (
                                        <span className="text-gray-400 text-xs">—</span>
                                    ) : (
                                        <span className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono break-all">
                                            {formatDiffValue(newVal)}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function SkeletonRows() {
    const skeletonIds = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];
    return (
        <>
            {skeletonIds.map((id) => (
                <tr key={id} className="border-b border-gray-100 dark:border-gray-800 animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                </tr>
            ))}
        </>
    );
}

function EmptyState({ hasFilters, onReset }: Readonly<{ hasFilters: boolean; onReset: () => void }>) {
    return (
        <tr>
            <td colSpan={6} className="py-16 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {hasFilters ? "No audit entries match your filters" : "No audit entries yet"}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {hasFilters
                        ? "Try adjusting your filters or date range"
                        : "Audit entries will appear here as actions are performed"}
                </p>
                {hasFilters && (
                    <button
                        onClick={onReset}
                        className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    >
                        Clear all filters
                    </button>
                )}
            </td>
        </tr>
    );
}

function PaginationNav({
    page,
    totalPages,
    loading,
    onPageChange,
}: Readonly<{
    page: number;
    totalPages: number;
    loading: boolean;
    onPageChange: (p: number) => void;
}>) {
    const pages = useMemo(() => {
        const items: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) items.push(i);
        } else {
            items.push(1);
            if (page > 3) items.push("ellipsis-start");
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                items.push(i);
            }
            if (page < totalPages - 2) items.push("ellipsis-end");
            items.push(totalPages);
        }
        return items;
    }, [page, totalPages]);

    return (
        <nav className="flex items-center gap-1">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
                Previous
            </button>
            {pages.map((p) =>
                typeof p === "string" ? (
                    <span key={p} className="px-2 text-gray-400">…</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                            p === page
                                ? "bg-blue-600 text-white font-medium"
                                : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                        {p}
                    </button>
                )
            )}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
                Next
            </button>
        </nav>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ViewAuditLogs() {
    const {
        logs,
        loading,
        isFetching,
        error,
        pagination,
        expandedLog,
        detailLoading,
        expandedId,
        search,
        actionFilter,
        resourceTypeFilter,
        datePreset,
        dateFrom,
        dateTo,
        hasActiveFilters,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleActionFilterChange,
        handleResourceTypeFilterChange,
        handleDatePresetChange,
        handleDateFromChange,
        handleDateToChange,
        handleToggleExpand,
        clearFilters,
        refresh,
    } = useViewAuditLogs();

    const startEntry = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <AnimatedPage>
            <div className="space-y-8">
                <PageHeader title="Audit Trail" breadcrumbs={BREADCRUMBS} />

                {/* Error state */}
                {error && !loading && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                        <button
                            onClick={() => refresh()}
                            className="ml-auto text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!error && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        {/* ── Toolbar ────────────────────────────────────────────── */}
                        <div className="p-5 border-b border-gray-200 dark:border-gray-800 space-y-4">
                            {/* Title row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Activity Log
                                        {pagination.total > 0 && (
                                            <span className="ml-2 text-sm font-normal text-gray-500">
                                                ({pagination.total.toLocaleString("en-IN")} entries)
                                            </span>
                                        )}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => refresh()}
                                    disabled={isFetching}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`h-4 w-4 text-gray-500 ${isFetching ? "animate-spin" : ""}`} />
                                </button>
                            </div>

                            {/* Date presets */}
                            <div className="flex flex-wrap items-center gap-2">
                                {DATE_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => handleDatePresetChange(preset.value)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                                            datePreset === preset.value
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                {datePreset === "custom" && (
                                    <div className="flex items-center gap-2 ml-2">
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => handleDateFromChange(e.target.value)}
                                            className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        />
                                        <span className="text-gray-400 text-xs">to</span>
                                        <input
                                            type="date"
                                            value={dateTo ? dateTo.slice(0, 10) : ""}
                                            onChange={(e) => handleDateToChange(e.target.value)}
                                            className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Filters row */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search summary…"
                                        value={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                                    />
                                </div>

                                {/* Action filter */}
                                <select
                                    value={actionFilter}
                                    onChange={(e) => handleActionFilterChange(e.target.value)}
                                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/30"
                                >
                                    {ACTION_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>

                                {/* Resource type filter */}
                                <select
                                    value={resourceTypeFilter}
                                    onChange={(e) => handleResourceTypeFilterChange(e.target.value)}
                                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/30"
                                >
                                    {RESOURCE_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>

                                {/* Page size */}
                                <select
                                    value={pagination.limit}
                                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/30"
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>{size} / page</option>
                                    ))}
                                </select>

                                {/* Clear filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ── Desktop Table ──────────────────────────────────── */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Summary</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && <SkeletonRows />}
                                    {!loading && logs.length === 0 && (
                                        <EmptyState hasFilters={hasActiveFilters} onReset={clearFilters} />
                                    )}
                                    {!loading && logs.length > 0 &&
                                        logs.map((log: AuditLog) => (
                                            <AuditRow
                                                key={log.audit_id}
                                                log={log}
                                                isExpanded={expandedId === log.audit_id}
                                                expandedLog={expandedId === log.audit_id ? expandedLog : null}
                                                detailLoading={expandedId === log.audit_id && detailLoading}
                                                onToggle={() => handleToggleExpand(log.audit_id)}
                                            />
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards ─────────────────────────────────────── */}
                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                            {loading && (
                                ["mob-sk-1", "mob-sk-2", "mob-sk-3"].map((id) => (
                                    <div key={id} className="p-4 animate-pulse space-y-3">
                                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                ))
                            )}
                            {!loading && logs.length === 0 && (
                                <div className="py-16 text-center">
                                    <Shield className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {hasActiveFilters ? "No matching entries" : "No entries yet"}
                                    </p>
                                </div>
                            )}
                            {!loading && logs.length > 0 &&
                                logs.map((log: AuditLog) => (
                                    <div key={log.audit_id} className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(log.created_at)}</span>
                                            <ActionBadge action={log.action} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.user_name}</span>
                                            <RoleBadge role={log.user_role} />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{log.summary ?? "—"}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">{formatResourceType(log.resource_type)}</span>
                                            <button
                                                onClick={() => handleToggleExpand(log.audit_id)}
                                                className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                                            >
                                                {expandedId === log.audit_id ? "Hide changes" : "View changes"}
                                            </button>
                                        </div>
                                        {expandedId === log.audit_id && (
                                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                <AuditDiffViewer
                                                    oldValue={expandedLog?.old_value}
                                                    newValue={expandedLog?.new_value}
                                                    loading={detailLoading}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                        {pagination.total > 0 && (
                            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startEntry}</span> to{" "}
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{endEntry}</span> of{" "}
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total.toLocaleString("en-IN")}</span> entries
                                </p>
                                <PaginationNav
                                    page={pagination.page}
                                    totalPages={pagination.totalPages}
                                    loading={isFetching}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE ROW (with expandable diff)
// ═══════════════════════════════════════════════════════════════════════════════

function AuditRow({
    log,
    isExpanded,
    expandedLog,
    detailLoading,
    onToggle,
}: Readonly<{
    log: AuditLog;
    isExpanded: boolean;
    expandedLog: AuditLog | null;
    detailLoading: boolean;
    onToggle: () => void;
}>) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
        }
    };

    return (
        <>
            <tr
                onClick={onToggle}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                aria-expanded={isExpanded}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-inset"
            >
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(log.created_at)}
                </td>
                <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.user_name}</span>
                        <RoleBadge role={log.user_role} />
                    </div>
                </td>
                <td className="py-3 px-4">
                    <ActionBadge action={log.action} />
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatResourceType(log.resource_type)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 max-w-md truncate" title={log.summary ?? undefined}>
                    {log.summary ?? "—"}
                </td>
                <td className="py-3 px-4">
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50 dark:bg-gray-800/30">
                    <td colSpan={6} className="px-4 py-3">
                        <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
                                {log.ip_address && log.ip_address !== '::1' && <span>IP: {log.ip_address}</span>}
                                {log.metadata?.entityName ? (
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {log.metadata.entityName as string}
                                        {log.metadata.companyName ? (
                                            <span className="text-gray-400 dark:text-gray-500"> &middot; {log.metadata.companyName as string}</span>
                                        ) : null}
                                    </span>
                                ) : (
                                    log.resource_id && !log.metadata?.verificationType && <span>ID: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{log.resource_id.slice(0, 8)}</code></span>
                                )}
                            </div>
                            <AuditDiffViewer
                                oldValue={expandedLog?.old_value}
                                newValue={expandedLog?.new_value}
                                loading={detailLoading}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
