import { useCreateCollege } from "@/hooks/sysadmin/useCreateCollege";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateCollegeForm = () => {
  const {
    formData,
    loading,
    handleChange,
    handleSubmit,
    showPassword,
    togglePassword,
    passwordStrength,
  } = useCreateCollege();

  const navigate = useNavigate();


  const academicYears = Array.from({ length: 21 }, (_, i) => 2020 + i); // 2020–2040

  const getStrengthColor = () => {
    if (passwordStrength === "strong") return "bg-green-500";
    if (passwordStrength === "medium") return "bg-yellow-500";
    if (passwordStrength === "weak") return "bg-red-500";
    return "bg-gray-200";
  };

  const getStrengthWidth = () => {
    if (passwordStrength === "strong") return "w-full";
    if (passwordStrength === "medium") return "w-2/3";
    if (passwordStrength === "weak") return "w-1/3";
    return "w-0";
  };

  return (
    <div className="p-8 bg-white rounded-xl border">
      {/* Section 1: College Information */}
      <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b">
        College Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: College Name + Subdomain */}
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
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              maxLength={50}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.collegeSubdomain && (
              <p className="text-xs text-blue-600 mt-1">
                {formData.collegeSubdomain.toLowerCase()}.placementcrm.com
              </p>
            )}
          </div>
        </div>

        {/* Row 2: College Type + Academic Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Type <span className="text-red-500">*</span>
            </label>
            <select
              name="collegeType"
              value={formData.collegeType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Address (full width, textarea) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            College Address
          </label>
          <textarea
            name="collegeAddress"
            value={formData.collegeAddress}
            onChange={handleChange}
            placeholder="Full Address"
            maxLength={500}
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
              maxLength={100}
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
              maxLength={100}
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
              maxLength={100}
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
              maxLength={100}
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
              placeholder="400088"
              maxLength={6}
              inputMode="numeric"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Section 2: First Admin Account */}
        <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-2 pb-2 border-b">
          First Admin Account
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          This account will be used by the college administrator to log in.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Name <span className="text-red-500">*</span>
          </label>
          <input
            name="adminName"
            value={formData.adminName}
            onChange={handleChange}
            placeholder="Admin Full Name"
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              maxLength={255}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
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
                maxLength={128}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {formData.adminPassword && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
                  />
                </div>
                <p
                  className={`text-xs mt-1 capitalize font-medium ${passwordStrength === "strong"
                    ? "text-green-600"
                    : passwordStrength === "medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                    }`}
                >
                  {passwordStrength}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate("/sysadmin/colleges")}
            className="px-6 py-2.5 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium transition"
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
        </div>
      </form>
    </div>
  );
};

export default CreateCollegeForm;