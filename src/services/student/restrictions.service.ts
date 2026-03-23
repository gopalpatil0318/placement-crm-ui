import api from "@/lib/api"
import type {
  StudentRestriction,
  RestrictionSummary,
  RestrictionFilters,
  AppealRestrictionInput,
} from "@/validators/RestrictionSchema"

// ─── Response Shapes ────────────────────────────────────────────────────────────

export interface MyRestrictionsResponse {
  restrictions: StudentRestriction[]
  summary: RestrictionSummary
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export interface AppealResponse {
  restriction_id: string
  restriction_type: string
  reason: string
  is_active: boolean
  appeal_submitted: boolean
  appeal_notes: string
  applied_on: string
  valid_until: string | null
  restricted_by_name: string
  updated_at: string
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const RestrictionsService = {
  /** API #162 — List student's own restrictions */
  getMyRestrictions: async (
    filters: RestrictionFilters = {},
  ): Promise<MyRestrictionsResponse> => {
    const params = new URLSearchParams()
    if (filters.is_active) params.append("is_active", filters.is_active)
    if (filters.restriction_type) params.append("restriction_type", filters.restriction_type)
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.limit) params.append("limit", String(filters.limit))

    const queryStr = params.toString()
    const url = queryStr
      ? `/student/get_my_restrictions?${queryStr}`
      : "/student/get_my_restrictions"
    const response = await api.get(url)

    return {
      restrictions: response.data.data.restrictions as StudentRestriction[],
      summary: response.data.data.summary as RestrictionSummary,
      pagination: response.data.pagination,
    }
  },

  /** API #163 — Submit appeal for a restriction (one-time, irreversible) */
  appealRestriction: async (
    restrictionId: string,
    data: AppealRestrictionInput,
  ): Promise<AppealResponse> => {
    const response = await api.post(
      `/student/appeal_restriction/${encodeURIComponent(restrictionId)}`,
      data,
    )
    return response.data.data as AppealResponse
  },
}
