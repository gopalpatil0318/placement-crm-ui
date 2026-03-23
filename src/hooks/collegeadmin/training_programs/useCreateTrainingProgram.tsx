import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { createTrainingProgramSchema, type CreateTrainingProgramInput } from "@/validators/TrainingProgramSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

type FormErrors = Partial<Record<keyof CreateTrainingProgramInput, string>>;

const INITIAL_FORM: CreateTrainingProgramInput = {
    program_name: "",
    program_type: "" as CreateTrainingProgramInput["program_type"],
    program_description: "",
    trainer_name: "",
    trainer_organization: "",
    start_date: "",
    end_date: "",
    total_sessions: "",
    session_duration_hours: "",
    target_dept_ids: [],
    target_passout_year: "",
    max_enrollment: "",
    enrollment_deadline: "",
};

// ========================
// HOOK
// ========================

export const useCreateTrainingProgram = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<CreateTrainingProgramInput>({ ...INITIAL_FORM });
    const [errors, setErrors] = useState<FormErrors>({});

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            CollegeAdminService.createTrainingProgram(payload as Parameters<typeof CollegeAdminService.createTrainingProgram>[0]),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.all() });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Training program created successfully",
            });
            navigate("/college/training-programs");
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong, please try again";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ program_name: message });
                setStep(1);
            }

            showToast({ type: "error", title: "Error Creating Program", description: message });
        },
    });

    const handleChange = useCallback(
        (name: string, value: unknown) => {
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof CreateTrainingProgramInput]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const handleNext = useCallback(() => {
        setStep((s) => Math.min(s + 1, 3));
    }, []);

    const handleBack = useCallback(() => {
        setStep((s) => Math.max(s - 1, 1));
    }, []);

    const handleSubmit = useCallback(() => {
        const result = createTrainingProgramSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof CreateTrainingProgramInput;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);

            // Navigate to the step that has the first error
            const firstErrorField = result.error.issues[0]?.path[0] as string;
            if (["program_name", "program_type", "program_description"].includes(firstErrorField)) {
                setStep(1);
            } else if (["trainer_name", "trainer_organization", "total_sessions", "session_duration_hours"].includes(firstErrorField)) {
                setStep(2);
            } else {
                setStep(3);
            }

            showToast({
                type: "warning",
                title: "Validation Failed",
                description: result.error.issues[0].message,
            });
            return;
        }

        setErrors({});

        // Build API payload — convert strings to numbers, strip empty strings
        const payload: Record<string, unknown> = {
            program_name: formData.program_name.trim(),
            program_type: formData.program_type,
        };

        if (formData.program_description) payload.program_description = formData.program_description;
        if (formData.trainer_name) payload.trainer_name = formData.trainer_name.trim();
        if (formData.trainer_organization) payload.trainer_organization = formData.trainer_organization.trim();
        if (formData.start_date) payload.start_date = formData.start_date;
        if (formData.end_date) payload.end_date = formData.end_date;
        if (formData.total_sessions) payload.total_sessions = Number(formData.total_sessions);
        if (formData.session_duration_hours) payload.session_duration_hours = Number(formData.session_duration_hours);
        if (formData.target_dept_ids && formData.target_dept_ids.length > 0) payload.target_dept_ids = formData.target_dept_ids;
        if (formData.target_passout_year) payload.target_passout_year = Number(formData.target_passout_year);
        if (formData.max_enrollment) payload.max_enrollment = Number(formData.max_enrollment);
        if (formData.enrollment_deadline) payload.enrollment_deadline = formData.enrollment_deadline;

        mutation.mutate(payload);
    }, [formData, mutation]);

    const handleCancel = useCallback(() => {
        navigate("/college/training-programs");
    }, [navigate]);

    return {
        step,
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleNext,
        handleBack,
        handleSubmit,
        handleCancel,
    };
};
