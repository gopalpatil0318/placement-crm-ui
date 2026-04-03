import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { useCollegeProfile } from "./useCollegeProfile"
import { showToast } from "@/utils/ToastUtils"
import { SysAdminService } from "@/services/sysadmin/sysadmin.services"
import { collegeSchemaUpdate } from "@/validators/CollegeSchemaUpdate"
import { queryKeys } from "@/lib/queryKeys"

function getEditCollegeError(queryError: unknown, mutationError: unknown): string | null {
  if (queryError) return queryError instanceof ApiError ? queryError.message : "Failed to load college"
  if (!mutationError) return null
  return mutationError instanceof ApiError ? mutationError.message : "Failed to update college"
}

interface EditCollegeForm {
  college_name: string
  college_subdomain: string
  college_type: string
  college_address: string
  college_city: string
  college_taluka: string
  college_district: string
  college_state: string
  college_pincode: string
  college_logo_url: string
  college_website: string
  college_affiliation: string
  college_established_year: string
  college_description: string
}

type FormErrors = Partial<Record<keyof EditCollegeForm, string>>

export const useEditCollege = (onItemLoaded?: (name: string) => void) => {
  const { college, loading, error: queryError } = useCollegeProfile()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<EditCollegeForm>({
    college_name: "",
    college_subdomain: "",
    college_type: "",
    college_address: "",
    college_city: "",
    college_taluka: "",
    college_district: "",
    college_state: "",
    college_pincode: "",
    college_logo_url: "",
    college_website: "",
    college_affiliation: "",
    college_established_year: "",
    college_description: "",
  })

  const originalData = useRef<EditCollegeForm | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (college) {
      const data: EditCollegeForm = {
        college_name: college.college_name || "",
        college_subdomain: college.college_subdomain || "",
        college_type: college.college_type || "",
        college_address: college.college_address || "",
        college_city: college.college_city || "",
        college_taluka: college.college_taluka || "",
        college_district: college.college_district || "",
        college_state: college.college_state || "",
        college_pincode: college.college_pincode || "",
        college_logo_url: college.college_logo_url || "",
        college_website: college.college_website || "",
        college_affiliation: college.college_affiliation || "",
        college_established_year: college.college_established_year ? String(college.college_established_year) : "",
        college_description: college.college_description || "",
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- data prefill from query
      setFormData(data)
      originalData.current = { ...data }
      onItemLoaded?.(college.college_name)
    }
  }, [college, onItemLoaded])

  const mutation = useMutation({
    mutationFn: ({ collegeId, payload }: { collegeId: string; payload: Partial<EditCollegeForm> }) => {
      // Convert established_year from string to number for the API
      const apiPayload: Record<string, unknown> = { ...payload }
      if (apiPayload.college_established_year !== undefined) {
        const yearStr = apiPayload.college_established_year as string
        apiPayload.college_established_year = yearStr ? Number(yearStr) : null
      }
      return SysAdminService.updateCollege(collegeId, apiPayload as Parameters<typeof SysAdminService.updateCollege>[1])
    },
    onSuccess: (res) => {
      const collegeId = college?.college_id
      if (res?.success) {
        if (collegeId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.colleges.all() })
          queryClient.invalidateQueries({ queryKey: queryKeys.colleges.detail(collegeId) })
        }
        showToast({
          type: "success",
          title: "Updated College Successfully",
          description: res.message || "College updated.",
        })
        if (collegeId) navigate(`/sysadmin/colleges/${collegeId}`)
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong"
      const status = error instanceof ApiError ? error.status : undefined

      if (status === 409) {
        if (message.toLowerCase().includes("subdomain")) {
          setErrors((prev) => ({ ...prev, college_subdomain: message }))
        } else if (message.toLowerCase().includes("name")) {
          setErrors((prev) => ({ ...prev, college_name: message }))
        }
        showToast({ type: "error", title: "Conflict", description: message })
      } else {
        showToast({ type: "error", title: "Update Failed", description: message })
      }
    },
  })

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name as keyof EditCollegeForm]) return prev
      return { ...prev, [name]: undefined }
    })
  }, [])

  const handleUpdate = useCallback(async () => {
    const collegeId = college?.college_id
    if (!collegeId) return

    const result = collegeSchemaUpdate.safeParse(formData)

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof EditCollegeForm
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      setErrors(fieldErrors)
      showToast({
        type: "warning",
        title: "Validation Failed",
        description: result.error.issues[0].message,
      })
      return
    }

    // Only send changed fields — trimmed
    const changedFields: Partial<EditCollegeForm> = {}
    if (originalData.current) {
      for (const key of Object.keys(formData) as (keyof EditCollegeForm)[]) {
        const trimmed = formData[key].trim()
        if (trimmed !== (originalData.current[key] || "").trim()) {
          changedFields[key] = trimmed
        }
      }
    }

    if (Object.keys(changedFields).length === 0) {
      showToast({ type: "warning", title: "No Changes", description: "Nothing has been changed." })
      return
    }

    setErrors({})
    mutation.mutate({ collegeId, payload: changedFields })
  }, [college, formData, mutation])

  const handleCancel = useCallback(() => {
    const collegeId = college?.college_id
    if (collegeId) {
      navigate(`/sysadmin/colleges/${collegeId}`)
    } else {
      navigate("/sysadmin/colleges")
    }
  }, [college, navigate])

  return {
    loading,
    updating: mutation.isPending,
    error: getEditCollegeError(queryError, mutation.error),
    errors,
    formData,
    handleChange,
    handleUpdate,
    handleCancel,
  }
}
