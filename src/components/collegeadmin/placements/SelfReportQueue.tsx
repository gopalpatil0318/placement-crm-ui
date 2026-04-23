import { useState, useCallback, useRef, useEffect } from "react"
import {
  AlertCircle,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
  FileText,
} from "lucide-react"
import {
  useAdminSelfReports,
  useSelfReportStats,
  type AdminSelfReport,
} from "@/hooks/collegeadmin/self-reports/useAdminSelfReports"
import { useYearFilter } from "@/context/YearFilterContext"
import SelfReportReviewSheet from "./SelfReportReviewSheet"

// ─── Constants ──────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "all" as const, label: "All" },
  { value: "pending" as const, label: "Pending", color: "text-amber-600 dark:text-amber-400" },
  { value: "approved" as const, label: "Approved", color: "text-emerald-600 dark:text-emerald-400" },
  { value: "rejected" as const, label: "Rejected", color: "text-red-600 dark:text-red-400" },
]

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; icon: typeof Clock; label: string }
> = {
  pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: Clock,
    label: "Pending",
  },
  approved: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: CheckCircle,
    label: "Approved",
  },
  rejected: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: XCircle,
    label: "Rejected",
  },
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

function formatPackage(val: number | null | undefined): string {
  if (val == null) return "—"
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} LPA`
  return `₹${val.toLocaleString("en-IN")}`
}

function getPlacementTypeLabel(type: string): string {
  if (type === "full-time") return "Full-Time"
  if (type === "internship") return "Internship"
  if (type === "both") return "Both"
  return type
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function SelfReportQueue() {
  const { selectedYear } = useYearFilter()
  const { stats } = useSelfReportStats(selectedYear)
  const {
    reports,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    statusFilter,
    search,
    handleStatusFilterChange,
    handleSearchChange,
    handlePassoutYearChange,
    handlePageChange,
  } = useAdminSelfReports(20)

  const [selectedReport, setSelectedReport] = useState<AdminSelfReport | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Debounce search
  const handleSearchInput = useCallback(
    (val: string) => {
      setSearchInput(val)
      clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(() => handleSearchChange(val), 300)
    },
    [handleSearchChange],
  )

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => clearTimeout(searchTimerRef.current)
  }, [])

  // Sync passout year from context
  useEffect(() => {
    handlePassoutYearChange(selectedYear)
  }, [selectedYear, handlePassoutYearChange])

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonHeader />
        <div className="space-y-3">
          {["skel-1", "skel-2", "skel-3", "skel-4", "skel-5"].map((id) => (
            <div
              key={id}
              className="h-16 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-12 dark:border-red-800/40 dark:bg-red-950/20">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium text-red-600 dark:text-red-400">
          Failed to load self-reports
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stat badges */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Off-Campus Reports
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review student self-reported placements
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatBadge
            label="Pending"
            count={stats.pending}
            bg="bg-amber-100 dark:bg-amber-900/30"
            text="text-amber-700 dark:text-amber-400"
          />
          <StatBadge
            label="Approved"
            count={stats.approved}
            bg="bg-emerald-100 dark:bg-emerald-900/30"
            text="text-emerald-700 dark:text-emerald-400"
          />
          <StatBadge
            label="Rejected"
            count={stats.rejected}
            bg="bg-gray-100 dark:bg-gray-800"
            text="text-gray-600 dark:text-gray-400"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-5 pt-4 pb-3">
          {/* Status pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleStatusFilterChange(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === tab.value
                    ? "bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              {isFetching && !isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              aria-label="Search student or company"
              placeholder="Search student or company..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400"
            />
          </div>
        </div>

        {/* Table (desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Student</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Company</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Package</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Submitted</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <EmptyState filterActive={statusFilter !== "all" || !!search} />
                  </td>
                </tr>
              ) : (
                reports.map((report, idx) => (
                  <ReportRow
                    key={report.report_id}
                    report={report}
                    index={(pagination.page - 1) * pagination.limit + idx + 1}
                    onClick={() => setSelectedReport(report)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {reports.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <EmptyState filterActive={statusFilter !== "all" || !!search} />
            </div>
          ) : (
            reports.map((report) => (
              <MobileReportCard
                key={report.report_id}
                report={report}
                onClick={() => setSelectedReport(report)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>
              {"–"}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                aria-label="Previous page"
                className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                aria-label="Next page"
                className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Sheet */}
      <SelfReportReviewSheet
        key={selectedReport?.report_id ?? "closed"}
        reportId={selectedReport?.report_id ?? null}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StatBadge({
  label,
  count,
  bg,
  text,
}: Readonly<{ label: string; count: number; bg: string; text: string }>) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${bg} ${text}`}
    >
      {label}: {count}
    </span>
  )
}

function ReportRow({
  report,
  index,
  onClick,
}: Readonly<{ report: AdminSelfReport; index: number; onClick: () => void }>) {
  const status = STATUS_CONFIG[report.verification_status] ?? STATUS_CONFIG.pending
  const StatusIcon = status.icon
  const fd = report.form_data
  const studentName = `${report.student_first_name ?? ""} ${report.student_last_name ?? ""}`.trim() || "—"

  return (
    <tr
      onClick={onClick}
      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
    >
      <td className="px-5 py-3 text-gray-400 text-xs">{index}</td>
      <td className="px-5 py-3">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[160px]">
            {studentName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
            {report.dept_name ?? "—"}
          </p>
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate max-w-[140px] text-gray-900 dark:text-gray-100">
            {fd.company_name}
          </span>
        </div>
      </td>
      <td className="px-5 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[140px]">
        {fd.job_title}
      </td>
      <td className="px-5 py-3 text-gray-700 dark:text-gray-300 font-medium">
        {fd.fulltime_package ? formatPackage(fd.fulltime_package) : "—"}
      </td>
      <td className="px-5 py-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {getPlacementTypeLabel(fd.placement_type)}
        </span>
      </td>
      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
        {formatDate(report.created_at)}
      </td>
      <td className="px-5 py-3">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </td>
      <td className="px-5 py-3">
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          Review
        </button>
      </td>
    </tr>
  )
}

function MobileReportCard({
  report,
  onClick,
}: Readonly<{ report: AdminSelfReport; onClick: () => void }>) {
  const status = STATUS_CONFIG[report.verification_status] ?? STATUS_CONFIG.pending
  const StatusIcon = status.icon
  const fd = report.form_data
  const studentName = `${report.student_first_name ?? ""} ${report.student_last_name ?? ""}`.trim() || "—"

  return (
    <button
      onClick={onClick}
      className="w-full px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {studentName}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{fd.company_name}</span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {fd.job_title}
            </span>
            {fd.fulltime_package && (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatPackage(fd.fulltime_package)}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            {formatDate(report.created_at)} · {report.dept_name ?? "—"}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0 ${status.bg} ${status.text}`}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </div>
    </button>
  )
}

function EmptyState({ filterActive }: Readonly<{ filterActive: boolean }>) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
        <FileText className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {filterActive
          ? "No reports match your filters"
          : "No self-reports submitted yet"}
      </p>
    </div>
  )
}

function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-7 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-7 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-7 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    </div>
  )
}
