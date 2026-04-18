import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { updateSkillSchema } from "@/validators/SkillSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

interface UpdateSkillForm {
    skill_name: string;
    skill_category: string;
}

type FormErrors = Partial<Record<keyof UpdateSkillForm, string>>;

interface SkillToEdit {
    skill_id: string;
    skill_name: string;
    skill_category: string;
}

// ========================
// HOOK
// ========================

export const useUpdateSkill = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateSkillForm>({ skill_name: "", skill_category: "" });
    const [originalData, setOriginalData] = useState<UpdateSkillForm | null>(null);
    const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    const mutation = useMutation({
        mutationFn: (payload: { skillId: string; data: { skill_name?: string; skill_category?: string } }) =>
            CollegeAdminService.updateSkill(payload.skillId, payload.data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.skills.all() });
            showToast({
                type: "success",
                title: "Skill Updated",
                description: response?.message || "Skill updated successfully",
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

            showToast({ type: "error", title: getErrorTitle(status), description: message });
        },
    });

    const startEditing = useCallback((skill: SkillToEdit) => {
        setEditingSkillId(skill.skill_id);
        const data: UpdateSkillForm = {
            skill_name: skill.skill_name,
            skill_category: skill.skill_category,
        };
        setFormData(data);
        setOriginalData(data);
        setErrors({});
    }, []);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof UpdateSkillForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!editingSkillId || !originalData) return;

            const result = updateSkillSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof UpdateSkillForm;
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

            // Build diff payload — only send changed fields
            const payload: Record<string, string> = {};
            if (formData.skill_name.trim() !== originalData.skill_name.trim()) {
                payload.skill_name = formData.skill_name.trim();
            }
            if (formData.skill_category !== originalData.skill_category) {
                payload.skill_category = formData.skill_category;
            }

            if (Object.keys(payload).length === 0) {
                showToast({
                    type: "warning",
                    title: "No Changes",
                    description: "Nothing has been changed.",
                });
                return;
            }

            setErrors({});
            mutation.mutate({ skillId: editingSkillId, data: payload });
        },
        [formData, originalData, editingSkillId, mutation],
    );

    const resetForm = useCallback(() => {
        setFormData({ skill_name: "", skill_category: "" });
        setOriginalData(null);
        setEditingSkillId(null);
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        editingSkillId,
        handleChange,
        handleSubmit,
        startEditing,
        resetForm,
        setFormData,
    };
};
