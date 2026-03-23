import { useState, useCallback, useRef } from "react";
import { type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { updateRoundResultSchema } from "@/validators/RoundResultSchema";
import { type RoundResult } from "./useViewRoundResults";

// ========================
// TYPES
// ========================

export interface UpdateRoundResultFormData {
    result_status: string;
    score: string;
    remarks: string;
    attended: boolean;
    scheduled_at: string;
    completed_at: string;
}

type FormErrors = Partial<Record<keyof UpdateRoundResultFormData, string>>;

const INITIAL_FORM: UpdateRoundResultFormData = {
    result_status: "",
    score: "",
    remarks: "",
    attended: false,
    scheduled_at: "",
    completed_at: "",
};

// ========================
// HOOK
// ========================

export const useUpdateRoundResult = (roundId: string, onSuccess?: () => void) => {
    const [formData, setFormData] = useState<UpdateRoundResultFormData>({ ...INITIAL_FORM });
    const [errors, setErrors] = useState<FormErrors>({});
    const [resultId, setResultId] = useState("");
    const originalData = useRef<UpdateRoundResultFormData | null>(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            CollegeAdminService.updateRoundResult(id, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.roundResults(roundId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Round result updated successfully",
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ result_status: message });
            }

            showToast({
                type: "error",
                title: status === 409 ? "Conflict" : status === 400 ? "Invalid Action" : status === 404 ? "Not Found" : "Error",
                description: message,
            });
        },
    });

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
            setErrors((prev) => {
                if (!prev[name as keyof UpdateRoundResultFormData]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        [],
    );

    const loadResult = useCallback((result: RoundResult) => {
        setResultId(result.result_id);
        const loaded: UpdateRoundResultFormData = {
            result_status: result.result_status || "",
            score: result.score !== null && result.score !== undefined
                ? String(result.score)
                : "",
            remarks: result.remarks || "",
            attended: result.attended ?? false,
            scheduled_at: result.scheduled_at
                ? String(result.scheduled_at).slice(0, 16)
                : "",
            completed_at: result.completed_at
                ? String(result.completed_at).slice(0, 16)
                : "",
        };
        setFormData(loaded);
        originalData.current = { ...loaded };
        setErrors({});
    }, []);

    const handleSubmit = useCallback(() => {
        if (mutation.isPending) return;

        if (!resultId) {
            showToast({ type: "error", title: "Error", description: "No result selected" });
            return;
        }

        const orig = originalData.current;

        // Build diff payload — only include changed fields
        const payload: Record<string, unknown> = {};

        if (!orig || formData.result_status !== orig.result_status) {
            if (formData.result_status) {
                payload.result_status = formData.result_status;
            }
        }

        if (!orig || formData.score !== orig.score) {
            if (formData.score === "" && orig?.score !== "") {
                payload.score = null; // Clear score
            } else if (formData.score !== "") {
                payload.score = Number(formData.score);
            }
        }

        if (!orig || formData.remarks.trim() !== (orig.remarks || "").trim()) {
            payload.remarks = formData.remarks.trim();
        }

        if (!orig || formData.attended !== orig.attended) {
            payload.attended = formData.attended;
        }

        if (!orig || formData.scheduled_at !== orig.scheduled_at) {
            payload.scheduled_at = formData.scheduled_at || undefined;
        }

        if (!orig || formData.completed_at !== orig.completed_at) {
            payload.completed_at = formData.completed_at || undefined;
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
        const result = updateRoundResultSchema.safeParse(payload);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof UpdateRoundResultFormData;
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
        mutation.mutate({ id: resultId, payload });
    }, [formData, resultId, mutation]);

    const reset = useCallback(() => {
        setFormData({ ...INITIAL_FORM });
        setResultId("");
        originalData.current = null;
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        resultId,
        handleChange,
        handleSubmit,
        loadResult,
        reset,
    };
};
