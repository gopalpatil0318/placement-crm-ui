import api from "@/lib/api"
import type {
  StudentFeedback,
  BrowseInterviewQuestion,
  StudentFeedbackFilters,
  BrowseQuestionsFilters,
  SubmitFeedbackPayload,
  SubmitInterviewQuestionPayload,
  SubmitInterviewQuestionsPayload,
  AppliedJobOption,
  QuestionCompany,
  Pagination,
} from "@/validators/FeedbackSchema"

// ─── Response Shapes ────────────────────────────────────────────────────────────

export interface MyFeedbackResponse {
  feedback: StudentFeedback[]
  pagination: Pagination
}

export interface BrowseQuestionsResponse {
  questions: BrowseInterviewQuestion[]
  pagination: Pagination
}

export interface AppliedJobOptionsResponse {
  companies: AppliedJobOption[]
}

export interface QuestionCompaniesResponse {
  companies: QuestionCompany[]
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const FeedbackService = {
  /** API #172 — Submit placement feedback */
  submitFeedback: async (data: SubmitFeedbackPayload) => {
    const response = await api.post("/student/submit_feedback", data)
    return response.data.data
  },

  /** API #173 — Get student's own submitted feedback */
  getMyFeedback: async (
    filters: StudentFeedbackFilters = {},
  ): Promise<MyFeedbackResponse> => {
    const params = new URLSearchParams()
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.limit) params.append("limit", String(filters.limit))

    const queryStr = params.toString()
    const url = queryStr
      ? `/student/get_my_feedback?${queryStr}`
      : "/student/get_my_feedback"
    const response = await api.get(url)

    return {
      feedback: response.data.data as StudentFeedback[],
      pagination: response.data.pagination,
    }
  },

  /** API #174 — Submit an interview question for review */
  submitInterviewQuestion: async (data: SubmitInterviewQuestionPayload) => {
    const response = await api.post("/student/submit_interview_question", data)
    return response.data.data
  },

  /** API #175 — Browse approved interview questions */
  browseInterviewQuestions: async (
    filters: BrowseQuestionsFilters = {},
  ): Promise<BrowseQuestionsResponse> => {
    const params = new URLSearchParams()
    if (filters.company_id) params.append("company_id", filters.company_id)
    if (filters.job_id) params.append("job_id", filters.job_id)
    if (filters.topic) params.append("topic", filters.topic)
    if (filters.round_type) params.append("round_type", filters.round_type)
    if (filters.search) params.append("search", filters.search)
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.limit) params.append("limit", String(filters.limit))

    const queryStr = params.toString()
    const url = queryStr
      ? `/student/browse_interview_questions?${queryStr}`
      : "/student/browse_interview_questions"
    const response = await api.get(url)

    return {
      questions: response.data.data as BrowseInterviewQuestion[],
      pagination: response.data.pagination,
    }
  },

  /** API #176 — Get applied companies & jobs (for submit form dropdowns) */
  getAppliedJobOptions: async (): Promise<AppliedJobOptionsResponse> => {
    const response = await api.get("/student/applied_job_options")
    return response.data.data as AppliedJobOptionsResponse
  },

  /** API #177 — Batch submit interview questions */
  submitInterviewQuestions: async (data: SubmitInterviewQuestionsPayload) => {
    const response = await api.post("/student/submit_interview_questions", data)
    return response.data.data
  },

  /** API #178 — Get companies with approved interview questions */
  getInterviewQuestionCompanies: async (): Promise<QuestionCompaniesResponse> => {
    const response = await api.get("/student/interview_question_companies")
    return response.data.data as QuestionCompaniesResponse
  },
}
