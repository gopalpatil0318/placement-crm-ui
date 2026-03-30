import { useState, useCallback, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { addRoundSchema } from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

export interface AddRoundFormData {
    round_name: string;
    round_description: string;
    round_type: string;
    round_date: string;
    round_venue: string;
}

const INITIAL_FORM: AddRoundFormData = {
    round_name: "",
    round_description: "",
    round_type: "",
    round_date: "",
    round_venue: "",
};

// ========================
// HOOK
// ========================

export const useAddRound = (jobId: string, onSuccess?: () => void) => {
    const [formData, setFormData] = useState<AddRoundFormData>(INITIAL_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name]) return prev;
                const next = { ...prev };
                delete next[name];
                return next;
            });
        },
        []
    );

    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM);
        setErrors({});
    }, []);

    const isDirty = useMemo(() => {
        return Object.keys(INITIAL_FORM).some(
            (key) => formData[key as keyof AddRoundFormData] !== INITIAL_FORM[key as keyof AddRoundFormData]
        );
    }, [formData]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const mutation = useMutation({
        mutationFn: (payload: {
            round_name: string;
            round_description?: string;
            round_type?: string;
            round_date?: string;
            round_venue?: string;
        }) =>
            CollegeAdminService.addJobRound(jobId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.rounds(jobId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Selection round added successfully",
            });
            resetForm();
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ round_name: message });
            }

            showToast({
                type: "error",
                title: status === 400 ? "Invalid Action" : status === 404 ? "Not Found" : "Error",
                description: message,
            });
        },
    });

    const handleSubmit = useCallback(() => {
        // Build validation data — only include non-empty optional fields
        const validationData: Record<string, unknown> = {
            round_name: formData.round_name.trim(),
        };
        if (formData.round_description.trim()) validationData.round_description = formData.round_description.trim();
        if (formData.round_type) validationData.round_type = formData.round_type;
        if (formData.round_date) validationData.round_date = formData.round_date;
        if (formData.round_venue.trim()) validationData.round_venue = formData.round_venue.trim();

        const result = addRoundSchema.safeParse(validationData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const field = String(issue.path[0]);
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
        mutation.mutate(validationData as { round_name: string; round_description?: string; round_type?: string; round_date?: string; round_venue?: string });
    }, [formData, mutation]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleSubmit,
        resetForm,
        isDirty,
    };
};
