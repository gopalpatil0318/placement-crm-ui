import api from "@/lib/api"
import type {
  OverrideEligibility,
  OverrideRequestResponse,
  MyOverrideRequest,
  OverrideFilters,
  RequestOverrideInput,
} from "@/validators/OverrideSchema"

// ─── Response Shapes ────────────────────────────────────────────────────────────

export interface CheckOverrideResponse {
  data: OverrideEligibility
}

export interface RequestOverrideApiResponse {
  data: OverrideRequestResponse
  message: string
}

export interface MyOverridesResponse {
  overrides: MyOverrideRequest[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const OverridesService = {
  /** Check whether student can request an override for a specific job */
  checkOverrideEligibility: async (
    jobId: string,
  ): Promise<OverrideEligibility> => {
    const response = await api.get(
      `/student/check_override_eligibility/${encodeURIComponent(jobId)}`,
    )
    return response.data.data as OverrideEligibility
  },

  /** Submit an eligibility override request for a job */
  requestOverride: async (
    jobId: string,
    data: RequestOverrideInput,
  ): Promise<RequestOverrideApiResponse> => {
    const response = await api.post(
      `/student/request_job_override/${encodeURIComponent(jobId)}`,
      { request_reason: data.request_reason.trim() },
    )
    return {
      data: response.data.data as OverrideRequestResponse,
      message: response.data.message as string,
    }
  },

  /** List the student's own override requests with filters */
  getMyOverrides: async (
    filters: OverrideFilters = {},
  ): Promise<MyOverridesResponse> => {
    const params = new URLSearchParams()
    if (filters.status) params.append("status", filters.status)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.limit) params.append("limit", String(filters.limit))

    const queryStr = params.toString()
    const url = queryStr
      ? `/student/get_my_override_requests?${queryStr}`
      : "/student/get_my_override_requests"
    const response = await api.get(url)

    return {
      overrides: response.data.data as MyOverrideRequest[],
      pagination: response.data.pagination,
    }
  },
}
