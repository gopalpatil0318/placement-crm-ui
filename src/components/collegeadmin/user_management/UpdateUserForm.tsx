import { useParams } from "react-router-dom";
import { useUpdateUser } from "@/hooks/collegeadmin/user_management/useUpdateUser";

const UpdateUserForm = () => {
  const { userId } = useParams<{ userId: string }>();

  const { formData, errors, loading, fetching, handleChange, handleSubmit } =
    useUpdateUser(userId || "");

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
              <p className="text-xs text-red-500 mt-1">{errors.userName}</p>
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
              <p className="text-xs text-red-500 mt-1">{errors.userEmail}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Role <span className="text-red-500 ml-0.5">*</span>
            </label>
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
        User Role <span className="text-red-500 ml-0.5">*</span>
    </label> */}

              <select
                name="userRole"
                value={formData.userRole}
                onChange={(e) => handleChange(e as any)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Role</option>
                <option value="tpo">TPO</option>
                <option value="tpc">TPC</option>
              </select>

              {errors.userRole && (
                <p className="text-xs text-red-500 mt-1">{errors.userRole}</p>
              )}
            </div>
            {errors.userRole && (
              <p className="text-xs text-red-500 mt-1">{errors.userRole}</p>
            )}
          </div>

          {/* User Email */}
          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Status <span className="text-red-500 ml-0.5">*</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  handleChange({
                    target: {
                      name: "userStatus",
                      value:
                        formData.userStatus === "Active"
                          ? "Inactive"
                          : "Active",
                    },
                  } as any)
                }
                className={`relative inline-flex h-7 w-14 items-center rounded-full 
        transition-colors duration-300
        ${formData.userStatus === "Active" ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white 
            transition-transform duration-300
            ${
              formData.userStatus === "Active"
                ? "translate-x-7"
                : "translate-x-1"
            }`}
                />
              </button>

              <span className="ml-3 text-sm font-medium text-gray-700">
                {formData.userStatus === "Active" ? "Active" : "Inactive"}
              </span>

              {errors.userStatus && (
                <p className="text-xs text-red-500 mt-1">{errors.userStatus}</p>
              )}
            </div>
            {errors.userStatus && (
              <p className="text-xs text-red-500 mt-1">{errors.userStatus}</p>
            )}
          </div>
        </div>

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
