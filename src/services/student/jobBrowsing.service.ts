import api from "@/lib/api"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface JobListItem {
  job_id: string
  job_title: string
  job_description: string
  job_location: string
  salary_package: string
  salary_min: number
  salary_max: number
  job_type: string
  internship_duration: string | null
  internship_stipend: number | null
  application_deadline: string
  bond_duration: string | null
  posted_at: string
  company_id: string
  company_name: string
  company_website: string | null
  company_logo: string | null
  industry_type: string
  position_count: number
  total_applications: number
  application_status: string | null
  has_applied: boolean
  has_denied: boolean
  is_eligible: boolean
  tier_id: string | null
  tier_name: string | null
  tier_level: number | null
  drive_type: string
}

export interface JobListFilters {
  search?: string
  job_type?: string
  drive_type?: string
  company_name?: string
  sort_by?: string
  sort_order?: string
  page?: number
  limit?: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PlacementContext {
  is_placed: boolean
  company_name?: string
  tier_name?: string | null
  tier_level?: number | null
  max_placements?: number
  allow_dream_upgrade?: boolean
}

export interface JobListResponse {
  jobs: JobListItem[]
  pagination: Pagination
  placement_context: PlacementContext
}

// ─── Job Detail ─────────────────────────────────────────────────────────────────

export interface JobDetailJob {
  job_id: string
  job_title: string
  job_description: string
  job_location: string
  salary_package: string
  salary_min: number
  salary_max: number
  bond_duration: string | null
  bond_details: string | null
  job_type: string
  internship_duration: string | null
  internship_stipend: number | null
  passout_year: number
  application_deadline: string
  job_status: string
  posted_at: string
  total_applications: number
  tier_id: string | null
  tier_name: string | null
  tier_level: number | null
}

export interface JobCompany {
  company_id: string
  company_name: string
  company_website: string | null
  company_logo: string | null
  industry_type: string
}

export interface JobPosition {
  position_id: string
  position_name: string
  position_description: string
  vacancies: number
  position_status: string
}

export interface EligibilityCriteria {
  min_overall_cgpa: number | null
  max_live_kts: number | null
  min_tenth_percentage: number | null
  min_twelfth_percentage: number | null
  min_diploma_percentage: number | null
  min_existing_package: number | null
  max_existing_package: number | null
  allowed_genders: string[] | null
  allowed_departments: string[] | null
  allowed_gap_statuses: string[] | null
  exclude_already_placed: boolean
}

export interface JobRound {
  round_id: string
  round_number: number
  round_name: string
  round_description: string
  round_type: string
  round_date: string | null
  round_venue: string | null
  round_status: string
}

export interface JobQuestion {
  question_id: string
  question_text: string
  question_type: "text" | "essay" | "mcq_single" | "mcq_multiple" | "yes_no"
  question_options: string[] | null
  is_required: boolean
  question_order: number
}

export interface StudentStatus {
  has_applied: boolean
  application_id: string | null
  application_status: string | null
  applied_at: string | null
  has_denied: boolean
  denial_reason: string | null
  denied_at: string | null
}

export interface JobDetailResponse {
  job: JobDetailJob
  company: JobCompany
  positions: JobPosition[]
  eligibility_criteria: EligibilityCriteria | null
  rounds: JobRound[]
  questions: JobQuestion[]
  student_status: StudentStatus
}

// ─── Eligibility ────────────────────────────────────────────────────────────────

export interface StudentSnapshot {
  overall_cgpa: number | null
  total_live_kts: number
  tenth_percentage: number | null
  twelfth_or_diploma: string
  twelfth_percentage: number | null
  diploma_percentage: number | null
  gender: string
  dept_name: string
  gap_status: string
  profile_is_approved: boolean
}

export interface PlacementPolicyInfo {
  is_placed: boolean
  current_placement?: {
    company_name: string
    tier_name: string
    tier_level: number | null
  }
  target_job?: {
    tier_name: string
    tier_level: number | null
  }
  allow_dream_upgrade?: boolean
  upgrade?: boolean
}

export interface EligibilityResponse {
  job: {
    job_id: string
    job_title: string
    company_name: string
    application_deadline: string
    job_status: string
  }
  eligibility: {
    is_eligible: boolean
    issues: string[]
    criteria: EligibilityCriteria | null
  }
  student_snapshot: StudentSnapshot
  blockers: string[]
  can_apply: boolean
  policy: PlacementPolicyInfo | null
}

// ─── Apply ──────────────────────────────────────────────────────────────────────

export interface AnswerPayload {
  question_id: string
  answer_text?: string
  answer_options?: string[]
  answer_boolean?: boolean
}

export interface ApplyPayload {
  position_id?: string | null
  answers: AnswerPayload[]
}

export interface ApplyResponse {
  application_id: string
  job_id: string
  position_id: string | null
  application_status: string
  is_eligible: boolean
  eligibility_remarks: string | null
  applied_at: string
  answers_submitted: number
  job_title: string
  company_name: string
  message?: string
}

// ─── Deny ───────────────────────────────────────────────────────────────────────

export interface DenyPayload {
  denial_reason: string
  additional_comments?: string
}

export interface DenyResponse {
  denial_id: string
  job_id: string
  denial_reason: string
  additional_comments: string | null
  denied_at: string
  job_title: string
  company_name: string
  message?: string
}

// ─── Applications List ──────────────────────────────────────────────────────────

export interface ApplicationListItem {
  application_id: string
  job_id: string
  position_id: string
  application_status: string
  is_eligible: boolean
  eligibility_remarks: string | null
  waitlist_rank: number | null
  applied_at: string
  last_updated_at: string
  job_title: string
  job_type: string
  job_location: string
  salary_package: string
  salary_min: number
  salary_max: number
  job_status: string
  application_deadline: string
  company_id: string
  company_name: string
  company_logo: string | null
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
  waitlisted: number
  withdrawn: number
}

export interface ApplicationsListFilters {
  application_status?: string
  sort_by?: string
  sort_order?: string
  page?: number
  limit?: number
}

export interface ApplicationsListResponse {
  applications: ApplicationListItem[]
  status_summary: StatusSummary
  pagination: Pagination
}

// ─── Application Detail ─────────────────────────────────────────────────────────

export interface ApplicationAnswer {
  answer_id: string
  question_id: string
  question_text: string
  question_type: string
  question_options: string[] | null
  is_required: boolean
  question_order: number
  answer_text: string | null
  answer_options: string[] | null
  answer_boolean: boolean | null
}

export interface RoundResult {
  result_id: string
  round_id: string
  round_name: string
  round_number: number
  round_type: string
  round_status: string
  round_date: string | null
  round_venue: string | null
  result_status: string
  score: number | null
  remarks: string | null
  attended: boolean
  scheduled_at: string | null
  completed_at: string | null
}

export interface PlacementResult {
  placement_id: string
  placement_type: string
  placement_status: string
  acceptance_status: string
  fulltime_package: number | null
  fulltime_designation: string | null
  internship_stipend: number | null
}

export interface ApplicationDetailResponse {
  application: {
    application_id: string
    job_id: string
    position_id: string | null
    application_status: string
    current_round_id: string | null
    is_eligible: boolean
    eligibility_remarks: string | null
    applied_at: string
    last_updated_at: string
    job_title: string
    job_status: string
    application_deadline: string
    company_name: string
    company_logo: string | null
    position_name: string | null
  }
  answers: ApplicationAnswer[]
  round_results: RoundResult[]
  all_rounds: JobRound[]
  placement: PlacementResult | null
}

// ─── Withdraw ───────────────────────────────────────────────────────────────────

export interface WithdrawPayload {
  withdrawal_reason?: string
}

export interface WithdrawResponse {
  application_id: string
  application_status: string
  previous_status: string
  last_updated_at: string
  job_title: string
  company_name: string
  message?: string
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const JobBrowsingService = {
  /** API #151 — List available jobs with search/filter/pagination */
  getAvailableJobs: async (filters: JobListFilters = {}): Promise<JobListResponse> => {
    const response = await api.get("/student/get_available_jobs", { params: filters })
    return {
      jobs: response.data.data,
      pagination: response.data.pagination,
      placement_context: response.data.placement_context ?? { is_placed: false },
    }
  },

  /** API #152 — Get full job details */
  getJobDetail: async (jobId: string): Promise<JobDetailResponse> => {
    const response = await api.get(`/student/get_job_details/${jobId}`)
    return response.data.data
  },

  /** API #153 — Check eligibility for a job */
  checkEligibility: async (jobId: string): Promise<EligibilityResponse> => {
    const response = await api.get(`/student/check_job_eligibility/${jobId}`)
    return response.data.data
  },

  /** API #154 — Apply for a job */
  applyForJob: async (jobId: string, payload: ApplyPayload): Promise<ApplyResponse> => {
    const response = await api.post(`/student/apply_for_job/${jobId}`, payload)
    return { ...response.data.data, message: response.data.message }
  },

  /** API #155 — Deny/opt-out of a job */
  denyJob: async (jobId: string, payload: DenyPayload): Promise<DenyResponse> => {
    const response = await api.post(`/student/deny_job/${jobId}`, payload)
    return { ...response.data.data, message: response.data.message }
  },

  /** API #156 — List my applications */
  getMyApplications: async (filters: ApplicationsListFilters = {}): Promise<ApplicationsListResponse> => {
    const response = await api.get("/student/get_my_applications", { params: filters })
    return {
      applications: response.data.data.applications,
      status_summary: response.data.data.status_summary,
      pagination: response.data.pagination,
    }
  },

  /** API #157 — Get application details */
  getApplicationDetail: async (applicationId: string): Promise<ApplicationDetailResponse> => {
    const response = await api.get(`/student/get_application_details/${applicationId}`)
    return response.data.data
  },

  /** API #158 — Withdraw application */
  withdrawApplication: async (applicationId: string, payload: WithdrawPayload = {}): Promise<WithdrawResponse> => {
    const response = await api.patch(`/student/withdraw_application/${applicationId}`, payload)
    return { ...response.data.data, message: response.data.message }
  },
}
