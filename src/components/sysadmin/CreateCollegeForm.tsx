import { useCreateCollege } from "@/hooks/sysadmin/useCreateCollege"
import CollegeForm from "./CollegeForm"

export default function CreateCollegeForm() {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
    showPassword,
    togglePassword,
  } = useCreateCollege()

  return (
    <CollegeForm
      mode="create"
      formData={formData}
      errors={errors}
      loading={loading}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      showPassword={showPassword}
      togglePassword={togglePassword}
    />
  )
}