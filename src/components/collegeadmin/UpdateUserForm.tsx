import { useParams } from "react-router-dom";
import { useUpdateUser } from "@/hooks/collegeadmin/useUpdateUser";

const UpdateUserForm = () => {
  const { userId } = useParams<{ userId: string }>();

  const {
    formData,
    errors,
    loading,
    fetching,
    handleChange,
    handleSubmit,
  } = useUpdateUser(userId || "");

  // ==============================
  // PRELOAD STATE
  // ==============================
  if (fetching) {
    return (
      <div className="p-8 bg-white rounded-xl border flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          Loading user data...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl border">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Edit User Details
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Name <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="User Name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.userName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.userName}
              </p>
            )}
          </div>

          {/* User Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="admin@email.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.userEmail && (
              <p className="text-xs text-red-500 mt-1">
                {errors.userEmail}
              </p>
            )}
          </div>
        </div>

        {/* Optional Password Field */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="userPassword"
            value={formData.userPassword}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}

        {/* Submit */}
        <div className="flex justify-end">
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