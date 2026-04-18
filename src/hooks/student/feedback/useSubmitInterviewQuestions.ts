import { useState, useCallback, useMemo, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { showToast, getErrorTitle } from "@/utils/ToastUtils"
import { FeedbackService } from "@/services/student/feedback.service"
import { submitInterviewQuestionsSchema } from "@/validators/FeedbackSchema"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface QuestionRow {
  id: string
  question_description: string
  sample_answer: string
}

let questionRowCounter = 0
function createQuestionRow(): QuestionRow {
  questionRowCounter += 1
  return { id: `qr-${questionRowCounter}`, question_description: "", sample_answer: "" }
}

interface FormErrors {
  company_id?: string
  job_id?: string
  round_type?: string
  questions?: string
  questionRows?: { question_description?: string; sample_answer?: string }[]
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useSubmitInterviewQuestions(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient()
  const [companyId, setCompanyId] = useState("")
  const [jobId, setJobId] = useState("")
  const [roundType, setRoundType] = useState("")
  const [questions, setQuestions] = useState<QuestionRow[]>([
    createQuestionRow(),
  ])
  const [errors, setErrors] = useState<FormErrors>({})
  const [submittedCount, setSubmittedCount] = useState(0)

  // Unsaved changes protection
  const isDirty = useMemo(
    () => questions.some((q) => q.question_description.trim().length > 0),
    [questions],
  )
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    globalThis.addEventListener("beforeunload", handler)
    return () => globalThis.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const addQuestion = useCallback(() => {
    setQuestions((prev) => {
      if (prev.length >= 10) return prev
      return [...prev, createQuestionRow()]
    })
  }, [])

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const updateQuestion = useCallback(
    (index: number, field: keyof QuestionRow, value: string) => {
      setQuestions((prev) =>
        prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
      )
      // Clear row-level error
      setErrors((prev) => {
        if (!prev.questionRows?.[index]) return prev
        const newRows = [...(prev.questionRows || [])]
        newRows[index] = { ...newRows[index], [field]: undefined }
        return { ...prev, questionRows: newRows }
      })
    },
    [],
  )

  const handleCompanyIdChange = useCallback((id: string) => {
    setCompanyId(id)
    setJobId("")
    setSubmittedCount(0)
    setErrors((prev) => {
      if (!prev.company_id) return prev
      return { ...prev, company_id: undefined }
    })
  }, [])

  const handleJobChange = useCallback((id: string) => {
    setJobId(id)
    setSubmittedCount(0)
    setErrors((prev) => {
      if (!prev.job_id) return prev
      return { ...prev, job_id: undefined }
    })
  }, [])

  const handleRoundTypeChange = useCallback((value: string) => {
    setRoundType(value)
    setErrors((prev) => {
      if (!prev.round_type) return prev
      return { ...prev, round_type: undefined }
    })
  }, [])

  const resetAfterSubmit = useCallback(() => {
    setRoundType("")
    setQuestions([createQuestionRow()])
    setErrors({})
  }, [])

  const resetForm = useCallback(() => {
    setCompanyId("")
    setJobId("")
    setRoundType("")
    setQuestions([createQuestionRow()])
    setErrors({})
    setSubmittedCount(0)
  }, [])

  const validatePayload = useCallback(() => {
    const nonEmptyQuestions = questions
      .map((q) => ({
        question_description: q.question_description.trim(),
        sample_answer: q.sample_answer.trim() || undefined,
      }))
      .filter((q) => q.question_description.length > 0)

    const payload = {
      company_id: companyId,
      job_id: jobId,
      round_type: roundType as "aptitude" | "technical_interview" | "hr_interview" | "group_discussion" | "coding_test" | "other",
      questions: nonEmptyQuestions,
    }

    const result = submitInterviewQuestionsSchema.safeParse(payload)
    if (result.success) {
      setErrors({})
      return result.data
    }

    const fieldErrors: FormErrors = {}
    const rowErrors: FormErrors["questionRows"] = []
    for (const issue of result.error.issues) {
      const path = issue.path
      if (path[0] === "questions" && typeof path[1] === "number") {
        const idx = path[1]
        const field = path[2] as string
        if (!rowErrors[idx]) rowErrors[idx] = {}
        rowErrors[idx][field as keyof (typeof rowErrors)[number]] = issue.message
      } else {
        const field = path[0] as keyof FormErrors
        if (field !== "questionRows") {
          (fieldErrors as Record<string, string>)[field] = issue.message
        }
      }
    }
    if (rowErrors.length > 0) fieldErrors.questionRows = rowErrors
    setErrors(fieldErrors)
    showToast({
      type: "warning",
      title: "Validation Failed",
      description: result.error.issues[0].message,
    })
    return null
  }, [companyId, jobId, roundType, questions])

  const mutation = useMutation({
    mutationFn: () => {
      const validated = validatePayload()
      if (!validated) return Promise.reject(new Error("Validation failed"))
      return FeedbackService.submitInterviewQuestions(validated)
    },
    onSuccess: (_data) => {
      const count = questions.filter((q) => q.question_description.trim().length > 0).length
      setSubmittedCount((prev) => prev + count)
      showToast({
        type: "success",
        title: "Questions Submitted",
        description: `${count} question${count > 1 ? "s" : ""} submitted for review.`,
      })
      resetAfterSubmit()
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.browseQuestions() })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.questionCompanies() })
      onSuccessCallback?.()
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === "Validation failed") return
      const message = error instanceof ApiError ? error.message : "Failed to submit questions"
      const status = error instanceof ApiError ? error.status : undefined
      const title = getErrorTitle(status)
      showToast({ type: "error", title, description: message })
    },
  })

  return {
    companyId,
    jobId,
    roundType,
    questions,
    errors,
    submittedCount,
    setCompanyId: handleCompanyIdChange,
    handleJobChange,
    handleRoundTypeChange,
    addQuestion,
    removeQuestion,
    updateQuestion,
    handleSubmit: mutation.mutate,
    isSubmitting: mutation.isPending,
    resetForm,
  }
}
