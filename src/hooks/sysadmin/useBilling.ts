import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { showToast } from "@/utils/ToastUtils"
import {
  SubscriptionService,
  type BillingOverviewParams,
  type CreateSubscriptionPayload,
  type UpdateSubscriptionPayload,
  type RecordPaymentPayload,
  type BillingSummary,
  type BillingCollege,
  type CurrentSubscription,
  type Subscription,
  type Payment,
} from "@/services/sysadmin/subscription.services"

// ─── Error helper ───────────────────────────────────────────────────────────────

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

// ─── Billing Overview (dashboard page) ──────────────────────────────────────────

export function useBillingOverview() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const queryFilters: BillingOverviewParams = { page, limit, status: statusFilter, search }

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: queryKeys.subscriptions.billingOverview(queryFilters as unknown as Record<string, unknown>),
    queryFn: () => SubscriptionService.getBillingOverview(queryFilters),
    placeholderData: (prev) => prev,
  })

  const colleges: BillingCollege[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 0 }

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value)
    setPage(1)
  }, [])

  return {
    colleges,
    loading: isLoading,
    isFetching,
    error: error ? toErrorMessage(error, "Failed to load billing data") : null,
    pagination,
    search,
    statusFilter,
    page,
    limit,
    setPage,
    setLimit,
    handleSearchChange,
    handleStatusChange,
  }
}

export function useBillingSummary() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subscriptions.billingSummary(),
    queryFn: () => SubscriptionService.getBillingSummary(),
  })

  const summary: BillingSummary = data?.data ?? {
    total_revenue: 0,
    total_pending: 0,
    overdue_count: 0,
    no_plan_count: 0,
    trial_count: 0,
    active_count: 0,
  }

  return { summary, loading: isLoading }
}

// ─── Per-College Subscription ───────────────────────────────────────────────────

export function useCollegeSubscription(collegeId: string) {
  const queryClient = useQueryClient()

  const { data: currentData, isLoading: loadingCurrent } = useQuery({
    queryKey: queryKeys.subscriptions.current(collegeId),
    queryFn: () => SubscriptionService.getCurrentSubscription(collegeId),
    enabled: !!collegeId,
  })

  const { data: listData, isLoading: loadingList } = useQuery({
    queryKey: queryKeys.subscriptions.list(collegeId),
    queryFn: () => SubscriptionService.listSubscriptions(collegeId),
    enabled: !!collegeId,
  })

  const current: CurrentSubscription | null = currentData?.data ?? null
  const subscriptions: Subscription[] = listData?.data ?? []

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.current(collegeId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.list(collegeId) })
    queryClient.invalidateQueries({ queryKey: ["subscriptions", "billing"] })
    queryClient.invalidateQueries({ queryKey: ["subscriptions", "summary"] })
    queryClient.invalidateQueries({ queryKey: queryKeys.colleges.detail(collegeId) })
  }, [collegeId, queryClient])

  const createMutation = useMutation({
    mutationFn: (data: CreateSubscriptionPayload) =>
      SubscriptionService.createSubscription(collegeId, data),
    onSuccess: (res) => {
      invalidate()
      showToast({ type: "success", title: "Subscription Created", description: res?.message || "Subscription created successfully" })
    },
    onError: (err: unknown) => {
      showToast({ type: "error", title: "Failed", description: toErrorMessage(err, "Failed to create subscription") })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ subId, data }: { subId: string; data: UpdateSubscriptionPayload }) =>
      SubscriptionService.updateSubscription(collegeId, subId, data),
    onSuccess: (res) => {
      invalidate()
      showToast({ type: "success", title: "Updated", description: res?.message || "Subscription updated" })
    },
    onError: (err: unknown) => {
      showToast({ type: "error", title: "Update Failed", description: toErrorMessage(err, "Failed to update subscription") })
    },
  })

  const paymentMutation = useMutation({
    mutationFn: ({ subId, data }: { subId: string; data: RecordPaymentPayload }) =>
      SubscriptionService.recordPayment(subId, data),
    onSuccess: (res) => {
      invalidate()
      showToast({ type: "success", title: "Payment Recorded", description: res?.message || "Payment recorded successfully" })
    },
    onError: (err: unknown) => {
      showToast({ type: "error", title: "Payment Failed", description: toErrorMessage(err, "Failed to record payment") })
    },
  })

  return {
    current,
    subscriptions,
    loadingCurrent,
    loadingList,
    createSubscription: createMutation.mutateAsync,
    creatingSubscription: createMutation.isPending,
    updateSubscription: updateMutation.mutateAsync,
    updatingSubscription: updateMutation.isPending,
    recordPayment: paymentMutation.mutateAsync,
    recordingPayment: paymentMutation.isPending,
  }
}

// ─── Payments for a specific subscription ───────────────────────────────────────

export function useSubscriptionPayments(subId: string) {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subscriptions.payments(subId, { page, limit } as unknown as Record<string, unknown>),
    queryFn: () => SubscriptionService.listPayments(subId, { page, limit }),
    enabled: !!subId,
  })

  const payments: Payment[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 0 }

  return { payments, loading: isLoading, pagination, page, setPage }
}
