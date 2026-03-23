import { useState, useCallback } from "react";
import { type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { addRoundResultSchema } from "@/validators/RoundResultSchema";

// ========================
// TYPES
// ========================

export interface AddRoundResultFormData {
    application_id: string;
    result_status: string;
    score: string;
    remarks: string;
    attended: boolean;
    scheduled_at: string;
    completed_at: string;
}

type FormErrors = Partial<Record<keyof AddRoundResultFormData, string>>;

const INITIAL_FORM: AddRoundResultFormData = {
    application_id: "",
    result_status: "",
    score: "",
    remarks: "",
    attended: false,
    scheduled_at: "",
    completed_at: "",
};

// ========================
// HOOK
// ========================

export const useAddRoundResult = (roundId: string, onSuccess?: () => void) => {
    const [formData, setFormData] = useState<AddRoundResultFormData>({ ...INITIAL_FORM });
    const [errors, setErrors] = useState<FormErrors>({});
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            CollegeAdminService.addRoundResult(roundId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.roundResults(roundId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Round result added successfully",
            });
            setFormData({ ...INITIAL_FORM });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ application_id: message });
            }

            showToast({
                type: "error",
                title: status === 404 ? "Not Found" : status === 400 ? "Invalid Action" : "Error",
                description: message,
            });
        },
    });

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
            setErrors((prev) => {
                if (!prev[name as keyof AddRoundResultFormData]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const handleSubmit = useCallback(() => {
        if (mutation.isPending) return;

        // Build payload — convert score to number, strip empty optionals
        const payload: Record<string, unknown> = {
            application_id: formData.application_id.trim(),
        };

        if (formData.result_status) {
            payload.result_status = formData.result_status;
        }
        if (formData.score !== "") {
            payload.score = Number(formData.score);
        }
        if (formData.remarks.trim()) {
            payload.remarks = formData.remarks.trim();
        }
        if (formData.attended) {
            payload.attended = true;
        }
        if (formData.scheduled_at) {
            payload.scheduled_at = formData.scheduled_at;
        }
        if (formData.completed_at) {
            payload.completed_at = formData.completed_at;
        }

        // Zod validation
        const result = addRoundResultSchema.safeParse(payload);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof AddRoundResultFormData;
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
        mutation.mutate(payload);
    }, [formData, mutation]);

    const reset = useCallback(() => {
        setFormData({ ...INITIAL_FORM });
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleSubmit,
        reset,
    };
};
