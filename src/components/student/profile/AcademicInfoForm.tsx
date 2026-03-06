import { GraduationCap } from "lucide-react";
import type { AcademicInfo } from "@/types/student";

interface AcademicInfoFormProps {
    academicInfo: AcademicInfo | null;
}

function Field({ label, value }: { label: string; value: string | number | undefined | null }) {
    const display = value !== null && value !== undefined ? String(value) : "—";
    return (
        <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {label}
            </label>
            <p className="text-sm text-gray-800 mt-0.5">{display}</p>
        </div>
    );
}

export default function AcademicInfoForm({
    academicInfo,
}: AcademicInfoFormProps) {
    if (!academicInfo) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                    <GraduationCap className="h-4 w-4 text-violet-500" />
                    Academic Information
                </h2>
                <p className="text-sm text-gray-400 italic">
                    No academic information available.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-5">
                <GraduationCap className="h-4 w-4 text-violet-500" />
                Academic Information
            </h2>

            {/* College Details */}
            <div className="mb-6">
                <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">
                    College Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Roll Number" value={academicInfo.roll_number} />
                    <Field label="Enrollment Number" value={academicInfo.enrollment_number} />
                    <Field label="Admission Year" value={academicInfo.admission_year} />
                    <Field label="Admission Based On" value={academicInfo.admission_based_on} />
                    <Field label="Overall CGPA" value={academicInfo.overall_cgpa} />
                </div>
            </div>

            {/* Previous Education */}
            <div className="mb-6">
                <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">
                    Previous Education
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="10th Percentage" value={`${academicInfo.tenth_percentage}%`} />
                    <Field label="10th Board" value={academicInfo.tenth_board} />
                    <Field label="10th Passing Year" value={academicInfo.tenth_passing_year} />
                    <Field label="12th / Diploma" value={academicInfo.twelfth_or_diploma} />
                    {academicInfo.twelfth_or_diploma === "12th" ? (
                        <>
                            <Field label="12th Percentage" value={academicInfo.twelfth_percentage ? `${academicInfo.twelfth_percentage}%` : null} />
                            <Field label="12th Board" value={academicInfo.twelfth_board} />
                        </>
                    ) : (
                        <>
                            <Field label="Diploma Percentage" value={academicInfo.diploma_percentage ? `${academicInfo.diploma_percentage}%` : null} />
                            <Field label="Diploma Branch" value={academicInfo.diploma_branch} />
                        </>
                    )}
                    <Field label="Higher Ed. Passing Year" value={academicInfo.higher_education_passing_year} />
                </div>
            </div>

            {/* Backlogs & Gap */}
            <div>
                <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">
                    Backlogs &amp; Gap
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Total Live KTs" value={academicInfo.total_live_kts} />
                    <Field label="Total Dead KTs" value={academicInfo.total_dead_kts} />
                    <Field
                        label="Education Gap"
                        value={academicInfo.any_gap_during_education ? `Yes (${academicInfo.gap_years} year${academicInfo.gap_years > 1 ? "s" : ""})` : "No"}
                    />
                    {academicInfo.any_gap_during_education && (
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Gap Reason
                            </label>
                            <p className="text-sm text-gray-800 mt-0.5">{academicInfo.gap_reason}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
