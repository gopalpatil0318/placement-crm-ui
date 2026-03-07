import { useState } from "react";
import { useCreateUser } from "@/hooks/collegeadmin/user_management/useCreateUser";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ROLE_OPTIONS = [
  { value: "tpo", label: "TPO (Training & Placement Officer)" },
  { value: "tpc", label: "TPC (Training & Placement Coordinator)" },
  { value: "hod", label: "HOD (Head of Department)" },
  { value: "teacher", label: "Teacher" },
];

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
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
  return { label: "Strong", color: "bg-green-500", width: "100%" };
}

const CreateUserForm = () => {
  const { formData, errors, loading, departments, fetchingDepts, handleChange, handleSubmit } =
    useCreateUser();

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const strength = getPasswordStrength(formData.userPassword);

  return (
    <div className="p-8 bg-white rounded-xl border">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Create User Form
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Name <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="e.g. Prof. Suresh Kumar"
              maxLength={100}
              className={`w-full rounded-lg border ${errors.userName ? "border-red-500" : "border-gray-300"} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.userName && (
              <p className="text-xs text-red-500 mt-1">{errors.userName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Role <span className="text-red-500 ml-0.5">*</span>
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
        </div>

        {/* Row 2: Email & Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email <span className="text-red-500 ml-0.5">*</span>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="userPassword"
                value={formData.userPassword}
                onChange={handleChange}
                placeholder="Min 8 characters"
                maxLength={128}
                className={`w-full rounded-lg border ${errors.userPassword ? "border-red-500" : "border-gray-300"} px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.userPassword && (
              <div className="mt-1.5">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className={`h-1 rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className={`text-xs mt-0.5 ${strength.color.replace("bg-", "text-")}`}>{strength.label}</p>
              </div>
            )}
            {errors.userPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.userPassword}</p>
            )}
          </div>
        </div>

        {/* Row 3: Department (optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
              {(formData.userRole === "hod" || formData.userRole === "teacher") && (
                <span className="text-blue-500 text-xs ml-2">(Recommended for {formData.userRole.toUpperCase()})</span>
              )}
            </label>
            <select
              name="deptId"
              value={formData.deptId || ""}
              onChange={handleChange}
              disabled={fetchingDepts}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="">No Department</option>
              {departments.map((dept) => (
                <option key={dept.dept_id} value={dept.dept_id}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
            {errors.deptId && (
              <p className="text-xs text-red-500 mt-1">{errors.deptId}</p>
            )}
          </div>
        </div>

        {/* Submit & Cancel */}
        <div className="flex gap-3">
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
              "Create User"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/college/view-users")}
            className="px-8 py-2.5 rounded-full font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;
