import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { setCriteriaSchema } from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

export interface CriteriaFormData {
    min_overall_cgpa: number | "";
    max_live_kts: number | "";
    min_tenth_percentage: number | "";
    min_twelfth_percentage: number | "";
    min_diploma_percentage: number | "";
    min_existing_package: number | "";
    max_existing_package: number | "";
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
    min_existing_package: boolean;
    max_existing_package: boolean;
    allowed_genders: boolean;
    allowed_departments: boolean;
    allowed_gap_statuses: boolean;
    exclude_already_placed: boolean;
}

const INITIAL_FORM: CriteriaFormData = {
    min_overall_cgpa: 7,
    max_live_kts: 0,
    min_tenth_percentage: 60,
    min_twelfth_percentage: 55,
    min_diploma_percentage: 60,
    min_existing_package: "",
    max_existing_package: "",
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
    min_existing_package: false,
    max_existing_package: false,
    allowed_genders: false,
    allowed_departments: false,
    allowed_gap_statuses: false,
    exclude_already_placed: false,
};

const NUMERIC_FIELDS = [
    "min_overall_cgpa",
    "max_live_kts",
    "min_tenth_percentage",
    "min_twelfth_percentage",
    "min_diploma_percentage",
    "min_existing_package",
    "max_existing_package",
] as const;

const ARRAY_FIELDS = [
    "allowed_genders",
    "allowed_departments",
    "allowed_gap_statuses",
] as const;

// ========================
// HOOK
// ========================

export const useSetJobCriteria = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CriteriaFormData>(INITIAL_FORM);
    const [toggles, setToggles] = useState<CriteriaToggles>(INITIAL_TOGGLES);
    const [errors, setErrors] = useState<Record<string, string>>({});
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
            setErrors((prev) => {
                if (!prev[name]) return prev;
                const next = { ...prev };
                delete next[name];
                return next;
            });
        },
        []
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
            if (criteria.min_existing_package != null) {
                newForm.min_existing_package = Number(criteria.min_existing_package);
                newToggles.min_existing_package = true;
            }
            if (criteria.max_existing_package != null) {
                newForm.max_existing_package = Number(criteria.max_existing_package);
                newToggles.max_existing_package = true;
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

    const mutation = useMutation({
        mutationFn: ({ payload, isUpdate }: { payload: Record<string, unknown>; isUpdate: boolean }) =>
            isUpdate
                ? CollegeAdminService.updateJobCriteria(jobId, payload)
                : CollegeAdminService.setJobCriteria(jobId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.criteria(jobId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || (isUpdate ? "Criteria updated successfully" : "Criteria set successfully"),
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                showToast({ type: "error", title: "Conflict", description: message });
            } else if (status === 404) {
                showToast({ type: "error", title: "Not Found", description: message || "No eligibility criteria found. Please set criteria first." });
            } else {
                showToast({ type: "error", title: "Error", description: message });
            }
        },
    });

    const buildPayload = useCallback(() => {
        const payload: Record<string, unknown> = {};
        const emptyErrors: Record<string, string> = {};

        for (const field of NUMERIC_FIELDS) {
            if (!toggles[field]) continue;
            if (formData[field] === "") {
                emptyErrors[field] = "This field is required when enabled";
            } else {
                payload[field] = formData[field];
            }
        }

        for (const field of ARRAY_FIELDS) {
            if (toggles[field]) payload[field] = formData[field];
        }

        if (toggles.exclude_already_placed) {
            payload.exclude_already_placed = formData.exclude_already_placed;
        }

        return { payload, emptyErrors };
    }, [formData, toggles]);

    const validatePayload = useCallback((payload: Record<string, unknown>) => {
        const result = setCriteriaSchema.safeParse(payload);
        if (result.success) return null;

        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
            const field = String(issue.path[0]);
            if (!fieldErrors[field]) fieldErrors[field] = issue.message;
        }
        return { fieldErrors, firstMessage: result.error.issues[0].message };
    }, []);

    // Build a payload that clears all criteria (all nulls + exclude_already_placed: false)
    const buildClearPayload = useCallback((): Record<string, unknown> => {
        const p: Record<string, unknown> = {};
        for (const field of NUMERIC_FIELDS) p[field] = null;
        for (const field of ARRAY_FIELDS) p[field] = null;
        p.exclude_already_placed = false;
        return p;
    }, []);

    // Inject null for every toggled-OFF field so backend clears stale DB values
    const injectDisabledNulls = useCallback((payload: Record<string, unknown>) => {
        for (const field of NUMERIC_FIELDS) {
            if (!toggles[field]) payload[field] = null;
        }
        for (const field of ARRAY_FIELDS) {
            if (!toggles[field]) payload[field] = null;
        }
        if (!toggles.exclude_already_placed) {
            payload.exclude_already_placed = false;
        }
    }, [toggles]);

    const handleSubmit = useCallback(() => {
        const { payload, emptyErrors } = buildPayload();
        const hasPayload = Object.keys(payload).length > 0;
        const hasErrors = Object.keys(emptyErrors).length > 0;

        // On update with ALL toggles off: send explicit nulls to clear every criterion
        if (isUpdate && !hasPayload && !hasErrors) {
            setErrors({});
            mutation.mutate({ payload: buildClearPayload(), isUpdate });
            return;
        }

        if (!hasPayload && !hasErrors) {
            showToast({ type: "warning", title: "No Criteria Selected", description: "Enable and configure at least one eligibility criterion" });
            return;
        }

        if (hasErrors) {
            setErrors(emptyErrors);
            showToast({ type: "warning", title: "Validation Failed", description: Object.values(emptyErrors)[0] });
            return;
        }

        const validationError = validatePayload(payload);
        if (validationError) {
            setErrors(validationError.fieldErrors);
            showToast({ type: "warning", title: "Validation Failed", description: validationError.firstMessage });
            return;
        }

        if (isUpdate) injectDisabledNulls(payload);

        setErrors({});
        mutation.mutate({ payload, isUpdate });
    }, [buildPayload, buildClearPayload, injectDisabledNulls, validatePayload, isUpdate, mutation]);

    return {
        formData,
        toggles,
        errors,
        loading: mutation.isPending,
        isUpdate,
        handleChange,
        handleToggle,
        handleMultiSelect,
        handleSubmit,
        loadExisting,
        resetForm,
    };
};
