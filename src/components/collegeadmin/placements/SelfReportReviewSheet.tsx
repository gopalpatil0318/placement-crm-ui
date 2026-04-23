import { useState, useCallback, useMemo, useEffect } from "react"
import {
  AlertTriangle,
  Building2,
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  IndianRupee,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  X,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { DocumentPreview } from "@/components/ui/DocumentPreview"
import {
  useSelfReportDetail,
  useReviewSelfReport,
  type AdminSelfReport,
  type ExistingPlacement,
} from "@/hooks/collegeadmin/self-reports/useAdminSelfReports"
import { CompanySearchCombobox, type CompanyOption } from "@/components/ui/CompanySearchCombobox"
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services"
import { usePermissions } from "@/hooks/usePermissions"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  reportId: string | null
  onClose: () => void
}

type EditLevel = "company" | "job" | "position" | null

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
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

function placementTypeLabel(t: string): string {
  if (t === "full-time") return "Full-Time"
  if (t === "internship") return "Internship"
  if (t === "both") return "Both"
  return t
}

function driveTypeLabel(t: string | undefined): string {
  if (t === "off_campus") return "Off-Campus"
  if (t === "pool_campus") return "Pool Campus"
  return t ?? "—"
}

// ─── Job / Position types for smart matching ────────────────────────────────

interface MatchedJob {
  job_id: string
  job_title: string
  job_location?: string
  drive_type?: string
  placement_count?: number
}

interface MatchedPosition {
  position_id: string
  position_name: string
  vacancies?: number
}

type MatchState =
  | { level: "loading" }
  | { level: "no-company" }                                       // unknown company
  | { level: "company-only"; jobs: MatchedJob[] }                 // new job
  | { level: "company-job"; job: MatchedJob; positions: MatchedPosition[] } // new position
  | { level: "full"; job: MatchedJob; position: MatchedPosition } // all 3 matched

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function SelfReportReviewSheet({ reportId, onClose }: Readonly<Props>) {
  const { report, isLoading } = useSelfReportDetail(reportId)
  const { reviewSelfReport, isReviewing } = useReviewSelfReport()
  const { hasPermission } = usePermissions()
  const canReview = hasPermission("self_reports.review")

  // Auto-select company when student already matched one
  const matchedCompany = useMemo<CompanyOption | null>(() => {
    const fd = report?.form_data
    if (fd?.company_id && fd?.company_name) {
      return { company_id: fd.company_id, company_name: fd.company_name }
    }
    return null
  }, [report])

  // ── Local state ──
  const [mode, setMode] = useState<"idle" | "approve" | "reject">("idle")
  const [companyOverride, setCompanyOverride] = useState<CompanyOption | null | undefined>(undefined)
  const [rejectionReason, setRejectionReason] = useState("")
  const [error, setError] = useState("")

  // Smart-match state
  const [matchState, setMatchState] = useState<MatchState>({ level: "no-company" })
  const [jobOverride, setJobOverride] = useState<MatchedJob | null | undefined>(undefined)
  const [posOverride, setPosOverride] = useState<MatchedPosition | null | undefined>(undefined)
  const [editingLevel, setEditingLevel] = useState<EditLevel>(null)

  // Quick-add company
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddName, setQuickAddName] = useState("")
  const [quickAddIndustry, setQuickAddIndustry] = useState("")
  const [quickAddLoading, setQuickAddLoading] = useState(false)

  // Reset all local state when switching to a different report
  useEffect(() => {
    setMode("idle")
    setCompanyOverride(undefined)
    setRejectionReason("")
    setError("")
    setMatchState({ level: "no-company" })
    setJobOverride(undefined)
    setPosOverride(undefined)
    setEditingLevel(null)
    setShowQuickAdd(false)
    setQuickAddName("")
    setQuickAddIndustry("")
  }, [reportId])

  const selectedCompany = companyOverride === undefined ? matchedCompany : companyOverride
  const setSelectedCompany = useCallback((c: CompanyOption | null) => {
    setCompanyOverride(c)
    // Reset downstream overrides when company changes
    setJobOverride(undefined)
    setPosOverride(undefined)
    setEditingLevel(null)
  }, [])

  // Effective selections (override > auto-match)
  const effectiveJob = useMemo(() => {
    if (jobOverride !== undefined) return jobOverride
    if (matchState.level === "company-job" || matchState.level === "full") return matchState.job
    return null
  }, [jobOverride, matchState])

  const effectivePosition = useMemo(() => {
    if (posOverride !== undefined) return posOverride
    if (matchState.level === "full") return matchState.position
    return null
  }, [posOverride, matchState])

  // Derived lists for job/position dropdowns
  const availableJobs = useMemo<MatchedJob[]>(() => {
    if (matchState.level === "company-only") return matchState.jobs
    if (matchState.level === "company-job" || matchState.level === "full") return [matchState.job]
    return []
  }, [matchState])

  const availablePositions = useMemo<MatchedPosition[]>(() => {
    if (matchState.level === "company-job") return matchState.positions
    if (matchState.level === "full") return [matchState.position]
    return []
  }, [matchState])

  // ── Smart matching: fetch jobs + auto-match when company resolves ──
  useEffect(() => {
    if (mode !== "approve" || !selectedCompany || !report) {
      setMatchState({ level: "no-company" })
      return
    }

    let cancelled = false
    const fd = report.form_data

    async function runMatch() {
      setMatchState({ level: "loading" })
      try {
        // Fetch company's off-campus jobs
        const jobsRes = await CollegeAdminService.getAllJobs({
          company_id: selectedCompany!.company_id,
          drive_type: fd.drive_type ?? "off_campus",
          limit: 50,
        })
        const jobs: MatchedJob[] = jobsRes?.data ?? []
        if (cancelled) return

        // Auto-match job_title (case-insensitive)
        const autoJob = fd.job_title
          ? jobs.find((j) => j.job_title.toLowerCase() === fd.job_title.toLowerCase())
          : undefined

        if (!autoJob) {
          setMatchState({ level: "company-only", jobs })
          return
        }

        // Fetch positions for matched job
        const jobDetail = await CollegeAdminService.getJob(autoJob.job_id)
        if (cancelled) return
        const positions: MatchedPosition[] = jobDetail?.data?.positions ?? []

        // Auto-match designation → position_name
        const designation = fd.fulltime_designation
        const autoPos = designation
          ? positions.find((p) => p.position_name.toLowerCase() === designation.toLowerCase())
          : undefined

        if (autoPos) {
          setMatchState({ level: "full", job: autoJob, position: autoPos })
        } else {
          setMatchState({ level: "company-job", job: autoJob, positions })
        }
      } catch {
        if (!cancelled) setMatchState({ level: "company-only", jobs: [] })
      }
    }

    void runMatch()
    return () => { cancelled = true }
  }, [mode, selectedCompany, report])

  // Reset overrides when matchState changes (new auto-match computed)
  useEffect(() => {
    setJobOverride(undefined)
    setPosOverride(undefined)
  }, [matchState])

  // ── Handlers ──
  const handleApprove = useCallback(async () => {
    if (!report || !selectedCompany) return
    setError("")
    try {
      await reviewSelfReport({
        reportId: report.report_id,
        action: "approve",
        company_id: selectedCompany.company_id,
        job_id: effectiveJob?.job_id,
      })
      onClose()
    } catch {
      // Toast already handled by the hook
    }
  }, [report, selectedCompany, effectiveJob, reviewSelfReport, onClose])

  const handleReject = useCallback(async () => {
    if (!report) return
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection")
      return
    }
    setError("")
    try {
      await reviewSelfReport({
        reportId: report.report_id,
        action: "reject",
        rejection_reason: rejectionReason.trim(),
      })
      onClose()
    } catch {
      // Toast already handled by the hook
    }
  }, [report, rejectionReason, reviewSelfReport, onClose])

  const handleQuickAddCompany = useCallback(async () => {
    const name = quickAddName.trim()
    if (!name) return
    setQuickAddLoading(true)
    try {
      const res = await CollegeAdminService.createCompany({
        company_name: name,
        ...(quickAddIndustry.trim() ? { industry: quickAddIndustry.trim() } : {}),
      })
      const created = res?.data?.company ?? res?.data
      if (created?.company_id) {
        setSelectedCompany({ company_id: created.company_id, company_name: created.company_name ?? name })
        setShowQuickAdd(false)
        setQuickAddName("")
        setQuickAddIndustry("")
      }
    } catch {
      setError("Failed to create company")
    } finally {
      setQuickAddLoading(false)
    }
  }, [quickAddName, quickAddIndustry, setSelectedCompany])

  const isPending = report?.verification_status === "pending"

  return (
    <Sheet open={!!reportId} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <SheetTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Self-Report Review
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review off-campus placement self-report details
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          {!isLoading && report && (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Student Info */}
              <StudentSection report={report} />

              {/* Existing Placements Warning */}
              {report.existing_placements && report.existing_placements.length > 0 && (
                <ExistingPlacementsWarning placements={report.existing_placements} />
              )}

              {/* Placement Details */}
              <PlacementSection report={report} />

              {/* Offer Letter */}
              {report.offer_letter_url && (
                <div className="px-5 py-4">
                  <SectionLabel text="Offer Letter" />
                  <div className="mt-2">
                    <DocumentPreview
                      value={report.offer_letter_url}
                      bucket="placenex-private"
                      label="Offer Letter"
                      variant="card"
                    />
                  </div>
                </div>
              )}

              {/* Remarks */}
              {report.form_data.remarks && (
                <div className="px-5 py-4">
                  <SectionLabel text="Student Remarks" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {report.form_data.remarks}
                  </p>
                </div>
              )}

              {/* Review info (for already-reviewed) */}
              {!isPending && (
                <div className="px-5 py-4">
                  <SectionLabel text="Review Details" />
                  <div className="mt-2 space-y-2">
                    <DetailRow label="Status" value={
                      <span className={
                        report.verification_status === "approved"
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-red-600 dark:text-red-400 font-medium"
                      }>
                        {report.verification_status === "approved" ? "Approved" : "Rejected"}
                      </span>
                    } />
                    {report.reviewer_name && (
                      <DetailRow label="Reviewed by" value={report.reviewer_name} />
                    )}
                    <DetailRow label="Reviewed at" value={formatDate(report.reviewed_at)} />
                    {report.rejection_reason && (
                      <DetailRow
                        label="Reason"
                        value={
                          <span className="text-red-600 dark:text-red-400">
                            {report.rejection_reason}
                          </span>
                        }
                      />
                    )}
                  </div>
                </div>
              )}

              {/* ══════ SMART APPROVAL SECTION ══════ */}
              {isPending && mode === "approve" && (
                <ApprovalMatchingSection
                  report={report}
                  selectedCompany={selectedCompany}
                  onSelectCompany={(c) => { setSelectedCompany(c); setEditingLevel(null) }}
                  matchState={matchState}
                  effectiveJob={effectiveJob}
                  effectivePosition={effectivePosition}
                  availableJobs={availableJobs}
                  availablePositions={availablePositions}
                  editingLevel={editingLevel}
                  onSetEditingLevel={setEditingLevel}
                  onSetJobOverride={setJobOverride}
                  onSetPosOverride={setPosOverride}
                  showQuickAdd={showQuickAdd}
                  quickAddName={quickAddName}
                  quickAddIndustry={quickAddIndustry}
                  quickAddLoading={quickAddLoading}
                  onShowQuickAdd={(show) => {
                    setShowQuickAdd(show)
                    if (show) setQuickAddName(report.form_data.company_name ?? "")
                    else { setQuickAddName(""); setQuickAddIndustry("") }
                  }}
                  onQuickAddNameChange={setQuickAddName}
                  onQuickAddIndustryChange={setQuickAddIndustry}
                  onQuickAddSubmit={handleQuickAddCompany}
                />
              )}

              {/* Rejection reason input */}
              {isPending && mode === "reject" && (
                <div className="px-5 py-4">
                  <SectionLabel text="Rejection Reason" />
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value)
                      if (error) setError("")
                    }}
                    rows={3}
                    aria-label="Rejection reason"
                    placeholder="Explain why this report is being rejected..."
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                  {error && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
                  )}
                </div>
              )}

              {/* Error message (approve flow) */}
              {isPending && mode === "approve" && error && (
                <div className="px-5 pb-2">
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {report && isPending && canReview && (
          <SheetFooter className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            {mode === "idle" && (
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setMode("approve")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => setMode("reject")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            )}

            {mode === "approve" && (
              <div className="flex w-full gap-3">
                <button
                  onClick={() => { setMode("idle"); setEditingLevel(null); setShowQuickAdd(false) }}
                  disabled={isReviewing}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isReviewing || !selectedCompany || matchState.level === "loading"}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReviewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {selectedCompany ? "Confirm Approval" : "Select a Company First"}
                </button>
              </div>
            )}

            {mode === "reject" && (
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setMode("idle")}
                  disabled={isReviewing}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleReject}
                  disabled={isReviewing}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {isReviewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Confirm Rejection
                </button>
              </div>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Smart Approval Sub-components ──────────────────────────────────────────────

/** The approval matching section — Company → Job → Position chain */
function ApprovalMatchingSection({
  report, selectedCompany, onSelectCompany, matchState,
  effectiveJob, effectivePosition, availableJobs, availablePositions,
  editingLevel, onSetEditingLevel, onSetJobOverride, onSetPosOverride,
  showQuickAdd, quickAddName, quickAddIndustry, quickAddLoading,
  onShowQuickAdd, onQuickAddNameChange, onQuickAddIndustryChange, onQuickAddSubmit,
}: Readonly<{
  report: AdminSelfReport
  selectedCompany: CompanyOption | null
  onSelectCompany: (c: CompanyOption | null) => void
  matchState: MatchState
  effectiveJob: MatchedJob | null
  effectivePosition: MatchedPosition | null
  availableJobs: MatchedJob[]
  availablePositions: MatchedPosition[]
  editingLevel: EditLevel
  onSetEditingLevel: (l: EditLevel) => void
  onSetJobOverride: (j: MatchedJob | null | undefined) => void
  onSetPosOverride: (p: MatchedPosition | null | undefined) => void
  showQuickAdd: boolean
  quickAddName: string
  quickAddIndustry: string
  quickAddLoading: boolean
  onShowQuickAdd: (show: boolean) => void
  onQuickAddNameChange: (v: string) => void
  onQuickAddIndustryChange: (v: string) => void
  onQuickAddSubmit: () => void
}>) {
  return (
    <div className="px-5 py-4 space-y-4">
      <SectionLabel text="Approval Matching" />

      {/* ── Company Row ── */}
      {editingLevel === "company" ? (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Select company:</p>
          <CompanySearchCombobox selected={selectedCompany} onSelect={onSelectCompany} />
          {!selectedCompany && (
            <div className="mt-2">
              {showQuickAdd ? (
                <QuickAddCompanyForm
                  name={quickAddName}
                  industry={quickAddIndustry}
                  loading={quickAddLoading}
                  onNameChange={onQuickAddNameChange}
                  onIndustryChange={onQuickAddIndustryChange}
                  onSubmit={onQuickAddSubmit}
                  onCancel={() => onShowQuickAdd(false)}
                />
              ) : (
                <button
                  onClick={() => onShowQuickAdd(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Plus className="h-3 w-3" /> Add new company
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <MatchRow
          icon={<Building2 className="h-4 w-4" />}
          label="Company"
          value={selectedCompany?.company_name}
          matched={!!selectedCompany}
          newLabel={`"${report.form_data.company_name}" not found`}
          onEdit={() => onSetEditingLevel("company")}
        />
      )}

      {/* ── Job Row ── */}
      {selectedCompany && matchState.level !== "loading" && (
        <JobMatchRow
          effectiveJob={effectiveJob}
          editing={editingLevel === "job"}
          availableJobs={availableJobs}
          formJobTitle={report.form_data.job_title}
          onEdit={() => onSetEditingLevel("job")}
          onCancel={() => onSetEditingLevel(null)}
          onPick={(j) => { onSetJobOverride(j); onSetPosOverride(undefined); onSetEditingLevel(null) }}
        />
      )}

      {/* ── Position Row ── */}
      {selectedCompany && effectiveJob && matchState.level !== "loading" && (
        <PositionMatchRow
          effectivePosition={effectivePosition}
          editing={editingLevel === "position"}
          availablePositions={availablePositions}
          formDesignation={report.form_data.fulltime_designation ?? "External Hire"}
          onEdit={() => onSetEditingLevel("position")}
          onCancel={() => onSetEditingLevel(null)}
          onPick={(p) => { onSetPosOverride(p); onSetEditingLevel(null) }}
        />
      )}

      {/* Loading indicator */}
      {selectedCompany && matchState.level === "loading" && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Matching jobs…</span>
        </div>
      )}

      {/* Summary pill */}
      {selectedCompany && matchState.level !== "loading" && (
        <ApprovalSummary
          company={selectedCompany.company_name}
          job={effectiveJob}
          position={effectivePosition}
          formData={report.form_data}
        />
      )}
    </div>
  )
}

/** Job row: editing or display */
function JobMatchRow({ effectiveJob, editing, availableJobs, formJobTitle, onEdit, onCancel, onPick }: Readonly<{
  effectiveJob: MatchedJob | null
  editing: boolean
  availableJobs: MatchedJob[]
  formJobTitle: string
  onEdit: () => void
  onCancel: () => void
  onPick: (j: MatchedJob | null) => void
}>) {
  if (editing) {
    return (
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Select existing job or leave empty for new:</p>
        <select
          value={effectiveJob?.job_id ?? ""}
          onChange={(e) => onPick(availableJobs.find((j) => j.job_id === e.target.value) ?? null)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">+ New Job</option>
          {availableJobs.map((j) => (
            <option key={j.job_id} value={j.job_id}>
              {j.job_title}{j.job_location ? ` — ${j.job_location}` : ""}
            </option>
          ))}
        </select>
        <button onClick={onCancel} className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
      </div>
    )
  }
  return (
    <MatchRow
      icon={<Briefcase className="h-4 w-4" />}
      label="Job"
      value={effectiveJob?.job_title}
      matched={!!effectiveJob}
      newLabel={`"${formJobTitle}" — will create new`}
      onEdit={onEdit}
    />
  )
}

/** Position row: editing or display */
function PositionMatchRow({ effectivePosition, editing, availablePositions, formDesignation, onEdit, onCancel, onPick }: Readonly<{
  effectivePosition: MatchedPosition | null
  editing: boolean
  availablePositions: MatchedPosition[]
  formDesignation: string
  onEdit: () => void
  onCancel: () => void
  onPick: (p: MatchedPosition | null) => void
}>) {
  if (editing) {
    return (
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Select existing position or leave empty for new:</p>
        <select
          value={effectivePosition?.position_id ?? ""}
          onChange={(e) => onPick(availablePositions.find((p) => p.position_id === e.target.value) ?? null)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">+ New Position</option>
          {availablePositions.map((p) => (
            <option key={p.position_id} value={p.position_id}>
              {p.position_name}{p.vacancies == null ? "" : ` (${p.vacancies} vacancies)`}
            </option>
          ))}
        </select>
        <button onClick={onCancel} className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
      </div>
    )
  }
  return (
    <MatchRow
      icon={<ChevronRight className="h-4 w-4" />}
      label="Position"
      value={effectivePosition?.position_name}
      matched={!!effectivePosition}
      newLabel={`"${formDesignation}" — will create new`}
      onEdit={onEdit}
    />
  )
}

/** Single row in the matching chain: Company → Job → Position */
function MatchRow({
  icon, label, value, matched, newLabel, onEdit,
}: Readonly<{
  icon: React.ReactNode
  label: string
  value?: string | null
  matched: boolean
  newLabel: string
  onEdit: () => void
}>) {
  return (
    <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm
      border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">{icon}</span>
      <span className="w-16 flex-shrink-0 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{label}</span>
      {matched ? (
        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium truncate">
          <Check className="h-3.5 w-3.5 flex-shrink-0" /> {value}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 truncate">
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0" /> {newLabel}
        </span>
      )}
      <button
        onClick={onEdit}
        className="ml-auto flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
        title={`Change ${label.toLowerCase()}`}
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  )
}

/** Approval summary pill that shows the matching chain */
function ApprovalSummary({
  company, job, position, formData,
}: Readonly<{
  company: string
  job: MatchedJob | null
  position: MatchedPosition | null
  formData: { job_title: string; fulltime_designation?: string }
}>) {
  const jobLabel = job ? job.job_title : formData.job_title
  const posLabel = position ? position.position_name : (formData.fulltime_designation ?? "External Hire")
  const allMatched = !!job && !!position
  const bg = allMatched
    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
    : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"

  return (
    <div className={`rounded-lg border p-3 ${bg}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 flex-wrap">
        <span className={job && position ? "text-emerald-700 dark:text-emerald-400" : ""}>{company}</span>
        <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
        <span className={job ? "text-emerald-700 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}>
          {!job && "🆕 "}{jobLabel}
        </span>
        <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
        <span className={position ? "text-emerald-700 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}>
          {!position && "🆕 "}{posLabel}
        </span>
      </div>
      {allMatched && job.placement_count != null && (
        <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-500">
          {job.placement_count} existing placement{job.placement_count === 1 ? "" : "s"} in this role
        </p>
      )}
    </div>
  )
}

/** Inline quick-add company mini form */
function QuickAddCompanyForm({
  name, industry, loading, onNameChange, onIndustryChange, onSubmit, onCancel,
}: Readonly<{
  name: string
  industry: string
  loading: boolean
  onNameChange: (v: string) => void
  onIndustryChange: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
}>) {
  return (
    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-2">
      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Quick Add Company</p>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Company name *"
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={industry}
        onChange={(e) => onIndustryChange(e.target.value)}
        placeholder="Industry (optional)"
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={loading || !name.trim()}
          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Create
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Sections ───────────────────────────────────────────────────────────────────

function StudentSection({ report }: Readonly<{ report: AdminSelfReport }>) {
  const name = `${report.student_first_name ?? ""} ${report.student_last_name ?? ""}`.trim()
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-semibold text-blue-700 dark:text-blue-300">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {name || "Unknown Student"}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {report.student_email && <span className="truncate">{report.student_email}</span>}
            {report.dept_name && (
              <>
                <span>·</span>
                <span className="truncate">{report.dept_name}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ExistingPlacementsWarning({
  placements,
}: Readonly<{ placements: ExistingPlacement[] }>) {
  return (
    <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/10 border-y border-amber-200 dark:border-amber-800/30">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            Student already has {placements.length} existing placement{placements.length > 1 ? "s" : ""}
          </p>
          <div className="mt-1 space-y-1">
            {placements.map((p) => (
              <p key={`${p.company_name}-${p.placement_type}`} className="text-xs text-amber-700 dark:text-amber-400">
                {p.company_name} — {placementTypeLabel(p.placement_type)}
                {p.fulltime_package ? ` (${formatPackage(p.fulltime_package)})` : ""}
                {" "}
                <span className="text-amber-500 capitalize">[{p.placement_status}]</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlacementSection({ report }: Readonly<{ report: AdminSelfReport }>) {
  const fd = report.form_data
  return (
    <div className="px-5 py-4">
      <SectionLabel text="Placement Details" />
      <div className="mt-3 space-y-2.5">
        <DetailRow
          label="Company"
          icon={<Building2 className="h-3.5 w-3.5" />}
          value={
            <span>
              {fd.company_name}
              {fd.company_id && (
                <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  <Check className="h-2.5 w-2.5" /> Matched
                </span>
              )}
            </span>
          }
        />
        <DetailRow
          label="Job Title"
          icon={<Briefcase className="h-3.5 w-3.5" />}
          value={fd.job_title}
        />
        <DetailRow label="Placement Type" value={placementTypeLabel(fd.placement_type)} />
        <DetailRow label="Drive Type" value={driveTypeLabel(fd.drive_type)} />

        {(fd.placement_type === "full-time" || fd.placement_type === "both") && (
          <>
            <DetailRow
              label="Package"
              icon={<IndianRupee className="h-3.5 w-3.5" />}
              value={
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatPackage(fd.fulltime_package)}
                </span>
              }
            />
            {fd.fulltime_designation && (
              <DetailRow label="Designation" value={fd.fulltime_designation} />
            )}
            {fd.fulltime_joining_date && (
              <DetailRow label="Joining Date" value={formatDate(fd.fulltime_joining_date)} />
            )}
          </>
        )}

        {(fd.placement_type === "internship" || fd.placement_type === "both") && (
          <>
            {fd.internship_stipend != null && (
              <DetailRow label="Stipend" value={`₹${fd.internship_stipend.toLocaleString("en-IN")}/month`} />
            )}
            {fd.internship_duration && (
              <DetailRow label="Duration" value={fd.internship_duration} />
            )}
            {fd.internship_start_date && (
              <DetailRow label="Start Date" value={formatDate(fd.internship_start_date)} />
            )}
          </>
        )}

        {fd.job_location && (
          <DetailRow
            label="Location"
            icon={<MapPin className="h-3.5 w-3.5" />}
            value={fd.job_location}
          />
        )}
        {fd.offer_date && (
          <DetailRow
            label="Offer Date"
            icon={<Calendar className="h-3.5 w-3.5" />}
            value={formatDate(fd.offer_date)}
          />
        )}
      </div>
    </div>
  )
}

// ─── Primitives ─────────────────────────────────────────────────────────────────

function SectionLabel({ text }: Readonly<{ text: string }>) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {text}
    </h3>
  )
}

function DetailRow({
  label,
  value,
  icon,
}: Readonly<{
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}>) {
  if (value == null || value === "" || value === "—") return null
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon && (
        <span className="mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="w-28 flex-shrink-0 text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  )
}
