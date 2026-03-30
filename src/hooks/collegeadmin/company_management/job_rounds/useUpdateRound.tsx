import { useState, useCallback, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { updateRoundSchema } from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

export interface UpdateRoundFormData {
    round_name: string;
    round_description: string;
    round_type: string;
    round_date: string;
    round_venue: string;
}

// ========================
// HOOK
// ========================

export const useUpdateRound = (jobId: string, onSuccess?: () => void) => {
    const [formData, setFormData] = useState<UpdateRoundFormData>({
        round_name: "",
        round_description: "",
        round_type: "",
        round_date: "",
        round_venue: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [roundId, setRoundId] = useState<string>("");
    const [originalData, setOriginalData] = useState<UpdateRoundFormData | null>(null);
    const queryClient = useQueryClient();

    const isDirty = useMemo(() => {
        if (!originalData) return false;
        const orig = originalData;
        return (
            formData.round_name !== orig.round_name ||
            formData.round_description !== orig.round_description ||
            formData.round_type !== orig.round_type ||
            formData.round_date !== orig.round_date ||
            formData.round_venue !== orig.round_venue
        );
    }, [formData, originalData]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name]) return prev;
                const next = { ...prev };
                delete next[name];
                return next;
            });
        },
        []
    );

    const loadRound = useCallback((round: Record<string, unknown>) => {
        setRoundId(String(round.round_id || ""));
        const loaded: UpdateRoundFormData = {
            round_name: String(round.round_name || ""),
            round_description: String(round.round_description || ""),
            round_type: String(round.round_type || ""),
            round_date: round.round_date
                ? String(round.round_date).slice(0, 16)
                : "",
            round_venue: String(round.round_venue || ""),
        };
        setFormData(loaded);
        setOriginalData({ ...loaded });
        setErrors({});
    }, []);

    const mutation = useMutation({
        mutationFn: (args: { roundId: string; payload: Record<string, unknown> }) =>
            CollegeAdminService.updateRound(args.roundId, args.payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.rounds(jobId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Round updated successfully",
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ round_name: message });
            }

            showToast({
                type: "error",
                title: status === 400 ? "Invalid Action" : status === 404 ? "Not Found" : "Error",
                description: message,
            });
        },
    });

    const handleSubmit = useCallback(() => {
        if (!roundId) {
            showToast({ type: "error", title: "Error", description: "No round selected" });
            return;
        }

        const orig = originalData;

        // Build diff payload — only include changed fields
        const payload: Record<string, unknown> = {};
        if (!orig || formData.round_name.trim() !== orig.round_name.trim()) {
            payload.round_name = formData.round_name.trim();
        }
        if (!orig || formData.round_description.trim() !== orig.round_description.trim()) {
            payload.round_description = formData.round_description.trim();
        }
        if (!orig || formData.round_type !== orig.round_type) {
            payload.round_type = formData.round_type;
        }
        if (!orig || formData.round_date !== orig.round_date) {
            payload.round_date = formData.round_date;
        }
        if (!orig || formData.round_venue.trim() !== orig.round_venue.trim()) {
            payload.round_venue = formData.round_venue.trim();
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
        const result = updateRoundSchema.safeParse(payload);
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
        mutation.mutate({ roundId, payload });
    }, [formData, originalData, roundId, mutation]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        roundId,
        handleChange,
        handleSubmit,
        loadRound,
        isDirty,
    };
};
