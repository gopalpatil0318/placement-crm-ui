import { useParams } from "react-router-dom";
import { useUpdateDepartment } from "@/hooks/collegeadmin/departmentManagement/useUpdateDepartment";
import { DEPT_TYPES } from "@/validators/DepartmentSchema";

// ========================
// CONSTANTS
// ========================

const DEPT_TYPE_OPTIONS = [
  { value: "", label: "Select Department Type (optional)" },
  ...DEPT_TYPES.map((t) => ({
    value: t,
    label: t.charAt(0).toUpperCase() + t.slice(1),
  })),
];

// ========================
// COMPONENT
// ========================

const UpdateDepartmentForm = () => {
  const { deptId } = useParams<{ deptId: string }>();

  const {
    formData,
    errors,
    loading,
    fetching,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useUpdateDepartment(deptId || "");

  // Dynamic semester/year hint
  const semYearHint =
    formData.programDurationYears && formData.totalSemesters
      ? `${formData.totalSemesters} semesters = ${formData.programDurationYears} years × ${Math.round(formData.totalSemesters / formData.programDurationYears)} semesters/year`
      : null;

  // ==============================
  // SKELETON LOADING STATE
  // ==============================
  if (fetching) {
    return (
      <div className="p-8 bg-white rounded-xl border animate-pulse space-y-6">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl border">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Edit Department Details
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1 — Name & Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              name="deptName"
              value={formData.deptName}
              onChange={handleChange}
              placeholder="e.g. Computer Engineering"
              maxLength={150}
              className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deptName ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            />
            {errors.deptName && (
              <p className="text-xs text-red-500 mt-1">{errors.deptName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Code
              <span className="text-gray-400 text-xs ml-1">(optional)</span>
            </label>
            <input
              name="deptCode"
              value={formData.deptCode}
              onChange={handleChange}
              placeholder="e.g. CE"
              maxLength={20}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            <p className="text-xs text-gray-400 mt-1">
              Short code like CE, IT, MECH — auto-uppercased
            </p>
          </div>
        </div>

        {/* Row 2 — Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Type
              <span className="text-gray-400 text-xs ml-1">(optional)</span>
            </label>
            <select
              name="deptType"
              value={formData.deptType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {DEPT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value || "placeholder"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3 — Duration & Semesters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Duration (Years)
            </label>
            <input
              type="number"
              name="programDurationYears"
              value={formData.programDurationYears}
              onChange={handleChange}
              min={1}
              max={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.programDurationYears && (
              <p className="text-xs text-red-500 mt-1">
                {errors.programDurationYears}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Semesters
            </label>
            <input
              type="number"
              name="totalSemesters"
              value={formData.totalSemesters}
              onChange={handleChange}
              min={1}
              max={12}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.totalSemesters && (
              <p className="text-xs text-red-500 mt-1">
                {errors.totalSemesters}
              </p>
            )}
          </div>
        </div>

        {/* Semester/Year hint */}
        {semYearHint && (
          <p className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-medium">
            💡 {semYearHint}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition disabled:opacity-60"
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

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateDepartmentForm;
