import api from "@/lib/api"
import type {
  StudentAvailableProgram,
  StudentEnrollment,
  StudentEnrollmentSummary,
  StudentTrainingFilters,
  StudentEnrollmentFilters,
  SubmitFeedbackInput,
  StudentSessionSchedule,
} from "@/validators/TrainingProgramSchema"

// ─── Response Shapes ────────────────────────────────────────────────────────────

export interface AvailableTrainingsResponse {
  programs: StudentAvailableProgram[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export interface EnrolledTrainingsResponse {
  enrollments: StudentEnrollment[]
  summary: StudentEnrollmentSummary
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const TrainingProgramsService = {
  /** API #164 — Available training programs for enrollment */
  getAvailableTraining: async (
    filters: StudentTrainingFilters = {},
  ): Promise<AvailableTrainingsResponse> => {
    const params = new URLSearchParams()
    if (filters.program_type) params.append("program_type", filters.program_type)
    if (filters.search) params.append("search", filters.search)
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.limit) params.append("limit", String(filters.limit))

    const queryStr = params.toString()
    const url = queryStr
      ? `/student/get_available_training?${queryStr}`
      : "/student/get_available_training"
    const response = await api.get(url)

    return {
      programs: response.data.data as StudentAvailableProgram[],
      pagination: response.data.pagination,
    }
  },

  /** API #165 — Enroll in a training program */
  enrollInTraining: async (programId: string) => {
    const response = await api.post(
      `/student/enroll_in_training/${encodeURIComponent(programId)}`,
    )
    return response.data.data
  },

  /** API #166 — List enrolled training programs with progress */
  getEnrolledTraining: async (
    filters: StudentEnrollmentFilters = {},
  ): Promise<EnrolledTrainingsResponse> => {
    const params = new URLSearchParams()
    if (filters.completion_status) params.append("completion_status", filters.completion_status)
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.limit) params.append("limit", String(filters.limit))

    const queryStr = params.toString()
    const url = queryStr
      ? `/student/get_enrolled_training?${queryStr}`
      : "/student/get_enrolled_training"
    const response = await api.get(url)

    return {
      enrollments: response.data.data.enrollments as StudentEnrollment[],
      summary: response.data.data.summary as StudentEnrollmentSummary,
      pagination: response.data.pagination,
    }
  },

  /** API #167 — Submit one-time feedback for a training enrollment */
  submitTrainingFeedback: async (
    enrollmentId: string,
    data: SubmitFeedbackInput,
  ) => {
    const response = await api.post(
      `/student/submit_training_feedback/${encodeURIComponent(enrollmentId)}`,
      data,
    )
    return response.data.data
  },

  /** B14.13 — Update previously submitted feedback */
  updateTrainingFeedback: async (
    enrollmentId: string,
    data: SubmitFeedbackInput,
  ) => {
    const response = await api.put(
      `/student/update_training_feedback/${encodeURIComponent(enrollmentId)}`,
      data,
    )
    return response.data.data
  },

  /** B14.15 — Withdraw from a training program */
  withdrawFromTraining: async (programId: string) => {
    const response = await api.patch(
      `/student/withdraw_from_training/${encodeURIComponent(programId)}`,
    )
    return response.data.data
  },

  /** GAP-2 — Get session schedule for a program */
  getMySessionSchedule: async (
    programId: string,
  ): Promise<StudentSessionSchedule> => {
    const response = await api.get(
      `/student/training_sessions/${encodeURIComponent(programId)}`,
    )
    return response.data.data as StudentSessionSchedule
  },
}
