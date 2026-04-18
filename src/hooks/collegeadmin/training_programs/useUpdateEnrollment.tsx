import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { updateEnrollmentSchema, type UpdateEnrollmentInput } from "@/validators/TrainingProgramSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

type FormErrors = Partial<Record<keyof UpdateEnrollmentInput, string>>;

// ========================
// HOOK
// ========================

export const useUpdateEnrollment = (programId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateEnrollmentInput>({
        completion_status: undefined,
        certificate_issued: undefined,
        certificate_url: "",
        payment_status: undefined,
        amount_paid: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [editingEnrollmentId, setEditingEnrollmentId] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<string | undefined>(undefined);

    const mutation = useMutation({
        mutationFn: ({ enrollmentId, payload }: { enrollmentId: string; payload: Record<string, unknown> }) =>
            CollegeAdminService.updateEnrollment(enrollmentId, payload as Parameters<typeof CollegeAdminService.updateEnrollment>[1]),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.enrollments(programId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.detail(programId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Enrollment updated successfully",
            });
            handleClose();
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong, please try again";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 400 && message.toLowerCase().includes("cancelled")) {
                showToast({ type: "error", title: "Program Cancelled", description: "Cannot update enrollment for a cancelled program." });
                handleClose();
                return;
            }

            showToast({ type: "error", title: getErrorTitle(status), description: message });
        },
    });

    const handleOpen = useCallback((enrollment: {
        enrollment_id: string;
        completion_status: string;
        certificate_issued: boolean;
        certificate_url: string | null;
        payment_status?: string;
        amount_paid?: number;
    }) => {
        setEditingEnrollmentId(enrollment.enrollment_id);
        setCurrentStatus(enrollment.completion_status);
        setFormData({
            completion_status: enrollment.completion_status as UpdateEnrollmentInput["completion_status"],
            certificate_issued: enrollment.certificate_issued,
            certificate_url: enrollment.certificate_url || "",
            payment_status: (enrollment.payment_status || undefined) as UpdateEnrollmentInput["payment_status"],
            amount_paid: enrollment.amount_paid ? String(enrollment.amount_paid) : "",
        });
        setErrors({});
    }, []);

    const handleClose = useCallback(() => {
        setEditingEnrollmentId(null);
        setCurrentStatus(undefined);
        setFormData({
            completion_status: undefined,
            certificate_issued: undefined,
            certificate_url: "",
            payment_status: undefined,
            amount_paid: "",
        });
        setErrors({});
    }, []);

    const handleChange = useCallback(
        (name: string, value: unknown) => {
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof UpdateEnrollmentInput]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const handleSubmit = useCallback(() => {
        if (!editingEnrollmentId || mutation.isPending) return;

        const result = updateEnrollmentSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof UpdateEnrollmentInput;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);
            showToast({ type: "warning", title: "Validation Failed", description: result.error.issues[0].message });
            return;
        }

        setErrors({});

        const payload: Record<string, unknown> = {};
        if (formData.completion_status) payload.completion_status = formData.completion_status;
        if (formData.certificate_issued !== undefined) payload.certificate_issued = formData.certificate_issued;
        if (formData.certificate_url) payload.certificate_url = formData.certificate_url;
        if (formData.payment_status) payload.payment_status = formData.payment_status;
        if (formData.amount_paid !== undefined && formData.amount_paid !== "") payload.amount_paid = Number(formData.amount_paid);

        mutation.mutate({ enrollmentId: editingEnrollmentId, payload });
    }, [formData, editingEnrollmentId, mutation]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        isOpen: editingEnrollmentId !== null,
        editingEnrollmentId,
        currentStatus,
        handleOpen,
        handleClose,
        handleChange,
        handleSubmit,
    };
};
