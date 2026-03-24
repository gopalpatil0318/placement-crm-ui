import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { updateTrainingProgramSchema, type UpdateTrainingProgramInput } from "@/validators/TrainingProgramSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

type FormErrors = Partial<Record<keyof UpdateTrainingProgramInput, string>>;

// ========================
// HOOK
// ========================

export const useUpdateTrainingProgram = (programId: string | undefined) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<UpdateTrainingProgramInput>({
        program_name: "",
        program_type: undefined,
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
    });
    const originalData = useRef<UpdateTrainingProgramInput | null>(null);
    const [fetchedProgramName, setFetchedProgramName] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    // ── Fetch existing data ──
    const { data: queryData, isLoading: fetching, error: queryFetchError } = useQuery({
        queryKey: queryKeys.trainingPrograms.detail(programId!),
        queryFn: () => CollegeAdminService.getTrainingProgram(programId!),
        enabled: !!programId,
    });

    useEffect(() => {
        const program = queryData?.data ?? queryData;
        if (program && !originalData.current) {
            const loaded: UpdateTrainingProgramInput = {
                program_name: program.program_name || "",
                program_type: program.program_type || undefined,
                program_description: program.program_description || "",
                trainer_name: program.trainer_name || "",
                trainer_organization: program.trainer_organization || "",
                start_date: program.start_date || "",
                end_date: program.end_date || "",
                total_sessions: program.total_sessions != null ? String(program.total_sessions) : "",
                session_duration_hours: program.session_duration_hours != null ? String(program.session_duration_hours) : "",
                target_dept_ids: program.target_dept_ids || [],
                target_passout_year: program.target_passout_year != null ? String(program.target_passout_year) : "",
                max_enrollment: program.max_enrollment != null ? String(program.max_enrollment) : "",
                enrollment_deadline: program.enrollment_deadline || "",
            };
            setFormData(loaded);
            originalData.current = loaded;
            setFetchedProgramName(program.program_name || "");
        }
    }, [queryData]);

    const fetchError = !programId
        ? "Program ID not found"
        : queryFetchError
            ? (queryFetchError instanceof Error ? queryFetchError.message : "Failed to fetch program details")
            : null;

    useEffect(() => {
        if (fetchError) showToast({ type: "error", title: "Fetch Error", description: fetchError });
    }, [fetchError]);

    // ── Mutation ──
    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            CollegeAdminService.updateTrainingProgram(programId!, payload as Parameters<typeof CollegeAdminService.updateTrainingProgram>[1]),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.detail(programId!) });
            showToast({ type: "success", title: "Success", description: response?.message || "Program updated successfully" });
            navigate(`/college/training-program/${programId}`);
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong, please try again";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ program_name: message });
                setStep(1);
            }

            if (status === 400 && message.toLowerCase().includes("cancelled")) {
                showToast({ type: "error", title: "Program Cancelled", description: "This program has been cancelled and cannot be edited." });
                navigate(`/college/training-program/${programId}`);
                return;
            }

            showToast({ type: "error", title: "Error Updating Program", description: message });
        },
    });

    const handleChange = useCallback(
        (name: string, value: unknown) => {
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof UpdateTrainingProgramInput]) return prev;
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
        if (!programId) return;

        const result = updateTrainingProgramSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof UpdateTrainingProgramInput;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);

            const firstErrorField = result.error.issues[0]?.path[0] as string;
            if (["program_name", "program_type", "program_description"].includes(firstErrorField)) {
                setStep(1);
            } else if (["trainer_name", "trainer_organization", "total_sessions", "session_duration_hours"].includes(firstErrorField)) {
                setStep(2);
            } else {
                setStep(3);
            }

            showToast({ type: "warning", title: "Validation Failed", description: result.error.issues[0].message });
            return;
        }

        // Build diff payload
        const orig = originalData.current;
        const payload: Record<string, unknown> = {};

        if (!orig || formData.program_name?.trim() !== orig.program_name?.trim())
            payload.program_name = formData.program_name?.trim();
        if (!orig || formData.program_description !== orig.program_description)
            payload.program_description = formData.program_description || undefined;
        if (!orig || formData.program_type !== orig.program_type)
            payload.program_type = formData.program_type;
        if (!orig || formData.trainer_name !== orig.trainer_name)
            payload.trainer_name = formData.trainer_name?.trim() || undefined;
        if (!orig || formData.trainer_organization !== orig.trainer_organization)
            payload.trainer_organization = formData.trainer_organization?.trim() || undefined;
        if (!orig || formData.start_date !== orig.start_date)
            payload.start_date = formData.start_date || undefined;
        if (!orig || formData.end_date !== orig.end_date)
            payload.end_date = formData.end_date || undefined;
        if (!orig || formData.total_sessions !== orig.total_sessions)
            payload.total_sessions = formData.total_sessions ? Number(formData.total_sessions) : undefined;
        if (!orig || formData.session_duration_hours !== orig.session_duration_hours)
            payload.session_duration_hours = formData.session_duration_hours ? Number(formData.session_duration_hours) : undefined;
        if (!orig || JSON.stringify(formData.target_dept_ids) !== JSON.stringify(orig.target_dept_ids))
            payload.target_dept_ids = formData.target_dept_ids && formData.target_dept_ids.length > 0 ? formData.target_dept_ids : undefined;
        if (!orig || formData.target_passout_year !== orig.target_passout_year)
            payload.target_passout_year = formData.target_passout_year ? Number(formData.target_passout_year) : undefined;
        if (!orig || formData.max_enrollment !== orig.max_enrollment)
            payload.max_enrollment = formData.max_enrollment ? Number(formData.max_enrollment) : undefined;
        if (!orig || formData.enrollment_deadline !== orig.enrollment_deadline)
            payload.enrollment_deadline = formData.enrollment_deadline || undefined;

        // Remove undefined values
        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([, v]) => v !== undefined),
        );

        if (Object.keys(cleanPayload).length === 0) {
            showToast({ type: "warning", title: "No Changes", description: "Nothing has been changed." });
            return;
        }

        setErrors({});
        mutation.mutate(cleanPayload);
    }, [formData, programId, mutation]);

    const handleCancel = useCallback(() => {
        if (programId) {
            navigate(`/college/training-program/${programId}`);
        } else {
            navigate("/college/training-programs");
        }
    }, [programId, navigate]);

    return {
        step,
        formData,
        fetchedProgramName,
        errors,
        loading: mutation.isPending,
        fetching,
        fetchError,
        handleChange,
        handleNext,
        handleBack,
        handleSubmit,
        handleCancel,
    };
};
