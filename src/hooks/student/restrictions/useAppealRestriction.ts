import { useState, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { RestrictionsService } from "@/services/student/restrictions.service"
import {
  appealRestrictionSchema,
  type AppealRestrictionInput,
} from "@/validators/RestrictionSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useAppealRestriction() {
  const queryClient = useQueryClient()
  const [appealNotes, setAppealNotes] = useState("")
  const [errors, setErrors] = useState<{ appeal_notes?: string }>({})

  const handleChange = useCallback((value: string) => {
    setAppealNotes(value)
    setErrors((prev) => {
      if (!prev.appeal_notes) return prev
      return { appeal_notes: undefined }
    })
  }, [])

  const resetForm = useCallback(() => {
    setAppealNotes("")
    setErrors({})
  }, [])

  const validate = useCallback((): AppealRestrictionInput | null => {
    const result = appealRestrictionSchema.safeParse({ appeal_notes: appealNotes })
    if (!result.success) {
      const fieldErrors: { appeal_notes?: string } = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AppealRestrictionInput
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
  }, [appealNotes])

  const mutation = useMutation({
    mutationFn: ({ restrictionId, data }: { restrictionId: string; data: AppealRestrictionInput }) =>
      RestrictionsService.appealRestriction(restrictionId, data),
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Appeal Submitted",
        description: "Your appeal has been submitted. You will be notified of the outcome.",
      })
      resetForm()
      // Invalidate all restriction queries to refresh the list + summary
      queryClient.invalidateQueries({ queryKey: ["studentPortal", "myRestrictions"] })
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Failed to submit appeal"
      const status = error instanceof ApiError ? error.status : undefined

      let title = "Error"
      if (status === 409) title = "Already Appealed"
      else if (status === 400) title = "Cannot Appeal"
      else if (status === 404) title = "Not Found"
      else if (status === 429) title = "Too Many Requests"

      const description =
        status === 429
          ? "You're submitting too quickly. Please wait a moment and try again."
          : message

      showToast({ type: "error", title, description })
    },
  })

  return {
    appealNotes,
    errors,
    handleChange,
    validate,
    submitAppeal: mutation.mutate,
    resetForm,
    isSubmitting: mutation.isPending,
  }
}
