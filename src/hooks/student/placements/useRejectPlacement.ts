import { useState, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { PlacementService } from "@/services/student/placement.service"
import {
  rejectPlacementSchema,
  type StudentPlacementsResponse,
  type RejectPlacementFormData,
} from "@/validators/PlacementSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useRejectPlacement() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({ rejection_reason: "" })
  const [errors, setErrors] = useState<{ rejection_reason?: string }>({})

  const handleChange = useCallback((value: string) => {
    setFormData({ rejection_reason: value })
    setErrors((prev) => {
      if (!prev.rejection_reason) return prev
      return { rejection_reason: undefined }
    })
  }, [])

  const resetForm = useCallback(() => {
    setFormData({ rejection_reason: "" })
    setErrors({})
  }, [])

  const mutation = useMutation({
    mutationFn: ({ placementId, payload }: { placementId: string; payload: RejectPlacementFormData }) =>
      PlacementService.rejectPlacement(placementId, { rejection_reason: payload.rejection_reason.trim() }),
    onSuccess: (data) => {
      showToast({
        type: "success",
        title: "Offer Declined",
        description: `You have declined the offer for ${data.job_title} at ${data.company_name}.`,
      })
      resetForm()

      // Optimistic: update placement status in cached lists
      queryClient.setQueriesData<StudentPlacementsResponse>(
        { queryKey: ["studentPortal", "placements"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            placements: old.placements.map((p) =>
              p.placement_id === data.placement_id
                ? { ...p, placement_status: "rejected" as const, acceptance_status: "rejected" as const, updated_at: data.updated_at }
                : p,
            ),
            statusSummary: {
              ...old.statusSummary,
              offered: Math.max(0, old.statusSummary.offered - 1),
              rejected: old.statusSummary.rejected + 1,
            },
          }
        },
      )
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Failed to reject placement"
      const status = error instanceof ApiError ? error.status : undefined
      const title =
        status === 409 ? "Already Processed"
        : status === 404 ? "Not Found"
        : status === 400 ? "Invalid Request"
        : status === 429 ? "Too Many Requests"
        : "Error"
      const description = status === 429 ? "You're acting too quickly. Please wait a moment." : message
      showToast({ type: "error", title, description })
    },
  })

  const validate = useCallback((): RejectPlacementFormData | null => {
    const result = rejectPlacementSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: { rejection_reason?: string } = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RejectPlacementFormData
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      showToast({
        type: "warning",
        title: "Validation Failed",
        description: result.error.issues[0].message,
      })
      return null
    }
    setErrors({})
    return result.data
  }, [formData])

  return {
    formData,
    errors,
    handleChange,
    validate,
    rejectPlacement: mutation.mutate,
    resetForm,
    isRejecting: mutation.isPending,
  }
}
