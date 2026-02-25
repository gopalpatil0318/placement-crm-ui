import { useParams } from "react-router-dom";
import { useUpdateDepartment } from "@/hooks/collegeadmin/departmentManagement/useUpdateDepartment";

const DEPT_TYPE_OPTIONS = [
    { value: "", label: "Select Department Type" },
    { value: "engineering", label: "Engineering" },
    { value: "science", label: "Science" },
    { value: "arts", label: "Arts" },
    { value: "commerce", label: "Commerce" },
    { value: "management", label: "Management" },
    { value: "other", label: "Other" },
];

const UpdateDepartmentForm = () => {
    const { deptId } = useParams<{ deptId: string }>();

    const {
        formData,
        errors,
        loading,
        fetching,
        handleChange,
        handleSubmit,
    } = useUpdateDepartment(deptId || "");

    // ==============================
    // PRELOAD STATE
    // ==============================
    if (fetching) {
        return (
            <div className="p-8 bg-white rounded-xl border flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    Loading department data...
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
                {/* Row 1 - Name & Code */}
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
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.deptName && (
                            <p className="text-xs text-red-500 mt-1">{errors.deptName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department Code <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            name="deptCode"
                            value={formData.deptCode}
                            onChange={handleChange}
                            placeholder="e.g. CE"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.deptCode && (
                            <p className="text-xs text-red-500 mt-1">{errors.deptCode}</p>
                        )}
                    </div>
                </div>

                {/* Row 2 - Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department Type <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <select
                            name="deptType"
                            value={formData.deptType}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {DEPT_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.deptType && (
                            <p className="text-xs text-red-500 mt-1">{errors.deptType}</p>
                        )}
                    </div>
                </div>

                {/* Row 3 - Duration & Semesters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Program Duration (Years) <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            type="number"
                            name="programDurationYears"
                            value={formData.programDurationYears}
                            onChange={handleChange}
                            min={1}
                            max={6}
                            placeholder="e.g. 4"
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
                            Total Semesters <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            type="number"
                            name="totalSemesters"
                            value={formData.totalSemesters}
                            onChange={handleChange}
                            min={1}
                            max={12}
                            placeholder="e.g. 8"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.totalSemesters && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.totalSemesters}
                            </p>
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

export default UpdateDepartmentForm;
