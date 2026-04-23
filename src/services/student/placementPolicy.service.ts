import api from "@/lib/api"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface PlacementPolicy {
  policy_id: string
  policy_title: string
  policy_description: string
  passout_year: number
  created_at: string
  updated_at: string
  created_by_name: string | null
}

export interface PlacementPoliciesResponse {
  policies: PlacementPolicy[]
  total: number
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const PlacementPolicyService = {
  /** CF1 — Get active placement policies for student's college + passout year */
  getActivePolicies: async (): Promise<PlacementPoliciesResponse> => {
    const response = await api.get("/student/get_placement_policies")
    return response.data.data as PlacementPoliciesResponse
  },
}
