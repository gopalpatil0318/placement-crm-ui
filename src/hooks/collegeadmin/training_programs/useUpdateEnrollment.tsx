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
        sessions_attended: "",
        completion_status: undefined,
        completion_percentage: "",
        certificate_issued: undefined,
        certificate_url: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [editingEnrollmentId, setEditingEnrollmentId] = useState<string | null>(null);

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
        sessions_attended: number;
        completion_status: string;
        completion_percentage: number;
        certificate_issued: boolean;
        certificate_url: string | null;
    }) => {
        setEditingEnrollmentId(enrollment.enrollment_id);
        setFormData({
            sessions_attended: String(enrollment.sessions_attended),
            completion_status: enrollment.completion_status as UpdateEnrollmentInput["completion_status"],
            completion_percentage: String(enrollment.completion_percentage),
            certificate_issued: enrollment.certificate_issued,
            certificate_url: enrollment.certificate_url || "",
        });
        setErrors({});
    }, []);

    const handleClose = useCallback(() => {
        setEditingEnrollmentId(null);
        setFormData({
            sessions_attended: "",
            completion_status: undefined,
            completion_percentage: "",
            certificate_issued: undefined,
            certificate_url: "",
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
        if (!editingEnrollmentId) return;

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
        if (formData.sessions_attended !== "") payload.sessions_attended = Number(formData.sessions_attended);
        if (formData.completion_status) payload.completion_status = formData.completion_status;
        if (formData.completion_percentage !== "") payload.completion_percentage = Number(formData.completion_percentage);
        if (formData.certificate_issued !== undefined) payload.certificate_issued = formData.certificate_issued;
        if (formData.certificate_url) payload.certificate_url = formData.certificate_url;

        mutation.mutate({ enrollmentId: editingEnrollmentId, payload });
    }, [formData, editingEnrollmentId, mutation]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        isOpen: editingEnrollmentId !== null,
        editingEnrollmentId,
        handleOpen,
        handleClose,
        handleChange,
        handleSubmit,
    };
};
