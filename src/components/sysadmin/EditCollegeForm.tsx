import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEditCollege } from "@/hooks/sysadmin/useEditCollege";

const EditCollegePage = () => {
  const {
    loading,
    updating,
    error,
    errors,
    formData,
    handleChange,
    handleUpdate,
  } = useEditCollege();

  return (
    <div className="p-8 bg-white rounded-xl border">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">
            Edit College
          </h1>
        </div>

        {/* Card */}
        <div className="  ">
          {/* Card Body */}
          <div className="space-y-6">
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
                  className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.college_name ? "border-red-500" : "border-slate-300"
                  }`}
                />
              </div>

              {/* College Subdomain */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College Subdomain
                </Label>
                <Input
                  name="college_subdomain"
                  value={formData.college_subdomain}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter subdomain"
                  className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.college_subdomain
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                />
              </div>

              {/* College Type */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College Type
                </Label>
                <select
                  name="college_type"
                  value={formData.college_type}
                  onChange={handleChange}
                  disabled={loading}
                  className={`h-11 w-full rounded-md border bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.college_type ? "border-red-500" : "border-slate-300"
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="engineering">Engineering</option>
                  <option value="diploma">Diploma</option>
                  <option value="mba">MBA</option>
                  <option value="polytechnic">Polytechnic</option>
                  <option value="degree">Degree</option>
                  <option value="medical">Medical</option>
                </select>
              </div>

              {/* College Address */}
              <div className="md:col-span-2">
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College Address
                </Label>
                <Input
                  name="college_address"
                  value={formData.college_address}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter full address"
                  className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.college_address
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                />
              </div>

              {/* College City */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College City
                </Label>
                <Input
                  name="college_city"
                  value={formData.college_city}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter city"
                  className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.college_city ? "border-red-500" : "border-slate-300"
                  }`}
                />
              </div>

              {/* College Taluka */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College Taluka
                </Label>
                <Input
                  name="college_taluka"
                  value={formData.college_taluka}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter taluka"
                  className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.college_taluka
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                />
              </div>

              {/* College District */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College District
                </Label>
                <Input
                  name="college_district"
                  value={formData.college_district}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter district"
                  className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.college_district
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                />
              </div>

              {/* College State */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College State
                </Label>
                <Input
                  name="college_state"
                  value={formData.college_state}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter state"
                  className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.college_state ? "border-red-500" : "border-slate-300"
                  }`}
                />
              </div>

              {/* College Pincode */}
              <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                  College Pincode
                </Label>
                <Input
                  name="college_pincode"
                  value={formData.college_pincode}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter pincode"
                  className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.college_pincode
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                />
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
