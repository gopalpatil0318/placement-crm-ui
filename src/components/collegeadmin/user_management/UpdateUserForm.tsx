import { useParams, useNavigate } from "react-router-dom";
import { useUpdateUser } from "@/hooks/collegeadmin/user_management/useUpdateUser";

const ROLE_OPTIONS = [
  { value: "tpo", label: "TPO (Training & Placement Officer)" },
  { value: "tpc", label: "TPC (Training & Placement Coordinator)" },
  { value: "hod", label: "HOD (Head of Department)" },
  { value: "teacher", label: "Teacher" },
];

const UpdateUserForm = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const {
    formData, errors, loading, fetching, departments,
    isCollegeAdmin, handleChange, handleSubmit, handleCancel,
  } = useUpdateUser(userId || "");

  // Skeleton loading
  if (fetching) {
    return (
      <div className="p-8 bg-white rounded-xl border space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 rounded-full w-32" />
          <div className="h-10 bg-gray-100 rounded-full w-24" />
        </div>
      </div>
    );
  }

  // Read-only for college admin accounts
  if (isCollegeAdmin) {
    return (
      <div className="p-8 bg-white rounded-xl border">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ College admin accounts cannot be modified. Only the system administrator can change college admin details.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-base text-gray-900">{formData.userName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-base text-gray-900">{formData.userEmail}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              College Admin
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/college/view-users")}
          className="mt-6 px-8 py-2.5 rounded-full font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl border">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Edit User Details
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Name
            </label>
            <input
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="User Name"
              maxLength={100}
              className={`w-full rounded-lg border ${errors.userName ? "border-red-500" : "border-gray-300"} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.userName && (
              <p className="text-xs text-red-500 mt-1">{errors.userName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="user@college.edu"
              maxLength={255}
              className={`w-full rounded-lg border ${errors.userEmail ? "border-red-500" : "border-gray-300"} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.userEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.userEmail}</p>
            )}
          </div>
        </div>

        {/* Row 2: Role & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Role
            </label>
            <select
              name="userRole"
              value={formData.userRole}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.userRole ? "border-red-500" : "border-gray-300"} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
            >
              <option value="">Select Role</option>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.userRole && (
              <p className="text-xs text-red-500 mt-1">{errors.userRole}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
              {(formData.userRole === "hod" || formData.userRole === "teacher") && (
                <span className="text-blue-500 text-xs ml-2">(Recommended)</span>
              )}
            </label>
            <select
              name="deptId"
              value={formData.deptId || ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">No Department</option>
              {departments.map((dept) => (
                <option key={dept.dept_id} value={dept.dept_id}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit & Cancel */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-8 py-2.5 rounded-full font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium transition disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUserForm;
