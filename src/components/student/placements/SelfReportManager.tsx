import { useState, useCallback, useRef, useEffect } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import AnimatedTabContent from "@/components/ui/AnimatedTabContent"
import FloatingInput from "@/components/ui/FloatingInput"
import FloatingTextarea from "@/components/ui/FloatingTextarea"
import { FileUpload } from "@/components/ui/FileUpload"
import { DocumentPreview } from "@/components/ui/DocumentPreview"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useFileUpload } from "@/hooks/useFileUpload"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { useCompanySearch } from "@/hooks/student/self-report/useCompanySearch"
import { useSubmitSelfReport } from "@/hooks/student/self-report/useSubmitSelfReport"
import { useMySelfReports } from "@/hooks/student/self-report/useMySelfReports"
import { useCancelSelfReport } from "@/hooks/student/self-report/useCancelSelfReport"
import {
  submitSelfReportSchema,
  getFieldErrors,
  PLACEMENT_TYPE_LABELS,
  DRIVE_TYPE_LABELS,
  type PlacementType,
  type DriveType,
} from "@/validators/student/selfReportSchema"
import type {
  SelfReport,
  SelfReportFormData,
  CompanySearchResult,
} from "@/services/student/selfReport.service"

// ─── Constants ──────────────────────────────────────────────────────────────────

const TAB_KEYS = ["report", "my-reports"] as const
type TabKey = (typeof TAB_KEYS)[number]

const STEPS = [
  { label: "Company & Role", icon: Building2 },
  { label: "Placement Details", icon: Briefcase },
  { label: "Documentation", icon: FileText },
] as const

const STATUS_CONFIG = {
  pending: {
    border: "border-amber-200 dark:border-amber-800/50",
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
    label: "Under Review",
  },
  approved: {
    border: "border-emerald-200 dark:border-emerald-800/50",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle,
    label: "Verified ✓",
  },
  rejected: {
    border: "border-red-200 dark:border-red-800/50",
    bg: "bg-red-50/50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
    label: "Rejected",
  },
} as const

const PLACEMENT_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-Time" },
  { value: "internship", label: "Internship" },
  { value: "both", label: "Full-Time + Internship" },
]

const DRIVE_TYPE_OPTIONS = [
  { value: "off_campus", label: "Off Campus" },
  { value: "pool_campus", label: "Pool Campus" },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
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
  if (val == null) return "—"
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} LPA`
  return `₹${val.toLocaleString("en-IN")}`
}

function formatStipend(val: number | null | undefined): string {
  if (val == null) return "—"
  return `₹${val.toLocaleString("en-IN")}/month`
}

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0]
}

// ─── Initial Form State ─────────────────────────────────────────────────────────

interface FormState {
  company_name: string
  company_id: string | null
  job_title: string
  job_location: string
  placement_type: PlacementType
  drive_type: DriveType
  fulltime_package: string
  fulltime_designation: string
  fulltime_joining_date: string
  internship_stipend: string
  internship_duration: string
  internship_start_date: string
  offer_date: string
  offer_letter_url: string | null
  remarks: string
}

const INITIAL_FORM: FormState = {
  company_name: "",
  company_id: null,
  job_title: "",
  job_location: "",
  placement_type: "full-time",
  drive_type: "off_campus",
  fulltime_package: "",
  fulltime_designation: "",
  fulltime_joining_date: "",
  internship_stipend: "",
  internship_duration: "",
  internship_start_date: "",
  offer_date: "",
  offer_letter_url: null,
  remarks: "",
}

// ═════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════════

export default function SelfReportManager() {
  const shouldReduce = useReducedMotion()
  const [activeTab, setActiveTab] = useState<TabKey>("report")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Off-Campus Placement
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Report your off-campus placement and track its verification status
        </p>
      </div>

      {/* Tab bar */}
      <div role="tablist" className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/50">
        <TabButton
          active={activeTab === "report"}
          onClick={() => setActiveTab("report")}
          icon={<Plus className="h-4 w-4" />}
          label="Report Placement"
        />
        <TabButton
          active={activeTab === "my-reports"}
          onClick={() => setActiveTab("my-reports")}
          icon={<FileText className="h-4 w-4" />}
          label="My Reports"
        />
      </div>

      {/* Tab content */}
      <AnimatedTabContent activeTab={activeTab} tabKeys={TAB_KEYS}>
        {activeTab === "report" && (
          <ReportForm onSuccess={() => setActiveTab("my-reports")} />
        )}
        {activeTab === "my-reports" && (
          <MyReportsList
            shouldReduce={shouldReduce}
            onResubmit={() => setActiveTab("report")}
          />
        )}
      </AnimatedTabContent>
    </div>
  )
}

// ─── Tab Button ─────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon,
  label,
}: Readonly<{
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}>) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-white text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-400"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

// ═════════════════════════════════════════════════════════════════════════════════
// TAB 1 — REPORT FORM (3-step)
// ═════════════════════════════════════════════════════════════════════════════════

function ReportForm({ onSuccess }: Readonly<{ onSuccess: () => void }>) {
  const { user } = useStudentAuth()
  const { submitSelfReport, isSubmitting } = useSubmitSelfReport()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Company combobox
  const [companySearch, setCompanySearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<CompanySearchResult | null>(null)
  const { companies, isSearching } = useCompanySearch(companySearch)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Offer letter upload
  const offerLetterUpload = useFileUpload()
  const [offerPath, setOfferPath] = useState("")

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Cleanup success timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
    }
  }, [])

  // ── Field handlers ──
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setForm((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => {
        if (!prev[name]) return prev
        const next = { ...prev }
        delete next[name]
        return next
      })
    },
    [],
  )

  // ── Company combobox ──
  const handleCompanySearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setCompanySearch(val)
      setForm((prev) => ({ ...prev, company_name: val, company_id: null }))
      setSelectedCompany(null)
      setShowDropdown(val.length >= 2)
      setErrors((prev) => {
        if (!prev.company_name) return prev
        const next = { ...prev }
        delete next.company_name
        return next
      })
    },
    [],
  )

  const handleSelectCompany = useCallback((company: CompanySearchResult) => {
    setSelectedCompany(company)
    setCompanySearch(company.company_name)
    setForm((prev) => ({
      ...prev,
      company_name: company.company_name,
      company_id: company.company_id,
    }))
    setShowDropdown(false)
  }, [])

  const handleClearCompany = useCallback(() => {
    setSelectedCompany(null)
    setCompanySearch("")
    setForm((prev) => ({ ...prev, company_name: "", company_id: null }))
  }, [])

  // ── Step validation ──
  const validateStep = useCallback(
    (s: number): boolean => {
      const errs: Record<string, string> = {}
      if (s === 0) {
        if (!form.company_name || form.company_name.length < 2)
          errs.company_name = "Company name is required (min 2 characters)"
        if (!form.job_title || form.job_title.length < 3)
          errs.job_title = "Job title is required (min 3 characters)"
      }
      if (s === 1) {
        const isFulltime = form.placement_type === "full-time" || form.placement_type === "both"
        const isInternship = form.placement_type === "internship" || form.placement_type === "both"
        if (isFulltime && !form.fulltime_package)
          errs.fulltime_package = "Package is required for full-time placements"
        if (isInternship && !form.internship_stipend)
          errs.internship_stipend = "Stipend is required for internship placements"
        if (form.offer_date && new Date(form.offer_date) > new Date()) {
          errs.offer_date = "Offer date cannot be in the future"
        }
      }
      setErrors(errs)
      return Object.keys(errs).length === 0
    },
    [form],
  )

  const handleNext = useCallback(() => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 2))
  }, [step, validateStep])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  // ── Build payload and submit ──
  const handleSubmit = useCallback(async () => {
    // Full Zod validation before submit
    const payload: Record<string, unknown> = {
      company_name: form.company_name,
      company_id: form.company_id || undefined,
      job_title: form.job_title,
      placement_type: form.placement_type,
      drive_type: form.drive_type,
      fulltime_package: form.fulltime_package ? Number(form.fulltime_package) : undefined,
      fulltime_designation: form.fulltime_designation || undefined,
      fulltime_joining_date: form.fulltime_joining_date || undefined,
      internship_stipend: form.internship_stipend ? Number(form.internship_stipend) : undefined,
      internship_duration: form.internship_duration || undefined,
      internship_start_date: form.internship_start_date || undefined,
      job_location: form.job_location || undefined,
      offer_date: form.offer_date || undefined,
      offer_letter_url: offerPath || undefined,
      remarks: form.remarks || undefined,
    }

    const result = submitSelfReportSchema.safeParse(payload)
    if (!result.success) {
      const fieldErrors = getFieldErrors(result)
      setErrors(fieldErrors)
      // Jump to earliest step with error
      if (fieldErrors.company_name || fieldErrors.job_title) setStep(0)
      else if (
        fieldErrors.fulltime_package ||
        fieldErrors.placement_type ||
        fieldErrors.offer_date
      )
        setStep(1)
      return
    }

    try {
      await submitSelfReport(payload as unknown as SelfReportFormData)
      setShowSuccess(true)
      successTimerRef.current = setTimeout(() => {
        setShowSuccess(false)
        // Reset form
        setForm({ ...INITIAL_FORM })
        setCompanySearch("")
        setSelectedCompany(null)
        setOfferPath("")
        offerLetterUpload.reset()
        setStep(0)
        onSuccess()
      }, 1500)
    } catch {
      // Error handled by hook toast
    }
  }, [form, offerPath, submitSelfReport, onSuccess, offerLetterUpload])

  const isFulltime = form.placement_type === "full-time" || form.placement_type === "both"
  const isInternship = form.placement_type === "internship" || form.placement_type === "both"

  // ── Success overlay ──
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-16 dark:border-emerald-800 dark:bg-emerald-950/30"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/40"
        >
          <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
          Self-Report Submitted!
        </p>
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Your placement cell will review it shortly.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Step Indicator ── */}
      <StepIndicator currentStep={step} />

      {/* ── Step Content ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <StepHeader title="Company & Role" description="Which company and role is this placement for?" />

              {/* Company Combobox */}
              <div className="relative" ref={dropdownRef}>
                <label htmlFor="company-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Company <span className="text-red-400">*</span>
                </label>

                {selectedCompany ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-800/50 dark:bg-emerald-900/20">
                    {selectedCompany.company_logo ? (
                      <img
                        src={selectedCompany.company_logo}
                        alt=""
                        className="h-6 w-6 rounded object-cover"
                      />
                    ) : (
                      <Building2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex-1 truncate">
                      {selectedCompany.company_name}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      <Check className="h-3 w-3" /> Matched
                    </span>
                    {selectedCompany.industry && (
                      <span className="text-xs text-emerald-500 dark:text-emerald-400">
                        {selectedCompany.industry}
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label="Clear selected company"
                      onClick={handleClearCompany}
                      className="rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-emerald-500" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="company-search"
                      type="text"
                      role="combobox"
                      aria-expanded={showDropdown}
                      aria-controls="company-listbox"
                      aria-label="Search company"
                      value={companySearch}
                      onChange={handleCompanySearchChange}
                      onFocus={() => companySearch.length >= 2 && setShowDropdown(true)}
                      placeholder="Search or type company name..."
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors ${
                        errors.company_name
                          ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {/* New company badge */}
                    {companySearch.length >= 2 && !selectedCompany && !isSearching && companies.length === 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        New company
                      </span>
                    )}
                  </div>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {showDropdown && !selectedCompany && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
                      id="company-listbox"
                    >
                      {companies.length > 0
                        ? companies.map((c) => (
                            <button
                              key={c.company_id}
                              type="button"
                              onClick={() => handleSelectCompany(c)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              {c.company_logo ? (
                                <img
                                  src={c.company_logo}
                                  alt=""
                                  className="h-8 w-8 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                  <Building2 className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {c.company_name}
                                </p>
                                {c.industry && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {c.industry}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))
                        : companySearch.length >= 2 &&
                          !isSearching && (
                            <div className="px-4 py-3 text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No matching companies found.
                              </p>
                              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                                &quot;{companySearch}&quot; will be submitted as a new company.
                              </p>
                            </div>
                          )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <FieldError error={errors.company_name} />
              </div>

              {/* Job Title */}
              <FloatingInput
                label="Job Title / Designation"
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
                error={errors.job_title}
                required
                maxLength={300}
                placeholder="e.g. Software Engineer, Data Analyst"
              />

              {/* Job Location */}
              <FloatingInput
                label="Job Location"
                name="job_location"
                value={form.job_location}
                onChange={handleChange}
                maxLength={300}
                placeholder="e.g. Mumbai, Remote"
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <StepHeader title="Placement Details" description="Provide the placement type, compensation, and offer details." />

              {/* Placement Type — Radio Cards */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Placement Type <span className="text-red-400">*</span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PLACEMENT_TYPE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`relative flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        form.placement_type === opt.value
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20 dark:border-blue-400 dark:bg-blue-950/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="placement_type"
                        value={opt.value}
                        checked={form.placement_type === opt.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          form.placement_type === opt.value
                            ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {form.placement_type === opt.value && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Full-time fields */}
              {isFulltime && (
                <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/30 dark:bg-blue-950/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Full-Time Details
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FloatingInput
                      label="Annual Package (₹)"
                      name="fulltime_package"
                      value={form.fulltime_package}
                      onChange={handleChange}
                      error={errors.fulltime_package}
                      required
                      type="number"
                      min="0"
                      placeholder="e.g. 600000"
                      inputMode="numeric"
                    />
                    <FloatingInput
                      label="Designation"
                      name="fulltime_designation"
                      value={form.fulltime_designation}
                      onChange={handleChange}
                      maxLength={200}
                      placeholder="e.g. Associate Software Engineer"
                    />
                  </div>
                  <FloatingInput
                    label="Joining Date"
                    name="fulltime_joining_date"
                    value={form.fulltime_joining_date}
                    onChange={handleChange}
                    type="date"
                  />
                </div>
              )}

              {/* Internship fields */}
              {isInternship && (
                <div className="space-y-4 rounded-xl border border-purple-100 bg-purple-50/30 p-4 dark:border-purple-900/30 dark:bg-purple-950/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Internship Details
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FloatingInput
                      label="Monthly Stipend (₹)"
                      name="internship_stipend"
                      value={form.internship_stipend}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      placeholder="e.g. 25000"
                      inputMode="numeric"
                    />
                    <FloatingInput
                      label="Duration"
                      name="internship_duration"
                      value={form.internship_duration}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="e.g. 6 months"
                    />
                  </div>
                  <FloatingInput
                    label="Start Date"
                    name="internship_start_date"
                    value={form.internship_start_date}
                    onChange={handleChange}
                    type="date"
                  />
                </div>
              )}

              {/* Drive Type */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Drive Type
                </legend>
                <div className="flex gap-3">
                  {DRIVE_TYPE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                        form.drive_type === opt.value
                          ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/20 dark:text-blue-300"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="drive_type"
                        value={opt.value}
                        checked={form.drive_type === opt.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Offer Date */}
              <FloatingInput
                label="Offer Date"
                name="offer_date"
                value={form.offer_date}
                onChange={handleChange}
                error={errors.offer_date}
                type="date"
                max={getTodayISO()}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <StepHeader title="Documentation" description="Upload your offer letter and review the summary before submitting." />

              {/* Offer Letter Upload */}
              <div>
                <label htmlFor="offer-letter-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Offer Letter (optional)
                </label>
                <FileUpload
                  id="offer-letter-upload"
                  value={offerPath || null}
                  onFileSelect={async (file) => {
                    if (!file || !user) {
                      setOfferPath("")
                      return
                    }
                    try {
                      const { storagePath } = await offerLetterUpload.upload(file, {
                        bucket: "placenex-private",
                        category: "placement-docs",
                        entityId: `sr_${user.id}`,
                      })
                      setOfferPath(storagePath)
                    } catch {
                      /* error displayed via offerLetterUpload.error */
                    }
                  }}
                  progress={offerLetterUpload.progress}
                  isUploading={offerLetterUpload.isUploading}
                  error={offerLetterUpload.error}
                  label="Upload offer letter (PDF, JPG, PNG — max 5 MB)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSizeBytes={5 * 1024 * 1024}
                />
              </div>

              {/* Remarks */}
              <FloatingTextarea
                label="Remarks / Additional Info"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder="Any additional details for the placement cell..."
              />

              {/* ── Summary Card ── */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Review Summary
                </h4>
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 text-sm">
                  <SummaryRow label="Company" value={form.company_name || "—"} />
                  <SummaryRow label="Job Title" value={form.job_title || "—"} />
                  <SummaryRow
                    label="Placement Type"
                    value={PLACEMENT_TYPE_LABELS[form.placement_type] || form.placement_type}
                  />
                  <SummaryRow
                    label="Drive Type"
                    value={DRIVE_TYPE_LABELS[form.drive_type] || form.drive_type}
                  />
                  {isFulltime && (
                    <>
                      <SummaryRow
                        label="Package"
                        value={form.fulltime_package ? formatPackage(Number(form.fulltime_package)) : "—"}
                      />
                      <SummaryRow label="Designation" value={form.fulltime_designation || "—"} />
                    </>
                  )}
                  {isInternship && (
                    <>
                      <SummaryRow
                        label="Stipend"
                        value={form.internship_stipend ? formatStipend(Number(form.internship_stipend)) : "—"}
                      />
                      <SummaryRow label="Duration" value={form.internship_duration || "—"} />
                    </>
                  )}
                  {form.job_location && <SummaryRow label="Location" value={form.job_location} />}
                  {form.offer_date && <SummaryRow label="Offer Date" value={formatDate(form.offer_date)} />}
                  {offerPath && <SummaryRow label="Offer Letter" value="✓ Uploaded" />}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation Buttons ── */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-0 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit for Review
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════════
// TAB 2 — MY REPORTS (status tracking)
// ═════════════════════════════════════════════════════════════════════════════════

function MyReportsList({
  shouldReduce,
  onResubmit,
}: Readonly<{
  shouldReduce: boolean | null
  onResubmit: () => void
}>) {
  const { reports, pagination, isLoading, isFetching, isError, refetch, handlePageChange } =
    useMySelfReports()

  const [cancelTarget, setCancelTarget] = useState<SelfReport | null>(null)

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        {["skel-1", "skel-2", "skel-3"].map((id) => (
          <div
            key={id}
            className="h-32 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        ))}
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

  // ── Empty ──
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-16 dark:border-gray-700 dark:bg-gray-800/30">
        <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
          <FileText className="h-8 w-8 text-blue-500" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            No reports yet
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Report your first off-campus placement!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Fetch indicator */}
      {isFetching && !isLoading && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      )}

      {/* Cards */}
      <motion.div
        variants={shouldReduce ? undefined : staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4"
      >
        {reports.map((report) => (
          <ReportCard
            key={report.report_id}
            report={report}
            shouldReduce={shouldReduce}
            onCancel={() => setCancelTarget(report)}
            onResubmit={onResubmit}
          />
        ))}
      </motion.div>

      {/* Pagination */}
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

      {/* Cancel Dialog */}
      <CancelDialog
        report={cancelTarget}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  )
}

// ─── Report Card ────────────────────────────────────────────────────────────────

function ReportCard({
  report,
  shouldReduce,
  onCancel,
  onResubmit,
}: Readonly<{
  report: SelfReport
  shouldReduce: boolean | null
  onCancel: () => void
  onResubmit: () => void
}>) {
  const status = STATUS_CONFIG[report.verification_status]
  const StatusIcon = status.icon
  const fd = report.form_data

  return (
    <motion.div
      variants={shouldReduce ? undefined : staggerItem}
      className={`rounded-xl border-2 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 ${status.border}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left */}
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

          {/* Info chips */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {PLACEMENT_TYPE_LABELS[fd.placement_type as PlacementType] ?? fd.placement_type}
            </span>
            {fd.fulltime_package != null && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                {formatPackage(fd.fulltime_package)}
              </span>
            )}
            {fd.internship_stipend != null && (
              <span className="inline-flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                {formatStipend(fd.internship_stipend)}
              </span>
            )}
            {fd.drive_type && (
              <span className="inline-flex items-center gap-1">
                {DRIVE_TYPE_LABELS[fd.drive_type as DriveType] ?? fd.drive_type}
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

          {/* Offer letter preview */}
          {report.offer_letter_url && (
            <div className="mt-3">
              <DocumentPreview
                value={report.offer_letter_url}
                bucket="placenex-private"
                variant="inline"
              />
            </div>
          )}

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
          {report.reviewed_at && report.reviewer_name && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Reviewed by {report.reviewer_name} on {formatDate(report.reviewed_at)}
            </p>
          )}
        </div>

        {/* Right — status + actions */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.badge}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>

          {/* Pending → Cancel */}
          {report.verification_status === "pending" && (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> Cancel
            </button>
          )}

          {/* Approved → View Placement */}
          {report.verification_status === "approved" && report.resulting_placement_id && (
            <Link
              to="/student/placements"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors dark:border-emerald-800/40 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
            >
              View Placement <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}

          {/* Rejected → Submit Again */}
          {report.verification_status === "rejected" && (
            <button
              onClick={onResubmit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors dark:border-blue-800/40 dark:text-blue-400 dark:hover:bg-blue-950/20"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Submit Again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Cancel Confirmation Dialog ─────────────────────────────────────────────────

function CancelDialog({
  report,
  onClose,
}: Readonly<{
  report: SelfReport | null
  onClose: () => void
}>) {
  const { cancelSelfReport, isCancelling } = useCancelSelfReport()

  if (!report) return null

  const handleConfirm = () => {
    cancelSelfReport(report.report_id, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <ModalWrapper
      isOpen={!!report}
      onClose={onClose}
      disabled={isCancelling}
      size="sm"
      title="Cancel Self-Report"
      titleIcon={<AlertCircle className="h-5 w-5 text-red-500" />}
    >
      <div className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to cancel your self-report for{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {report.form_data.job_title}
          </span>{" "}
          at{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {report.form_data.company_name}
          </span>{"?"}
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          This action cannot be undone. You can submit a new report later.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Keep It
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isCancelling}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}
            Yes, Cancel Report
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ─── Shared Sub-components ──────────────────────────────────────────────────────

function StepIndicator({ currentStep }: Readonly<{ currentStep: number }>) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((s, idx) => {
        const Icon = s.icon
        const isActive = idx === currentStep
        const isDone = idx < currentStep

        let circleClass: string
        if (isActive) {
          circleClass = "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25"
        } else if (isDone) {
          circleClass = "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        } else {
          circleClass = "border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
        }

        let labelClass: string
        if (isActive) {
          labelClass = "text-blue-600 dark:text-blue-400"
        } else if (isDone) {
          labelClass = "text-blue-500 dark:text-blue-400"
        } else {
          labelClass = "text-gray-400 dark:text-gray-500"
        }

        return (
          <div key={s.label} className="flex items-center">
            {idx > 0 && (
              <div
                className={`h-0.5 w-8 sm:w-16 transition-colors ${
                  isDone ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${circleClass}`}
              >
                {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${labelClass}`}
              >
                {s.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StepHeader({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <div className="mb-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  )
}

function SummaryRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">{label}:</span>
      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{value}</span>
    </div>
  )
}

function FieldError({ error }: Readonly<{ error?: string }>) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          className="mt-1.5 text-xs text-red-500 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
