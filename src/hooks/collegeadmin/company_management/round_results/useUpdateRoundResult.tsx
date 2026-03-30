import { useState, useCallback, useMemo, useEffect } from "react";
import { type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
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
    const [originalData, setOriginalData] = useState<UpdateRoundResultFormData | null>(null);
    const queryClient = useQueryClient();

    const isDirty = useMemo(() => {
        if (!originalData) return false;
        return (
            formData.result_status !== originalData.result_status ||
            formData.score !== originalData.score ||
            formData.remarks !== originalData.remarks ||
            formData.attended !== originalData.attended ||
            formData.scheduled_at !== originalData.scheduled_at ||
            formData.completed_at !== originalData.completed_at
        );
    }, [formData, originalData]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

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
                title: getErrorTitle(status),
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
        setOriginalData({ ...loaded });
        setErrors({});
    }, []);

    // Extract diff payload from formData vs original — reduces handleSubmit complexity
    const buildDiffPayload = (
        formData: UpdateRoundResultFormData,
        orig: UpdateRoundResultFormData | null,
    ): Record<string, unknown> => {
        const payload: Record<string, unknown> = {};

        if (orig?.result_status !== formData.result_status && formData.result_status) {
            payload.result_status = formData.result_status;
        }

        if (orig?.score !== formData.score) {
            if (formData.score === "" && orig?.score !== "") {
                payload.score = null;
            } else if (formData.score !== "") {
                payload.score = Number(formData.score);
            }
        }

        if (formData.remarks.trim() !== (orig?.remarks || "").trim()) {
            payload.remarks = formData.remarks.trim();
        }

        if (orig?.attended !== formData.attended) {
            payload.attended = formData.attended;
        }

        if (orig?.scheduled_at !== formData.scheduled_at) {
            payload.scheduled_at = formData.scheduled_at || undefined;
        }

        if (orig?.completed_at !== formData.completed_at) {
            payload.completed_at = formData.completed_at || undefined;
        }

        return payload;
    };

    const handleSubmit = useCallback(() => {
        if (mutation.isPending) return;

        if (!resultId) {
            showToast({ type: "error", title: "Error", description: "No result selected" });
            return;
        }

        const payload = buildDiffPayload(formData, originalData);

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
    }, [formData, resultId, mutation, originalData]);

    const reset = useCallback(() => {
        setFormData({ ...INITIAL_FORM });
        setResultId("");
        setOriginalData(null);
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
        isDirty,
    };
};
