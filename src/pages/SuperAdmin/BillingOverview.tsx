import { useNavigate } from "react-router-dom"
import {
  Search,
  IndianRupee,
  AlertTriangle,
  Users,
  Clock,
  Zap,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import PageHeader from "@/components/sysadmin/PageHeader"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList"
import { useBillingOverview, useBillingSummary } from "@/hooks/sysadmin/useBilling"
import type { BillingCollege, SubscriptionStatus } from "@/services/sysadmin/subscription.services"

// ─── Constants ──────────────────────────────────────────────────────────────────

const BREADCRUMBS = [
  { label: "Dashboard", path: "/sysadmin/dashboard" },
  { label: "Billing", active: true },
]

const STATUS_OPTIONS = [
  { value: "all", label: "All Plans" },
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "expired", label: "Expired" },
  { value: "suspended", label: "Suspended" },
  { value: "none", label: "No Plan" },
  { value: "overdue", label: "Overdue" },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || amount === 0) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function getQuotaPercent(used: number, quota: number | null): number {
  if (!quota || quota === 0) return 0
  return Math.min(Math.round((used / quota) * 100), 100)
}

function getQuotaColor(percent: number): string {
  if (percent >= 100) return "bg-red-500"
  if (percent >= 90) return "bg-red-400"
  if (percent >= 80) return "bg-amber-400"
  return "bg-emerald-500"
}

function getStatusStyle(status: SubscriptionStatus | null): { bg: string; text: string; dot: string } {
  switch (status) {
    case "active":
      return { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" }
    case "trial":
      return { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" }
    case "expired":
      return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" }
    case "suspended":
      return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" }
    default:
      return { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" }
  }
}

function getDaysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function BillingOverview() {
  const navigate = useNavigate()
  const { summary, loading: summaryLoading } = useBillingSummary()
  const {
    colleges,
    loading,
    error,
    pagination,
    search,
    statusFilter,
    page,
    limit,
    setPage,
    handleSearchChange,
    handleStatusChange,
  } = useBillingOverview()

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <PageHeader title="Billing & Subscriptions" breadcrumbs={BREADCRUMBS} />

        {/* ─── Summary Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={IndianRupee}
            label="Total Revenue"
            value={formatCurrency(summary.total_revenue)}
            color="emerald"
            loading={summaryLoading}
          />
          <SummaryCard
            icon={Clock}
            label="Amount Pending"
            value={formatCurrency(summary.total_pending)}
            color="amber"
            loading={summaryLoading}
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Overdue"
            value={String(summary.overdue_count)}
            color="red"
            loading={summaryLoading}
          />
          <SummaryCard
            icon={Users}
            label="No Plan"
            value={String(summary.no_plan_count)}
            color="gray"
            loading={summaryLoading}
          />
        </div>

        {/* ─── Mini Stats ──────────────────────────────────────────────── */}
        {!summaryLoading && (
          <div className="flex flex-wrap gap-3">
            <MiniStat label="Active" count={summary.active_count} color="emerald" />
            <MiniStat label="Trial" count={summary.trial_count} color="blue" />
            <MiniStat label="Overdue" count={summary.overdue_count} color="red" />
          </div>
        )}

        {/* ─── Error State ── */}
        {error && !loading && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm p-10 flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Failed to load billing data</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        )}

        {!error && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* ─── Toolbar ──────────────────────────────────────────────── */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search colleges..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ─── Table ─────────────────────────────────────────────── */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {["College", "Plan", "Students", "Quota", "Amount", "Paid", "Due", "Expires", "Actions"].map((h) => (
                    <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "sr-only" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {loading ? (
                <tbody>
                  {Array.from({ length: limit }).map((_, i) => (
                    <tr key={`billing-skel-${String(i)}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={`billing-skel-${String(i)}-${String(j)}`} className="px-5 py-3.5">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ) : (
                <BillingTableBody
                  colleges={colleges}
                  onRowClick={(id) => navigate(`/sysadmin/colleges/${id}`)}
                />
              )}
            </table>
          </div>

          {/* ─── Pagination ───────────────────────────────────────────── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-gray-800 text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1.5">
                <PaginationBtn label="Previous" disabled={page <= 1} onClick={() => setPage(page - 1)} />
                <PaginationBtn label="Next" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} />
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </AnimatedPage>
  )
}

// ─── Billing Row ────────────────────────────────────────────────────────────────

function BillingRow({ college, onClick }: Readonly<{ college: BillingCollege; onClick: () => void }>) {
  const status = college.subscription_status ?? college.college_subscription_status ?? "none"
  const style = getStatusStyle(status)
  const quotaPercent = getQuotaPercent(college.students_used, college.student_quota)
  const quotaColor = getQuotaColor(quotaPercent)
  const due = (college.total_amount ?? 0) - (college.amount_paid ?? 0)
  const daysLeft = getDaysRemaining(status === "trial" ? college.trial_ends_at : college.valid_to)

  return (
    <AnimatedRow
      onClick={onClick}
      className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
    >
      {/* College */}
      <td className="px-5 py-3.5">
        <div>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            {college.college_name}
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
            {college.college_subdomain}
          </p>
        </div>
      </td>

      {/* Plan badge */}
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${style.bg} ${style.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {status}
        </span>
      </td>

      {/* Students used */}
      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300 tabular-nums">
        {college.students_used}
      </td>

      {/* Quota bar */}
      <td className="px-5 py-3.5">
        {college.student_quota ? (
          <div className="w-28">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                {college.students_used}/{college.student_quota}
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{quotaPercent}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${quotaColor}`} style={{ width: `${quotaPercent}%` }} />
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">Unlimited</span>
        )}
      </td>

      {/* Amount */}
      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300 tabular-nums">
        {formatCurrency(college.total_amount)}
      </td>

      {/* Paid */}
      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300 tabular-nums">
        {formatCurrency(college.amount_paid)}
      </td>

      {/* Due */}
      <td className="px-5 py-3.5">
        {due > 0 ? (
          <span className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums">
            {formatCurrency(due)}
          </span>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
        )}
      </td>

      {/* Expires */}
      <td className="px-5 py-3.5">
        <ExpiryCell status={status} daysLeft={daysLeft} dateStr={status === "trial" ? college.trial_ends_at : college.valid_to} />
      </td>

      {/* Action */}
      <td className="px-5 py-3.5">
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">
          View →
        </span>
      </td>
    </AnimatedRow>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function ExpiryCell({ status, daysLeft, dateStr }: Readonly<{ status: string; daysLeft: number | null; dateStr: string | null }>) {
  if (status === "none" || !dateStr) return <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
  if (status === "expired") return <span className="text-xs font-semibold text-red-600 dark:text-red-400">Expired</span>

  if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" />
        {daysLeft}d left
      </span>
    )
  }

  return <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(dateStr)}</span>
}

const COLOR_MAP = {
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/20", icon: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
  red: { bg: "bg-red-50 dark:bg-red-900/20", icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  gray: { bg: "bg-gray-50 dark:bg-gray-800", icon: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" },
} as const

function SummaryCard({ icon: Icon, label, value, color, loading }: Readonly<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: keyof typeof COLOR_MAP
  loading: boolean
}>) {
  const c = COLOR_MAP[color]
  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-800 p-5 ${c.bg}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${c.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
          {loading ? (
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-1 animate-pulse" />
          ) : (
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums truncate">{value}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, count, color }: Readonly<{ label: string; count: number; color: "emerald" | "blue" | "red" }>) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      <Zap className="h-3 w-3" />
      {count} {label}
    </span>
  )
}

function PaginationBtn({ label, disabled, onClick }: Readonly<{ label: string; disabled: boolean; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-3.5 h-9 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {label}
    </button>
  )
}

function BillingTableBody({ colleges, onRowClick }: Readonly<{ colleges: BillingCollege[]; onRowClick: (id: string) => void }>) {
  if (colleges.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={9} className="py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No colleges found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <AnimatedTableBody>
      {colleges.map((college) => (
        <BillingRow
          key={college.college_id}
          college={college}
          onClick={() => onRowClick(college.college_id)}
        />
      ))}
    </AnimatedTableBody>
  )
}
