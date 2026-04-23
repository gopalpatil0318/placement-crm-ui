import { useState, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  ArrowUpDown,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { useMySelfReports } from "@/hooks/student/self-report/useMySelfReports"
import SelfReportFormModal from "./SelfReportFormModal"
import CancelSelfReportModal from "./CancelSelfReportModal"
import type { SelfReport } from "@/services/student/selfReport.service"

// ─── Constants ──────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "all" as const, label: "All" },
  { value: "pending" as const, label: "Pending" },
  { value: "approved" as const, label: "Approved" },
  { value: "rejected" as const, label: "Rejected" },
]

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: typeof Clock; label: string }> = {
  pending: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: Clock, label: "Pending Review" },
  approved: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle, label: "Approved" },
  rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle, label: "Rejected" },
}

const SORT_OPTIONS = [
  { value: "created_at", label: "Date Submitted" },
  { value: "updated_at", label: "Last Updated" },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

function formatPackage(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—"
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} LPA`
  return `₹${val.toLocaleString("en-IN")}`
}

const PLACEMENT_TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-Time",
  internship: "Internship",
  both: "Full-Time + Internship",
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function SelfReportDashboard() {
  const shouldReduce = useReducedMotion()
  const {
    reports,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    statusFilter,
    sortBy,
    sortOrder,
    handleStatusFilterChange,
    handleSortByChange,
    handleSortOrderChange,
    handlePageChange,
  } = useMySelfReports()

  const [showFormModal, setShowFormModal] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<SelfReport | null>(null)

  const handleSubmitSuccess = useCallback(() => {
    setShowFormModal(false)
  }, [])

  const handleCancelSuccess = useCallback(() => {
    setCancelTarget(null)
  }, [])

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-56 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="mt-2 h-4 w-80 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["skel-1", "skel-2", "skel-3"].map((id) => (
            <div key={id} className="h-32 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error State ──
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
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Self-Reported Placements
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Report your off-campus placements for college verification
          </p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Plus className="h-4 w-4" /> Report Placement
        </button>
      </div>

      {/* ── Status Tabs ── */}
      <div role="tablist" className="flex items-center gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/50">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={statusFilter === tab.value}
            onClick={() => handleStatusFilterChange(tab.value)}
            className={`flex-shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-white text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Sort Controls */}
        <div className="ml-auto flex items-center gap-2">
          {isFetching && !isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
          <select
            value={sortBy}
            aria-label="Sort by"
            onChange={(e) => handleSortByChange(e.target.value as typeof sortBy)}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              handleSortOrderChange(sortOrder === "desc" ? "asc" : "desc")
            }
            aria-label={sortOrder === "desc" ? "Sort ascending" : "Sort descending"}
            className="rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Empty State ── */}
      {reports.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-16 dark:border-gray-700 dark:bg-gray-800/30">
          <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {statusFilter === "all"
                ? "No self-reports yet"
                : `No ${statusFilter} reports`}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Got placed off-campus? Report it here for college verification.
            </p>
          </div>
          {statusFilter === "all" && (
            <button
              onClick={() => setShowFormModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Report Your First Placement
            </button>
          )}
        </div>
      )}

      {/* ── Report Cards ── */}
      {reports.length > 0 && (
        <motion.div
          variants={shouldReduce ? undefined : staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4"
        >
          {reports.map((report) => (
            <SelfReportCard
              key={report.report_id}
              report={report}
              shouldReduce={shouldReduce}
              onCancel={() => setCancelTarget(report)}
            />
          ))}
        </motion.div>
      )}

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
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

      {/* ── Modals ── */}
      {showFormModal && (
        <SelfReportFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}

      <CancelSelfReportModal
        report={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onSuccess={handleCancelSuccess}
      />
    </div>
  )
}

// ─── Report Card ────────────────────────────────────────────────────────────────

interface SelfReportCardProps {
  report: SelfReport
  shouldReduce: boolean | null
  onCancel: () => void
}

function SelfReportCard({ report, shouldReduce, onCancel }: Readonly<SelfReportCardProps>) {
  const status = STATUS_CONFIG[report.verification_status] ?? STATUS_CONFIG.pending
  const StatusIcon = status.icon
  const fd = report.form_data

  return (
    <motion.div
      variants={shouldReduce ? undefined : staggerItem}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Company & Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/30">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">
                {fd.company_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {fd.job_title}
              </p>
            </div>
          </div>

          {/* Details row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {PLACEMENT_TYPE_LABEL[fd.placement_type] ?? fd.placement_type}
            </span>
            {fd.fulltime_package != null && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                {formatPackage(fd.fulltime_package)}
              </span>
            )}
            {fd.job_location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {fd.job_location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(report.created_at)}
            </span>
          </div>

          {/* Rejection reason */}
          {report.verification_status === "rejected" && report.rejection_reason && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800/40 dark:bg-red-950/20">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-0.5">
                Rejection Reason
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {report.rejection_reason}
              </p>
            </div>
          )}

          {/* Reviewed by */}
          {report.reviewed_at && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Reviewed by {report.reviewer_name} on{" "}
              {formatDate(report.reviewed_at)}
            </p>
          )}
        </div>

        {/* Right: Status badge + actions */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.text}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>

          {report.verification_status === "pending" && (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
