import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

interface UpdateJobFormData {
    job_title: string;
    job_description: string;
    job_location: string;
    salary_package: string;
    salary_min: number | "";
    salary_max: number | "";
    bond_duration: string;
    bond_details: string;
    application_deadline: string;
}

// ========================
// HOOK
// ========================

export const useUpdateJob = (jobId: string | undefined) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<UpdateJobFormData>({
        job_title: "",
        job_description: "",
        job_location: "",
        salary_package: "",
        salary_min: "",
        salary_max: "",
        bond_duration: "",
        bond_details: "",
        application_deadline: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Fetch current job data
    useEffect(() => {
        if (!jobId) return;

        const fetchJob = async () => {
            setFetching(true);
            try {
                const response = await CollegeAdminService.getJob(jobId);
                const data = response.data || response;
                setFormData({
                    job_title: data.job_title || "",
                    job_description: data.job_description || "",
                    job_location: data.job_location || "",
                    salary_package: data.salary_package || "",
                    salary_min: data.salary_min ? Number(data.salary_min) : "",
                    salary_max: data.salary_max ? Number(data.salary_max) : "",
                    bond_duration: data.bond_duration || "",
                    bond_details: data.bond_details || "",
                    application_deadline: data.application_deadline
                        ? data.application_deadline.slice(0, 16)
                        : "",
                });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Failed to fetch job";
                setFetchError(msg);
                showToast({ type: "error", title: "Error", description: msg });
            } finally {
                setFetching(false);
            }
        };

        fetchJob();
    }, [jobId]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
            }));
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();
            if (!jobId) return;

            // Basic validation
            const newErrors: Record<string, string> = {};
            if (!formData.job_title.trim()) newErrors.job_title = "Job title is required";
            if (!formData.job_location.trim()) newErrors.job_location = "Location is required";
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: Object.values(newErrors)[0],
                });
                return;
            }

            setErrors({});
            setLoading(true);

            try {
                const payload: Record<string, unknown> = {};
                if (formData.job_title) payload.job_title = formData.job_title;
                if (formData.job_description) payload.job_description = formData.job_description;
                if (formData.job_location) payload.job_location = formData.job_location;
                if (formData.salary_package) payload.salary_package = formData.salary_package;
                if (formData.salary_min !== "") payload.salary_min = formData.salary_min;
                if (formData.salary_max !== "") payload.salary_max = formData.salary_max;
                if (formData.bond_duration) payload.bond_duration = formData.bond_duration;
                if (formData.bond_details) payload.bond_details = formData.bond_details;
                if (formData.application_deadline) payload.application_deadline = formData.application_deadline;

                const response = await CollegeAdminService.updateJob(jobId, payload);
                showToast({
                    type: "success",
                    title: "Success",
                    description: response?.message || "Job updated successfully",
                });
                navigate(`/college/job/${jobId}`);
            } catch (error: unknown) {
                const axiosErr = error as AxiosError<{ error?: string; message?: string }>;
                const errorMsg =
                    axiosErr?.response?.data?.error ||
                    axiosErr?.response?.data?.message ||
                    (error instanceof Error ? error.message : "Something went wrong");

                showToast({
                    type: "error",
                    title: "Error Updating Job",
                    description: errorMsg,
                });
            } finally {
                setLoading(false);
            }
        },
        [formData, jobId, navigate]
    );

    const handleCancel = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return {
        formData,
        errors,
        loading,
        fetching,
        fetchError,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
