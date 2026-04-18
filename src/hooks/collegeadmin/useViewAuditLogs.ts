import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface AuditLog {
    audit_id: string;
    college_id: string;
    user_id: string;
    user_name: string;
    user_role: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    summary: string | null;
    metadata: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
    // Only present in detail view
    old_value?: Record<string, unknown> | null;
    new_value?: Record<string, unknown> | null;
}

export type DatePreset = "today" | "7d" | "30d" | "90d" | "custom";

// ─── Preset Helpers ─────────────────────────────────────────────────────────────

/** Format a Date as YYYY-MM-DD in the user's local timezone (not UTC) */
function toLocalDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** Get the user's timezone offset as ±HH:MM (e.g. "+05:30" for IST) */
function getTzOffset(): string {
    const offset = new Date().getTimezoneOffset(); // minutes behind UTC (e.g. -330 for IST)
    const sign = offset <= 0 ? "+" : "-";
    const abs = Math.abs(offset);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return `${sign}${hh}:${mm}`;
}

function getPresetDates(preset: DatePreset): { from: string; to: string } {
    const now = new Date();
    const todayStr = toLocalDateStr(now);
    const tz = getTzOffset();
    const toEndOfDay = `${todayStr}T23:59:59${tz}`;
    const from = new Date();

    switch (preset) {
        case "today":
            return { from: todayStr, to: toEndOfDay };
        case "7d":
            from.setDate(from.getDate() - 7);
            break;
        case "30d":
            from.setDate(from.getDate() - 30);
            break;
        case "90d":
            from.setDate(from.getDate() - 90);
            break;
        case "custom":
            return { from: "", to: "" }; // let the user choose
    }

    return { from: toLocalDateStr(from), to: toEndOfDay };
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useViewAuditLogs() {
    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // Filters
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [resourceTypeFilter, setResourceTypeFilter] = useState("");

    // Date
    const [datePreset, setDatePreset] = useState<DatePreset>("90d");
    const [dateFrom, setDateFrom] = useState(() => getPresetDates("90d").from);
    const [dateTo, setDateTo] = useState(() => getPresetDates("90d").to);

    // Expanded row detail
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up debounce timer on unmount to prevent state updates on unmounted component
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);

    // Build query filters (omit empty values)
    const queryFilters = {
        page,
        limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(actionFilter && { action: actionFilter }),
        ...(resourceTypeFilter && { resource_type: resourceTypeFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
    };

    // ── List query ──────────────────────────────────────────────────────────
    const {
        data,
        isLoading,
        isFetching,
        error: queryError,
        refetch,
    } = useQuery({
        queryKey: queryKeys.auditLogs.all(queryFilters),
        queryFn: () => CollegeAdminService.getAuditLogs(queryFilters),
        placeholderData: keepPreviousData,
    });

    const logs: AuditLog[] = Array.isArray(data?.data?.logs) ? data.data.logs : [];
    const pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading;
    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof Error ? queryError.message : "Failed to fetch audit logs";
    }

    // ── Detail query (on-demand for expanded row) ───────────────────────────
    const {
        data: detailData,
        isLoading: detailLoading,
    } = useQuery({
        queryKey: queryKeys.auditLogs.detail(expandedId ?? ""),
        queryFn: () => CollegeAdminService.getAuditLogDetail(expandedId ?? ""),
        enabled: !!expandedId,
    });

    const expandedLog: AuditLog | null = detailData?.data ?? null;

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        setExpandedId(null);
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setPage(1);
        setLimit(newLimit);
        setExpandedId(null);
    }, []);

    const handleActionFilterChange = useCallback((action: string) => {
        setActionFilter(action);
        setPage(1);
    }, []);

    const handleResourceTypeFilterChange = useCallback((type: string) => {
        setResourceTypeFilter(type);
        setPage(1);
    }, []);

    const handleDatePresetChange = useCallback((preset: DatePreset) => {
        setDatePreset(preset);
        if (preset !== "custom") {
            const { from, to } = getPresetDates(preset);
            setDateFrom(from);
            setDateTo(to);
            setPage(1);
        }
    }, []);

    const handleDateFromChange = useCallback((date: string) => {
        setDateFrom(date);
        setDatePreset("custom");
        setPage(1);
    }, []);

    const handleDateToChange = useCallback((date: string) => {
        // Append end-of-day with timezone so backend TIMESTAMPTZ comparison is accurate
        const value = date ? `${date}T23:59:59${getTzOffset()}` : date;
        setDateTo(value);
        setDatePreset("custom");
        setPage(1);
    }, []);

    const handleToggleExpand = useCallback((auditId: string) => {
        setExpandedId((prev) => (prev === auditId ? null : auditId));
    }, []);

    const clearFilters = useCallback(() => {
        setSearch("");
        setDebouncedSearch("");
        setActionFilter("");
        setResourceTypeFilter("");
        setDatePreset("90d");
        const { from, to } = getPresetDates("90d");
        setDateFrom(from);
        setDateTo(to);
        setPage(1);
        setExpandedId(null);
    }, []);

    const hasActiveFilters = !!(
        search || actionFilter || resourceTypeFilter || datePreset !== "90d"
    );

    return {
        // Data
        logs,
        loading,
        isFetching,
        error,
        pagination,
        expandedLog,
        detailLoading,
        expandedId,

        // Filter state
        search,
        actionFilter,
        resourceTypeFilter,
        datePreset,
        dateFrom,
        dateTo,
        hasActiveFilters,

        // Handlers
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
        refresh: refetch,
    };
}
