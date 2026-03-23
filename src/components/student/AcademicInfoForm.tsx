import { useAcademicInfo } from "@/hooks/student/useAcademicInfo";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";

const AcademicInfoForm = () => {
    const { formData, errors, loading, fetching, handleChange, handleCheckboxChange, handleSubmit } =
        useAcademicInfo();

    const admissionOptions = [
        { value: "JEE", label: "JEE" },
        { value: "MHT-CET", label: "MHT-CET" },
        { value: "GATE", label: "GATE" },
        { value: "Direct", label: "Direct" },
        { value: "Management", label: "Management" },
        { value: "CAT", label: "CAT" },
        { value: "Other", label: "Other" },
    ];

    if (fetching) {
        return (
            <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
                <div className="h-5 w-44 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mb-6" />
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                                <div className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                                <div className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end mt-6 pt-4 border-t dark:border-gray-700">
                    <div className="h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Academic Information</h2>

            <div className="space-y-6">
                {/* ================= Basic Academic Details ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FloatingInput label="Roll Number" name="roll_number" value={String(formData.roll_number ?? "")} onChange={handleChange} error={errors.roll_number} />
                    <FloatingInput label="Enrollment Number" name="enrollment_number" value={String(formData.enrollment_number ?? "")} onChange={handleChange} error={errors.enrollment_number} />
                    <FloatingInput label="Admission Year" name="admission_year" value={String(formData.admission_year ?? "")} onChange={handleChange} error={errors.admission_year} required type="number" />
                    <FloatingSelect label="Admission Based On" name="admission_based_on" value={String(formData.admission_based_on ?? "")} onChange={handleChange} error={errors.admission_based_on} required options={admissionOptions} />
                </div>

                {/* ================= 10th Details ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">10th Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FloatingInput label="Percentage (%)" name="tenth_percentage" value={String(formData.tenth_percentage ?? "")} onChange={handleChange} error={errors.tenth_percentage} required type="number" />
                        <FloatingInput label="Board" name="tenth_board" value={String(formData.tenth_board ?? "")} onChange={handleChange} error={errors.tenth_board} required />
                        <FloatingInput label="Passing Year" name="tenth_passing_year" value={String(formData.tenth_passing_year ?? "")} onChange={handleChange} error={errors.tenth_passing_year} required type="number" />
                    </div>
                </div>

                {/* ================= 12th / Diploma Toggle ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Higher Secondary</h3>

                    {/* Radio Toggle */}
                    <div className="flex items-center gap-6 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="twelfth_or_diploma"
                                value="12th"
                                checked={formData.twelfth_or_diploma === "12th"}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">12th</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="twelfth_or_diploma"
                                value="Diploma"
                                checked={formData.twelfth_or_diploma === "Diploma"}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diploma</span>
                        </label>
                    </div>

                    {/* Conditional 12th Fields */}
                    {formData.twelfth_or_diploma === "12th" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FloatingInput label="12th Percentage (%)" name="twelfth_percentage" value={String(formData.twelfth_percentage ?? "")} onChange={handleChange} error={errors.twelfth_percentage} required type="number" />
                            <FloatingInput label="12th Board" name="twelfth_board" value={String(formData.twelfth_board ?? "")} onChange={handleChange} error={errors.twelfth_board} required />
                        </div>
                    )}

                    {/* Conditional Diploma Fields */}
                    {formData.twelfth_or_diploma === "Diploma" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FloatingInput label="Diploma Percentage (%)" name="diploma_percentage" value={String(formData.diploma_percentage ?? "")} onChange={handleChange} error={errors.diploma_percentage} required type="number" />
                            <FloatingInput label="Diploma Branch" name="diploma_branch" value={String(formData.diploma_branch ?? "")} onChange={handleChange} error={errors.diploma_branch} required />
                        </div>
                    )}

                    <div className="mt-6">
                        <FloatingInput label="Passing Year" name="higher_education_passing_year" value={String(formData.higher_education_passing_year ?? "")} onChange={handleChange} error={errors.higher_education_passing_year} required type="number" />
                    </div>
                </div>

                {/* ================= Current Performance ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Current Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FloatingInput label="Overall CGPA (/10)" name="overall_cgpa" value={String(formData.overall_cgpa ?? "")} onChange={handleChange} error={errors.overall_cgpa} required type="number" />
                        <FloatingInput label="Total Live KTs" name="total_live_kts" value={String(formData.total_live_kts ?? "")} onChange={handleChange} error={errors.total_live_kts} required type="number" />
                        <FloatingInput label="Total Dead KTs" name="total_dead_kts" value={String(formData.total_dead_kts ?? "")} onChange={handleChange} error={errors.total_dead_kts} required type="number" />
                    </div>
                </div>

                {/* ================= Education Gap ================= */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Education Gap</h3>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.any_gap_during_education}
                                onChange={(e) => handleCheckboxChange("any_gap_during_education", e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Yes, I have a gap</span>
                        </label>
                    </div>

                    {formData.any_gap_during_education && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FloatingInput label="Gap Years" name="gap_years" value={String(formData.gap_years ?? "")} onChange={handleChange} error={errors.gap_years} required type="number" />
                            <FloatingTextarea label="Gap Reason" name="gap_reason" value={formData.gap_reason || ""} onChange={handleChange} error={errors.gap_reason} rows={3} />
                        </div>
                    )}

                    {!formData.any_gap_during_education && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No education gap reported.</p>
                    )}
                </div>

                {/* ================= Save Button ================= */}
                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition cursor-pointer disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AcademicInfoForm;
