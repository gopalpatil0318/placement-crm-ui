import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { addPositionSchema } from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

interface AddPositionFormData {
    position_name: string;
    position_description: string;
    vacancies: number | "";
}

type FormErrors = Partial<Record<keyof AddPositionFormData, string>>;

const INITIAL_FORM: AddPositionFormData = {
    position_name: "",
    position_description: "",
    vacancies: 1,
};

// ========================
// HOOK
// ========================

export const useAddPosition = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<AddPositionFormData>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});

    const mutation = useMutation({
        mutationFn: (payload: { position_name: string; position_description?: string; vacancies?: number }) =>
            CollegeAdminService.addJobPosition(jobId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.positions(jobId) });
            showToast({ type: "success", title: "Success", description: response?.message || "Position added successfully" });
            resetForm();
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;
            if (status === 409) {
                setErrors({ position_name: message });
            }
            showToast({ type: "error", title: "Error", description: message });
        },
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
            }));
            setErrors((prev) => {
                if (!prev[name as keyof AddPositionFormData]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM);
        setErrors({});
    }, []);

    const handleSubmit = useCallback(async () => {
        // Build parse-ready object: trim name, coerce vacancies
        const parseData = {
            position_name: formData.position_name.trim(),
            position_description: formData.position_description,
            vacancies: formData.vacancies === "" ? undefined : formData.vacancies,
        };

        const result = addPositionSchema.safeParse(parseData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof AddPositionFormData;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            }
            setErrors(fieldErrors);
            showToast({ type: "warning", title: "Validation Failed", description: result.error.issues[0].message });
            return;
        }
        setErrors({});

        const payload: { position_name: string; position_description?: string; vacancies?: number } = {
            position_name: parseData.position_name,
        };
        if (formData.position_description.trim()) {
            payload.position_description = formData.position_description.trim();
        }
        if (parseData.vacancies !== undefined) {
            payload.vacancies = parseData.vacancies;
        }

        mutation.mutate(payload);
    }, [formData, mutation]);

    return { formData, errors, loading: mutation.isPending, handleChange, handleSubmit, resetForm };
};
