import api from "@/lib/api"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface SelfReportFormData {
  company_name: string
  company_id?: string | null
  job_id?: string | null
  job_title: string
  placement_type: "full-time" | "internship" | "both"
  drive_type?: "off_campus" | "pool_campus"
  fulltime_package?: number | null
  fulltime_designation?: string | null
  fulltime_joining_date?: string | null
  internship_stipend?: number | null
  internship_duration?: string | null
  internship_start_date?: string | null
  job_location?: string
  offer_date?: string | null
  offer_letter_url?: string | null
  remarks?: string | null
}

/** Shape of form_data JSONB stored in the DB */
export interface SelfReportFormFields {
  company_name: string
  company_id?: string
  job_title: string
  placement_type: "full-time" | "internship" | "both"
  drive_type?: string
  fulltime_package?: number
  fulltime_designation?: string
  fulltime_joining_date?: string
  internship_stipend?: number
  internship_duration?: string
  internship_start_date?: string
  job_location?: string
  offer_date?: string
  remarks?: string
}

export interface SelfReport {
  report_id: string
  student_id: string
  college_id: string
  form_data: SelfReportFormFields
  offer_letter_url: string | null
  passout_year: number
  verification_status: "pending" | "approved" | "rejected"
  rejection_reason: string | null
  reviewed_at: string | null
  resulting_placement_id: string | null
  created_at: string
  updated_at: string
  // Joined fields from backend
  reviewer_name?: string | null
  placement_company_name?: string | null
  placement_status?: string | null
}

export interface SelfReportListResponse {
  reports: SelfReport[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CompanySearchResult {
  company_id: string
  company_name: string
  industry: string | null
  company_logo: string | null
}

export interface CompanyJobResult {
  job_id: string
  job_title: string
  job_location: string | null
  drive_type: string
  job_type: string | null
  placement_count: number
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const SelfReportService = {
  /** Submit a new self-report */
  submitSelfReport: async (data: SelfReportFormData): Promise<SelfReport> => {
    const response = await api.post("/student/self-report", data)
    return response.data.data.report as SelfReport
  },

  /** List own self-reports (paginated) */
  getMySelfReports: async (
    filters: { page?: number; limit?: number } = {},
  ): Promise<SelfReportListResponse> => {
    const params = new URLSearchParams()
    if (filters.page != null) params.append("page", String(filters.page))
    if (filters.limit != null) params.append("limit", String(filters.limit))

    const queryStr = params.toString()
    const url = queryStr
      ? `/student/self-report?${queryStr}`
      : "/student/self-report"
    const response = await api.get(url)

    return {
      reports: response.data.data.reports as SelfReport[],
      pagination: response.data.pagination,
    }
  },

  /** Cancel a pending self-report */
  cancelSelfReport: async (reportId: string): Promise<{ report_id: string }> => {
    const response = await api.delete(`/student/self-report/${reportId}`)
    return response.data.data as { report_id: string }
  },

  /** Search companies for combobox */
  searchCompanies: async (q: string, limit = 10): Promise<CompanySearchResult[]> => {
    const response = await api.get(
      `/student/companies/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    )
    return response.data.data.companies as CompanySearchResult[]
  },

  /** Fetch off-campus jobs at a company (for self-report job dropdown) */
  getCompanyJobs: async (companyId: string): Promise<CompanyJobResult[]> => {
    const response = await api.get(`/student/company-jobs/${companyId}`)
    return (response.data.data?.jobs ?? []) as CompanyJobResult[]
  },
}
