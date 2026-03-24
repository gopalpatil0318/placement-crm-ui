import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { createSkillSchema } from "@/validators/SkillSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

interface CreateSkillForm {
    skill_name: string;
    skill_category: string;
}

type FormErrors = Partial<Record<keyof CreateSkillForm, string>>;

const INITIAL_FORM: CreateSkillForm = {
    skill_name: "",
    skill_category: "",
};

// ========================
// HOOK
// ========================

export const useCreateSkill = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateSkillForm>({ ...INITIAL_FORM });
    const [errors, setErrors] = useState<FormErrors>({});

    const mutation = useMutation({
        mutationFn: (payload: { skill_name: string; skill_category?: string }) =>
            CollegeAdminService.createSkill(payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.skills.all() });
            showToast({
                type: "success",
                title: "Skill Added",
                description: response?.message || "Skill added successfully",
            });
            resetForm();
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong, please try again";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ skill_name: message });
            }

            showToast({ type: "error", title: "Error Adding Skill", description: message });
        },
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof CreateSkillForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const result = createSkillSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof CreateSkillForm;
                    if (!fieldErrors[field]) {
                        fieldErrors[field] = issue.message;
                    }
                }
                setErrors(fieldErrors);
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: result.error.issues[0].message,
                });
                return;
            }

            setErrors({});
            const payload: { skill_name: string; skill_category?: string } = {
                skill_name: result.data.skill_name,
            };
            if (result.data.skill_category) {
                payload.skill_category = result.data.skill_category;
            }
            mutation.mutate(payload);
        },
        [formData, mutation],
    );

    const resetForm = useCallback(() => {
        setFormData({ ...INITIAL_FORM });
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleSubmit,
        resetForm,
        setFormData,
    };
};
