import { useCreateCollege } from "@/hooks/sysadmin/useCreateCollege";
import { Eye, EyeOff } from "lucide-react";

const CreateCollegeForm = () => {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    showPassword,
    togglePassword,
  } = useCreateCollege();

  const currentYear = new Date().getFullYear();

const passingYears = Array.from(
  { length: 15 },
  (_, i) => currentYear - 5 + i
);


  return (
    <div className="p-8 bg-white rounded-xl border">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Create College Form
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* College Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Name <span className="text-red-500">*</span>
            </label>
            <input
              name="collegeName"
              value={formData.collegeName}
              onChange={handleChange}
              placeholder="College Name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subdomain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subdomain <span className="text-red-500">*</span>
            </label>
            <input
              name="collegeSubdomain"
              value={formData.collegeSubdomain}
              onChange={handleChange}
              placeholder="yourcollege"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* College Type */}
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
              <option value="medical">Medical</option>
              <option value="arts">Arts</option>
              <option value="commerce">Commerce</option>
            </select>
          </div>

          {/* Academic Year */}
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
    {passingYears.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
</div>

        </div>

        {/* Row 3 - Address Full Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            College Address <span className="text-red-500">*</span>
          </label>
          <input
            name="collegeAddress"
            value={formData.collegeAddress}
            onChange={handleChange}
            placeholder="Full Address"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              name="collegeCity"
              value={formData.collegeCity}
              onChange={handleChange}
              placeholder="City"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Taluka */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taluka <span className="text-red-500">*</span>
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

        {/* Row 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District <span className="text-red-500">*</span>
            </label>
            <input
              name="collegeDistrict"
              value={formData.collegeDistrict}
              onChange={handleChange}
              placeholder="District"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
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

        {/* Row 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              name="collegePincode"
              value={formData.collegePincode}
              onChange={handleChange}
              placeholder="411041"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 7 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Admin Password */}
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
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium transition"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Creating...
            </div>
          ) : (
            "Create College"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCollegeForm;