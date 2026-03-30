import { useNavigate } from "react-router-dom";
import { useUpdateJob } from "@/hooks/collegeadmin/company_management/job_postings/useUpdateJob";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import { Briefcase, DollarSign, FileText, Loader2, X } from "lucide-react";

// ========================
// TYPES
// ========================

interface UpdateJobFormProps {
    jobId: string | undefined;
    onItemLoaded?: (title: string) => void;
}

// ========================
// FIELD HELPERS
// ========================

const currentYear = new Date().getFullYear();
const PASSOUT_YEARS = Array.from({ length: 21 }, (_, i) => currentYear - 5 + i);

const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        hasError ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    }`;

const selectClass = (hasError: boolean) =>
    `${inputClass(hasError)} appearance-none [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800`;

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="text-xs text-red-500 dark:text-red-400 mt-1">{message}</p> : null;

const SectionHeader = ({
    icon: Icon,
    title,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
}) => (
    <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    </div>
);

// ========================
// SKELETON
// ========================

const UpdateJobSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 animate-pulse">
        {/* Header skeleton */}
        <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-lg w-64 mb-8" />

        {/* Section 1: Title & Location row */}
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 mb-2" />
                    <div className="h-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700" />
                </div>
                <div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16 mb-2" />
                    <div className="h-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700" />
                </div>
            </div>

            {/* Section 2: Salary 3-col row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((k) => (
                    <div key={k}>
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24 mb-2" />
                        <div className="h-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700" />
                    </div>
                ))}
            </div>

            {/* Section 3: Bond & Deadline row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24 mb-2" />
                    <div className="h-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700" />
                </div>
                <div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32 mb-2" />
                    <div className="h-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700" />
                </div>
            </div>

            {/* Section 4: Bond Details textarea */}
            <div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 mb-2" />
                <div className="h-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700" />
            </div>

            {/* Section 5: Description textarea */}
            <div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 mb-2" />
                <div className="h-28 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700" />
            </div>
        </div>
    </div>
);

// ========================
// COMPONENT
// ========================

const UpdateJobForm = ({ jobId, onItemLoaded }: UpdateJobFormProps) => {
    const navigate = useNavigate();
    const {
        formData,
        fetchedJobTitle,
        errors,
        loading,
        fetching,
        fetchError,
        handleChange,
        updateField,
        handleSubmit,
        handleCancel,
    } = useUpdateJob(jobId, onItemLoaded);

    // ========================
    // FETCHING / ERROR
    // ========================

    if (fetching) return <UpdateJobSkeleton />;

    if (fetchError) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400 font-semibold text-lg mb-1">Failed to Load Job</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{fetchError}</p>
                <button
                    type="button"
                    onClick={() => navigate("/college/jobs")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                     Back to Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {fetchedJobTitle ? `Edit: ${fetchedJobTitle}` : "Edit Job Posting"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update the core job details below. Changes are saved only when you submit.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
                {/* Section 1 — Core Details */}
                <div>
                    <SectionHeader icon={Briefcase} title="Core Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FloatingInput
                            label="Job Title"
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleChange}
                            error={errors.job_title}
                            placeholder="e.g. Software Developer — Campus 2026"
                            maxLength={300}
                            required
                        />
                        <FloatingInput
                            label="Location"
                            name="job_location"
                            value={formData.job_location}
                            onChange={handleChange}
                            error={errors.job_location}
                            placeholder="e.g. Mumbai, Pune, Bangalore"
                            maxLength={300}
                            required
                        />
                    </div>

                    {/* Passout Years */}
                    <div className="mt-5">
                        <label className={labelClass}>Passout Year(s) <span className="text-gray-400 text-xs ml-1">(optional)</span></label>
                        <select
                            value=""
                            onChange={(e) => {
                                const year = Number(e.target.value);
                                if (year && !formData.passout_years.includes(year)) {
                                    updateField("passout_years", [...formData.passout_years, year]);
                                }
                            }}
                            className={selectClass(!!errors.passout_years)}
                        >
                            <option value="">Add Year</option>
                            {PASSOUT_YEARS.map((y) => (
                                <option key={y} value={y} disabled={formData.passout_years.includes(y)}>{y}</option>
                            ))}
                        </select>
                        {formData.passout_years.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {formData.passout_years.map((y) => (
                                    <span key={y} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                        {y}
                                        <button type="button" onClick={() => updateField("passout_years", formData.passout_years.filter((v) => v !== y))} className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <FieldError message={errors.passout_years} />
                    </div>
                </div>

                {/* Section 2 — Compensation */}
                <div>
                    <SectionHeader icon={DollarSign} title="Compensation" />
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <FloatingInput
                                label="Salary Package"
                                name="salary_package"
                                value={formData.salary_package}
                                onChange={handleChange}
                                placeholder="e.g. 7 LPA"
                            />
                            <FloatingInput
                                label="Salary Min (₹)"
                                name="salary_min"
                                type="number"
                                inputMode="numeric"
                                value={String(formData.salary_min)}
                                onChange={handleChange}
                                placeholder="e.g. 700000"
                            />
                            <FloatingInput
                                label="Salary Max (₹)"
                                name="salary_max"
                                type="number"
                                inputMode="numeric"
                                value={String(formData.salary_max)}
                                onChange={handleChange}
                                placeholder="e.g. 700000"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FloatingInput
                                label="Bond Duration"
                                name="bond_duration"
                                value={formData.bond_duration}
                                onChange={handleChange}
                                placeholder="e.g. 2 years"
                            />
                            <FloatingInput
                                label="Application Deadline"
                                name="application_deadline"
                                type="datetime-local"
                                value={formData.application_deadline}
                                onChange={handleChange}
                            />
                        </div>

                        <FloatingTextarea
                            label="Bond Details"
                            name="bond_details"
                            value={formData.bond_details}
                            onChange={handleChange}
                            placeholder="Bond conditions and penalty details..."
                            rows={2}
                            maxLength={1000}
                        />
                    </div>
                </div>

                {/* Section 3 — Description */}
                <div>
                    <SectionHeader icon={FileText} title="Description" />
                    <FloatingTextarea
                        label="Job Description"
                        name="job_description"
                        value={formData.job_description}
                        onChange={handleChange}
                        placeholder="Describe the role, responsibilities, and requirements..."
                        rows={5}
                        maxLength={5000}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
                    >
                        {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving...</>) : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateJobForm;
