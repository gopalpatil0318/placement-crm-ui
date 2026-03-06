import { User } from "lucide-react";
import type { PersonalInfo } from "@/types/student";

interface PersonalInfoFormProps {
    personalInfo: PersonalInfo | null;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function Field({ label, value }: { label: string; value: string | undefined | null }) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {label}
            </label>
            <p className="text-sm text-gray-800 mt-0.5">{value || "—"}</p>
        </div>
    );
}

export default function PersonalInfoForm({
    personalInfo,
}: PersonalInfoFormProps) {
    if (!personalInfo) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-violet-500" />
                    Personal Information
                </h2>
                <p className="text-sm text-gray-400 italic">
                    No personal information available.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-5">
                <User className="h-4 w-4 text-violet-500" />
                Personal Information
            </h2>

            {/* Basic Info */}
            <div className="mb-6">
                <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">
                    Basic Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Date of Birth" value={formatDate(personalInfo.birth_date)} />
                    <Field label="Gender" value={personalInfo.gender} />
                    <Field label="Blood Group" value={personalInfo.blood_group} />
                    <Field label="Nationality" value={personalInfo.nationality} />
                    <Field label="Caste" value={personalInfo.caste} />
                    <Field label="Category" value={personalInfo.category} />
                    <Field label="Mobile" value={personalInfo.mobile_number} />
                    <Field label="Alternate Mobile" value={personalInfo.alternate_mobile} />
                </div>
            </div>

            {/* Family Info */}
            <div className="mb-6">
                <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">
                    Family Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Father's Name" value={personalInfo.father_name} />
                    <Field label="Father's Mobile" value={personalInfo.father_mobile} />
                    <Field label="Father's Occupation" value={personalInfo.father_occupation} />
                    <Field
                        label="Father's Annual Income"
                        value={personalInfo.father_annual_income ? `₹${Number(personalInfo.father_annual_income).toLocaleString()}` : "—"}
                    />
                    <Field label="Mother's Name" value={personalInfo.mother_name} />
                    <Field label="Mother's Mobile" value={personalInfo.mother_mobile} />
                    <Field label="Mother's Occupation" value={personalInfo.mother_occupation} />
                    <Field
                        label="Mother's Annual Income"
                        value={personalInfo.mother_annual_income ? `₹${Number(personalInfo.mother_annual_income).toLocaleString()}` : "—"}
                    />
                    <Field label="Guardian Name" value={personalInfo.guardian_name} />
                    <Field label="Guardian Mobile" value={personalInfo.guardian_mobile} />
                </div>
            </div>

            {/* Address */}
            <div>
                <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">
                    Address
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Permanent */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Permanent Address</p>
                        <p className="text-sm text-gray-800">{personalInfo.permanent_address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {personalInfo.permanent_city}, {personalInfo.permanent_district},{" "}
                            {personalInfo.permanent_state} – {personalInfo.permanent_pincode}
                        </p>
                    </div>
                    {/* Current */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                            Current Address
                            {personalInfo.same_as_permanent && (
                                <span className="ml-2 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    Same as permanent
                                </span>
                            )}
                        </p>
                        <p className="text-sm text-gray-800">{personalInfo.current_address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {personalInfo.current_city}, {personalInfo.current_district},{" "}
                            {personalInfo.current_state} – {personalInfo.current_pincode}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
