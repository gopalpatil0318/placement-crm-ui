import { useEffect } from "react";
import { useSetJobCriteria } from "@/hooks/collegeadmin/company_management/Job_eligibility_criteria/useSetJobCriteria";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { useState, useCallback } from "react";
import { showToast } from "@/utils/ToastUtils";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";

// ========================
// TYPES
// ========================

interface Department {
    dept_id: string;
    dept_name: string;
}

interface JobCriteriaManagerProps {
    jobId: string;
    jobStatus?: string;
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

const JobCriteriaManager = ({ jobId, jobStatus, existingCriteria, onSuccess }: JobCriteriaManagerProps) => {
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

    const isCancelled = jobStatus === "cancelled";

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
            {/* Cancelled Job Banner */}
            {isCancelled && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">This job is cancelled</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Criteria cannot be modified for cancelled jobs.</p>
                    </div>
                </div>
            )}

            {/* Section Header */}
            <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {isUpdate ? "Update Eligibility Criteria" : "Set Eligibility Criteria"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
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
                    disabled={isCancelled}
                >
                    <input
                        type="number"
                        name="min_overall_cgpa"
                        value={formData.min_overall_cgpa}
                        onChange={handleChange}
                        min={0}
                        max={10}
                        step={0.1}
                        disabled={!toggles.min_overall_cgpa || isCancelled}
                        placeholder="e.g. 7.0"
                        className={inputClass(toggles.min_overall_cgpa && !isCancelled, errors.min_overall_cgpa)}
                    />
                </CriteriaField>

                {/* Max Live KTs */}
                <CriteriaField
                    label="Maximum Live KTs"
                    description="Students with active backlogs ≤ this value"
                    enabled={toggles.max_live_kts}
                    onToggle={() => handleToggle("max_live_kts")}
                    error={errors.max_live_kts}
                    disabled={isCancelled}
                >
                    <input
                        type="number"
                        name="max_live_kts"
                        value={formData.max_live_kts}
                        onChange={handleChange}
                        min={0}
                        max={20}
                        disabled={!toggles.max_live_kts || isCancelled}
                        placeholder="e.g. 0"
                        className={inputClass(toggles.max_live_kts && !isCancelled, errors.max_live_kts)}
                    />
                </CriteriaField>

                {/* Min 10th Percentage */}
                <CriteriaField
                    label="Minimum 10th Percentage"
                    description="Students with 10th % ≥ this value"
                    enabled={toggles.min_tenth_percentage}
                    onToggle={() => handleToggle("min_tenth_percentage")}
                    error={errors.min_tenth_percentage}
                    disabled={isCancelled}
                >
                    <input
                        type="number"
                        name="min_tenth_percentage"
                        value={formData.min_tenth_percentage}
                        onChange={handleChange}
                        min={0}
                        max={100}
                        disabled={!toggles.min_tenth_percentage || isCancelled}
                        placeholder="e.g. 60"
                        className={inputClass(toggles.min_tenth_percentage && !isCancelled, errors.min_tenth_percentage)}
                    />
                </CriteriaField>

                {/* Min 12th Percentage */}
                <CriteriaField
                    label="Minimum 12th Percentage"
                    description="Applied only to 12th students"
                    enabled={toggles.min_twelfth_percentage}
                    onToggle={() => handleToggle("min_twelfth_percentage")}
                    error={errors.min_twelfth_percentage}
                    disabled={isCancelled}
                >
                    <input
                        type="number"
                        name="min_twelfth_percentage"
                        value={formData.min_twelfth_percentage}
                        onChange={handleChange}
                        min={0}
                        max={100}
                        disabled={!toggles.min_twelfth_percentage || isCancelled}
                        placeholder="e.g. 55"
                        className={inputClass(toggles.min_twelfth_percentage && !isCancelled, errors.min_twelfth_percentage)}
                    />
                </CriteriaField>

                {/* Min Diploma Percentage */}
                <CriteriaField
                    label="Minimum Diploma Percentage"
                    description="Applied only to diploma students"
                    enabled={toggles.min_diploma_percentage}
                    onToggle={() => handleToggle("min_diploma_percentage")}
                    error={errors.min_diploma_percentage}
                    disabled={isCancelled}
                >
                    <input
                        type="number"
                        name="min_diploma_percentage"
                        value={formData.min_diploma_percentage}
                        onChange={handleChange}
                        min={0}
                        max={100}
                        disabled={!toggles.min_diploma_percentage || isCancelled}
                        placeholder="e.g. 60"
                        className={inputClass(toggles.min_diploma_percentage && !isCancelled, errors.min_diploma_percentage)}
                    />
                </CriteriaField>

                {/* Min Existing Package */}
                <CriteriaField
                    label="Minimum Existing Package (₹)"
                    description="Students with existing CTC ≥ this value"
                    enabled={toggles.min_existing_package}
                    onToggle={() => handleToggle("min_existing_package")}
                    error={errors.min_existing_package}
                    disabled={isCancelled}
                >
                    <input
                        type="number"
                        name="min_existing_package"
                        value={formData.min_existing_package}
                        onChange={handleChange}
                        min={0}
                        disabled={!toggles.min_existing_package || isCancelled}
                        placeholder="e.g. 300000"
                        className={inputClass(toggles.min_existing_package && !isCancelled, errors.min_existing_package)}
                    />
                </CriteriaField>

                {/* Max Existing Package */}
                <CriteriaField
                    label="Maximum Existing Package (₹)"
                    description="Students with existing CTC ≤ this value"
                    enabled={toggles.max_existing_package}
                    onToggle={() => handleToggle("max_existing_package")}
                    error={errors.max_existing_package}
                    disabled={isCancelled}
                >
                    <input
                        type="number"
                        name="max_existing_package"
                        value={formData.max_existing_package}
                        onChange={handleChange}
                        min={0}
                        disabled={!toggles.max_existing_package || isCancelled}
                        placeholder="e.g. 800000"
                        className={inputClass(toggles.max_existing_package && !isCancelled, errors.max_existing_package)}
                    />
                </CriteriaField>

                {/* Exclude Already Placed */}
                <CriteriaField
                    label="Exclude Already Placed"
                    description="Exclude students who already have a 'selected' status"
                    enabled={toggles.exclude_already_placed}
                    onToggle={() => handleToggle("exclude_already_placed")}
                    disabled={isCancelled}
                >
                    <label className="flex items-center gap-3 mt-1">
                        <input
                            type="checkbox"
                            name="exclude_already_placed"
                            checked={formData.exclude_already_placed}
                            onChange={handleChange}
                            disabled={!toggles.exclude_already_placed || isCancelled}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-40"
                        />
                        <span className={`text-sm ${toggles.exclude_already_placed && !isCancelled ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
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
                    disabled={isCancelled}
                >
                    <div className="flex flex-wrap gap-2 mt-1">
                        {GENDER_OPTIONS.map((g) => (
                            <label
                                key={g}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                                    !toggles.allowed_genders || isCancelled
                                        ? "opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                        : formData.allowed_genders.includes(g)
                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 shadow-sm"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.allowed_genders.includes(g)}
                                    onChange={() => handleMultiSelect("allowed_genders", g)}
                                    disabled={!toggles.allowed_genders || isCancelled}
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
                    disabled={isCancelled}
                >
                    <div className="flex flex-wrap gap-2 mt-1">
                        {GAP_OPTIONS.map((g) => (
                            <label
                                key={g.value}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                                    !toggles.allowed_gap_statuses || isCancelled
                                        ? "opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                        : formData.allowed_gap_statuses.includes(g.value)
                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 shadow-sm"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.allowed_gap_statuses.includes(g.value)}
                                    onChange={() => handleMultiSelect("allowed_gap_statuses", g.value)}
                                    disabled={!toggles.allowed_gap_statuses || isCancelled}
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
                    disabled={isCancelled}
                >
                    {loadingDepts ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Loading departments...</p>
                    ) : (
                        <div className="flex flex-wrap gap-2 mt-1 max-h-40 overflow-y-auto">
                            {departments.map((d) => (
                                <label
                                    key={d.dept_id}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                                        !toggles.allowed_departments || isCancelled
                                            ? "opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                            : formData.allowed_departments.includes(d.dept_name)
                                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 shadow-sm"
                                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.allowed_departments.includes(d.dept_name)}
                                        onChange={() => handleMultiSelect("allowed_departments", d.dept_name)}
                                        disabled={!toggles.allowed_departments || isCancelled}
                                        className="sr-only"
                                    />
                                    {d.dept_name}
                                </label>
                            ))}
                            {departments.length === 0 && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">No departments found</p>
                            )}
                        </div>
                    )}
                </CriteriaField>
            </div>

            {/* Submit Button — hidden when cancelled */}
            {!isCancelled && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading
                            ? isUpdate ? "Updating..." : "Setting..."
                            : isUpdate ? "Update Criteria" : "Set Criteria"}
                    </button>
                </div>
            )}
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
    disabled,
    children,
}: {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    error?: string;
    disabled?: boolean;
    children: React.ReactNode;
}) => (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${
        disabled
            ? "bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-60"
            : enabled
            ? "bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 shadow-sm"
            : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
    }`}>
        <div className="flex items-start justify-between mb-2">
            <div>
                <p className={`text-sm font-semibold transition-colors ${enabled && !disabled ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>{label}</p>
                <p className={`text-xs mt-0.5 transition-colors ${enabled && !disabled ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-gray-600"}`}>{description}</p>
            </div>
            <button
                type="button"
                onClick={onToggle}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${
                    enabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Toggle ${label}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
        {children}
        {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">{error}</p>}
    </div>
);

// ========================
// HELPER
// ========================

const inputClass = (enabled: boolean, error?: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
        !enabled
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed"
            : error
            ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-gray-100"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
    }`;

export default JobCriteriaManager;
