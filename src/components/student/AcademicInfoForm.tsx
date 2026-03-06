import { useAcademicInfo } from "@/hooks/student/useAcademicInfo";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const AcademicInfoForm = ({ profileData }: Props) => {
    const { formData, errors, loading, fetching, handleChange, handleCheckboxChange, handleSubmit } =
        useAcademicInfo(profileData);

    const admissionOptions = ["JEE", "MHT-CET", "GATE", "Direct", "Management", "CAT", "Other"];

    if (fetching) {
        return (
            <div className="p-8 bg-white rounded-xl border">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-3 text-gray-500">Loading academic info...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Academic Information</h2>

            <div className="space-y-6">
                {/* ================= Basic Academic Details ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputField label="Roll Number" name="roll_number" formData={formData} errors={errors} handleChange={handleChange} />
                    <InputField label="Enrollment Number" name="enrollment_number" formData={formData} errors={errors} handleChange={handleChange} />
                    <InputField
                        label={<>Admission Year<span className="text-red-500 ml-1">*</span></>}
                        name="admission_year" type="number" formData={formData} errors={errors} handleChange={handleChange}
                    />
                    <SelectField
                        label={<>Admission Based On<span className="text-red-500 ml-1">*</span></>}
                        name="admission_based_on" options={admissionOptions} formData={formData} errors={errors} handleChange={handleChange}
                    />
                </div>

                {/* ================= 10th Details ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">10th Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField
                            label={<>Percentage (%)<span className="text-red-500 ml-1">*</span></>}
                            name="tenth_percentage" type="number" formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <InputField
                            label={<>Board<span className="text-red-500 ml-1">*</span></>}
                            name="tenth_board" formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <InputField
                            label={<>Passing Year<span className="text-red-500 ml-1">*</span></>}
                            name="tenth_passing_year" type="number" formData={formData} errors={errors} handleChange={handleChange}
                        />
                    </div>
                </div>

                {/* ================= 12th / Diploma Toggle ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Higher Secondary</h3>

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
                            <span className="text-sm font-medium text-gray-700">12th</span>
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
                            <span className="text-sm font-medium text-gray-700">Diploma</span>
                        </label>
                    </div>

                    {/* Conditional 12th Fields */}
                    {formData.twelfth_or_diploma === "12th" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label={<>12th Percentage (%)<span className="text-red-500 ml-1">*</span></>}
                                name="twelfth_percentage" type="number" formData={formData} errors={errors} handleChange={handleChange}
                            />
                            <InputField
                                label={<>12th Board<span className="text-red-500 ml-1">*</span></>}
                                name="twelfth_board" formData={formData} errors={errors} handleChange={handleChange}
                            />
                        </div>
                    )}

                    {/* Conditional Diploma Fields */}
                    {formData.twelfth_or_diploma === "Diploma" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label={<>Diploma Percentage (%)<span className="text-red-500 ml-1">*</span></>}
                                name="diploma_percentage" type="number" formData={formData} errors={errors} handleChange={handleChange}
                            />
                            <InputField
                                label={<>Diploma Branch<span className="text-red-500 ml-1">*</span></>}
                                name="diploma_branch" formData={formData} errors={errors} handleChange={handleChange}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
                        <InputField
                            label={<>Passing Year<span className="text-red-500 ml-1">*</span></>}
                            name="higher_education_passing_year" type="number" formData={formData} errors={errors} handleChange={handleChange}
                        />
                    </div>
                </div>

                {/* ================= Current Performance ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField
                            label={<>Overall CGPA (/10)<span className="text-red-500 ml-1">*</span></>}
                            name="overall_cgpa" type="number" formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <InputField
                            label={<>Total Live KTs<span className="text-red-500 ml-1">*</span></>}
                            name="total_live_kts" type="number" formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <InputField
                            label={<>Total Dead KTs<span className="text-red-500 ml-1">*</span></>}
                            name="total_dead_kts" type="number" formData={formData} errors={errors} handleChange={handleChange}
                        />
                    </div>
                </div>

                {/* ================= Education Gap ================= */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Education Gap</h3>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.any_gap_during_education}
                                onChange={(e) => handleCheckboxChange("any_gap_during_education", e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">Yes, I have a gap</span>
                        </label>
                    </div>

                    {formData.any_gap_during_education && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label={<>Gap Years<span className="text-red-500 ml-1">*</span></>}
                                name="gap_years" type="number" formData={formData} errors={errors} handleChange={handleChange}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gap Reason
                                </label>
                                <textarea
                                    name="gap_reason"
                                    value={formData.gap_reason || ""}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.gap_reason && (
                                    <p className="text-xs text-red-500 mt-1">{errors.gap_reason}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {!formData.any_gap_during_education && (
                        <p className="text-sm text-gray-500 italic">No education gap reported.</p>
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

/* ================= Reusable Components ================= */

const InputField = ({ label, name, formData, errors, handleChange, type = "text" }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            name={name}
            type={type}
            value={formData[name] || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
);

const SelectField = ({ label, name, options, formData, errors, handleChange }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">Select</option>
            {options.map((option: string) => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
        {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
);
