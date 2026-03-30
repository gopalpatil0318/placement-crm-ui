import { useState, useCallback, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { addQuestionSchema } from "@/validators/JobPostingSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

const MCQ_TYPES = ["mcq_single", "mcq_multiple"];

export interface AddQuestionFormData {
    question_text: string;
    question_type: string;
    question_options: string[];
    is_required: boolean;
}

const INITIAL_FORM: AddQuestionFormData = {
    question_text: "",
    question_type: "",
    question_options: ["", ""],
    is_required: true,
};

// ========================
// HOOK
// ========================

export const useAddQuestion = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<AddQuestionFormData>(INITIAL_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const mutation = useMutation({
        mutationFn: (apiPayload: { question_text: string; question_type: string; question_options?: string[]; is_required?: boolean }) =>
            CollegeAdminService.addJobQuestion(jobId, apiPayload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.questions(jobId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Question added successfully",
            });
            resetForm();
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ question_text: message });
            }

            showToast({
                type: "error",
                title: status === 400 ? "Invalid Action" : status === 404 ? "Not Found" : "Error",
                description: message,
            });
        },
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;

            setFormData((prev) => {
                const next = { ...prev };

                if (type === "checkbox" && e.target instanceof HTMLInputElement) {
                    (next as Record<string, unknown>)[name] = e.target.checked;
                } else {
                    (next as Record<string, unknown>)[name] = value;
                }

                // Auto-clear options when switching MCQ → non-MCQ
                if (name === "question_type") {
                    const wasMcq = MCQ_TYPES.includes(prev.question_type);
                    const isMcq = MCQ_TYPES.includes(value);
                    if (wasMcq && !isMcq) {
                        next.question_options = ["", ""];
                    }
                }

                return next;
            });

            setErrors((prev) => {
                if (!prev[name]) return prev;
                const next = { ...prev };
                delete next[name];
                return next;
            });
        },
        []
    );

    // ── Option handlers ──

    const addOption = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            question_options: [...prev.question_options, ""],
        }));
        setErrors((prev) => {
            if (!prev.question_options) return prev;
            const next = { ...prev };
            delete next.question_options;
            return next;
        });
    }, []);

    const removeOption = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            question_options: prev.question_options.filter((_, i) => i !== index),
        }));
    }, []);

    const updateOption = useCallback((index: number, value: string) => {
        setFormData((prev) => {
            const updated = [...prev.question_options];
            updated[index] = value;
            return { ...prev, question_options: updated };
        });
        setErrors((prev) => {
            if (!prev.question_options) return prev;
            const next = { ...prev };
            delete next.question_options;
            return next;
        });
    }, []);

    // ── Reset ──

    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM);
        setErrors({});
    }, []);

    // ── Submit ──

    const handleSubmit = useCallback(async () => {
        const isMcq = MCQ_TYPES.includes(formData.question_type);

        // Build validation payload
        const validationData: Record<string, unknown> = {
            question_text: formData.question_text.trim(),
            question_type: formData.question_type,
            is_required: formData.is_required,
        };

        if (isMcq) {
            validationData.question_options = formData.question_options.map((o) => o.trim()).filter((o) => o.length > 0);
        }

        const result = addQuestionSchema.safeParse(validationData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const field = String(issue.path[0]);
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

        // Build API payload — only send options for MCQ types
        const apiPayload: { question_text: string; question_type: string; question_options?: string[]; is_required?: boolean } = {
            question_text: formData.question_text.trim(),
            question_type: formData.question_type,
            is_required: formData.is_required,
        };

        if (isMcq) {
            apiPayload.question_options = formData.question_options.map((o) => o.trim()).filter((o) => o.length > 0);
        }

        mutation.mutate(apiPayload);
    }, [formData, mutation]);

    // ── Dirty check + beforeunload ──

    const isDirty = useMemo(() => {
        return (
            formData.question_text.trim() !== "" ||
            formData.question_type !== "" ||
            formData.is_required !== true ||
            formData.question_options.some((o) => o.trim() !== "")
        );
    }, [formData]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        isDirty,
        handleChange,
        handleSubmit,
        resetForm,
        addOption,
        removeOption,
        updateOption,
    };
};
