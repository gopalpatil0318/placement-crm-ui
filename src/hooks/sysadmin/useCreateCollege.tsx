import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { collegeSchema } from "@/validators/collegeSchema"
import { SysAdminService } from "@/services/sysadmin/sysadmin.services"
import { queryKeys } from "@/lib/queryKeys"

interface CreateCollegeForm {
  collegeName: string
  collegeSubdomain: string
  collegeType: string
  collegeAddress: string
  collegeCity: string
  collegeTaluka: string
  collegeDistrict: string
  collegeState: string
  collegePincode: string
  defaultAcademicYear: string
  adminName: string
  adminEmail: string
  adminPassword: string
}

type FormErrors = Partial<CreateCollegeForm>

const INITIAL_FORM: CreateCollegeForm = {
  collegeName: "",
  collegeSubdomain: "",
  collegeType: "",
  collegeAddress: "",
  collegeCity: "",
  collegeTaluka: "",
  collegeDistrict: "",
  collegeState: "",
  collegePincode: "",
  defaultAcademicYear: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
}

export const useCreateCollege = () => {
  const [formData, setFormData] = useState<CreateCollegeForm>({ ...INITIAL_FORM })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: CreateCollegeForm & { defaultAcademicYear: number }) =>
      SysAdminService.createCollege(payload),
    onSuccess: (response) => {
      if (response?.success === false) {
        showToast({
          type: "error",
          title: "Error Creating College",
          description: response.error || response.message || "Something went wrong",
        })
        return
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.colleges.all() })
      showToast({
        type: "success",
        title: "Success",
        description: response?.message || "College created successfully",
      })
      setFormData({ ...INITIAL_FORM })
      navigate("/sysadmin/colleges")
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong"
      const status = error instanceof ApiError ? error.status : undefined

      if (status === 429) {
        showToast({ type: "error", title: "Rate Limited", description: "Too many requests. Please try again in a few minutes." })
      } else if (status === 409) {
        if (message.toLowerCase().includes("subdomain")) {
          setErrors((prev) => ({ ...prev, collegeSubdomain: message }))
        } else if (message.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, adminEmail: message }))
        }
        showToast({ type: "error", title: "Conflict", description: message })
      } else {
        showToast({ type: "error", title: "Error Creating College", description: message })
      }
    },
  })

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (name === "collegeSubdomain") {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "")
      setFormData((prev) => ({ ...prev, [name]: sanitized }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    setErrors((prev) => {
      if (!prev[name as keyof CreateCollegeForm]) return prev
      return { ...prev, [name]: undefined }
    })
  }, [])

  const handleSubmit = useCallback(async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()

    const result = collegeSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof CreateCollegeForm
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

    setErrors({})
    mutation.mutate({
      collegeName:        formData.collegeName.trim(),
      collegeSubdomain:   formData.collegeSubdomain.trim(),
      collegeType:        formData.collegeType,
      collegeAddress:     formData.collegeAddress.trim(),
      collegeCity:        formData.collegeCity.trim(),
      collegeTaluka:      formData.collegeTaluka.trim(),
      collegeDistrict:    formData.collegeDistrict.trim(),
      collegeState:       formData.collegeState.trim(),
      collegePincode:     formData.collegePincode.trim(),
      defaultAcademicYear: Number(formData.defaultAcademicYear),
      adminName:          formData.adminName.trim(),
      adminEmail:         formData.adminEmail.trim(),
      adminPassword:      formData.adminPassword,
    } as CreateCollegeForm & { defaultAcademicYear: number })
  }, [formData, mutation])

  const handleCancel = useCallback(() => {
    navigate("/sysadmin/colleges")
  }, [navigate])

  return {
    formData,
    errors,
    loading: mutation.isPending,
    setErrors,
    handleChange,
    handleSubmit,
    handleCancel,
    showPassword,
    togglePassword: () => setShowPassword((prev) => !prev),
  }
}
