import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import { addRestrictionSchema, type RestrictionType } from "@/validators/RestrictionSchema";

interface AddRestrictionForm {
    restriction_type: RestrictionType | "";
    reason: string;
    details: string;
    valid_until: string;
}

type FormErrors = Partial<Record<keyof AddRestrictionForm, string>>;

export const useAddRestriction = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<AddRestrictionForm>({
        restriction_type: "",
        reason: "",
        details: "",
        valid_until: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const mutation = useMutation({
        mutationFn: (payload: {
            studentId: string;
            data: {
                restriction_type: string;
                reason: string;
                details?: string;
                valid_until?: string;
            };
        }) => CollegeAdminService.addStudentRestriction(payload.studentId, payload.data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.restrictions.all() });
            showToast({
                type: "success",
                title: "Restriction Applied",
                description: response?.message || "Student restriction applied successfully",
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ restriction_type: message });
            }
            if (status === 400) {
                setErrors({ valid_until: message });
            }

            showToast({ type: "error", title: "Error", description: message });
        },
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof AddRestrictionForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const handleSubmit = useCallback(
        (studentId: string) => {
            const result = addRestrictionSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof AddRestrictionForm;
                    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
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

            // Validate future date if provided
            if (formData.valid_until) {
                const selected = new Date(formData.valid_until);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selected < today) {
                    setErrors({ valid_until: "Valid until date must be today or in the future" });
                    showToast({
                        type: "warning",
                        title: "Validation Failed",
                        description: "Valid until date must be today or in the future",
                    });
                    return;
                }
            }

            mutation.mutate({
                studentId,
                data: {
                    restriction_type: formData.restriction_type,
                    reason: formData.reason.trim(),
                    details: formData.details.trim() || undefined,
                    valid_until: formData.valid_until || undefined,
                },
            });
        },
        [formData, mutation],
    );

    const resetForm = useCallback(() => {
        setFormData({ restriction_type: "", reason: "", details: "", valid_until: "" });
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleSubmit,
        resetForm,
    };
};
