import React from "react"
import { Search, MessageCircle, AlertCircle, RefreshCw } from "lucide-react"
import PageHeader from "@/components/sysadmin/PageHeader"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList"
import { useContactInquiries } from "@/hooks/sysadmin/useContactInquiries"
import type { ContactInquiry } from "@/services/sysadmin/submissions.services"

const BREADCRUMBS = [
    { label: "Dashboard", path: "/sysadmin/dashboard" },
    { label: "Contact Inquiries", active: true },
]

const STATUS_OPTIONS = [
    { value: "", label: "All Status" },
    { value: "new", label: "New" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
]

const PAGE_SIZES = [10, 25, 50]

const TABLE_HEADERS = ["Name", "Email", "Phone", "Subject", "Status", "Date"]

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    new: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
    in_progress: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    resolved: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    closed: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" },
}

function formatDate(dateStr: string) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES.new
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${s.bg} ${s.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {status.replaceAll("_", " ")}
        </span>
    )
}

function truncateMessage(msg: string, len = 60): string {
    return msg.length > len ? msg.slice(0, len) + "…" : msg
}

function EmptyState({ hasFilters }: Readonly<{ hasFilters: boolean }>) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                <MessageCircle className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {hasFilters ? "No inquiries match your filters" : "No contact inquiries yet"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasFilters ? "Try adjusting your search or filter criteria." : "Contact inquiries from the website will appear here."}
            </p>
        </div>
    )
}

export default function ContactInquiries() {
    const {
        contactInquiries, loading, isFetching, error, refresh,
        search, page, limit, pagination, statusFilter,
        handleSearchChange, handleLimitChange, handleStatusFilterChange,
        handleNavigateToDetail, setPage,
    } = useContactInquiries()

    const hasFilters = !!(search || statusFilter)

    return (
        <AnimatedPage>
            <div className="space-y-8">
                <PageHeader title="Contact Inquiries" breadcrumbs={BREADCRUMBS} />

                {error && !loading && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm p-10 flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Failed to load contact inquiries</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                        </div>
                        <button type="button" onClick={() => refresh()} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                            <RefreshCw className="h-4 w-4" /> Try Again
                        </button>
                    </div>
                )}

                {!error && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <Toolbar search={search} statusFilter={statusFilter} limit={limit} onSearchChange={handleSearchChange} onStatusChange={handleStatusFilterChange} onLimitChange={handleLimitChange} />

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        {TABLE_HEADERS.map((h) => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <DesktopTableBody rows={contactInquiries} loading={loading} limit={limit} hasFilters={hasFilters} onRowClick={handleNavigateToDetail} />
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                            <MobileCardList rows={contactInquiries} loading={loading} limit={limit} hasFilters={hasFilters} onCardClick={handleNavigateToDetail} />
                        </div>

                        {pagination.totalPages > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border-t border-gray-100 dark:border-gray-800 text-sm">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {loading ? <span>Loading page {page}...</span> : <>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total}</>}
                                </p>
                                <div className="flex items-center gap-1.5 mt-3 sm:mt-0">
                                    <PaginationButton label="Previous" disabled={page <= 1 || isFetching} onClick={() => setPage(Math.max(1, page - 1))} />
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                                        .map((p, idx, arr) => (
                                            <React.Fragment key={p}>
                                                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400 dark:text-gray-500">…</span>}
                                                <button type="button" onClick={() => setPage(p)} disabled={isFetching} className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{p}</button>
                                            </React.Fragment>
                                        ))}
                                    <PaginationButton label="Next" disabled={page >= pagination.totalPages || isFetching} onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AnimatedPage>
    )
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function Toolbar({ search, statusFilter, limit, onSearchChange, onStatusChange, onLimitChange }: Readonly<{
    search: string; statusFilter: string; limit: number
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onStatusChange: (v: string) => void; onLimitChange: (v: number) => void
}>) {
    return (
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="search" placeholder="Search name, email, message…" value={search} onChange={onSearchChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors" />
                </div>
                <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none">
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 sm:ml-auto">
                    Show{" "}
                    <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm outline-none text-gray-700 dark:text-gray-300">
                        {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
        </div>
    )
}

function DesktopTableBody({ rows, loading, limit, hasFilters, onRowClick }: Readonly<{
    rows: ContactInquiry[]; loading: boolean; limit: number; hasFilters: boolean; onRowClick: (id: string) => void
}>) {
    if (loading) {
        return (
            <tbody>
                {Array.from({ length: limit }).map((_, i) => (
                    <tr key={`ci-sk-${String(i)}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                        {Array.from({ length: TABLE_HEADERS.length }).map((_, j) => (
                            <td key={`ci-sk-${String(i)}-${String(j)}`} className="px-5 py-3.5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" /></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        )
    }
    if (rows.length === 0) {
        return (<tbody><tr><td colSpan={TABLE_HEADERS.length} className="py-16 text-center"><EmptyState hasFilters={hasFilters} /></td></tr></tbody>)
    }
    return (
        <AnimatedTableBody>
            {rows.map((ci) => (
                <AnimatedRow key={ci.id} onClick={() => onRowClick(ci.id)} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{ci.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{ci.email}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 tabular-nums">{ci.phone}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{ci.subject ?? "—"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={ci.status} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 tabular-nums">{formatDate(ci.created_at)}</td>
                </AnimatedRow>
            ))}
        </AnimatedTableBody>
    )
}

function MobileCardList({ rows, loading, limit, hasFilters, onCardClick }: Readonly<{
    rows: ContactInquiry[]; loading: boolean; limit: number; hasFilters: boolean; onCardClick: (id: string) => void
}>) {
    if (loading) {
        return (<>{Array.from({ length: limit }).map((_, i) => (
            <div key={`ci-mob-sk-${String(i)}`} className="p-4 space-y-3 animate-pulse">
                <div className="flex items-start justify-between"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" /><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" /></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
            </div>
        ))}</>)
    }
    if (rows.length === 0) return <div className="py-16 text-center"><EmptyState hasFilters={hasFilters} /></div>
    return (
        <>{rows.map((ci) => (
            <button type="button" key={ci.id} onClick={() => onCardClick(ci.id)} className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-800">
                <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate min-w-0 flex-1">{ci.name}</p>
                    <StatusBadge status={ci.status} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{ci.email} {ci.subject && `· ${ci.subject}`}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">{truncateMessage(ci.message, 100)}</p>
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{formatDate(ci.created_at)}</p>
            </button>
        ))}</>
    )
}

function PaginationButton({ label, disabled, onClick }: Readonly<{ label: string; disabled: boolean; onClick: () => void }>) {
    return (
        <button type="button" onClick={onClick} disabled={disabled} className="px-3.5 h-9 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {label}
        </button>
    )
}
