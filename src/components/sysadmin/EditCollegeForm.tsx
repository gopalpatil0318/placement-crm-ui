import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEditCollege } from "@/hooks/sysadmin/useEditCollege";

const EditCollegePage = () => {
  const {
    loading,
    updating,
    error,
    formData,
    handleChange,
    handleStatusToggle,
    handleUpdate
  } = useEditCollege();

  return (
    <div className="bg-slate-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Edit College
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {/* Card Header */}
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-800">
              College Details
            </h2>
          </div>

          {/* Card Body */}
          <div className="px-6 py-6">
            {error && (
              <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* College ID */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College ID
                </Label>
                <Input
                  value={formData.college_id}
                  readOnly
                  disabled
                  className="h-11 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-700"
                />
              </div>

              {/* College Name */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College Name
                </Label>
                <Input
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter college name"
                  className="h-11 rounded-md border border-slate-300 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Subdomain */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  Subdomain
                </Label>
                <Input
                  name="college_subdomain"
                  value={formData.college_subdomain}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="college.example.com"
                  className="h-11 rounded-md border border-slate-300 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* College Status */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-slate-700">
                  College Status
                </Label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStatusToggle}
                    className={`relative inline-flex h-4.5 w-7.5 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.college_status === "active"
                        ? "bg-blue-500"
                        : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${formData.college_status === "active"
                          ? "translate-x-4"
                          : "translate-x-0.75"
                        }`}
                    />
                  </button>

                  <p className="text-sm text-slate-600">
                    Status:
                    <span className="ml-1 font-medium capitalize">
                      {formData.college_status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Button Row */}
            <div className="mt-8 flex justify-end">
              <Button
                type="button"
                onClick={handleUpdate}
                disabled={updating || loading}
                className="h-11 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {updating ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCollegePage;