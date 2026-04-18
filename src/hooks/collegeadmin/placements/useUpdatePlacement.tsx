import { useState, useCallback, useMemo, useEffect } from "react";
import { type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { updatePlacementSchema } from "@/validators/PlacementSchema";
import { queryKeys } from "@/lib/queryKeys";
import { type PlacementListItem } from "./useViewPlacements";

// ========================
// TYPES
// ========================

interface UpdatePlacementForm {
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

type FormErrors = Partial<Record<keyof UpdatePlacementForm, string>>;

const INITIAL_FORM: UpdatePlacementForm = {
    placement_type: "",
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

function buildDiffPayload(
    formData: UpdatePlacementForm,
    orig: UpdatePlacementForm | null,
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (orig?.placement_type !== formData.placement_type && formData.placement_type) {
        payload.placement_type = formData.placement_type;
    }
    if (orig?.fulltime_package !== formData.fulltime_package) {
        payload.fulltime_package =
            formData.fulltime_package === "" ? null : Number(formData.fulltime_package);
    }
    if (orig?.fulltime_designation.trim() !== formData.fulltime_designation.trim()) {
        payload.fulltime_designation = formData.fulltime_designation.trim() || null;
    }
    if (orig?.fulltime_joining_date !== formData.fulltime_joining_date) {
        payload.fulltime_joining_date = formData.fulltime_joining_date || null;
    }
    if (orig?.internship_stipend !== formData.internship_stipend) {
        payload.internship_stipend =
            formData.internship_stipend === "" ? null : Number(formData.internship_stipend);
    }
    if (orig?.internship_duration.trim() !== formData.internship_duration.trim()) {
        payload.internship_duration = formData.internship_duration.trim() || null;
    }
    if (orig?.internship_start_date !== formData.internship_start_date) {
        payload.internship_start_date = formData.internship_start_date || null;
    }
    if (orig?.offer_letter_url.trim() !== formData.offer_letter_url.trim()) {
        payload.offer_letter_url = formData.offer_letter_url.trim() || null;
    }
    if (orig?.joining_letter_url.trim() !== formData.joining_letter_url.trim()) {
        payload.joining_letter_url = formData.joining_letter_url.trim() || null;
    }

    return payload;
}

// ========================
// HOOK
// ========================

export const useUpdatePlacement = (onSuccess: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdatePlacementForm>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [placementId, setPlacementId] = useState<string | null>(null);
    const [originalData, setOriginalData] = useState<UpdatePlacementForm | null>(null);

    const mutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            CollegeAdminService.updatePlacement(id, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.placements.all() });
            if (placementId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.placements.detail(placementId) });
            }
            showToast({
                type: "success",
                title: "Success",
                description:
                    response?.message || "Placement updated successfully",
            });
            onSuccess();
        },
        onError: (err: unknown) => {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "Something went wrong";
            const status = err instanceof ApiError ? err.status : undefined;
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
                if (!prev[name as keyof UpdatePlacementForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const loadPlacement = useCallback((placement: PlacementListItem) => {
        setPlacementId(placement.placement_id);
        const form: UpdatePlacementForm = {
            placement_type: placement.placement_type || "",
            fulltime_package:
                placement.fulltime_package === null
                    ? ""
                    : String(placement.fulltime_package),
            fulltime_designation: placement.fulltime_designation || "",
            fulltime_joining_date: placement.fulltime_joining_date
                ? placement.fulltime_joining_date.split("T")[0]
                : "",
            internship_stipend:
                placement.internship_stipend === null
                    ? ""
                    : String(placement.internship_stipend),
            internship_duration: placement.internship_duration || "",
            internship_start_date: placement.internship_start_date
                ? placement.internship_start_date.split("T")[0]
                : "",
            offer_letter_url: placement.offer_letter_url || "",
            joining_letter_url: placement.joining_letter_url || "",
        };
        setFormData(form);
        setOriginalData({ ...form });
        setErrors({});
    }, []);

    const reset = useCallback(() => {
        setFormData(INITIAL_FORM);
        setErrors({});
        setPlacementId(null);
        setOriginalData(null);
    }, []);

    // ── Unsaved-changes guard ──
    const isDirty = useMemo(() => {
        if (!originalData) return false;
        return (Object.keys(INITIAL_FORM) as (keyof UpdatePlacementForm)[]).some(
            (key) => formData[key] !== originalData[key],
        );
    }, [formData, originalData]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const handleSubmit = useCallback(async () => {
        if (mutation.isPending || !placementId) return;

        const payload = buildDiffPayload(formData, originalData);

        if (Object.keys(payload).length === 0) {
            showToast({
                type: "warning",
                title: "No Changes",
                description: "Nothing has been changed.",
            });
            return;
        }

        // Zod validation on the diff payload (convert numbers back to strings for schema)
        const schemaInput: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(payload)) {
            if (val === null) schemaInput[key] = "";
            else if (typeof val === "number") schemaInput[key] = String(val);
            else schemaInput[key] = val;
        }

        const result = updatePlacementSchema.safeParse(schemaInput);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof UpdatePlacementForm;
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

        mutation.mutate({ id: placementId, payload });
    }, [formData, placementId, mutation, originalData]);

    return {
        formData,
        errors,
        isDirty,
        loading: mutation.isPending,
        handleChange,
        handleSubmit,
        loadPlacement,
        reset,
    };
};
