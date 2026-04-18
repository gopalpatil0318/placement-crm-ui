import { useState, useCallback, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { showToast, getErrorTitle } from "@/utils/ToastUtils"
import { TrainingProgramsService } from "@/services/student/trainingPrograms.service"
import { submitFeedbackSchema } from "@/validators/TrainingProgramSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useSubmitTrainingFeedback() {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [errors, setErrors] = useState<{ student_rating?: string; student_feedback?: string }>({})

  const isDirty = rating > 0 || feedback.trim().length > 0

  // ── Protect unsaved feedback ──
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const resetForm = useCallback(() => {
    setRating(0)
    setFeedback("")
    setErrors({})
  }, [])

  const prefill = useCallback((existingRating: number, existingFeedback: string) => {
    setRating(existingRating)
    setFeedback(existingFeedback)
    setErrors({})
  }, [])

  const validate = useCallback((): { student_rating: number; student_feedback: string } | null => {
    const result = submitFeedbackSchema.safeParse({
      student_rating: rating,
      student_feedback: feedback.trim(),
    })
    if (!result.success) {
      const fieldErrors: { student_rating?: string; student_feedback?: string } = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as "student_rating" | "student_feedback"
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
  }, [rating, feedback])

  const mutation = useMutation({
    mutationFn: ({ enrollmentId, data, isEdit }: { enrollmentId: string; data: { student_rating: number; student_feedback: string }; isEdit?: boolean }) =>
      isEdit
        ? TrainingProgramsService.updateTrainingFeedback(enrollmentId, data)
        : TrainingProgramsService.submitTrainingFeedback(enrollmentId, data),
    onSuccess: (_data, variables) => {
      showToast({
        type: "success",
        title: variables.isEdit ? "Feedback Updated" : "Feedback Submitted",
        description: variables.isEdit ? "Your feedback has been updated." : "Thank you for your feedback!",
      })
      resetForm()
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.myEnrollments() })
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Failed to submit feedback"
      const status = error instanceof ApiError ? error.status : undefined
      showToast({ type: "error", title: getErrorTitle(status), description: message })
    },
  })

  return {
    rating,
    feedback,
    errors,
    setRating,
    setFeedback: useCallback((value: string) => {
      setFeedback(value)
      setErrors((prev) => {
        if (!prev.student_feedback) return prev
        return { ...prev, student_feedback: undefined }
      })
    }, []),
    validate,
    submitFeedback: mutation.mutate,
    isSubmitting: mutation.isPending,
    resetForm,
    prefill,
  }
}
