import { useCreateCollege } from "@/hooks/sysadmin/useCreateCollege";
import { Eye, EyeOff } from "lucide-react";
import { useMemo } from "react";

const ACADEMIC_YEARS = Array.from({ length: 21 }, (_, i) => 2020 + i);

const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
  if (!password) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "33%" };
  if (score <= 4) return { label: "Medium", color: "bg-yellow-500", width: "66%" };
  return { label: "Strong", color: "bg-emerald-500", width: "100%" };
};

const CreateCollegeForm = () => {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
    showPassword,
    togglePassword,
  } = useCreateCollege();

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.adminPassword),
    [formData.adminPassword]
  );

  return (
    <div className="p-8 bg-white rounded-xl border">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: College Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            College Information
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Basic details about the college
          </p>

          <div className="space-y-6">
            {/* Row 1: Name + Subdomain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder="College Name"
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.collegeName ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.collegeName && (
                  <p className="text-xs text-red-500 mt-1">{errors.collegeName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subdomain <span className="text-red-500">*</span>
                </label>
                <input
                  name="collegeSubdomain"
                  value={formData.collegeSubdomain}
                  onChange={handleChange}
                  placeholder="yourcollege"
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.collegeSubdomain ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {formData.collegeSubdomain && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    {formData.collegeSubdomain}.placementcrm.com
                  </p>
                )}
                {errors.collegeSubdomain && (
                  <p className="text-xs text-red-500 mt-1">{errors.collegeSubdomain}</p>
                )}
              </div>
            </div>

            {/* Row 2: Type + Academic Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="collegeType"
                  value={formData.collegeType}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.collegeType ? "border-red-500" : "border-gray-300"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="defaultAcademicYear"
                  value={formData.defaultAcademicYear}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  {ACADEMIC_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Address (full width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College Address
              </label>
              <textarea
                name="collegeAddress"
                value={formData.collegeAddress}
                onChange={handleChange}
                placeholder="Full Address"
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Row 4: City + Taluka */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  name="collegeCity"
                  value={formData.collegeCity}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taluka
                </label>
                <input
                  name="collegeTaluka"
                  value={formData.collegeTaluka}
                  onChange={handleChange}
                  placeholder="Taluka"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Row 5: District + State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  name="collegeDistrict"
                  value={formData.collegeDistrict}
                  onChange={handleChange}
                  placeholder="District"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  name="collegeState"
                  value={formData.collegeState}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  name="collegePincode"
                  value={formData.collegePincode}
                  onChange={handleChange}
                  placeholder="411041"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Section 2: Admin Account */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            First Admin Account
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            This account will be used by the college administrator to log in
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  placeholder="Admin Full Name"
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.adminName ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.adminName && (
                  <p className="text-xs text-red-500 mt-1">{errors.adminName}</p>
                )}
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@email.com"
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.adminEmail ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.adminEmail && (
                  <p className="text-xs text-red-500 mt-1">{errors.adminEmail}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full rounded-lg border px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.adminPassword ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.adminPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.adminPassword}</p>
              )}

              {/* Password Strength Indicator */}
              {formData.adminPassword && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${passwordStrength.label === "Weak" ? "text-red-500" :
                      passwordStrength.label === "Medium" ? "text-yellow-600" :
                        "text-emerald-600"
                    }`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-1">
                Must contain at least 1 uppercase, 1 lowercase, and 1 number
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium transition disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </div>
            ) : (
              "Create College"
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-full font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCollegeForm;