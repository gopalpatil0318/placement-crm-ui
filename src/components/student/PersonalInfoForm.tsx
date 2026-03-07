import { usePersonalInfo } from "@/hooks/student/useStudentsPersonalInfo";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const PersonalInfoForm = ({ profileData, refreshProfile, nextStep }: Props) => {
    const { formData, errors, loading, handleChange, handleCheckboxChange, handleSubmit } =
        usePersonalInfo(profileData, refreshProfile, nextStep);

    const occupationOptions: string[] = [
        "Private Service",
        "Business/Entrepreneur",
        "Agriculture/Farming",
        "Doctor",
        "Engineer",
        "Lawyer",
        "Retired",
        "Government Service",
        "Self-Employed",
        "Freelancer",
        "Teacher/Educator",
        "Housewife",
        "Laborer/Skilled Worker",
        "Student",
        "Scientist/Researcher",
        "Artist/Performer",
        "Shopkeeper/Trader",
        "Healthcare Worker (Nurse, Pharmacist, etc.)",
        "Security Services",
        "Driver/Chauffeur",
        "Construction Worker",
        "IT Professional/Software Engineer",
        "Journalist/Media",
        "Banking/Finance",
        "Real Estate",
        "Architect",
        "Fashion Designer",
        "Government Contractor",
        "NGO Worker",
        "Mechanic",
        "Chef/Caterer",
        "Sportsperson",
        "Civil Services (IAS, IPS, etc.)",
        "Clerical/Administrative",
        "Others",
    ];

    const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
    const categoryOptions = ["General", "OBC", "SC", "ST", "NT", "VJ", "SBC"];
    const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    return (
        <div className="p-8 bg-white rounded-xl border">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Personal Information
            </h2>

            <div className="space-y-6">
                {/* ================= Contact Details ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label={<>Mobile Number<span className="text-red-500 ml-1">*</span></>}
                        name="mobile_number"
                        {...{ formData, errors, handleChange }}
                    />
                    <InputField
                        label="Alternate Mobile"
                        name="alternate_mobile"
                        {...{ formData, errors, handleChange }}
                    />
                </div>

                {/* ================= Personal Details ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Birth Date<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="date"
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.birth_date && (
                            <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>
                        )}
                    </div>

                    <SelectField
                        label={<>Gender<span className="text-red-500 ml-1">*</span></>}
                        name="gender"
                        options={genderOptions}
                        {...{ formData, errors, handleChange }}
                    />

                    <SelectField
                        label={<>Blood Group<span className="text-red-500 ml-1">*</span></>}
                        name="blood_group"
                        options={bloodGroupOptions}
                        {...{ formData, errors, handleChange }}
                    />
                </div>

                {/* ================= Identity ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField
                        label={<>Aadhaar Number<span className="text-red-500 ml-1">*</span></>}
                        name="aadhaar_number"
                        {...{ formData, errors, handleChange }}
                    />
                    <InputField
                        label={<>Caste<span className="text-red-500 ml-1">*</span></>}
                        name="caste"
                        {...{ formData, errors, handleChange }}
                    />
                    <SelectField
                        label={<>Category<span className="text-red-500 ml-1">*</span></>}
                        name="category"
                        options={categoryOptions}
                        {...{ formData, errors, handleChange }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <InputField
                        label={<>Nationality<span className="text-red-500 ml-1">*</span></>}
                        name="nationality"
                        {...{ formData, errors, handleChange }}
                    />
                </div>

                {/* ================= Father Details ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Father Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InputField
                            label={<>Father Name<span className="text-red-500 ml-1">*</span></>}
                            name="father_name"
                            {...{ formData, errors, handleChange }}
                        />
                        <InputField
                            label={<>Father Mobile<span className="text-red-500 ml-1">*</span></>}
                            name="father_mobile"
                            {...{ formData, errors, handleChange }}
                        />
                        <SelectField
                            label={<>Father Occupation<span className="text-red-500 ml-1">*</span></>}
                            name="father_occupation"
                            options={occupationOptions}
                            {...{ formData, errors, handleChange }}
                        />
                        <InputField
                            label={<>Annual Income (₹)<span className="text-red-500 ml-1">*</span></>}
                            name="father_annual_income"
                            type="number"
                            {...{ formData, errors, handleChange }}
                        />
                    </div>
                </div>

                {/* ================= Mother Details ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Mother Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InputField
                            label={<>Mother Name<span className="text-red-500 ml-1">*</span></>}
                            name="mother_name"
                            {...{ formData, errors, handleChange }}
                        />
                        <InputField
                            label={<>Mother Mobile<span className="text-red-500 ml-1">*</span></>}
                            name="mother_mobile"
                            {...{ formData, errors, handleChange }}
                        />
                        <SelectField
                            label={<>Mother Occupation<span className="text-red-500 ml-1">*</span></>}
                            name="mother_occupation"
                            options={occupationOptions}
                            {...{ formData, errors, handleChange }}
                        />
                        <InputField
                            label={<>Annual Income (₹)<span className="text-red-500 ml-1">*</span></>}
                            name="mother_annual_income"
                            type="number"
                            {...{ formData, errors, handleChange }}
                        />
                    </div>
                </div>

                {/* ================= Guardian Details ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Guardian Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Guardian Name"
                            name="guardian_name"
                            {...{ formData, errors, handleChange }}
                        />
                        <InputField
                            label="Guardian Mobile"
                            name="guardian_mobile"
                            {...{ formData, errors, handleChange }}
                        />
                    </div>
                </div>

                {/* ================= Permanent Address ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Permanent Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <InputField
                            label={<>City<span className="text-red-500 ml-1">*</span></>}
                            name="permanent_city"
                            {...{ formData, errors, handleChange }}
                        />
                        <InputField
                            label={<>District<span className="text-red-500 ml-1">*</span></>}
                            name="permanent_district"
                            {...{ formData, errors, handleChange }}
                        />
                        <InputField
                            label={<>State<span className="text-red-500 ml-1">*</span></>}
                            name="permanent_state"
                            {...{ formData, errors, handleChange }}
                        />
                        <InputField
                            label={<>Pincode<span className="text-red-500 ml-1">*</span></>}
                            name="permanent_pincode"
                            {...{ formData, errors, handleChange }}
                        />
                    </div>
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                            name="permanent_address"
                            value={formData.permanent_address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.permanent_address && (
                            <p className="text-red-500 text-sm mt-1">{errors.permanent_address}</p>
                        )}
                    </div>
                </div>

                {/* ================= Current Address ================= */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Current Address</h3>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.same_as_permanent}
                                onChange={(e) => handleCheckboxChange(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">Same as permanent address</span>
                        </label>
                    </div>

                    {!formData.same_as_permanent && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <InputField
                                    label={<>City<span className="text-red-500 ml-1">*</span></>}
                                    name="current_city"
                                    {...{ formData, errors, handleChange }}
                                />
                                <InputField
                                    label={<>District<span className="text-red-500 ml-1">*</span></>}
                                    name="current_district"
                                    {...{ formData, errors, handleChange }}
                                />
                                <InputField
                                    label={<>State<span className="text-red-500 ml-1">*</span></>}
                                    name="current_state"
                                    {...{ formData, errors, handleChange }}
                                />
                                <InputField
                                    label={<>Pincode<span className="text-red-500 ml-1">*</span></>}
                                    name="current_pincode"
                                    {...{ formData, errors, handleChange }}
                                />
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address <span className="text-red-500 ml-1">*</span>
                                </label>
                                <textarea
                                    name="current_address"
                                    value={formData.current_address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.current_address && (
                                    <p className="text-red-500 text-sm mt-1">{errors.current_address}</p>
                                )}
                            </div>
                        </>
                    )}

                    {formData.same_as_permanent && (
                        <p className="text-sm text-gray-500 italic">
                            Current address will be copied from permanent address.
                        </p>
                    )}
                </div>

                {/* ================= Next Button ================= */}
                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition cursor-pointer"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoForm;

/* ================= Reusable Components ================= */

const InputField = ({ label, name, formData, errors, handleChange, type = "text" }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            name={name}
            type={type}
            value={formData[name] || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors[name] && (
            <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
        )}
    </div>
);

const SelectField = ({
    label,
    name,
    options,
    formData,
    errors,
    handleChange,
}: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <select
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">Select</option>
            {options.map((option: any) =>
                typeof option === "string" ? (
                    <option key={option} value={option}>{option}</option>
                ) : (
                    <option key={option.value} value={option.value}>{option.label}</option>
                )
            )}
        </select>
        {errors[name] && (
            <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
        )}
    </div>
);
