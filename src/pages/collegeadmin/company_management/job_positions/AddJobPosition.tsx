import { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

interface JobOption {
    job_id: string;
    job_title: string;
    company_name: string;
    job_status: string;
}

// ========================
// COMPONENT
// ========================

const AddJobPosition = () => {
    const navigate = useNavigate();

    // Job list for dropdown
    const [jobs, setJobs] = useState<JobOption[]>([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        position_name: "",
        position_description: "",
        vacancies: 1 as number | "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Fetch all jobs for the dropdown
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await CollegeAdminService.getAllJobs({ limit: 100 });
                setJobs(response?.data?.jobs || []);
            } catch {
                showToast({ type: "error", title: "Error", description: "Failed to load jobs" });
            } finally {
                setJobsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            if (name === "job_id") {
                setSelectedJobId(value);
                if (errors.job_id) setErrors((prev) => ({ ...prev, job_id: "" }));
                return;
            }
            setFormData((prev) => ({
                ...prev,
                [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
            }));
            if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        },
        [errors]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            // Validation
            const newErrors: Record<string, string> = {};
            if (!selectedJobId) {
                newErrors.job_id = "Please select a job";
            }
            const trimmedName = formData.position_name.trim();
            if (!trimmedName) {
                newErrors.position_name = "Position name is required";
            } else if (trimmedName.length < 2) {
                newErrors.position_name = "Position name must be at least 2 characters";
            } else if (trimmedName.length > 200) {
                newErrors.position_name = "Position name cannot exceed 200 characters";
            }
            if (formData.position_description.length > 1000) {
                newErrors.position_description = "Description cannot exceed 1000 characters";
            }
            if (formData.vacancies !== "" && (formData.vacancies < 1 || formData.vacancies > 9999)) {
                newErrors.vacancies = "Vacancies must be between 1 and 9999";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                showToast({ type: "warning", title: "Validation Failed", description: Object.values(newErrors)[0] });
                return;
            }

            setErrors({});
            setLoading(true);

            try {
                const payload: { position_name: string; position_description?: string; vacancies?: number } = {
                    position_name: trimmedName,
                };
                if (formData.position_description.trim()) {
                    payload.position_description = formData.position_description.trim();
                }
                if (formData.vacancies !== "" && formData.vacancies >= 1) {
                    payload.vacancies = formData.vacancies;
                }

                const response = await CollegeAdminService.addJobPosition(selectedJobId, payload);
                showToast({ type: "success", title: "Success", description: response?.message || "Position added successfully" });
                navigate(`/college/job/${selectedJobId}/positions`);
            } catch (error: unknown) {
                const axiosErr = error as AxiosError<{ error?: string; message?: string }>;
                const errorMsg =
                    axiosErr?.response?.data?.error ||
                    axiosErr?.response?.data?.message ||
                    (error instanceof Error ? error.message : "Something went wrong");
                showToast({ type: "error", title: "Error Adding Position", description: errorMsg });
            } finally {
                setLoading(false);
            }
        },
        [formData, selectedJobId, navigate]
    );

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Job Positions", path: "/college/job-positions" },
        { label: "Add Position", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Add Job Position" breadcrumbs={breadcrumbs} />

                <div className="p-8 bg-white rounded-xl border">
                    <h1 className="text-xl font-semibold text-gray-800 mb-6">
                        Add New Position to a Job
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        {/* Job Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Job <span className="text-red-500">*</span>
                            </label>
                            {jobsLoading ? (
                                <div className="w-full h-11 bg-gray-100 rounded-lg animate-pulse" />
                            ) : (
                                <select
                                    name="job_id"
                                    value={selectedJobId}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.job_id ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                >
                                    <option value="">— Select a job —</option>
                                    {jobs
                                        .filter((j) => j.job_status !== "cancelled")
                                        .map((j) => (
                                            <option key={j.job_id} value={j.job_id}>
                                                {j.job_title} — {j.company_name} ({j.job_status})
                                            </option>
                                        ))}
                                </select>
                            )}
                            {errors.job_id && <p className="text-xs text-red-500 mt-1">{errors.job_id}</p>}
                        </div>

                        {/* Position Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Position Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="position_name"
                                value={formData.position_name}
                                onChange={handleChange}
                                placeholder="e.g. Data Analyst"
                                maxLength={200}
                                className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.position_name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                            {errors.position_name && <p className="text-xs text-red-500 mt-1">{errors.position_name}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-gray-400 text-xs ml-1">(optional)</span>
                            </label>
                            <textarea
                                name="position_description"
                                value={formData.position_description}
                                onChange={handleChange}
                                placeholder="Brief description of the position..."
                                rows={3}
                                maxLength={1000}
                                className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.position_description ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                            {errors.position_description && <p className="text-xs text-red-500 mt-1">{errors.position_description}</p>}
                        </div>

                        {/* Vacancies */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vacancies <span className="text-gray-400 text-xs ml-1">(optional)</span>
                            </label>
                            <input
                                type="number"
                                name="vacancies"
                                value={formData.vacancies}
                                onChange={handleChange}
                                placeholder="e.g. 10"
                                min={1}
                                max={9999}
                                className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vacancies ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                            {errors.vacancies && <p className="text-xs text-red-500 mt-1">{errors.vacancies}</p>}
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition disabled:opacity-60"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Adding...
                                    </div>
                                ) : (
                                    "Add Position"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/college/job-positions")}
                                disabled={loading}
                                className="px-6 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddJobPosition;
