import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { updateQuestionSchema } from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

const MCQ_TYPES = ["mcq_single", "mcq_multiple"];

export interface UpdateQuestionFormData {
    question_text: string;
    question_type: string;
    question_options: string[];
    is_required: boolean;
    question_order: number;
}

// ========================
// HOOK
// ========================

export const useUpdateQuestion = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateQuestionFormData>({
        question_text: "",
        question_type: "",
        question_options: ["", ""],
        is_required: true,
        question_order: 1,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [questionId, setQuestionId] = useState<string>("");
    const [originalSnapshot, setOriginalSnapshot] = useState<UpdateQuestionFormData | null>(null);
    const originalData = useRef<UpdateQuestionFormData | null>(null);

    const mutation = useMutation({
        mutationFn: (params: { id: string; payload: Record<string, unknown> }) =>
            CollegeAdminService.updateQuestion(params.id, params.payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.questions(jobId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Question updated successfully",
            });
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
                } else if (type === "number") {
                    (next as Record<string, unknown>)[name] = value === "" ? 1 : Number(value);
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
                    // If switching non-MCQ → MCQ and no options exist yet, add 2 empty
                    if (!wasMcq && isMcq && prev.question_options.filter((o) => o.trim()).length === 0) {
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

    // ── Load existing question data ──

    const loadQuestion = useCallback((question: {
        question_id: string;
        question_text: string;
        question_type: string;
        question_options: string[] | null;
        is_required: boolean;
        question_order: number;
    }) => {
        setQuestionId(question.question_id);

        const options = Array.isArray(question.question_options)
            ? question.question_options
            : ["", ""];

        const loaded: UpdateQuestionFormData = {
            question_text: question.question_text,
            question_type: question.question_type,
            question_options: options.length > 0 ? [...options] : ["", ""],
            is_required: question.is_required,
            question_order: question.question_order,
        };
        setFormData(loaded);
        originalData.current = {
            ...loaded,
            question_options: [...loaded.question_options],
        };
        setOriginalSnapshot({
            ...loaded,
            question_options: [...loaded.question_options],
        });
        setErrors({});
    }, []);

    // ── Submit (diff-based) ──

    const handleSubmit = useCallback(async () => {
        if (!questionId) {
            showToast({ type: "error", title: "Error", description: "No question selected" });
            return;
        }

        const orig = originalData.current;
        const isMcq = MCQ_TYPES.includes(formData.question_type);

        // Build diff payload — only include changed fields
        const payload: Record<string, unknown> = {};

        if (!orig || formData.question_text.trim() !== orig.question_text.trim()) {
            payload.question_text = formData.question_text.trim();
        }
        if (!orig || formData.question_type !== orig.question_type) {
            payload.question_type = formData.question_type;
        }
        if (!orig || formData.is_required !== orig.is_required) {
            payload.is_required = formData.is_required;
        }
        if (!orig || formData.question_order !== orig.question_order) {
            payload.question_order = formData.question_order;
        }

        // Options diff — compare trimmed, filtered arrays
        if (isMcq) {
            const currentOpts = formData.question_options.map((o) => o.trim()).filter((o) => o.length > 0);
            const origOpts = orig
                ? orig.question_options.map((o) => o.trim()).filter((o) => o.length > 0)
                : [];

            const optionsChanged =
                currentOpts.length !== origOpts.length ||
                currentOpts.some((o, i) => o !== origOpts[i]);

            if (!orig || optionsChanged) {
                payload.question_options = currentOpts;
            }

            // If type changed TO MCQ, options MUST be in payload
            if (payload.question_type && MCQ_TYPES.includes(String(payload.question_type))) {
                if (!payload.question_options) {
                    payload.question_options = currentOpts;
                }
            }
        }

        // No changes guard
        if (Object.keys(payload).length === 0) {
            showToast({
                type: "warning",
                title: "No Changes",
                description: "Nothing has been changed.",
            });
            return;
        }

        // Zod validation on diff payload
        const result = updateQuestionSchema.safeParse(payload);
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
        mutation.mutate({ id: questionId, payload });
    }, [formData, questionId, mutation]);

    // ── Dirty check + beforeunload ──

    const isDirty = useMemo(() => {
        if (!originalSnapshot) return false;
        if (formData.question_text.trim() !== originalSnapshot.question_text.trim()) return true;
        if (formData.question_type !== originalSnapshot.question_type) return true;
        if (formData.is_required !== originalSnapshot.is_required) return true;
        if (formData.question_order !== originalSnapshot.question_order) return true;
        const currentOpts = formData.question_options.map((o) => o.trim()).filter((o) => o.length > 0);
        const origOpts = originalSnapshot.question_options.map((o) => o.trim()).filter((o) => o.length > 0);
        if (currentOpts.length !== origOpts.length || currentOpts.some((o, i) => o !== origOpts[i])) return true;
        return false;
    }, [formData, originalSnapshot]);

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
        questionId,
        handleChange,
        handleSubmit,
        loadQuestion,
        addOption,
        removeOption,
        updateOption,
    };
};
