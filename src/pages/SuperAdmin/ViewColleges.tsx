import React from "react"
import { Search, Plus, Building2, AlertCircle, RefreshCw } from "lucide-react"
import PageHeader from "@/components/sysadmin/PageHeader"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList"
import { useViewColleges, type College } from "@/hooks/sysadmin/useViewColleges"

const BREADCRUMBS = [
  { label: "Dashboard", path: "/sysadmin/dashboard" },
  { label: "Colleges", active: true },
]

const COLLEGE_TYPES = [
  { value: "", label: "All Types" },
  { value: "engineering", label: "Engineering" },
  { value: "diploma", label: "Diploma" },
  { value: "mba", label: "MBA" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "degree", label: "Degree" },
  { value: "medical", label: "Medical" },
]

const PAGE_SIZES = [10, 25, 50]

const TABLE_HEADERS = ["College Name", "Subdomain", "Type", "Status", "Students", "Plan", "City", "State", "Year", "Created"]

const PLAN_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  trial: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  expired: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  suspended: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" },
  none: { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function PlanBadge({ status }: Readonly<{ status: string | null }>) {
  const key = status ?? "none"
  const s = PLAN_STYLES[key] ?? PLAN_STYLES.none
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {key === "none" ? "No Plan" : key}
    </span>
  )
}

function StudentsCell({ used, quota }: Readonly<{ used: number; quota: number | null }>) {
  if (quota === null || quota === 0) {
    return <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">{used}</span>
  }
  const pct = Math.min(Math.round((used / quota) * 100), 100)
  let color = "text-emerald-600 dark:text-emerald-400"
  if (pct >= 90) color = "text-red-600 dark:text-red-400"
  else if (pct >= 70) color = "text-amber-600 dark:text-amber-400"
  return (
    <span className={`text-sm font-medium tabular-nums ${color}`}>
      {used}/{quota}
    </span>
  )
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const isActive = status === "active"
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
      isActive
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
      {status}
    </span>
  )
}

function EmptyState({ hasFilters }: Readonly<{ hasFilters: boolean }>) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
        <Building2 className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {hasFilters ? "No colleges match your filters" : "No colleges yet"}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {hasFilters
          ? "Try adjusting your search or filter criteria."
          : "Click 'Add College' to register your first institution."}
      </p>
    </div>
  )
}

export default function ViewColleges() {
  const {
    colleges,
    loading,
    isFetching,
    error,
    refresh,
    search,
    page,
    limit,
    pagination,
    statusFilter,
    typeFilter,
    handleSearchChange,
    handleLimitChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    setPage,
    handleNavigateToAddCollege,
    handleNavigateToViewCollege,
  } = useViewColleges()

  const hasFilters = !!(search || statusFilter || typeFilter)

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <PageHeader title="Colleges" breadcrumbs={BREADCRUMBS} />

        {/* ── Error State ── */}
        {error && !loading && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm p-10 flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Failed to load colleges</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => refresh()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}

        {!error && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <Toolbar
            search={search}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            limit={limit}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusFilterChange}
            onTypeChange={handleTypeFilterChange}
            onLimitChange={handleLimitChange}
            onAddCollege={handleNavigateToAddCollege}
          />

          {/* ─── Table (desktop) ─────────────────────────────────────── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <DesktopTableBody
                colleges={colleges}
                loading={loading}
                limit={limit}
                hasFilters={hasFilters}
                onRowClick={handleNavigateToViewCollege}
              />
            </table>
          </div>

          {/* ─── Mobile Cards ─────────────────────────────────────────────── */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            <MobileCardList
              colleges={colleges}
              loading={loading}
              limit={limit}
              hasFilters={hasFilters}
              onCardClick={handleNavigateToViewCollege}
            />
          </div>

          {/* ─── Pagination ───────────────────────────────────────────────── */}
          {pagination.totalPages > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border-t border-gray-100 dark:border-gray-800 text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                {loading ? (
                  <span>Loading page {page}...</span>
                ) : (
                  <>
                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total}
                  </>
                )}
              </p>

              <div className="flex items-center gap-1.5 mt-3 sm:mt-0">
                <PaginationButton
                  label="Previous"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage(Math.max(1, page - 1))}
                />

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-gray-400 dark:text-gray-500">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        disabled={isFetching}
                        className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}

                <PaginationButton
                  label="Next"
                  disabled={page >= pagination.totalPages || isFetching}
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                />
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

function Toolbar({ search, statusFilter, typeFilter, limit, onSearchChange, onStatusChange, onTypeChange, onLimitChange, onAddCollege }: Readonly<{
  search: string
  statusFilter: string
  typeFilter: string
  limit: number
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStatusChange: (v: string) => void
  onTypeChange: (v: string) => void
  onLimitChange: (v: number) => void
  onAddCollege: () => void
}>) {
  return (
    <div className="p-5 border-b border-gray-100 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search colleges..."
            value={search}
            onChange={onSearchChange}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        >
          {COLLEGE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-3 sm:ml-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            Show{" "}
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm outline-none text-gray-700 dark:text-gray-300"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={onAddCollege}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add College
          </button>
        </div>
      </div>
    </div>
  )
}

function DesktopTableBody({ colleges, loading, limit, hasFilters, onRowClick }: Readonly<{
  colleges: College[]
  loading: boolean
  limit: number
  hasFilters: boolean
  onRowClick: (id: string) => void
}>) {
  if (loading) {
    return (
      <tbody>
        {Array.from({ length: limit }).map((_, i) => (
          <tr key={`vc-skel-${String(i)}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
            {Array.from({ length: TABLE_HEADERS.length }).map((_, j) => (
              <td key={`vc-skel-${String(i)}-${String(j)}`} className="px-5 py-3.5">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

  if (colleges.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={TABLE_HEADERS.length} className="py-16 text-center">
            <EmptyState hasFilters={hasFilters} />
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <AnimatedTableBody>
      {colleges.map((college) => (
        <AnimatedRow
          key={college.college_id}
          onClick={() => onRowClick(college.college_id)}
          className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
        >
          <td className="px-5 py-3.5">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              {college.college_name}
            </span>
          </td>
          <td className="px-5 py-3.5">
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
              {college.college_subdomain}
            </span>
          </td>
          <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 capitalize">
            {college.college_type || "—"}
          </td>
          <td className="px-5 py-3.5">
            <StatusBadge status={college.college_status} />
          </td>
          <td className="px-5 py-3.5">
            <StudentsCell used={college.students_used} quota={college.student_quota} />
          </td>
          <td className="px-5 py-3.5">
            <PlanBadge status={college.subscription_status} />
          </td>
          <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
            {college.college_city || "—"}
          </td>
          <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
            {college.college_state || "—"}
          </td>
          <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
            {college.default_academic_year || "—"}
          </td>
          <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
            {formatDate(college.created_at)}
          </td>
        </AnimatedRow>
      ))}
    </AnimatedTableBody>
  )
}

function MobileCardList({ colleges, loading, limit, hasFilters, onCardClick }: Readonly<{
  colleges: College[]
  loading: boolean
  limit: number
  hasFilters: boolean
  onCardClick: (id: string) => void
}>) {
  if (loading) {
    return (
      <>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={`vc-mob-skel-${String(i)}`} className="p-4 space-y-3 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
            <div className="flex gap-3">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
            </div>
          </div>
        ))}
      </>
    )
  }

  if (colleges.length === 0) {
    return (
      <div className="py-16 text-center">
        <EmptyState hasFilters={hasFilters} />
      </div>
    )
  }

  return (
    <>
      {colleges.map((college) => (
        <button
          type="button"
          key={college.college_id}
          onClick={() => onCardClick(college.college_id)}
          className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-800"
        >
          <div className="flex items-start justify-between gap-3 mb-1">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate min-w-0 flex-1">
              {college.college_name}
            </p>
            <StatusBadge status={college.college_status} />
          </div>
          <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">
            {college.college_subdomain}
          </span>
          <div className="flex items-center gap-3 mb-2">
            <StudentsCell used={college.students_used} quota={college.student_quota} />
            <PlanBadge status={college.subscription_status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            {college.college_type && <span className="capitalize">{college.college_type}</span>}
            {(college.college_city || college.college_state) && (
              <span>{[college.college_city, college.college_state].filter(Boolean).join(", ")}</span>
            )}
            <span>Year: {college.default_academic_year || "—"}</span>
            <span>{formatDate(college.created_at)}</span>
          </div>
        </button>
      ))}
    </>
  )
}

function PaginationButton({ label, disabled, onClick }: Readonly<{ label: string; disabled: boolean; onClick: () => void }>) {
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