import { useState, useCallback, useMemo, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { showToast, getErrorTitle } from "@/utils/ToastUtils"
import { FeedbackService } from "@/services/student/feedback.service"
import { submitInterviewQuestionSchema } from "@/validators/FeedbackSchema"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface FormErrors {
  company_id?: string
  job_id?: string
  question_description?: string
  topic?: string
  sample_answer?: string
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useSubmitInterviewQuestion(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient()
  const [companyId, setCompanyId] = useState("")
  const [jobId, setJobId] = useState("")
  const [questionDescription, setQuestionDescription] = useState("")
  const [topic, setTopic] = useState("")
  const [sampleAnswer, setSampleAnswer] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})

  // Unsaved changes protection
  const isDirty = useMemo(
    () => questionDescription.trim().length > 0 || topic.trim().length > 0 || sampleAnswer.trim().length > 0,
    [questionDescription, topic, sampleAnswer],
  )
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    globalThis.addEventListener("beforeunload", handler)
    return () => globalThis.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const resetForm = useCallback(() => {
    setCompanyId("")
    setJobId("")
    setQuestionDescription("")
    setTopic("")
    setSampleAnswer("")
    setErrors({})
  }, [])

  // When company changes, reset job (cascading dropdown)
  const handleCompanyIdChange = useCallback((id: string) => {
    setCompanyId(id)
    setJobId("")
    setErrors((prev) => {
      if (!prev.company_id) return prev
      return { ...prev, company_id: undefined }
    })
  }, [])

  const handleJobChange = useCallback((id: string) => {
    setJobId(id)
    setErrors((prev) => {
      if (!prev.job_id) return prev
      return { ...prev, job_id: undefined }
    })
  }, [])

  const handleQuestionChange = useCallback((value: string) => {
    setQuestionDescription(value)
    setErrors((prev) => {
      if (!prev.question_description) return prev
      return { ...prev, question_description: undefined }
    })
  }, [])

  const handleTopicChange = useCallback((value: string) => {
    setTopic(value)
    setErrors((prev) => {
      if (!prev.topic) return prev
      return { ...prev, topic: undefined }
    })
  }, [])

  const handleSampleAnswerChange = useCallback((value: string) => {
    setSampleAnswer(value)
    setErrors((prev) => {
      if (!prev.sample_answer) return prev
      return { ...prev, sample_answer: undefined }
    })
  }, [])

  const mutation = useMutation({
    mutationFn: () => {
      const result = submitInterviewQuestionSchema.safeParse({
        company_id: companyId,
        job_id: jobId,
        question_description: questionDescription.trim(),
        topic: topic.trim() || undefined,
        sample_answer: sampleAnswer.trim() || undefined,
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
      return FeedbackService.submitInterviewQuestion(result.data)
    },
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Question Submitted",
        description: "Your question has been submitted for review.",
      })
      resetForm()
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.browseQuestions() })
      onSuccessCallback?.()
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === "Validation failed") return
      const message = error instanceof ApiError ? error.message : "Failed to submit question"
      const status = error instanceof ApiError ? error.status : undefined
      const title = getErrorTitle(status)
      showToast({ type: "error", title, description: message })
    },
  })

  return {
    companyId,
    jobId,
    questionDescription,
    topic,
    sampleAnswer,
    errors,
    setCompanyId: handleCompanyIdChange,
    handleJobChange,
    handleQuestionChange,
    handleTopicChange,
    handleSampleAnswerChange,
    handleSubmit: mutation.mutate,
    isSubmitting: mutation.isPending,
    resetForm,
  }
}
