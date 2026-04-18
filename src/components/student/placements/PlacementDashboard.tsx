import { useMemo, useState, useCallback, memo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  ArrowUpDown,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Trophy,
  Upload,
  XCircle,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { useMyPlacements } from "@/hooks/student/placements/useMyPlacements"
import AcceptPlacementModal from "@/components/student/placements/AcceptPlacementModal"
import RejectPlacementModal from "@/components/student/placements/RejectPlacementModal"
import UploadDocumentModal from "@/components/student/placements/UploadDocumentModal"
import {
  PLACEMENT_STATUS_TABS,
  PLACEMENT_STATUS_LABELS,
  PLACEMENT_STATUS_COLORS,
  PLACEMENT_STATUS_ICONS,
  PLACEMENT_TYPE_LABELS,
  PLACEMENT_SORT_OPTIONS,
  PLACEMENT_TYPE_FILTER_OPTIONS,
  formatPackage,
  formatStipend,
  canActOnPlacement,
  type StudentPlacement,
  type PlacementStatus,
  type PlacementStatusFilter,
  type PlacementTypeFilter,
  type PlacementFilters,
} from "@/validators/PlacementSchema"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getOfferCountdown(expiresAt: string | null): { text: string; urgent: boolean; expired: boolean } | null {
  if (!expiresAt) return null
  const expiryDate = new Date(expiresAt)
  if (Number.isNaN(expiryDate.getTime())) return null
  const diff = expiryDate.getTime() - Date.now()
  if (diff <= 0) return { text: "Expired", urgent: true, expired: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 3) return { text: `Expires in ${days}d ${hours}h`, urgent: false, expired: false }
  if (days > 0) return { text: `Expires in ${days}d ${hours}h`, urgent: true, expired: false }
  return { text: `Expires in ${hours}h`, urgent: true, expired: false }
}

/** Can the student upload/re-upload documents for this placement? */
function canUploadDocuments(p: StudentPlacement): boolean {
  return ["offered", "accepted", "joined"].includes(p.placement_status)
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PlacementDashboard() {
  const shouldReduce = useReducedMotion()
  const {
    placements,
    statusSummary,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    statusFilter,
    typeFilter,
    sortBy,
    sortOrder,
    page,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleSortByChange,
    handleSortOrderChange,
    handlePageChange,
  } = useMyPlacements()

  // Modal state
  const [acceptTarget, setAcceptTarget] = useState<StudentPlacement | null>(null)
  const [rejectTarget, setRejectTarget] = useState<StudentPlacement | null>(null)
  const [uploadTarget, setUploadTarget] = useState<StudentPlacement | null>(null)

  // ── Pagination numbers ──
  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages
    const current = pagination.page
    const pages: (number | "...")[] = []
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push("...")
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (current < total - 2) pages.push("...")
      pages.push(total)
    }
    return pages
  }, [pagination.totalPages, pagination.page])

  const getTabCount = (key: PlacementStatusFilter) => {
    if (key === "all") return statusSummary.total
    return statusSummary[key]
  }

  const handleAccept = useCallback((placement: StudentPlacement) => {
    setAcceptTarget(placement)
  }, [])

  const handleReject = useCallback((placement: StudentPlacement) => {
    setRejectTarget(placement)
  }, [])

  const handleUpload = useCallback((placement: StudentPlacement) => {
    setUploadTarget(placement)
  }, [])

  const Wrapper = shouldReduce ? "div" : motion.div
  const wrapperProps = shouldReduce
    ? {}
    : { variants: staggerContainer, initial: "hidden", animate: "visible" }
  const itemMotion = shouldReduce ? {} : { variants: staggerItem }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            My Placements
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {statusSummary.total} total placement{statusSummary.total === 1 ? "" : "s"}
            {statusSummary.offered > 0 && (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {" · "}{statusSummary.offered} pending decision
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`summary-skeleton-${String(i)}`} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200/40 dark:border-gray-800/40 bg-gray-50 dark:bg-gray-800/30 motion-safe:animate-pulse">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-1.5 flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-14" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && statusSummary.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard label="Offered" count={statusSummary.offered} status="offered" />
          <SummaryCard label="Accepted" count={statusSummary.accepted} status="accepted" />
          <SummaryCard label="Joined" count={statusSummary.joined} status="joined" />
          <SummaryCard label="Declined" count={statusSummary.declined} status="declined" />
          <SummaryCard label="Cancelled" count={statusSummary.cancelled} status="cancelled" />
        </div>
      )}

      {/* ── Filters Bar ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
        <div className="px-5 py-4 flex items-center gap-4 flex-wrap">
          {/* Status filter tabs */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5 flex-wrap" role="tablist" aria-label="Filter by placement status">
            {PLACEMENT_STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                id={`placement-tab-${tab.key}`}
                role="tab"
                aria-selected={statusFilter === tab.key}
                aria-controls="placement-tabpanel"
                onClick={() => handleStatusFilterChange(tab.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
                {getTabCount(tab.key) > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 rounded-full text-[10px] font-bold ${
                      statusFilter === tab.key
                        ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {getTabCount(tab.key)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => handleTypeFilterChange(e.target.value as PlacementTypeFilter)}
            aria-label="Filter by placement type"
            className="text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
          >
            {PLACEMENT_TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort by */}
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as PlacementFilters["sort_by"])}
            aria-label="Sort by field"
            className="text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
          >
            {PLACEMENT_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort order */}
          <button
            type="button"
            onClick={() =>
              handleSortOrderChange(sortOrder === "desc" ? "asc" : "desc")
            }
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <ArrowUpDown size={14} />
            {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </button>

          {/* Fetching indicator */}
          {isFetching && !isLoading && (
            <Loader2 size={14} className="animate-spin text-indigo-500 ml-auto" />
          )}
        </div>

        {/* ── Placement List ── */}
        <div id="placement-tabpanel" role="tabpanel" aria-labelledby={`placement-tab-${statusFilter}`} className="border-t border-gray-100 dark:border-gray-800">
          {isLoading && <SkeletonList />}
          {!isLoading && isError && <ErrorState onRetry={() => refetch()} />}
          {!isLoading && !isError && placements.length === 0 && (
            <EmptyState hasFilters={statusFilter !== "all" || typeFilter !== "all"} />
          )}
          {!isLoading && !isError && placements.length > 0 && (
            <Wrapper {...wrapperProps}>
              {placements.map((placement) => {
                const ItemWrapper = shouldReduce ? "div" : motion.div
                return (
                  <ItemWrapper key={placement.placement_id} {...itemMotion}>
                    <MemoPlacementCard
                      placement={placement}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onUpload={handleUpload}
                    />
                  </ItemWrapper>
                )
              })}
            </Wrapper>
          )}
        </div>

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3.5 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {(page - 1) * pagination.limit + 1}–
                {Math.min(page * pagination.limit, pagination.total)}
              </span>{" "}
              of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} className="text-gray-500" />
              </button>
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span
                    key={idx < pagination.page ? "ellipsis-start" : "ellipsis-end"}
                    className="px-1 text-xs text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`min-h-[44px] min-w-[44px] px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      page === p
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AcceptPlacementModal
        placement={acceptTarget}
        isOpen={!!acceptTarget}
        onClose={() => setAcceptTarget(null)}
      />
      <RejectPlacementModal
        placement={rejectTarget}
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
      />
      <UploadDocumentModal
        placement={uploadTarget}
        isOpen={!!uploadTarget}
        onClose={() => setUploadTarget(null)}
      />
    </div>
  )
}

// ─── Summary Card ───────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  count,
  status,
}: Readonly<{
  label: string
  count: number
  status: PlacementStatus
}>) {
  const colors = PLACEMENT_STATUS_COLORS[status]
  const Icon = PLACEMENT_STATUS_ICONS[status]

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors.bg} border-gray-200/40 dark:border-gray-800/40`}
    >
      <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${colors.bg}`}>
        <Icon size={16} className={colors.text} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {count}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

// ─── Placement Card ─────────────────────────────────────────────────────────────

function PlacementCard({
  placement,
  onAccept,
  onReject,
  onUpload,
}: Readonly<{
  placement: StudentPlacement
  onAccept: (placement: StudentPlacement) => void
  onReject: (placement: StudentPlacement) => void
  onUpload: (placement: StudentPlacement) => void
}>) {
  const colors = PLACEMENT_STATUS_COLORS[placement.placement_status]
  const StatusIcon = PLACEMENT_STATUS_ICONS[placement.placement_status]
  const showActions = canActOnPlacement(placement)

  const isFullTime = placement.placement_type === "full-time" || placement.placement_type === "both"
  const isInternship = placement.placement_type === "internship" || placement.placement_type === "both"
  const offerCountdown = placement.placement_status === "offered" ? getOfferCountdown(placement.offer_expires_at) : null

  const initials = placement.company_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 px-5 py-5 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
      {/* Company Avatar */}
      {placement.company_logo ? (
        <img
          src={placement.company_logo}
          alt={placement.company_name}
          className="shrink-0 h-12 w-12 rounded-xl object-contain bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
        />
      ) : (
        <div className="shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {initials}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-3">
        {/* Row 1: Company + Status */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {placement.job_title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {placement.company_website ? (
                <a
                  href={placement.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
                >
                  {placement.company_name}
                  <ExternalLink size={10} />
                </a>
              ) : (
                placement.company_name
              )}
              {placement.position_name && (
                <span className="text-gray-400 dark:text-gray-500">
                  {" · "}{placement.position_name}
                </span>
              )}
            </p>
          </div>
          {/* Status Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <output
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
            >
              <StatusIcon size={12} />
              {PLACEMENT_STATUS_LABELS[placement.placement_status]}
            </output>
            {/* Offer Expiry Countdown */}
            {offerCountdown && !offerCountdown.expired && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  offerCountdown.urgent
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                }`}
              >
                <Clock size={10} />
                {offerCountdown.text}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Key Details */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          {/* Package / Stipend */}
          {isFullTime && placement.fulltime_package && (
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {formatPackage(placement.fulltime_package)}
            </span>
          )}
          {isInternship && placement.internship_stipend && (
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {formatStipend(placement.internship_stipend)}
            </span>
          )}

          {/* Type badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
            {PLACEMENT_TYPE_LABELS[placement.placement_type]}
          </span>

          {/* Location */}
          {placement.job_location && (
            <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
              <MapPin size={12} />
              {placement.job_location}
            </span>
          )}

          {/* Designation */}
          {isFullTime && placement.fulltime_designation && (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {placement.fulltime_designation}
            </span>
          )}
        </div>

        {/* Row 3: Dates + Offer Letter */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400">
          {isFullTime && placement.fulltime_joining_date && (
            <span>
              Joining:{" "}
              {new Date(placement.fulltime_joining_date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "Asia/Kolkata",
              })}
            </span>
          )}
          {isInternship && placement.internship_start_date && (
            <span>
              Starts:{" "}
              {new Date(placement.internship_start_date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "Asia/Kolkata",
              })}
            </span>
          )}
          {isInternship && placement.internship_duration && (
            <span>Duration: {placement.internship_duration}</span>
          )}

          {/* Offer Letter */}
          {placement.offer_letter_url && (
            <span className="inline-flex items-center gap-1">
              <a
                href={placement.offer_letter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                <FileText size={12} />
                Offer Letter
                <ExternalLink size={10} />
              </a>
              {placement.offer_letter_verified && (
                <span className="inline-flex items-center gap-0.5 ml-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              )}
              {!placement.offer_letter_verified && placement.offer_letter_rejection_reason && (
                <span className="inline-flex items-center gap-0.5 ml-1 text-red-500 dark:text-red-400">
                  <ShieldX size={12} />
                  Rejected
                </span>
              )}
            </span>
          )}

          {/* Joining Letter */}
          {placement.joining_letter_url && (
            <span className="inline-flex items-center gap-1">
              <a
                href={placement.joining_letter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                <FileText size={12} />
                Joining Letter
                <ExternalLink size={10} />
              </a>
              {placement.joining_letter_verified && (
                <span className="inline-flex items-center gap-0.5 ml-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              )}
              {!placement.joining_letter_verified && placement.joining_letter_rejection_reason && (
                <span className="inline-flex items-center gap-0.5 ml-1 text-red-500 dark:text-red-400">
                  <ShieldX size={12} />
                  Rejected
                </span>
              )}
            </span>
          )}

          <span className="text-gray-400 dark:text-gray-500">
            Received:{" "}
            {new Date(placement.created_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </span>
        </div>

        {/* Row 3b: Document Rejection Alerts */}
        {placement.offer_letter_rejection_reason && !placement.offer_letter_verified && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
            <AlertCircle size={14} className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="text-xs text-red-600 dark:text-red-400">
              <span className="font-medium">Offer letter rejected:</span>{" "}
              {placement.offer_letter_rejection_reason}
            </div>
          </div>
        )}
        {placement.joining_letter_rejection_reason && !placement.joining_letter_verified && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
            <AlertCircle size={14} className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="text-xs text-red-600 dark:text-red-400">
              <span className="font-medium">Joining letter rejected:</span>{" "}
              {placement.joining_letter_rejection_reason}
            </div>
          </div>
        )}

        {/* Row 4: Actions */}
        {(showActions || canUploadDocuments(placement)) && (
          <div className="flex items-center gap-2 pt-1">
            {showActions && (
              <>
                <button
                  type="button"
                  onClick={() => onAccept(placement)}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl transition-colors cursor-pointer"
                >
                  <CheckCircle size={14} />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onReject(placement)}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors cursor-pointer"
                >
                  <XCircle size={14} />
                  Decline
                </button>
              </>
            )}
            {canUploadDocuments(placement) && (
              <button
                type="button"
                onClick={() => onUpload(placement)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl transition-colors cursor-pointer"
              >
                <Upload size={14} />
                Upload Documents
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const MemoPlacementCard = memo(PlacementCard)

// ─── Skeleton List ──────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`skel-${String(i)}`}
          className="flex items-start gap-4 px-5 py-5 motion-safe:animate-pulse border-b border-gray-50 dark:border-gray-800/50 last:border-b-0"
        >
          <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/5" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            </div>
            <div className="flex gap-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
            </div>
            <div className="flex gap-3">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-28" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Error State ────────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-500 dark:text-red-400" />
      </div>
      <p className="text-base font-medium text-gray-600 dark:text-gray-400">
        Failed to load placements
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 text-center max-w-xs">
        Something went wrong. Please check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  )
}

// ─── Empty States ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: Readonly<{ hasFilters: boolean }>) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        {hasFilters ? (
          <Briefcase size={24} className="text-gray-400 dark:text-gray-500" />
        ) : (
          <Trophy size={24} className="text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <p className="text-base font-medium text-gray-600 dark:text-gray-400">
        {hasFilters ? "No matching placements" : "No placements yet"}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 text-center max-w-xs">
        {hasFilters
          ? "Try adjusting your filters to see more results."
          : "When you receive placement offers, they will appear here. Keep applying!"}
      </p>
    </div>
  )
}
