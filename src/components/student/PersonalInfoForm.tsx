import { usePersonalInfo } from "@/hooks/student/useStudentsPersonalInfo";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import { OCCUPATION_OPTIONS } from "@/constants/personalInfo";

const PersonalInfoForm = ({ onSaveSuccess }: Readonly<{ onSaveSuccess?: () => void }>) => {
    const { formData, errors, loading, fetching, handleChange, handleCheckboxChange, handleSubmit } =
        usePersonalInfo({ onSaveSuccess });

    const genderOptions = ["Male", "Female", "Other", "Prefer not to say"].map(o => ({ value: o, label: o }));
    const categoryOptions = ["General", "OBC", "OBC-NCL", "SC", "ST", "EWS", "NT", "NT-A", "NT-B", "NT-C", "NT-D", "VJ", "VJ-A", "SBC", "SEBC", "DT/DNT", "Open"].map(o => ({ value: o, label: o }));
    const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(o => ({ value: o, label: o }));

    if (fetching) {
        return (
            <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
                <div className="h-5 w-44 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mb-6" />
                <div className="space-y-6">
                    {/* Contact Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {["mobile", "alt-mobile"].map((id) => (
                            <div key={id} className="space-y-2">
                                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                                <div className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                            </div>
                        ))}
                    </div>
                    {/* Personal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["gender", "dob", "blood"].map((id) => (
                            <div key={id} className="space-y-2">
                                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                                <div className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                            </div>
                        ))}
                    </div>
                    {/* Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["category", "aadhar", "pan"].map((id) => (
                            <div key={id} className="space-y-2">
                                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                                <div className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                            </div>
                        ))}
                    </div>
                    {/* Section headers + grids for Father/Mother/Address */}
                    {["father", "mother", "address"].map((section) => (
                        <div key={section}>
                            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mb-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {["a", "b", "c", "d"].map((field) => (
                                    <div key={`${section}-${field}`} className="space-y-2">
                                        <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                                        <div className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end pt-4 mt-6">
                    <div className="h-11 w-28 rounded-full bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Personal Information
            </h2>

            <div className="space-y-6">
                {/* ================= Contact Details ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput label="Mobile Number" name="mobile_number" value={String(formData.mobile_number ?? "")} onChange={handleChange} error={errors.mobile_number} required inputMode="tel" />
                    <FloatingInput label="Alternate Mobile" name="alternate_mobile" value={String(formData.alternate_mobile ?? "")} onChange={handleChange} error={errors.alternate_mobile} inputMode="tel" />
                </div>

                {/* ================= Personal Details ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FloatingInput label="Birth Date" name="birth_date" value={formData.birth_date} onChange={handleChange} error={errors.birth_date} required type="date" max={new Date().toISOString().split('T')[0]} />
                    <FloatingSelect label="Gender" name="gender" value={String(formData.gender ?? "")} onChange={handleChange} error={errors.gender} required options={genderOptions} />
                    <FloatingSelect label="Blood Group" name="blood_group" value={String(formData.blood_group ?? "")} onChange={handleChange} error={errors.blood_group} required options={bloodGroupOptions} />
                </div>

                {/* ================= Identity ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FloatingInput label="Aadhaar Number" name="aadhaar_number" value={String(formData.aadhaar_number ?? "")} onChange={handleChange} error={errors.aadhaar_number} required inputMode="numeric" />
                    <FloatingInput label="Caste" name="caste" value={String(formData.caste ?? "")} onChange={handleChange} error={errors.caste} required />
                    <FloatingSelect label="Category" name="category" value={String(formData.category ?? "")} onChange={handleChange} error={errors.category} required options={categoryOptions} />
                </div>

                <FloatingInput label="Nationality" name="nationality" value={String(formData.nationality ?? "")} onChange={handleChange} error={errors.nationality} required />

                {/* ================= Father Details ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Father Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FloatingInput label="Father Name" name="father_name" value={String(formData.father_name ?? "")} onChange={handleChange} error={errors.father_name} required />
                        <FloatingInput label="Father Mobile" name="father_mobile" value={String(formData.father_mobile ?? "")} onChange={handleChange} error={errors.father_mobile} required inputMode="tel" />
                        <FloatingSelect label="Father Occupation" name="father_occupation" value={String(formData.father_occupation ?? "")} onChange={handleChange} error={errors.father_occupation} required options={OCCUPATION_OPTIONS} />
                        <FloatingInput label="Annual Income (₹)" name="father_annual_income" value={String(formData.father_annual_income ?? "")} onChange={handleChange} error={errors.father_annual_income} required type="number" inputMode="decimal" />
                    </div>
                </div>

                {/* ================= Mother Details ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Mother Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FloatingInput label="Mother Name" name="mother_name" value={String(formData.mother_name ?? "")} onChange={handleChange} error={errors.mother_name} required />
                        <FloatingInput label="Mother Mobile" name="mother_mobile" value={String(formData.mother_mobile ?? "")} onChange={handleChange} error={errors.mother_mobile} required inputMode="tel" />
                        <FloatingSelect label="Mother Occupation" name="mother_occupation" value={String(formData.mother_occupation ?? "")} onChange={handleChange} error={errors.mother_occupation} required options={OCCUPATION_OPTIONS} />
                        <FloatingInput label="Annual Income (₹)" name="mother_annual_income" value={String(formData.mother_annual_income ?? "")} onChange={handleChange} error={errors.mother_annual_income} required type="number" inputMode="decimal" />
                    </div>
                </div>

                {/* ================= Guardian Details ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Guardian Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingInput label="Guardian Name" name="guardian_name" value={String(formData.guardian_name ?? "")} onChange={handleChange} error={errors.guardian_name} />
                        <FloatingInput label="Guardian Mobile" name="guardian_mobile" value={String(formData.guardian_mobile ?? "")} onChange={handleChange} error={errors.guardian_mobile} inputMode="tel" />
                    </div>
                </div>

                {/* ================= Permanent Address ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Permanent Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <FloatingInput label="City" name="permanent_city" value={String(formData.permanent_city ?? "")} onChange={handleChange} error={errors.permanent_city} required />
                        <FloatingInput label="District" name="permanent_district" value={String(formData.permanent_district ?? "")} onChange={handleChange} error={errors.permanent_district} required />
                        <FloatingInput label="State" name="permanent_state" value={String(formData.permanent_state ?? "")} onChange={handleChange} error={errors.permanent_state} required />
                        <FloatingInput label="Pincode" name="permanent_pincode" value={String(formData.permanent_pincode ?? "")} onChange={handleChange} error={errors.permanent_pincode} required inputMode="numeric" />
                    </div>
                    <div className="mt-6">
                        <FloatingTextarea label="Address" name="permanent_address" value={formData.permanent_address} onChange={handleChange} error={errors.permanent_address} required rows={3} />
                    </div>
                </div>

                {/* ================= Current Address ================= */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Current Address</h3>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.same_as_permanent}
                                onChange={(e) => handleCheckboxChange(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Same as permanent address</span>
                        </label>
                    </div>

                    {!formData.same_as_permanent && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FloatingInput label="City" name="current_city" value={String(formData.current_city ?? "")} onChange={handleChange} error={errors.current_city} required />
                                <FloatingInput label="District" name="current_district" value={String(formData.current_district ?? "")} onChange={handleChange} error={errors.current_district} required />
                                <FloatingInput label="State" name="current_state" value={String(formData.current_state ?? "")} onChange={handleChange} error={errors.current_state} required />
                                <FloatingInput label="Pincode" name="current_pincode" value={String(formData.current_pincode ?? "")} onChange={handleChange} error={errors.current_pincode} required inputMode="numeric" />
                            </div>
                            <div className="mt-6">
                                <FloatingTextarea label="Address" name="current_address" value={formData.current_address} onChange={handleChange} error={errors.current_address} required rows={3} />
                            </div>
                        </>
                    )}

                    {formData.same_as_permanent && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Current address will be copied from permanent address.
                        </p>
                    )}
                </div>

                {/* ================= Next Button ================= */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 py-3 border-t border-gray-200 dark:border-gray-700 -mx-8 px-8 md:static md:border-0 md:mx-0 md:px-0 md:bg-transparent md:dark:bg-transparent">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition cursor-pointer w-full md:w-auto"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoForm;
