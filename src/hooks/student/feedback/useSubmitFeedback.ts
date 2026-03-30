import { useState, useCallback, useMemo, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { showToast, getErrorTitle } from "@/utils/ToastUtils"
import { FeedbackService } from "@/services/student/feedback.service"
import { submitFeedbackSchema } from "@/validators/FeedbackSchema"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface FormErrors {
  job_id?: string
  company_id?: string
  rating?: string
  feedback_text?: string
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useSubmitFeedback(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const [jobId, setJobId] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Unsaved changes protection
  const isDirty = useMemo(
    () => rating > 0 || feedbackText.trim().length > 0,
    [rating, feedbackText],
  )
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    globalThis.addEventListener("beforeunload", handler)
    return () => globalThis.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const resetForm = useCallback(() => {
    setJobId("")
    setCompanyId("")
    setRating(0)
    setFeedbackText("")
    setIsAnonymous(false)
    setErrors({})
  }, [])

  const handleJobSelect = useCallback((newJobId: string, newCompanyId: string) => {
    setJobId(newJobId)
    setCompanyId(newCompanyId)
    setErrors((prev) => {
      if (!prev.job_id) return prev
      return { ...prev, job_id: undefined }
    })
  }, [])

  const handleRatingChange = useCallback((star: number) => {
    setRating(star)
    setErrors((prev) => {
      if (!prev.rating) return prev
      return { ...prev, rating: undefined }
    })
  }, [])

  const handleFeedbackTextChange = useCallback((value: string) => {
    setFeedbackText(value)
    setErrors((prev) => {
      if (!prev.feedback_text) return prev
      return { ...prev, feedback_text: undefined }
    })
  }, [])

  const mutation = useMutation({
    mutationFn: () => {
      const result = submitFeedbackSchema.safeParse({
        job_id: jobId,
        company_id: companyId,
        rating,
        feedback_text: feedbackText.trim() || undefined,
        is_anonymous: isAnonymous,
      })
      if (!result.success) {
        const fieldErrors: FormErrors = {}
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof FormErrors
          if (!fieldErrors[field]) fieldErrors[field] = issue.message
        }
        setErrors(fieldErrors)
        showToast({
          type: "warning",
          title: "Validation Failed",
          description: result.error.issues[0].message,
        })
        return Promise.reject(new Error("Validation failed"))
      }
      setErrors({})
      return FeedbackService.submitFeedback(result.data)
    },
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      })
      resetForm()
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.myFeedback() })
      onSuccess?.()
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === "Validation failed") return
      const message = error instanceof ApiError ? error.message : "Failed to submit feedback"
      const status = error instanceof ApiError ? error.status : undefined
      if (status === 409) {
        setErrors({ job_id: message })
      }
      const title = status === 409 ? "Already Submitted" : getErrorTitle(status)
      showToast({ type: "error", title, description: message })
    },
  })

  return {
    jobId,
    companyId,
    rating,
    feedbackText,
    isAnonymous,
    errors,
    handleJobSelect,
    handleRatingChange,
    handleFeedbackTextChange,
    setIsAnonymous,
    handleSubmit: mutation.mutate,
    isSubmitting: mutation.isPending,
    resetForm,
  }
}
