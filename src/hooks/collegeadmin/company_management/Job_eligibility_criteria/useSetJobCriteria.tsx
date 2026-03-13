import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

export interface CriteriaFormData {
    min_overall_cgpa: number | "";
    max_live_kts: number | "";
    min_tenth_percentage: number | "";
    min_twelfth_percentage: number | "";
    min_diploma_percentage: number | "";
    allowed_genders: string[];
    allowed_departments: string[];
    allowed_gap_statuses: string[];
    exclude_already_placed: boolean;
}

export interface CriteriaToggles {
    min_overall_cgpa: boolean;
    max_live_kts: boolean;
    min_tenth_percentage: boolean;
    min_twelfth_percentage: boolean;
    min_diploma_percentage: boolean;
    allowed_genders: boolean;
    allowed_departments: boolean;
    allowed_gap_statuses: boolean;
    exclude_already_placed: boolean;
}

const INITIAL_FORM: CriteriaFormData = {
    min_overall_cgpa: 7.0,
    max_live_kts: 0,
    min_tenth_percentage: 60,
    min_twelfth_percentage: 55,
    min_diploma_percentage: 60,
    allowed_genders: [],
    allowed_departments: [],
    allowed_gap_statuses: [],
    exclude_already_placed: false,
};

const INITIAL_TOGGLES: CriteriaToggles = {
    min_overall_cgpa: false,
    max_live_kts: false,
    min_tenth_percentage: false,
    min_twelfth_percentage: false,
    min_diploma_percentage: false,
    allowed_genders: false,
    allowed_departments: false,
    allowed_gap_statuses: false,
    exclude_already_placed: false,
};

// ========================
// HOOK
// ========================

export const useSetJobCriteria = (jobId: string, onSuccess?: () => void) => {
    const [formData, setFormData] = useState<CriteriaFormData>(INITIAL_FORM);
    const [toggles, setToggles] = useState<CriteriaToggles>(INITIAL_TOGGLES);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            if (type === "checkbox") {
                const checked = (e.target as HTMLInputElement).checked;
                setFormData((prev) => ({ ...prev, [name]: checked }));
            } else if (type === "number") {
                setFormData((prev) => ({
                    ...prev,
                    [name]: value === "" ? "" : Number(value),
                }));
            } else {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors]
    );

    const handleToggle = useCallback((field: keyof CriteriaToggles) => {
        setToggles((prev) => ({ ...prev, [field]: !prev[field] }));
    }, []);

    const handleMultiSelect = useCallback(
        (field: keyof CriteriaFormData, value: string) => {
            setFormData((prev) => {
                const current = prev[field] as string[];
                const updated = current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value];
                return { ...prev, [field]: updated };
            });
        },
        []
    );

    const loadExisting = useCallback(
        (criteria: Record<string, unknown>) => {
            const newForm = { ...INITIAL_FORM };
            const newToggles = { ...INITIAL_TOGGLES };

            if (criteria.min_overall_cgpa != null) {
                newForm.min_overall_cgpa = Number(criteria.min_overall_cgpa);
                newToggles.min_overall_cgpa = true;
            }
            if (criteria.max_live_kts != null) {
                newForm.max_live_kts = Number(criteria.max_live_kts);
                newToggles.max_live_kts = true;
            }
            if (criteria.min_tenth_percentage != null) {
                newForm.min_tenth_percentage = Number(criteria.min_tenth_percentage);
                newToggles.min_tenth_percentage = true;
            }
            if (criteria.min_twelfth_percentage != null) {
                newForm.min_twelfth_percentage = Number(criteria.min_twelfth_percentage);
                newToggles.min_twelfth_percentage = true;
            }
            if (criteria.min_diploma_percentage != null) {
                newForm.min_diploma_percentage = Number(criteria.min_diploma_percentage);
                newToggles.min_diploma_percentage = true;
            }
            if (Array.isArray(criteria.allowed_genders) && criteria.allowed_genders.length > 0) {
                newForm.allowed_genders = criteria.allowed_genders as string[];
                newToggles.allowed_genders = true;
            }
            if (Array.isArray(criteria.allowed_departments) && criteria.allowed_departments.length > 0) {
                newForm.allowed_departments = criteria.allowed_departments as string[];
                newToggles.allowed_departments = true;
            }
            if (Array.isArray(criteria.allowed_gap_statuses) && criteria.allowed_gap_statuses.length > 0) {
                newForm.allowed_gap_statuses = criteria.allowed_gap_statuses as string[];
                newToggles.allowed_gap_statuses = true;
            }
            if (criteria.exclude_already_placed === true) {
                newForm.exclude_already_placed = true;
                newToggles.exclude_already_placed = true;
            }

            setFormData(newForm);
            setToggles(newToggles);
            setIsUpdate(true);
        },
        []
    );

    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM);
        setToggles(INITIAL_TOGGLES);
        setErrors({});
        setIsUpdate(false);
    }, []);

    const handleSubmit = useCallback(async () => {
        // Build payload — only include toggled-on fields
        const payload: Record<string, unknown> = {};
        const newErrors: Record<string, string> = {};

        if (toggles.min_overall_cgpa) {
            if (formData.min_overall_cgpa === "" || formData.min_overall_cgpa < 0 || formData.min_overall_cgpa > 10) {
                newErrors.min_overall_cgpa = "CGPA must be between 0 and 10";
            } else {
                payload.min_overall_cgpa = formData.min_overall_cgpa;
            }
        }

        if (toggles.max_live_kts) {
            if (formData.max_live_kts === "" || formData.max_live_kts < 0 || formData.max_live_kts > 20) {
                newErrors.max_live_kts = "KTs must be between 0 and 20";
            } else {
                payload.max_live_kts = formData.max_live_kts;
            }
        }

        if (toggles.min_tenth_percentage) {
            if (formData.min_tenth_percentage === "" || formData.min_tenth_percentage < 0 || formData.min_tenth_percentage > 100) {
                newErrors.min_tenth_percentage = "Percentage must be between 0 and 100";
            } else {
                payload.min_tenth_percentage = formData.min_tenth_percentage;
            }
        }

        if (toggles.min_twelfth_percentage) {
            if (formData.min_twelfth_percentage === "" || formData.min_twelfth_percentage < 0 || formData.min_twelfth_percentage > 100) {
                newErrors.min_twelfth_percentage = "Percentage must be between 0 and 100";
            } else {
                payload.min_twelfth_percentage = formData.min_twelfth_percentage;
            }
        }

        if (toggles.min_diploma_percentage) {
            if (formData.min_diploma_percentage === "" || formData.min_diploma_percentage < 0 || formData.min_diploma_percentage > 100) {
                newErrors.min_diploma_percentage = "Percentage must be between 0 and 100";
            } else {
                payload.min_diploma_percentage = formData.min_diploma_percentage;
            }
        }

        if (toggles.allowed_genders) {
            if (formData.allowed_genders.length === 0) {
                newErrors.allowed_genders = "Select at least one gender";
            } else {
                payload.allowed_genders = formData.allowed_genders;
            }
        }

        if (toggles.allowed_departments) {
            if (formData.allowed_departments.length === 0) {
                newErrors.allowed_departments = "Select at least one department";
            } else {
                payload.allowed_departments = formData.allowed_departments;
            }
        }

        if (toggles.allowed_gap_statuses) {
            if (formData.allowed_gap_statuses.length === 0) {
                newErrors.allowed_gap_statuses = "Select at least one gap status";
            } else {
                payload.allowed_gap_statuses = formData.allowed_gap_statuses;
            }
        }

        if (toggles.exclude_already_placed) {
            payload.exclude_already_placed = formData.exclude_already_placed;
        }

        // At least one criterion must be enabled
        if (Object.keys(payload).length === 0) {
            showToast({
                type: "warning",
                title: "No Criteria Selected",
                description: "Enable and configure at least one eligibility criterion",
            });
            return;
        }

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
            const response = isUpdate
                ? await CollegeAdminService.updateJobCriteria(jobId, payload)
                : await CollegeAdminService.setJobCriteria(jobId, payload);

            showToast({
                type: "success",
                title: "Success",
                description: response?.message || (isUpdate ? "Criteria updated successfully" : "Criteria set successfully"),
            });
            onSuccess?.();
        } catch (error: unknown) {
            const axiosErr = error as AxiosError<{ error?: string; message?: string }>;
            const errorMsg =
                axiosErr?.response?.data?.error ||
                axiosErr?.response?.data?.message ||
                (error instanceof Error ? error.message : "Something went wrong");
            showToast({ type: "error", title: "Error", description: errorMsg });
        } finally {
            setLoading(false);
        }
    }, [formData, toggles, jobId, isUpdate, onSuccess]);

    return {
        formData,
        toggles,
        errors,
        loading,
        isUpdate,
        handleChange,
        handleToggle,
        handleMultiSelect,
        handleSubmit,
        loadExisting,
        resetForm,
    };
};
