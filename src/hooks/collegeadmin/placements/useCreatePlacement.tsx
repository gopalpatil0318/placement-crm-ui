import { useState, useCallback, useEffect } from "react";
import { type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { createPlacementSchema } from "@/validators/PlacementSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

interface CreatePlacementForm {
    application_id: string;
    placement_type: string;
    fulltime_package: string;
    fulltime_designation: string;
    fulltime_joining_date: string;
    internship_stipend: string;
    internship_duration: string;
    internship_start_date: string;
    offer_letter_url: string;
}

type FormErrors = Partial<Record<keyof CreatePlacementForm, string>>;

const INITIAL_FORM: CreatePlacementForm = {
    application_id: "",
    placement_type: "full-time",
    fulltime_package: "",
    fulltime_designation: "",
    fulltime_joining_date: "",
    internship_stipend: "",
    internship_duration: "",
    internship_start_date: "",
    offer_letter_url: "",
};

// ========================
// HOOK
// ========================

export const useCreatePlacement = (onSuccess: () => void, prefilledApplicationId?: string) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreatePlacementForm>({
        ...INITIAL_FORM,
        application_id: prefilledApplicationId || "",
    });
    const [errors, setErrors] = useState<FormErrors>({});

    // Sync formData.application_id when prefilledApplicationId changes
    useEffect(() => {
        if (prefilledApplicationId) {
            setFormData((prev) => ({ ...prev, application_id: prefilledApplicationId }));
        }
    }, [prefilledApplicationId]);

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            CollegeAdminService.createPlacement(payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.placements.all() });
            showToast({
                type: "success",
                title: "Success",
                description:
                    response?.message || "Placement record created successfully",
            });
            reset();
            onSuccess();
        },
        onError: (err: unknown) => {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "Something went wrong";
            const status = err instanceof ApiError ? err.status : undefined;

            if (status === 409) {
                setErrors({ application_id: message });
                showToast({
                    type: "error",
                    title: "Duplicate Placement",
                    description: message,
                });
            } else if (status === 400) {
                showToast({
                    type: "error",
                    title: "Invalid Action",
                    description: message,
                });
            } else if (status === 404) {
                setErrors({ application_id: message });
                showToast({
                    type: "error",
                    title: "Not Found",
                    description: message,
                });
            } else {
                showToast({
                    type: "error",
                    title: "Error",
                    description: message,
                });
            }
        },
    });

    const handleChange = useCallback(
        (
            e: ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof CreatePlacementForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const reset = useCallback(() => {
        setFormData({ ...INITIAL_FORM, application_id: prefilledApplicationId || "" });
        setErrors({});
    }, [prefilledApplicationId]);

    const handleSubmit = useCallback(async () => {
        if (mutation.isPending) return;

        // Zod validation
        const result = createPlacementSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof CreatePlacementForm;
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

        // Build payload
        const payload: Record<string, unknown> = {
            application_id: formData.application_id.trim(),
            placement_type: formData.placement_type,
        };

        if (
            formData.placement_type === "full-time" ||
            formData.placement_type === "both"
        ) {
            if (formData.fulltime_package)
                payload.fulltime_package = Number(formData.fulltime_package);
            if (formData.fulltime_designation.trim())
                payload.fulltime_designation =
                    formData.fulltime_designation.trim();
            if (formData.fulltime_joining_date)
                payload.fulltime_joining_date = formData.fulltime_joining_date;
        }

        if (
            formData.placement_type === "internship" ||
            formData.placement_type === "both"
        ) {
            if (formData.internship_stipend)
                payload.internship_stipend = Number(formData.internship_stipend);
            if (formData.internship_duration.trim())
                payload.internship_duration =
                    formData.internship_duration.trim();
            if (formData.internship_start_date)
                payload.internship_start_date = formData.internship_start_date;
        }

        if (formData.offer_letter_url.trim())
            payload.offer_letter_url = formData.offer_letter_url.trim();

        mutation.mutate(payload);
    }, [formData, mutation]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleSubmit,
        reset,
    };
};
