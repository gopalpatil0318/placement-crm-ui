import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEditCollege } from "@/hooks/sysadmin/useEditCollege";
import { useNavigate } from "react-router-dom";

const EditCollegeForm = () => {
  const {
    loading,
    updating,
    error,
    errors,
    formData,
    handleChange,
    handleUpdate,
    hasChanges,
    collegeId,
  } = useEditCollege();
  const navigate = useNavigate();

  return (
    <div className="p-8 bg-white rounded-xl border">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">
            Edit College
          </h1>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* College Name */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-slate-700">
                College Name <span className="text-red-500">*</span>
              </Label>
              <Input
                name="college_name"
                value={formData.college_name}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter college name"
                maxLength={200}
                className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.college_name ? "border-red-500" : "border-slate-300"
                  }`}
              />
              {errors.college_name && (
                <p className="text-xs text-red-500 mt-1">{errors.college_name}</p>
              )}
            </div>

            {/* College Subdomain */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-slate-700">
                College Subdomain <span className="text-red-500">*</span>
              </Label>
              <Input
                name="college_subdomain"
                value={formData.college_subdomain}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter subdomain"
                maxLength={50}
                className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.college_subdomain ? "border-red-500" : "border-slate-300"
                  }`}
              />
              {errors.college_subdomain && (
                <p className="text-xs text-red-500 mt-1">{errors.college_subdomain}</p>
              )}
              {formData.college_subdomain && (
                <p className="text-xs text-blue-600 mt-1">
                  {formData.college_subdomain}.placementcrm.com
                </p>
              )}
            </div>

            {/* College Type */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-slate-700">
                College Type <span className="text-red-500">*</span>
              </Label>
              <select
                name="college_type"
                value={formData.college_type}
                onChange={handleChange}
                disabled={loading}
                className={`h-11 w-full rounded-md border bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.college_type ? "border-red-500" : "border-slate-300"
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
              <textarea
                name="college_address"
                value={formData.college_address}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter full address"
                maxLength={500}
                rows={2}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none ${errors.college_address ? "border-red-500" : "border-slate-300"
                  }`}
              />
            </div>

            {/* City */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-slate-700">City</Label>
              <Input
                name="college_city"
                value={formData.college_city}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter city"
                maxLength={100}
                className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.college_city ? "border-red-500" : "border-slate-300"
                  }`}
              />
            </div>

            {/* Taluka */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-slate-700">Taluka</Label>
              <Input
                name="college_taluka"
                value={formData.college_taluka}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter taluka"
                maxLength={100}
                className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.college_taluka ? "border-red-500" : "border-slate-300"
                  }`}
              />
            </div>

            {/* District */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-slate-700">District</Label>
              <Input
                name="college_district"
                value={formData.college_district}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter district"
                maxLength={100}
                className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.college_district ? "border-red-500" : "border-slate-300"
                  }`}
              />
            </div>

            {/* State */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-slate-700">State</Label>
              <Input
                name="college_state"
                value={formData.college_state}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter state"
                maxLength={100}
                className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.college_state ? "border-red-500" : "border-slate-300"
                  }`}
              />
            </div>

            {/* Pincode */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-slate-700">Pincode</Label>
              <Input
                name="college_pincode"
                value={formData.college_pincode}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter pincode"
                maxLength={6}
                inputMode="numeric"
                className={`h-11 rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.college_pincode ? "border-red-500" : "border-slate-300"
                  }`}
              />
              {errors.college_pincode && (
                <p className="text-xs text-red-500 mt-1">{errors.college_pincode}</p>
              )}
            </div>
          </div>

          {/* Button Row */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(collegeId ? `/sysadmin/colleges/${collegeId}` : "/sysadmin/colleges")}
              className="h-11 rounded-full px-6 py-3 text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={updating || loading || !hasChanges()}
              className="h-11 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCollegeForm;
