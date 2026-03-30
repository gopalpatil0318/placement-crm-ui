import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import { updateRestrictionSchema, type StudentRestriction } from "@/validators/RestrictionSchema";

interface UpdateRestrictionForm {
    reason: string;
    details: string;
    valid_until: string;
}

type FormErrors = Partial<Record<keyof UpdateRestrictionForm, string>>;

export const useUpdateRestriction = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateRestrictionForm>({
        reason: "",
        details: "",
        valid_until: "",
    });
    const originalData = useRef<UpdateRestrictionForm | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    const mutation = useMutation({
        mutationFn: (payload: {
            restrictionId: string;
            data: Record<string, unknown>;
        }) => CollegeAdminService.updateRestriction(payload.restrictionId, payload.data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.restrictions.all() });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Restriction updated successfully",
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 400) {
                setErrors({ valid_until: message });
            }

            showToast({ type: "error", title: getErrorTitle(status), description: message });
        },
    });

    const loadRestriction = useCallback((restriction: StudentRestriction) => {
        const loaded: UpdateRestrictionForm = {
            reason: restriction.reason || "",
            details: restriction.details || "",
            valid_until: restriction.valid_until
                ? restriction.valid_until.split("T")[0]
                : "",
        };
        setFormData(loaded);
        originalData.current = loaded;
        setErrors({});
    }, []);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof UpdateRestrictionForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const handleSubmit = useCallback(
        (restrictionId: string, studentId?: string) => {
            const result = updateRestrictionSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof UpdateRestrictionForm;
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

            // Build diff payload
            const orig = originalData.current;
            const payload: Record<string, unknown> = {};

            if (formData.reason.trim() !== orig?.reason.trim()) {
                payload.reason = formData.reason.trim();
            }
            if (formData.details.trim() !== (orig?.details || "").trim()) {
                payload.details = formData.details.trim() || undefined;
            }
            if (formData.valid_until !== orig?.valid_until) {
                payload.valid_until = formData.valid_until || undefined;
            }

            if (Object.keys(payload).length === 0) {
                showToast({ type: "warning", title: "No Changes", description: "Nothing has been changed." });
                return;
            }

            setErrors({});
            mutation.mutate({ restrictionId, data: payload });

            // Also invalidate student-specific cache if we know the student
            if (studentId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.restrictions.student(studentId) });
                queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) });
            }
        },
        [formData, mutation, queryClient],
    );

    const handleResolve = useCallback(
        (restrictionId: string, studentId?: string) => {
            mutation.mutate(
                { restrictionId, data: { is_active: false } },
                {
                    onSuccess: (response) => {
                        queryClient.invalidateQueries({ queryKey: queryKeys.restrictions.all() });
                        if (studentId) {
                            queryClient.invalidateQueries({ queryKey: queryKeys.restrictions.student(studentId) });
                            queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) });
                        }
                        showToast({
                            type: "success",
                            title: "Restriction Resolved",
                            description: response?.message || "Restriction has been resolved",
                        });
                        onSuccess?.();
                    },
                },
            );
        },
        [mutation, queryClient, onSuccess],
    );

    const resetForm = useCallback(() => {
        setFormData({ reason: "", details: "", valid_until: "" });
        originalData.current = null;
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        loadRestriction,
        handleChange,
        handleSubmit,
        handleResolve,
        resetForm,
    };
};
