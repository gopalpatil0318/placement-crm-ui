import { useState, useCallback, useMemo, useEffect } from "react"
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services"
import { ApiError } from "@/lib/api"
import { showToast, getErrorTitle } from "@/utils/ToastUtils"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface AdminSelfReportFormData {
  company_name: string
  company_id?: string
  job_title: string
  placement_type: string
  drive_type?: string
  fulltime_package?: number
  fulltime_designation?: string
  fulltime_joining_date?: string
  internship_stipend?: number
  internship_duration?: string
  internship_start_date?: string
  job_location?: string
  offer_date?: string
  remarks?: string
}

export interface ExistingPlacement {
  company_name: string
  placement_type: string
  fulltime_package: number | null
  placement_status: string
}

export interface AdminSelfReport {
  report_id: string
  student_id: string
  college_id: string
  form_data: AdminSelfReportFormData
  offer_letter_url: string | null
  passout_year: number
  verification_status: "pending" | "approved" | "rejected"
  rejection_reason?: string | null
  reviewed_at?: string | null
  resulting_placement_id?: string | null
  created_at: string
  updated_at?: string
  // Joined from list endpoint
  student_first_name?: string
  student_last_name?: string
  student_email?: string
  dept_name?: string | null
  // Joined from detail endpoint
  student_passout_year?: number
  reviewer_name?: string | null
  existing_placements?: ExistingPlacement[]
}

export interface SelfReportStats {
  pending: number
  approved: number
  rejected: number
}

interface Filters {
  verification_status?: string
  search?: string
  passout_year?: number
  page?: number
  limit?: number
}

type StatusFilter = "all" | "pending" | "approved" | "rejected"

// ─── List Hook ──────────────────────────────────────────────────────────────────

export function useAdminSelfReports(initialLimit = 10) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [search, setSearch] = useState("")
  const [passoutYear, setPassoutYear] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  const queryFilters = useMemo<Filters>(
    () => ({
      ...(statusFilter === "all" ? {} : { verification_status: statusFilter }),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(passoutYear ? { passout_year: passoutYear } : {}),
      page,
      limit,
    }),
    [statusFilter, search, passoutYear, page, limit],
  )

  const queryClient = useQueryClient()

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.selfReports.list(queryFilters as Record<string, unknown>),
    queryFn: () => CollegeAdminService.getSelfReports(queryFilters),
    placeholderData: keepPreviousData,
  })

  const reports: AdminSelfReport[] = data?.data?.reports ?? []
  const pagination = data?.pagination ?? {
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  }

  // Prefetch next page
  useEffect(() => {
    if (pagination.page < pagination.totalPages) {
      const next = { ...queryFilters, page: pagination.page + 1 }
      void queryClient.prefetchQuery({
        queryKey: queryKeys.selfReports.list(next as Record<string, unknown>),
        queryFn: () => CollegeAdminService.getSelfReports(next),
      })
    }
  }, [pagination.page, pagination.totalPages, queryFilters, queryClient])

  const handleStatusFilterChange = useCallback((f: StatusFilter) => {
    setStatusFilter(f)
    setPage(1)
  }, [])

  const handleSearchChange = useCallback((q: string) => {
    setSearch(q)
    setPage(1)
  }, [])

  const handlePassoutYearChange = useCallback((y: number | undefined) => {
    setPassoutYear(y)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return {
    reports,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    statusFilter,
    search,
    passoutYear,
    handleStatusFilterChange,
    handleSearchChange,
    handlePassoutYearChange,
    handlePageChange,
  }
}

// ─── Detail Hook ────────────────────────────────────────────────────────────────

export function useSelfReportDetail(reportId: string | null) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.selfReports.detail(reportId ?? ""),
    queryFn: () => CollegeAdminService.getSelfReportById(reportId!),
    enabled: !!reportId,
  })

  return {
    report: (data?.data?.report as AdminSelfReport) ?? null,
    isLoading,
    isError,
    refetch,
  }
}

// ─── Stats Hook ─────────────────────────────────────────────────────────────────

export function useSelfReportStats(passoutYear: number) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.selfReports.stats(passoutYear),
    queryFn: () => CollegeAdminService.getSelfReportStats(passoutYear),
    enabled: passoutYear > 0,
    staleTime: 30_000,
  })

  const stats: SelfReportStats = data?.data?.stats ?? { pending: 0, approved: 0, rejected: 0 }

  return { stats, isLoading }
}

// ─── Review Mutation ────────────────────────────────────────────────────────────

export function useReviewSelfReport() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      reportId,
      action,
      company_id,
      job_id,
      rejection_reason,
    }: {
      reportId: string
      action: "approve" | "reject"
      company_id?: string
      job_id?: string
      rejection_reason?: string
    }) =>
      CollegeAdminService.reviewSelfReport(reportId, {
        action,
        company_id,
        job_id,
        rejection_reason,
      }),
    onSuccess: (_data, variables) => {
      const isApprove = variables.action === "approve"
      showToast({
        type: "success",
        title: isApprove ? "Self-Report Approved" : "Self-Report Rejected",
        description: isApprove
          ? "Placement has been recorded and the student has been notified."
          : "The student has been notified of the rejection.",
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.selfReports.list() })
      void queryClient.invalidateQueries({ queryKey: ["selfReports", "stats"] })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.selfReports.detail(variables.reportId),
      })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError ? error.message : "Failed to review self-report"
      const status = error instanceof ApiError ? error.status : undefined
      showToast({ type: "error", title: getErrorTitle(status), description: message })
    },
  })

  return {
    reviewSelfReport: mutation.mutateAsync,
    isReviewing: mutation.isPending,
  }
}
