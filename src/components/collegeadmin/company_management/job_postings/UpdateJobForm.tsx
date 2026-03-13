import { useUpdateJob } from "@/hooks/collegeadmin/company_management/job_postings/useUpdateJob";

// ========================
// COMPONENT
// ========================

const UpdateJobForm = ({ jobId }: { jobId: string | undefined }) => {
    const {
        formData,
        errors,
        loading,
        fetching,
        fetchError,
        handleChange,
        handleSubmit,
        handleCancel,
    } = useUpdateJob(jobId);

    // ========================
    // FETCHING / ERROR
    // ========================

    if (fetching) {
        return (
            <div className="p-8 bg-white rounded-xl border animate-pulse">
                <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="p-8 bg-white rounded-xl border text-center">
                <p className="text-red-500 font-medium">{fetchError}</p>
            </div>
        );
    }

    const descriptionLength = formData.job_description?.length || 0;

    return (
        <div className="p-8 bg-white rounded-xl border">
            <h1 className="text-xl font-semibold text-gray-800 mb-6">
                Update Job Posting
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 — Title & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleChange}
                            placeholder="e.g. Software Developer — Campus 2026"
                            maxLength={300}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.job_title ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.job_title && <p className="text-xs text-red-500 mt-1">{errors.job_title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            name="job_location"
                            value={formData.job_location}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai, Pune, Bangalore"
                            maxLength={300}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.job_location ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.job_location && <p className="text-xs text-red-500 mt-1">{errors.job_location}</p>}
                    </div>
                </div>

                {/* Row 2 — Salary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Salary Package
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            name="salary_package"
                            value={formData.salary_package}
                            onChange={handleChange}
                            placeholder="e.g. 7 LPA"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Salary Min (₹)
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            type="number"
                            name="salary_min"
                            value={formData.salary_min}
                            onChange={handleChange}
                            placeholder="e.g. 700000"
                            min={0}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Salary Max (₹)
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            type="number"
                            name="salary_max"
                            value={formData.salary_max}
                            onChange={handleChange}
                            placeholder="e.g. 700000"
                            min={0}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Row 3 — Bond */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bond Duration
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            name="bond_duration"
                            value={formData.bond_duration}
                            onChange={handleChange}
                            placeholder="e.g. 2 years"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Application Deadline
                        </label>
                        <input
                            type="datetime-local"
                            name="application_deadline"
                            value={formData.application_deadline}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Row 4 — Bond Details */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bond Details
                        <span className="text-gray-400 text-xs ml-1">(optional)</span>
                    </label>
                    <textarea
                        name="bond_details"
                        value={formData.bond_details}
                        onChange={handleChange}
                        placeholder="Bond conditions and penalty details..."
                        rows={2}
                        maxLength={1000}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                {/* Row 5 — Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                        <span className="text-gray-400 text-xs ml-1">(optional)</span>
                    </label>
                    <textarea
                        name="job_description"
                        value={formData.job_description}
                        onChange={handleChange}
                        placeholder="Describe the role, responsibilities, and requirements..."
                        rows={5}
                        maxLength={5000}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex justify-between mt-1">
                        <span />
                        <p className={`text-xs ${descriptionLength > 4500 ? "text-orange-500" : "text-gray-400"}`}>
                            {descriptionLength} / 5000
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition disabled:opacity-60"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Updating...
                            </div>
                        ) : (
                            "Update Job"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateJobForm;
