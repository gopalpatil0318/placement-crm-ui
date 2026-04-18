import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { updateTrainingProgramSchema, type UpdateTrainingProgramInput } from "@/validators/TrainingProgramSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

type FormErrors = Partial<Record<keyof UpdateTrainingProgramInput, string>>;

// ========================
// HELPERS — extracted for cognitive complexity
// ========================

type FieldDef = {
    key: keyof UpdateTrainingProgramInput;
    transform?: (v: unknown) => unknown;
    compare?: (a: unknown, b: unknown) => boolean;
};

const DIFF_FIELDS: FieldDef[] = [
    { key: "program_name", transform: (v) => (v as string)?.trim() },
    { key: "program_description" },
    { key: "program_type" },
    { key: "trainer_name", transform: (v) => (v as string)?.trim() || undefined },
    { key: "trainer_organization", transform: (v) => (v as string)?.trim() || undefined },
    { key: "start_date", transform: (v) => v || undefined },
    { key: "end_date", transform: (v) => v || undefined },
    { key: "total_sessions", transform: (v) => (v ? Number(v) : undefined) },
    { key: "session_duration_hours", transform: (v) => (v ? Number(v) : undefined) },
    {
        key: "target_dept_ids",
        transform: (v) => {
            const arr = v as string[] | undefined;
            return arr && arr.length > 0 ? arr : undefined;
        },
        compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
    { key: "target_passout_year", transform: (v) => (v ? Number(v) : undefined) },
    { key: "max_enrollment", transform: (v) => (v ? Number(v) : undefined) },
    { key: "enrollment_deadline", transform: (v) => v || undefined },
    { key: "program_fee", transform: (v) => (v ? Number(v) : undefined) },
    { key: "min_attendance_pct", transform: (v) => (v ? Number(v) : undefined) },
];

function buildDiffPayload(
    formData: UpdateTrainingProgramInput,
    orig: UpdateTrainingProgramInput | null,
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const { key, transform, compare } of DIFF_FIELDS) {
        const newVal = formData[key];
        const origVal = orig?.[key];
        const isEqual = compare ? compare(newVal, origVal) : newVal === origVal;
        if (!orig || !isEqual) {
            payload[key] = transform ? transform(newVal) : newVal;
        }
    }
    return Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined),
    );
}

function getStepForField(field: string): number {
    if (["program_name", "program_type", "program_description"].includes(field)) return 1;
    if (["trainer_name", "trainer_organization", "total_sessions", "session_duration_hours", "program_fee", "min_attendance_pct"].includes(field)) return 2;
    return 3;
}

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
        program_fee: "",
        fee_currency: "",
        min_attendance_pct: "",
    });
    const [originalData, setOriginalData] = useState<UpdateTrainingProgramInput | null>(null);
    const [fetchedProgramName, setFetchedProgramName] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    // ── Fetch existing data ──
    const { data: queryData, isLoading: fetching, error: queryFetchError } = useQuery({
        queryKey: queryKeys.trainingPrograms.detail(programId!),
        queryFn: () => CollegeAdminService.getTrainingProgram(programId!),
        enabled: !!programId,
    });

    // Prefill form from fetched data — standard React Query → form initialization pattern
    /* eslint-disable react-hooks/set-state-in-effect -- one-time form initialization from query data */
    useEffect(() => {
        const program = queryData?.data ?? queryData;
        if (program && !originalData) {
            const loaded: UpdateTrainingProgramInput = {
                program_name: program.program_name || "",
                program_type: program.program_type || undefined,
                program_description: program.program_description || "",
                trainer_name: program.trainer_name || "",
                trainer_organization: program.trainer_organization || "",
                start_date: program.start_date || "",
                end_date: program.end_date || "",
                total_sessions: program.total_sessions == null ? "" : String(program.total_sessions),
                session_duration_hours: program.session_duration_hours == null ? "" : String(program.session_duration_hours),
                target_dept_ids: program.target_dept_ids || [],
                target_passout_year: program.target_passout_year == null ? "" : String(program.target_passout_year),
                max_enrollment: program.max_enrollment == null ? "" : String(program.max_enrollment),
                enrollment_deadline: program.enrollment_deadline || "",
                program_fee: program.program_fee == null ? "" : String(program.program_fee),
                fee_currency: program.fee_currency || "",
                min_attendance_pct: program.min_attendance_pct == null ? "" : String(program.min_attendance_pct),
            };
            setFormData(loaded);
            setOriginalData(loaded);
            setFetchedProgramName(program.program_name || "");
        }
    }, [queryData, originalData]);
    /* eslint-enable react-hooks/set-state-in-effect */

    let fetchError: string | null = null;
    if (!programId) {
        fetchError = "Program ID not found";
    } else if (queryFetchError) {
        fetchError = queryFetchError instanceof Error ? queryFetchError.message : "Failed to fetch program details";
    }

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

            showToast({ type: "error", title: getErrorTitle(status), description: message });
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
        if (!programId || mutation.isPending) return;

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
            setStep(getStepForField(result.error.issues[0]?.path[0] as string));
            showToast({ type: "warning", title: "Validation Failed", description: result.error.issues[0].message });
            return;
        }

        const cleanPayload = buildDiffPayload(formData, originalData);

        if (Object.keys(cleanPayload).length === 0) {
            showToast({ type: "warning", title: "No Changes", description: "Nothing has been changed." });
            return;
        }

        setErrors({});
        mutation.mutate(cleanPayload);
    }, [formData, programId, mutation, originalData]);

    const handleCancel = useCallback(() => {
        if (programId) {
            navigate(`/college/training-program/${programId}`);
        } else {
            navigate("/college/training-programs");
        }
    }, [programId, navigate]);

    // ── Form dirty tracking + unsaved-changes guard ──
    const isDirty = useMemo(() => {
        if (!originalData) return false;
        return (Object.keys(originalData) as (keyof UpdateTrainingProgramInput)[]).some(
            (key) => JSON.stringify(formData[key]) !== JSON.stringify(originalData[key]),
        );
    }, [formData, originalData]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    return {
        step,
        formData,
        fetchedProgramName,
        errors,
        loading: mutation.isPending,
        fetching,
        fetchError,
        isDirty,
        handleChange,
        handleNext,
        handleBack,
        handleSubmit,
        handleCancel,
    };
};
