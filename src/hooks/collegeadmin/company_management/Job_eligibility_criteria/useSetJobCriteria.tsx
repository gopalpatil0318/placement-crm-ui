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
    required_skills: { skill_id: string; skill_name?: string; skill_category?: string }[];
    min_skill_match_percentage: number | "";
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
    required_skills: boolean;
    min_skill_match_percentage: boolean;
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
    required_skills: [],
    min_skill_match_percentage: 100,
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
    required_skills: false,
    min_skill_match_percentage: false,
};

const NUMERIC_FIELDS = [
    "min_overall_cgpa",
    "max_live_kts",
    "min_tenth_percentage",
    "min_twelfth_percentage",
    "min_diploma_percentage",
    "min_existing_package",
    "max_existing_package",
    "min_skill_match_percentage",
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

            const loadNumber = (key: keyof CriteriaFormData & keyof typeof INITIAL_TOGGLES) => {
                if (criteria[key] != null) {
                    (newForm as Record<string, unknown>)[key] = Number(criteria[key]);
                    newToggles[key] = true;
                }
            };
            const loadArray = (key: keyof CriteriaFormData & keyof typeof INITIAL_TOGGLES) => {
                if (Array.isArray(criteria[key]) && (criteria[key] as unknown[]).length > 0) {
                    (newForm as Record<string, unknown>)[key] = criteria[key];
                    newToggles[key] = true;
                }
            };

            loadNumber("min_overall_cgpa");
            loadNumber("max_live_kts");
            loadNumber("min_tenth_percentage");
            loadNumber("min_twelfth_percentage");
            loadNumber("min_diploma_percentage");
            loadNumber("min_existing_package");
            loadNumber("max_existing_package");
            loadNumber("min_skill_match_percentage");

            loadArray("allowed_genders");
            loadArray("allowed_departments");
            loadArray("allowed_gap_statuses");
            loadArray("required_skills");

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

        // Skills — send as { skill_id }[] for API
        if (toggles.required_skills && formData.required_skills.length > 0) {
            payload.required_skills = formData.required_skills.map((s) => ({ skill_id: s.skill_id }));
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
        p.required_skills = [];
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
        if (!toggles.required_skills) {
            payload.required_skills = [];
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

    const addSkill = useCallback((skill: { skill_id: string; skill_name?: string; skill_category?: string }) => {
        setFormData((prev) => {
            if (prev.required_skills.some((s) => s.skill_id === skill.skill_id)) return prev;
            return { ...prev, required_skills: [...prev.required_skills, skill] };
        });
    }, []);

    const removeSkill = useCallback((skillId: string) => {
        setFormData((prev) => ({
            ...prev,
            required_skills: prev.required_skills.filter((s) => s.skill_id !== skillId),
        }));
    }, []);

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
        addSkill,
        removeSkill,
    };
};
