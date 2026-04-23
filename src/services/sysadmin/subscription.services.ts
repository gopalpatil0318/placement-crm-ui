import api from "../../lib/api"

// ─── Types ──────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "none" | "trial" | "active" | "expired" | "suspended"

export interface Subscription {
  subscription_id: string
  college_id: string
  subscription_status: SubscriptionStatus
  student_quota: number
  price_per_student: number
  total_amount: number
  amount_paid: number
  trial_ends_at: string | null
  valid_from: string
  valid_to: string
  grace_period_days: number
  allowed_passout_years: number[] | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  payment_count?: number
}

export interface CurrentSubscription {
  subscription: Subscription | null
  students_used: number
  students_remaining?: number
  subscription_status: SubscriptionStatus
}

export interface Payment {
  payment_id: string
  subscription_id: string
  college_id: string
  amount: number
  payment_date: string
  payment_method: string
  transaction_reference: string | null
  receipt_number: string | null
  notes: string | null
  recorded_by: string | null
  recorded_at: string
}

export interface BillingCollege {
  college_id: string
  college_name: string
  college_type: string
  college_subdomain: string
  college_subscription_status: SubscriptionStatus
  default_academic_year: number
  subscription_id: string | null
  subscription_status: SubscriptionStatus | null
  student_quota: number | null
  price_per_student: number | null
  total_amount: number | null
  amount_paid: number | null
  valid_from: string | null
  valid_to: string | null
  trial_ends_at: string | null
  allowed_passout_years: number[] | null
  students_used: number
}

export interface BillingSummary {
  total_revenue: number
  total_pending: number
  overdue_count: number
  no_plan_count: number
  trial_count: number
  active_count: number
}

export interface CreateSubscriptionPayload {
  subscription_status: "trial" | "active"
  student_quota: number
  price_per_student?: number
  total_amount?: number
  trial_ends_at?: string | null
  valid_from: string
  valid_to: string
  grace_period_days?: number
  allowed_passout_years?: number[] | null
  notes?: string
}

export interface UpdateSubscriptionPayload {
  subscription_status?: SubscriptionStatus
  student_quota?: number
  price_per_student?: number
  total_amount?: number
  trial_ends_at?: string | null
  valid_from?: string
  valid_to?: string
  grace_period_days?: number
  allowed_passout_years?: number[] | null
  notes?: string
}

export interface RecordPaymentPayload {
  amount: number
  payment_date: string
  payment_method: string
  transaction_reference?: string
  receipt_number?: string
  notes?: string
}

export interface BillingOverviewParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const SubscriptionService = {
  // Billing dashboard
  getBillingOverview: async (params?: BillingOverviewParams) => {
    const response = await api.get("/sysadmin/billing/overview", { params })
    return response.data
  },

  getBillingSummary: async (): Promise<{ data: BillingSummary }> => {
    const response = await api.get("/sysadmin/billing/summary")
    return response.data
  },

  // Per-college subscription CRUD
  createSubscription: async (collegeId: string, data: CreateSubscriptionPayload) => {
    const response = await api.post(`/sysadmin/colleges/${collegeId}/subscriptions`, data)
    return response.data
  },

  listSubscriptions: async (collegeId: string) => {
    const response = await api.get(`/sysadmin/colleges/${collegeId}/subscriptions`)
    return response.data
  },

  getCurrentSubscription: async (collegeId: string): Promise<{ data: CurrentSubscription }> => {
    const response = await api.get(`/sysadmin/colleges/${collegeId}/subscriptions/current`)
    return response.data
  },

  updateSubscription: async (collegeId: string, subId: string, data: UpdateSubscriptionPayload) => {
    const response = await api.put(`/sysadmin/colleges/${collegeId}/subscriptions/${subId}`, data)
    return response.data
  },

  // Payments
  recordPayment: async (subId: string, data: RecordPaymentPayload) => {
    const response = await api.post(`/sysadmin/subscriptions/${subId}/payments`, data)
    return response.data
  },

  listPayments: async (subId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/sysadmin/subscriptions/${subId}/payments`, { params })
    return response.data
  },
}
