import api from "@/lib/api"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface DashboardJob {
  job_id: string
  job_title: string
  company_name: string
  company_website: string | null
  job_location: string
  salary_package: string
  salary_min: number
  salary_max: number
  job_type: string
  application_deadline: string
  posted_at: string
  position_count: number
  total_applications: number
  has_applied: boolean
  has_denied: boolean
  application_status: string | null
}

export interface DashboardApplication {
  application_id: string
  job_id: string
  application_status: string
  applied_at: string
  last_updated_at: string
  job_title: string
  job_type: string
  job_location: string
  salary_package: string
  company_name: string
  position_name: string
  current_round_name: string | null
  current_round_number: number | null
  rounds_passed: number
  total_rounds: number
}

export interface StatusSummary {
  total: number
  pending: number
  under_review: number
  shortlisted: number
  rejected: number
  selected: number
  offered: number
  withdrawn: number
}

export interface ApplicationsResponse {
  applications: DashboardApplication[]
  status_summary: StatusSummary
}

export interface JobsResponse {
  data: DashboardJob[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const DashboardService = {
  /** Fetch available jobs (first page, sorted by deadline ascending) */
  getAvailableJobs: async (limit = 5): Promise<JobsResponse> => {
    const response = await api.get("/student/get_available_jobs", {
      params: { page: 1, limit, sort_by: "application_deadline", sort_order: "asc" },
    })
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    }
  },

  /** Fetch student's applications with status summary */
  getMyApplications: async (limit = 5): Promise<ApplicationsResponse> => {
    const response = await api.get("/student/get_my_applications", {
      params: { page: 1, limit, sort_by: "last_updated_at", sort_order: "desc" },
    })
    return response.data.data
  },
}
