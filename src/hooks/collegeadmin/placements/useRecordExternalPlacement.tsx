import { useState, useCallback } from "react";
import { type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface ExternalPlacementForm {
    student_id: string;
    company_id: string;
    job_id: string;
    job_title: string;
    job_location: string;
    drive_type: string;
    placement_type: string;
    fulltime_package: string;
    fulltime_designation: string;
    fulltime_joining_date: string;
    internship_stipend: string;
    internship_duration: string;
    internship_start_date: string;
    offer_letter_url: string;
    remarks: string;
    passout_year: string;
}

type FormErrors = Partial<Record<keyof ExternalPlacementForm, string>>;

const INITIAL_FORM: ExternalPlacementForm = {
    student_id: "",
    company_id: "",
    job_id: "",
    job_title: "",
    job_location: "",
    drive_type: "off_campus",
    placement_type: "full-time",
    fulltime_package: "",
    fulltime_designation: "",
    fulltime_joining_date: "",
    internship_stipend: "",
    internship_duration: "",
    internship_start_date: "",
    offer_letter_url: "",
    remarks: "",
    passout_year: "",
};

// ========================
// PAYLOAD BUILDER
// ========================

function addTrimmedField(payload: Record<string, unknown>, key: string, value: string): void {
    const trimmed = value.trim();
    if (trimmed) payload[key] = trimmed;
}

function buildPayload(formData: ExternalPlacementForm): Record<string, unknown> {
    const payload: Record<string, unknown> = {
        student_id: formData.student_id,
        company_id: formData.company_id,
        job_title: formData.job_title.trim(),
        job_location: formData.job_location.trim() || "External",
        drive_type: formData.drive_type,
        placement_type: formData.placement_type,
    };

    const isFullTime = formData.placement_type === "full-time" || formData.placement_type === "both";
    const isInternship = formData.placement_type === "internship" || formData.placement_type === "both";

    if (isFullTime) {
        if (formData.fulltime_package) payload.fulltime_package = Number(formData.fulltime_package);
        addTrimmedField(payload, "fulltime_designation", formData.fulltime_designation);
        if (formData.fulltime_joining_date) payload.fulltime_joining_date = formData.fulltime_joining_date;
    }

    if (isInternship) {
        if (formData.internship_stipend) payload.internship_stipend = Number(formData.internship_stipend);
        addTrimmedField(payload, "internship_duration", formData.internship_duration);
        if (formData.internship_start_date) payload.internship_start_date = formData.internship_start_date;
    }

    addTrimmedField(payload, "offer_letter_url", formData.offer_letter_url);
    addTrimmedField(payload, "remarks", formData.remarks);

    if (formData.job_id) payload.job_id = formData.job_id;
    if (formData.passout_year) payload.passout_year = Number(formData.passout_year);

    return payload;
}

// ========================
// VALIDATION
// ========================

function validate(formData: ExternalPlacementForm): FormErrors {
    const errors: FormErrors = {};

    if (!formData.student_id) errors.student_id = "Student is required";
    if (!formData.company_id) errors.company_id = "Company is required";
    if (!formData.job_title.trim()) errors.job_title = "Job title is required";
    if (formData.job_title.trim().length < 3) errors.job_title = "Job title must be at least 3 characters";

    const isFullTime = formData.placement_type === "full-time" || formData.placement_type === "both";
    const isInternship = formData.placement_type === "internship" || formData.placement_type === "both";

    if (isFullTime && !formData.fulltime_package) {
        errors.fulltime_package = "Package is required for full-time placements";
    }
    if (isInternship && !formData.internship_stipend) {
        errors.internship_stipend = "Stipend is required for internship placements";
    }

    return errors;
}

// ========================
// HOOK
// ========================

export const useRecordExternalPlacement = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<ExternalPlacementForm>({ ...INITIAL_FORM });
    const [errors, setErrors] = useState<FormErrors>({});

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            CollegeAdminService.recordExternalPlacement(payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.placements.all() });

            const data = response?.data;
            const withdrawnApps = data?.auto_withdrawal?.withdrawn_apps ?? 0;
            const revokedPlacements = data?.auto_withdrawal?.revoked_placements ?? 0;

            let description = response?.message || "External placement recorded successfully";
            if (withdrawnApps > 0 || revokedPlacements > 0) {
                description += `. Auto-withdrawn: ${withdrawnApps} applications, ${revokedPlacements} offers.`;
            }

            showToast({
                type: "success",
                title: "External Placement Recorded",
                description,
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const status = error instanceof ApiError ? error.status : undefined;
            const message = error instanceof ApiError ? error.message : "Failed to record external placement";
            showToast({
                type: "error",
                title: getErrorTitle(status),
                description: message,
            });
        },
    });

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
            setErrors((prev) => {
                if (!prev[name as keyof ExternalPlacementForm]) return prev;
                return { ...prev, [name]: "" };
            });
        },
        [],
    );

    const handleSubmit = useCallback(() => {
        if (mutation.isPending) return;

        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast({
                type: "warning",
                title: "Validation Failed",
                description: Object.values(validationErrors)[0] || "Please fix the errors",
            });
            return;
        }
        setErrors({});
        mutation.mutate(buildPayload(formData));
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
        setFormData,
    };
};
