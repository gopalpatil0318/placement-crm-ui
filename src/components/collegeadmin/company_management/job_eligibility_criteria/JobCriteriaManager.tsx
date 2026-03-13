import { useEffect } from "react";
import { useSetJobCriteria } from "@/hooks/collegeadmin/company_management/Job_eligibility_criteria/useSetJobCriteria";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { useState, useCallback } from "react";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

interface Department {
    dept_id: string;
    dept_name: string;
}

interface JobCriteriaManagerProps {
    jobId: string;
    existingCriteria: Record<string, unknown> | null;
    onSuccess: () => void;
}

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const GAP_OPTIONS = [
    { value: "no_gap", label: "No Gap" },
    { value: "gap", label: "Gap" },
];

// ========================
// MAIN COMPONENT
// ========================

const JobCriteriaManager = ({ jobId, existingCriteria, onSuccess }: JobCriteriaManagerProps) => {
    const {
        formData,
        toggles,
        errors,
        loading,
        isUpdate,
        handleChange,
        handleToggle,
        handleMultiSelect,
        handleSubmit,
        loadExisting,
    } = useSetJobCriteria(jobId, onSuccess);

    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDepts, setLoadingDepts] = useState(false);

    // Load departments for the multi-select
    const fetchDepartments = useCallback(async () => {
        setLoadingDepts(true);
        try {
            const response = await CollegeAdminService.getDepartments({ limit: 100, is_active: true });
            const depts = Array.isArray(response.data) ? response.data : [];
            setDepartments(depts);
        } catch {
            showToast({ type: "error", title: "Error", description: "Failed to load departments" });
        } finally {
            setLoadingDepts(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // Load existing criteria if available
    useEffect(() => {
        if (existingCriteria) {
            loadExisting(existingCriteria);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingCriteria]);

    return (
        <div className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        {isUpdate ? "Update Eligibility Criteria" : "Set Eligibility Criteria"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Toggle criteria on/off. Only enabled criteria will be applied as filters.
                    </p>
                </div>
            </div>

            {/* Criteria Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Min Overall CGPA */}
                <CriteriaField
                    label="Minimum Overall CGPA"
                    description="Students with CGPA ≥ this value"
                    enabled={toggles.min_overall_cgpa}
                    onToggle={() => handleToggle("min_overall_cgpa")}
                    error={errors.min_overall_cgpa}
                >
                    <input
                        type="number"
                        name="min_overall_cgpa"
                        value={formData.min_overall_cgpa}
                        onChange={handleChange}
                        min={0}
                        max={10}
                        step={0.1}
                        disabled={!toggles.min_overall_cgpa}
                        placeholder="e.g. 7.0"
                        className={inputClass(toggles.min_overall_cgpa, errors.min_overall_cgpa)}
                    />
                </CriteriaField>

                {/* Max Live KTs */}
                <CriteriaField
                    label="Maximum Live KTs"
                    description="Students with active backlogs ≤ this value"
                    enabled={toggles.max_live_kts}
                    onToggle={() => handleToggle("max_live_kts")}
                    error={errors.max_live_kts}
                >
                    <input
                        type="number"
                        name="max_live_kts"
                        value={formData.max_live_kts}
                        onChange={handleChange}
                        min={0}
                        max={20}
                        disabled={!toggles.max_live_kts}
                        placeholder="e.g. 0"
                        className={inputClass(toggles.max_live_kts, errors.max_live_kts)}
                    />
                </CriteriaField>

                {/* Min 10th Percentage */}
                <CriteriaField
                    label="Minimum 10th Percentage"
                    description="Students with 10th % ≥ this value"
                    enabled={toggles.min_tenth_percentage}
                    onToggle={() => handleToggle("min_tenth_percentage")}
                    error={errors.min_tenth_percentage}
                >
                    <input
                        type="number"
                        name="min_tenth_percentage"
                        value={formData.min_tenth_percentage}
                        onChange={handleChange}
                        min={0}
                        max={100}
                        disabled={!toggles.min_tenth_percentage}
                        placeholder="e.g. 60"
                        className={inputClass(toggles.min_tenth_percentage, errors.min_tenth_percentage)}
                    />
                </CriteriaField>

                {/* Min 12th Percentage */}
                <CriteriaField
                    label="Minimum 12th Percentage"
                    description="Applied only to 12th students"
                    enabled={toggles.min_twelfth_percentage}
                    onToggle={() => handleToggle("min_twelfth_percentage")}
                    error={errors.min_twelfth_percentage}
                >
                    <input
                        type="number"
                        name="min_twelfth_percentage"
                        value={formData.min_twelfth_percentage}
                        onChange={handleChange}
                        min={0}
                        max={100}
                        disabled={!toggles.min_twelfth_percentage}
                        placeholder="e.g. 55"
                        className={inputClass(toggles.min_twelfth_percentage, errors.min_twelfth_percentage)}
                    />
                </CriteriaField>

                {/* Min Diploma Percentage */}
                <CriteriaField
                    label="Minimum Diploma Percentage"
                    description="Applied only to diploma students"
                    enabled={toggles.min_diploma_percentage}
                    onToggle={() => handleToggle("min_diploma_percentage")}
                    error={errors.min_diploma_percentage}
                >
                    <input
                        type="number"
                        name="min_diploma_percentage"
                        value={formData.min_diploma_percentage}
                        onChange={handleChange}
                        min={0}
                        max={100}
                        disabled={!toggles.min_diploma_percentage}
                        placeholder="e.g. 60"
                        className={inputClass(toggles.min_diploma_percentage, errors.min_diploma_percentage)}
                    />
                </CriteriaField>

                {/* Exclude Already Placed */}
                <CriteriaField
                    label="Exclude Already Placed"
                    description="Exclude students who already have a 'selected' status"
                    enabled={toggles.exclude_already_placed}
                    onToggle={() => handleToggle("exclude_already_placed")}
                >
                    <label className="flex items-center gap-3 mt-1">
                        <input
                            type="checkbox"
                            name="exclude_already_placed"
                            checked={formData.exclude_already_placed}
                            onChange={handleChange}
                            disabled={!toggles.exclude_already_placed}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-40"
                        />
                        <span className={`text-sm ${toggles.exclude_already_placed ? "text-gray-700" : "text-gray-400"}`}>
                            Yes, exclude placed students
                        </span>
                    </label>
                </CriteriaField>
            </div>

            {/* Multi-Select Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Allowed Genders */}
                <CriteriaField
                    label="Allowed Genders"
                    description="Only these genders will be eligible"
                    enabled={toggles.allowed_genders}
                    onToggle={() => handleToggle("allowed_genders")}
                    error={errors.allowed_genders}
                >
                    <div className="flex flex-wrap gap-2 mt-1">
                        {GENDER_OPTIONS.map((g) => (
                            <label
                                key={g}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition ${
                                    !toggles.allowed_genders
                                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                                        : formData.allowed_genders.includes(g)
                                        ? "bg-blue-50 border-blue-300 text-blue-700"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-blue-200"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.allowed_genders.includes(g)}
                                    onChange={() => handleMultiSelect("allowed_genders", g)}
                                    disabled={!toggles.allowed_genders}
                                    className="sr-only"
                                />
                                {g}
                            </label>
                        ))}
                    </div>
                </CriteriaField>

                {/* Allowed Gap Statuses */}
                <CriteriaField
                    label="Allowed Gap Statuses"
                    description="Filter by education gap status"
                    enabled={toggles.allowed_gap_statuses}
                    onToggle={() => handleToggle("allowed_gap_statuses")}
                    error={errors.allowed_gap_statuses}
                >
                    <div className="flex flex-wrap gap-2 mt-1">
                        {GAP_OPTIONS.map((g) => (
                            <label
                                key={g.value}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition ${
                                    !toggles.allowed_gap_statuses
                                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                                        : formData.allowed_gap_statuses.includes(g.value)
                                        ? "bg-blue-50 border-blue-300 text-blue-700"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-blue-200"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.allowed_gap_statuses.includes(g.value)}
                                    onChange={() => handleMultiSelect("allowed_gap_statuses", g.value)}
                                    disabled={!toggles.allowed_gap_statuses}
                                    className="sr-only"
                                />
                                {g.label}
                            </label>
                        ))}
                    </div>
                </CriteriaField>

                {/* Allowed Departments */}
                <CriteriaField
                    label="Allowed Departments"
                    description="Only selected departments are eligible"
                    enabled={toggles.allowed_departments}
                    onToggle={() => handleToggle("allowed_departments")}
                    error={errors.allowed_departments}
                >
                    {loadingDepts ? (
                        <p className="text-xs text-gray-400 mt-1">Loading departments...</p>
                    ) : (
                        <div className="flex flex-wrap gap-2 mt-1 max-h-40 overflow-y-auto">
                            {departments.map((d) => (
                                <label
                                    key={d.dept_id}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition ${
                                        !toggles.allowed_departments
                                            ? "opacity-40 cursor-not-allowed bg-gray-50"
                                            : formData.allowed_departments.includes(d.dept_name)
                                            ? "bg-blue-50 border-blue-300 text-blue-700"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-blue-200"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.allowed_departments.includes(d.dept_name)}
                                        onChange={() => handleMultiSelect("allowed_departments", d.dept_name)}
                                        disabled={!toggles.allowed_departments}
                                        className="sr-only"
                                    />
                                    {d.dept_name}
                                </label>
                            ))}
                            {departments.length === 0 && (
                                <p className="text-xs text-gray-400">No departments found</p>
                            )}
                        </div>
                    )}
                </CriteriaField>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-40 flex items-center gap-2"
                >
                    {loading && (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {loading
                        ? isUpdate ? "Updating..." : "Setting..."
                        : isUpdate ? "Update Criteria" : "Set Criteria"}
                </button>
            </div>
        </div>
    );
};

// ========================
// CRITERIA FIELD WRAPPER
// ========================

const CriteriaField = ({
    label,
    description,
    enabled,
    onToggle,
    error,
    children,
}: {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className={`p-4 rounded-xl border transition-all ${enabled ? "bg-white border-blue-200 shadow-sm" : "bg-gray-50/50 border-gray-100"}`}>
        <div className="flex items-start justify-between mb-2">
            <div>
                <p className={`text-sm font-semibold ${enabled ? "text-gray-800" : "text-gray-400"}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${enabled ? "text-gray-500" : "text-gray-300"}`}>{description}</p>
            </div>
            <button
                type="button"
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                    enabled ? "bg-blue-600" : "bg-gray-300"
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
        {children}
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
);

// ========================
// HELPER
// ========================

const inputClass = (enabled: boolean, error?: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
        !enabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : error
            ? "border-red-400 bg-red-50"
            : "border-gray-300 bg-white"
    }`;

export default JobCriteriaManager;
