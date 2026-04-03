import { useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { SysAdminService } from "@/services/sysadmin/sysadmin.services"
import { showToast } from "@/utils/ToastUtils"
import { queryKeys } from "@/lib/queryKeys"

function getCollegeProfileError(queryError: unknown): string | null {
  if (!queryError) return null
  return queryError instanceof ApiError ? queryError.message : "Failed to load college"
}

export interface CollegeData {
  college_id: string
  college_name: string
  college_subdomain: string
  college_type: string
  college_address: string
  college_city: string
  college_taluka: string
  college_district: string
  college_state: string
  college_pincode: string
  college_status: string
  enabled_features: string[]
  default_academic_year: number
  admin_name: string
  admin_email: string
  college_logo_url: string | null
  college_website: string | null
  college_affiliation: string | null
  college_established_year: number | null
  college_description: string | null
  created_at: string
  updated_at: string
}

// ─── Shared mutation error handler ──────────────────────────────────────────────

function handleMutationError(error: unknown, fallbackTitle: string) {
  const message = error instanceof ApiError ? error.message : "Something went wrong"
  showToast({ type: "error", title: fallbackTitle, description: message })
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export const useCollegeProfile = () => {
  const { collegeId } = useParams<{ collegeId: string }>()
  const queryClient = useQueryClient()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: college, isLoading: loading, error: queryError } = useQuery<CollegeData | null>({
    queryKey: queryKeys.colleges.detail(collegeId || ""),
    queryFn: () => SysAdminService.getCollegeProfile(collegeId!),
    enabled: !!collegeId,
  })

  // Invalidation helper — keeps mutation callbacks DRY
  const invalidateCollege = useCallback(
    (alsoInvalidateList = false) => {
      if (!collegeId) return
      queryClient.invalidateQueries({ queryKey: queryKeys.colleges.detail(collegeId) })
      if (alsoInvalidateList) {
        queryClient.invalidateQueries({ queryKey: queryKeys.colleges.all() })
      }
    },
    [collegeId, queryClient],
  )

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      SysAdminService.toggleCollegeStatus(id, status),
    onSuccess: (res) => {
      if (res?.success) {
        invalidateCollege(true)
        showToast({ type: "success", title: "Status Updated", description: res.message || "College status updated" })
      }
    },
    onError: (err: unknown) => handleMutationError(err, "Failed to update status"),
  })

  const featuresMutation = useMutation({
    mutationFn: ({ id, features }: { id: string; features: string[] }) =>
      SysAdminService.updateCollegeFeatures(id, features),
    onSuccess: (res) => {
      if (res?.success) {
        invalidateCollege()
        showToast({ type: "success", title: "Features Updated", description: res.message || "College features updated successfully" })
      }
    },
    onError: (err: unknown) => handleMutationError(err, "Failed to update features"),
  })

  const academicYearMutation = useMutation({
    mutationFn: ({ id, year }: { id: string; year: number }) =>
      SysAdminService.updateAcademicYear(id, year),
    onSuccess: (res) => {
      if (res?.success) {
        invalidateCollege()
        showToast({ type: "success", title: "Academic Year Updated", description: res.message || "Academic year updated successfully" })
      }
    },
    onError: (err: unknown) => handleMutationError(err, "Failed to update academic year"),
  })

  const requestStatusToggle = useCallback(() => {
    if (!college?.college_id) return
    setShowConfirmDialog(true)
  }, [college])

  const cancelStatusToggle = useCallback(() => {
    setShowConfirmDialog(false)
  }, [])

  const confirmStatusToggle = useCallback(() => {
    if (!college?.college_id) return
    const newStatus = college.college_status === "active" ? "inactive" : "active"
    setShowConfirmDialog(false)
    statusMutation.mutate({ id: college.college_id, status: newStatus })
  }, [college, statusMutation])

  const updateFeatures = useCallback((features: string[]) => {
    if (!college?.college_id) return Promise.resolve()
    return featuresMutation.mutateAsync({ id: college.college_id, features })
  }, [college, featuresMutation])

  const updateAcademicYear = useCallback((year: number) => {
    if (!college?.college_id) return Promise.resolve()
    return academicYearMutation.mutateAsync({ id: college.college_id, year })
  }, [college, academicYearMutation])

  return {
    college: college ?? null,
    loading,
    error: getCollegeProfileError(queryError),
    toggling: statusMutation.isPending,
    showConfirmDialog,
    requestStatusToggle,
    confirmStatusToggle,
    cancelStatusToggle,
    updateFeatures,
    updateAcademicYear,
  }
}
