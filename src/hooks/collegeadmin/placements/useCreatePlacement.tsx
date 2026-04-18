import { useState, useCallback, useEffect, useMemo } from "react";
import { type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
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
    joining_letter_url: string;
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
    joining_letter_url: "",
};

// ========================
// HELPERS
// ========================

function buildCreatePayload(formData: CreatePlacementForm): Record<string, unknown> {
    const payload: Record<string, unknown> = {
        application_id: formData.application_id.trim(),
        placement_type: formData.placement_type,
    };

    const isFullTime = formData.placement_type === "full-time" || formData.placement_type === "both";
    const isInternship = formData.placement_type === "internship" || formData.placement_type === "both";

    if (isFullTime) {
        if (formData.fulltime_package)
            payload.fulltime_package = Number(formData.fulltime_package);
        if (formData.fulltime_designation.trim())
            payload.fulltime_designation = formData.fulltime_designation.trim();
        if (formData.fulltime_joining_date)
            payload.fulltime_joining_date = formData.fulltime_joining_date;
    }

    if (isInternship) {
        if (formData.internship_stipend)
            payload.internship_stipend = Number(formData.internship_stipend);
        if (formData.internship_duration.trim())
            payload.internship_duration = formData.internship_duration.trim();
        if (formData.internship_start_date)
            payload.internship_start_date = formData.internship_start_date;
    }

    if (formData.offer_letter_url.trim())
        payload.offer_letter_url = formData.offer_letter_url.trim();

    if (formData.joining_letter_url.trim())
        payload.joining_letter_url = formData.joining_letter_url.trim();

    return payload;
}

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
            // eslint-disable-next-line react-hooks/set-state-in-effect -- prop sync
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

            if (status === 409 || status === 404) {
                setErrors({ application_id: message });
            }
            showToast({
                type: "error",
                title: getErrorTitle(status),
                description: message,
            });
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

    // ── Unsaved-changes guard ──
    const initialRef = useMemo(
        () => ({ ...INITIAL_FORM, application_id: prefilledApplicationId || "" }),
        [prefilledApplicationId],
    );

    const isDirty = useMemo(() => {
        return (Object.keys(INITIAL_FORM) as (keyof CreatePlacementForm)[]).some(
            (key) => formData[key] !== initialRef[key],
        );
    }, [formData, initialRef]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

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

        mutation.mutate(buildCreatePayload(formData));
    }, [formData, mutation]);

    return {
        formData,
        errors,
        isDirty,
        loading: mutation.isPending,
        handleChange,
        handleSubmit,
        reset,
    };
};
