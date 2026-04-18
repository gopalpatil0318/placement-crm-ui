import api from "@/lib/api"
import type {
  StudentPlacement,
  StudentPlacementsResponse,
  PlacementFilters,
  PlacementPagination,
  PlacementStatusSummary,
  AcceptPlacementResponse,
  RejectPlacementResponse,
} from "@/validators/PlacementSchema"

// ─── Service ────────────────────────────────────────────────────────────────────

export const PlacementService = {
  /** API #159 — List student's own placements with optional filters */
  getMyPlacements: async (
    filters: PlacementFilters = {},
  ): Promise<StudentPlacementsResponse> => {
    const params = new URLSearchParams()
    if (filters.placement_status) params.append("placement_status", filters.placement_status)
    if (filters.placement_type) params.append("placement_type", filters.placement_type)
    if (filters.acceptance_status) params.append("acceptance_status", filters.acceptance_status)
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.limit) params.append("limit", String(filters.limit))

    const queryStr = params.toString()
    const url = queryStr
      ? `/student/get_my_placements?${queryStr}`
      : "/student/get_my_placements"
    const response = await api.get(url)

    return {
      placements: response.data.data.placements as StudentPlacement[],
      statusSummary: response.data.data.status_summary as PlacementStatusSummary,
      pagination: response.data.pagination as PlacementPagination,
    }
  },

  /** API #160 — Accept a placement offer */
  acceptPlacement: async (
    placementId: string,
  ): Promise<AcceptPlacementResponse> => {
    const response = await api.patch(
      `/student/accept_placement/${placementId}`,
    )
    return response.data.data as AcceptPlacementResponse
  },

  /** API #161 — Decline a placement offer with reason */
  rejectPlacement: async (
    placementId: string,
    payload: { rejection_reason: string },
  ): Promise<RejectPlacementResponse> => {
    const response = await api.patch(
      `/student/decline_placement/${placementId}`,
      payload,
    )
    return response.data.data as RejectPlacementResponse
  },

  /** Alias for rejectPlacement using the new endpoint name */
  declinePlacement: async (
    placementId: string,
    payload: { rejection_reason: string },
  ): Promise<RejectPlacementResponse> => {
    const response = await api.patch(
      `/student/decline_placement/${placementId}`,
      payload,
    )
    return response.data.data as RejectPlacementResponse
  },

  /** Upload offer letter and/or joining letter URLs */
  uploadPlacementDocuments: async (
    placementId: string,
    payload: { offer_letter_url?: string; joining_letter_url?: string },
  ) => {
    const response = await api.patch(
      `/student/upload_placement_documents/${placementId}`,
      payload,
    )
    return response.data
  },
}
