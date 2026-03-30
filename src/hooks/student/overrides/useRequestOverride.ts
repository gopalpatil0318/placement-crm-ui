import { useState, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { queryKeys } from "@/lib/queryKeys"
import { OverridesService } from "@/services/student/overrides.service"
import type { RequestOverrideApiResponse } from "@/services/student/overrides.service"
import {
  requestOverrideSchema,
  type RequestOverrideInput,
} from "@/validators/OverrideSchema"

export function useRequestOverride(jobId: string) {
  const queryClient = useQueryClient()
  const [requestReason, setRequestReason] = useState("")
  const [errors, setErrors] = useState<{ request_reason?: string }>({})

  const handleChange = useCallback((value: string) => {
    setRequestReason(value)
    setErrors((prev) => {
      if (!prev.request_reason) return prev
      return { request_reason: undefined }
    })
  }, [])

  const resetForm = useCallback(() => {
    setRequestReason("")
    setErrors({})
  }, [])

  const validate = useCallback((): RequestOverrideInput | null => {
    const result = requestOverrideSchema.safeParse({ request_reason: requestReason })
    if (!result.success) {
      const fieldErrors: { request_reason?: string } = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RequestOverrideInput
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
  }, [requestReason])

  const mutation = useMutation({
    mutationFn: (data: RequestOverrideInput) =>
      OverridesService.requestOverride(jobId, data),
    onSuccess: (response: RequestOverrideApiResponse) => {
      showToast({
        type: "success",
        title: "Override Requested",
        description: response.message,
      })
      resetForm()
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentPortal.overrideEligibility(jobId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentPortal.eligibility(jobId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentPortal.jobDetail(jobId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentPortal.myOverrides(),
      })
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Failed to submit override request"
      const status = error instanceof ApiError ? error.status : undefined

      const titleMap: Record<number, string> = {
        400: "Cannot Request Override",
        404: "Job Not Found",
        409: "Already Requested",
        429: "Too Many Requests",
      }
      const title = (status && titleMap[status]) || "Error"

      const description =
        status === 429
          ? "You're submitting too quickly. Please wait a moment and try again."
          : message

      showToast({ type: "error", title, description })
    },
  })

  return {
    requestReason,
    errors,
    handleChange,
    validate,
    submitRequest: mutation.mutate,
    resetForm,
    isSubmitting: mutation.isPending,
  }
}
