import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

interface AddPositionFormData {
    position_name: string;
    position_description: string;
    vacancies: number | "";
}

const INITIAL_FORM: AddPositionFormData = {
    position_name: "",
    position_description: "",
    vacancies: 1,
};

// ========================
// HOOK
// ========================

export const useAddPosition = (jobId: string, onSuccess?: () => void) => {
    const [formData, setFormData] = useState<AddPositionFormData>(INITIAL_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM);
        setErrors({});
    }, []);

    const handleSubmit = useCallback(async () => {
        // Validation
        const newErrors: Record<string, string> = {};
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

            const response = await CollegeAdminService.addJobPosition(jobId, payload);
            showToast({ type: "success", title: "Success", description: response?.message || "Position added successfully" });
            resetForm();
            onSuccess?.();
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
    }, [formData, jobId, onSuccess, resetForm]);

    return { formData, errors, loading, handleChange, handleSubmit, resetForm };
};
