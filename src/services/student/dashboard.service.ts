import api from "@/lib/api"

// ─── Dashboard Overview Types ───────────────────────────────────────────────────

export type JourneyStage = "onboarding" | "ready" | "active" | "offered" | "placed" | "off_season"

export interface DashboardAction {
  priority: number
  type: string
  title: string
  subtitle: string | null
  deadline: string | null
  link: string
  icon_hint: string
}

export interface FunnelData {
  total: number
  pending: number
  under_review: number
  shortlisted: number
  selected: number
  waitlisted: number
  offered: number
  rejected: number
  withdrawn: number
  auto_withdrawn: number
  active_count: number
}

export interface ScheduleItem {
  event_date: string
  event_type: "round" | "offer_deadline" | "training_session"
  title: string
  subtitle: string | null
  venue: string | null
  link: string
}

export type DocStatus = "verified" | "uploaded" | "missing" | "rejected" | "not_applicable"

export interface DocChecklist {
  offer_letter: DocStatus
  joining_letter: DocStatus
}

export interface OfferItem {
  placement_id: string
  company_name: string
  company_logo: string | null
  job_title: string
  placement_type: string
  fulltime_package: number | null
  fulltime_designation: string | null
  offer_expires_at: string | null
  doc_checklist: DocChecklist
}

export interface CurrentPlacement {
  placement_id: string
  company_name: string
  company_logo: string | null
  job_title: string
  placement_status: string
  placement_type: string
  fulltime_package: number | null
  fulltime_designation: string | null
  fulltime_joining_date: string | null
  internship_stipend: number | null
  internship_duration: string | null
  internship_start_date: string | null
  tier_name: string | null
  tier_level: number | null
  doc_checklist: DocChecklist
}

export interface PlacementContext {
  current_placement: CurrentPlacement | null
  offers: OfferItem[]
  dream_upgrade_allowed: boolean
  max_active_offers: number
}

export interface ProfileSection {
  weight: number
  completed: boolean
  suggestion: string
}

export interface ProfileHealth {
  total_percentage: number
  is_complete: boolean
  is_approved: boolean
  approval_status: string
  rejection_reason: string | null
  rejected_at: string | null
  sections: Record<string, ProfileSection>
  next_incomplete: { section: string; weight: number; suggestion: string } | null
}

export interface QuickStats {
  jobs_available: number
  active_applications: number
  unread_notifications: number
  active_restrictions: number
  is_placed: boolean
}

export interface WaitlistRank {
  waitlist_rank: number
  job_title: string
  company_name: string
}

export interface DashboardOverviewResponse {
  journey_stage: JourneyStage
  profile: ProfileHealth
  actions: DashboardAction[]
  funnel: FunnelData
  schedule: ScheduleItem[]
  placement_context: PlacementContext | null
  quick_stats: QuickStats
  waitlist_ranks: WaitlistRank[]
  enabled_features: string[]
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const DashboardService = {
  /** Fetch composite dashboard overview (single endpoint, 1 DB round-trip) */
  getDashboardOverview: async (): Promise<DashboardOverviewResponse> => {
    const response = await api.get("/student/get_dashboard_overview")
    return response.data.data
  },
}
