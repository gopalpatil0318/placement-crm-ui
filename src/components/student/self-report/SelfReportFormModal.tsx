import { useState, useCallback, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Building2,
  Briefcase,
  Loader2,
  Search,
  X,
} from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import FloatingInput from "@/components/ui/FloatingInput"
import FloatingSelect from "@/components/ui/FloatingSelect"
import FloatingTextarea from "@/components/ui/FloatingTextarea"
import { FileUpload } from "@/components/ui/FileUpload"
import { useFileUpload } from "@/hooks/useFileUpload"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { useCompanySearch } from "@/hooks/student/self-report/useCompanySearch"
import { useCompanyJobs } from "@/hooks/student/self-report/useCompanyJobs"
import { useSubmitSelfReport } from "@/hooks/student/self-report/useSubmitSelfReport"
import type { SelfReportFormData, CompanySearchResult } from "@/services/student/selfReport.service"

// ─── Constants ──────────────────────────────────────────────────────────────────

const PLACEMENT_TYPE_OPTIONS = [
  { value: "", label: "Select type" },
  { value: "full-time", label: "Full-Time" },
  { value: "internship", label: "Internship" },
  { value: "both", label: "Full-Time + Internship" },
]

const DRIVE_TYPE_OPTIONS = [
  { value: "off_campus", label: "Off Campus" },
  { value: "pool_campus", label: "Pool Campus" },
]

// ─── Initial State ──────────────────────────────────────────────────────────────

const INITIAL_FORM: SelfReportFormData = {
  company_name: "",
  company_id: null,
  job_id: null,
  job_title: "",
  placement_type: "full-time",
  drive_type: "off_campus",
  fulltime_package: null,
  fulltime_designation: null,
  fulltime_joining_date: null,
  internship_stipend: null,
  internship_duration: null,
  internship_start_date: null,
  job_location: "",
  offer_date: null,
  offer_letter_url: null,
  remarks: null,
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface SelfReportFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function SelfReportFormModal({
  isOpen,
  onClose,
  onSuccess,
}: Readonly<SelfReportFormModalProps>) {
  const [form, setForm] = useState<SelfReportFormData>({ ...INITIAL_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { submitSelfReport, isSubmitting } = useSubmitSelfReport()
  const { user } = useStudentAuth()

  // Company combobox state
  const [companySearch, setCompanySearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<CompanySearchResult | null>(null)
  const { companies, isSearching } = useCompanySearch(companySearch)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Company jobs for job dropdown
  const { jobs: companyJobs, isLoadingJobs } = useCompanyJobs(selectedCompany?.company_id)
  const [selectedJobId, setSelectedJobId] = useState<string>("")

  // File upload for offer letter
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

  // ── Field change handler ──
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setForm((prev) => ({ ...prev, [name]: value || null }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    },
    [],
  )

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    },
    [],
  )

  // ── Company combobox handlers ──
  const handleCompanySearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setCompanySearch(val)
      setForm((prev) => ({ ...prev, company_name: val, company_id: null, job_id: null, job_title: "" }))
      setSelectedCompany(null)
      setSelectedJobId("")
      setShowDropdown(val.length >= 2)
      setErrors((prev) => {
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
      job_id: null,
      job_title: "",
    }))
    setSelectedJobId("")
    setShowDropdown(false)
  }, [])

  const handleClearCompany = useCallback(() => {
    setSelectedCompany(null)
    setCompanySearch("")
    setSelectedJobId("")
    setForm((prev) => ({ ...prev, company_name: "", company_id: null, job_id: null, job_title: "" }))
  }, [])

  // ── Job dropdown handler ──
  const handleJobSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const jobId = e.target.value
      setSelectedJobId(jobId)
      if (jobId) {
        const job = companyJobs.find((j) => j.job_id === jobId)
        if (job) {
          setForm((prev) => ({ ...prev, job_id: job.job_id, job_title: job.job_title }))
          setErrors((prev) => { const next = { ...prev }; delete next.job_title; return next })
          return
        }
      }
      // "New Role" or no selection — clear job_id, let user type freely
      setForm((prev) => ({ ...prev, job_id: null, job_title: "" }))
    },
    [companyJobs],
  )

  const isExistingJobSelected = !!selectedJobId

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {}

    if (!form.company_name || form.company_name.length < 2) {
      errs.company_name = "Company name is required (min 2 characters)"
    }
    if (!form.job_title || form.job_title.length < 3) {
      errs.job_title = "Job title is required (min 3 characters)"
    }
    if (!form.placement_type) {
      errs.placement_type = "Placement type is required"
    }

    const isFulltime = form.placement_type === "full-time" || form.placement_type === "both"
    if (isFulltime && (form.fulltime_package === null || form.fulltime_package === undefined)) {
      errs.fulltime_package = "Package is required for full-time placements"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form])

  // ── Submit ──
  const handleSubmit = useCallback(async () => {
    if (!validate()) return

    const payload: SelfReportFormData = {
      ...form,
      offer_letter_url: offerPath || form.offer_letter_url,
    }

    try {
      await submitSelfReport(payload)
      onSuccess()
    } catch {
      // Error handled by hook
    }
  }, [form, validate, submitSelfReport, onSuccess, offerPath])

  const isFulltime = form.placement_type === "full-time" || form.placement_type === "both"
  const isInternship = form.placement_type === "internship" || form.placement_type === "both"

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      disabled={isSubmitting}
      size="2xl"
      title="Report Off-Campus Placement"
      titleIcon={<Briefcase className="h-5 w-5 text-blue-500" />}
      footer={
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit for Review
          </button>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        {/* ── Company Search (Combobox) ── */}
        <div className="relative" ref={dropdownRef}>
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Company <span className="text-red-400">*</span>
          </span>

          {selectedCompany ? (
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 dark:border-blue-800/50 dark:bg-blue-900/20">
              <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex-1 truncate">
                {selectedCompany.company_name}
              </span>
              {selectedCompany.industry && (
                <span className="text-xs text-blue-500 dark:text-blue-400">
                  {selectedCompany.industry}
                </span>
              )}
              <button
                type="button"
                aria-label="Clear selected company"
                onClick={handleClearCompany}
                className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-blue-500" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="company-search-input"
                type="text"
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls="company-search-listbox"
                aria-label="Search company"
                value={companySearch}
                onChange={handleCompanySearchChange}
                onFocus={() => companySearch.length >= 2 && setShowDropdown(true)}
                placeholder="Search or type a new company name..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors
                  ${errors.company_name
                    ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  }`}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
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
                id="company-search-listbox"
                role="listbox"
                className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
              >
                {companies.length > 0 && (
                  companies.map((c) => (
                    <button
                      key={c.company_id}
                      type="button"
                      role="option"
                      aria-selected={form.company_id === c.company_id}
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
                )}
                {companies.length === 0 && companySearch.length >= 2 && !isSearching && (
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No matching companies.
                    </p>
                    <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
                      "{companySearch}" will be submitted as a new company.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {errors.company_name && (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                className="mt-1.5 text-xs text-red-500 dark:text-red-400"
              >
                {errors.company_name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ── Job Dropdown (shown when known company is selected) ── */}
        {selectedCompany && (
          <div>
            <label htmlFor="job-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Existing Role at {selectedCompany.company_name}
            </label>
            <div className="relative">
              <select
                id="job-select"
                value={selectedJobId}
                onChange={handleJobSelect}
                disabled={isLoadingJobs}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              >
                <option value="">+ New Role (type your own)</option>
                {companyJobs.map((j) => (
                  <option key={j.job_id} value={j.job_id}>
                    {j.job_title}{j.job_location ? ` — ${j.job_location}` : ""}{j.placement_count > 0 ? ` (${j.placement_count} placed)` : ""}
                  </option>
                ))}
              </select>
              {isLoadingJobs && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>
            {companyJobs.length > 0 && !selectedJobId && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Pick an existing role or type a new one below.
              </p>
            )}
          </div>
        )}

        {/* ── Job Title ── */}
        <FloatingInput
          label="Job Title / Designation"
          name="job_title"
          value={form.job_title}
          onChange={handleChange}
          error={errors.job_title}
          required
          maxLength={300}
          placeholder="e.g. Software Engineer, Data Analyst"
          disabled={isExistingJobSelected}
        />

        {/* ── Placement Type + Drive Type (side by side) ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FloatingSelect
            label="Placement Type"
            name="placement_type"
            value={form.placement_type}
            onChange={handleChange}
            options={PLACEMENT_TYPE_OPTIONS}
            error={errors.placement_type}
            required
          />
          <FloatingSelect
            label="Drive Type"
            name="drive_type"
            value={form.drive_type ?? "off_campus"}
            onChange={handleChange}
            options={DRIVE_TYPE_OPTIONS}
          />
        </div>

        {/* ── Full-Time Fields ── */}
        {isFulltime && (
          <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/50 dark:bg-gray-800/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Full-Time Details
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingInput
                label="Annual Package (₹)"
                name="fulltime_package"
                value={form.fulltime_package?.toString() ?? ""}
                onChange={handleNumberChange}
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
                value={form.fulltime_designation ?? ""}
                onChange={handleChange}
                maxLength={200}
                placeholder="e.g. Associate Software Engineer"
              />
            </div>
            <FloatingInput
              label="Joining Date"
              name="fulltime_joining_date"
              value={form.fulltime_joining_date ?? ""}
              onChange={handleChange}
              type="date"
            />
          </div>
        )}

        {/* ── Internship Fields ── */}
        {isInternship && (
          <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/50 dark:bg-gray-800/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Internship Details
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingInput
                label="Monthly Stipend (₹)"
                name="internship_stipend"
                value={form.internship_stipend?.toString() ?? ""}
                onChange={handleNumberChange}
                type="number"
                min="0"
                placeholder="e.g. 25000"
                inputMode="numeric"
              />
              <FloatingInput
                label="Duration"
                name="internship_duration"
                value={form.internship_duration ?? ""}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. 6 months"
              />
            </div>
            <FloatingInput
              label="Start Date"
              name="internship_start_date"
              value={form.internship_start_date ?? ""}
              onChange={handleChange}
              type="date"
            />
          </div>
        )}

        {/* ── Common Fields ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FloatingInput
            label="Job Location"
            name="job_location"
            value={form.job_location ?? ""}
            onChange={handleChange}
            maxLength={300}
            placeholder="e.g. Bangalore, Remote"
          />
          <FloatingInput
            label="Offer Date"
            name="offer_date"
            value={form.offer_date ?? ""}
            onChange={handleChange}
            type="date"
          />
        </div>

        {/* ── Offer Letter Upload ── */}
        <div>
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Offer Letter (optional)
          </span>
          <FileUpload
            value={offerPath || null}
            onFileSelect={async (file: File | null) => {
              if (!file || !user) return
              try {
                const { storagePath } = await offerLetterUpload.upload(file, {
                  bucket: "placenex-private",
                  category: "placement-docs",
                  entityId: `sr_${user.id}`,
                })
                setOfferPath(storagePath)
              } catch { /* error displayed via offerLetterUpload.error */ }
            }}
            progress={offerLetterUpload.progress}
            isUploading={offerLetterUpload.isUploading}
            error={offerLetterUpload.error}
            label="Upload offer letter (PDF, JPG, PNG — max 5 MB)"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        {/* ── Remarks ── */}
        <FloatingTextarea
          label="Remarks / Additional Info"
          name="remarks"
          value={form.remarks ?? ""}
          onChange={handleChange}
          maxLength={2000}
          placeholder="Any additional information about this placement..."
        />
      </div>
    </ModalWrapper>
  )
}
