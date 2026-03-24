import { useNavigate } from "react-router-dom"
import { useEditCollege } from "@/hooks/sysadmin/useEditCollege"
import CollegeForm from "./CollegeForm"
import { AlertCircle } from "lucide-react"

interface EditCollegeFormProps {
  onItemLoaded?: (name: string) => void
}

export default function EditCollegeForm({ onItemLoaded }: EditCollegeFormProps) {
  const navigate = useNavigate()
  const {
    loading,
    updating,
    error,
    errors,
    formData,
    handleChange,
    handleUpdate,
    handleCancel,
  } = useEditCollege(onItemLoaded)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 animate-pulse">
        <div className="space-y-8">
          <div>
            <div className="flex items-start gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800" />
          <div>
            <div className="flex items-start gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Failed to load college</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/sysadmin/colleges")}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Colleges
        </button>
      </div>
    )
  }

  return (
    <CollegeForm
      mode="edit"
      formData={formData}
      errors={errors}
      loading={updating}
      handleChange={handleChange}
      handleUpdate={handleUpdate}
      handleCancel={handleCancel}
    />
  )
}
