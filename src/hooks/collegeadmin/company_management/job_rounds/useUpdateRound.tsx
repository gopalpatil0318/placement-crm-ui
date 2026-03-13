import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

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

export const useUpdateRound = (onSuccess?: () => void) => {
    const [formData, setFormData] = useState<UpdateRoundFormData>({
        round_name: "",
        round_description: "",
        round_type: "",
        round_date: "",
        round_venue: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [roundId, setRoundId] = useState<string>("");

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors]
    );

    const loadRound = useCallback((round: Record<string, unknown>) => {
        setRoundId(String(round.round_id || ""));
        setFormData({
            round_name: String(round.round_name || ""),
            round_description: String(round.round_description || ""),
            round_type: String(round.round_type || ""),
            round_date: round.round_date
                ? String(round.round_date).slice(0, 16) // ISO → datetime-local format
                : "",
            round_venue: String(round.round_venue || ""),
        });
        setErrors({});
    }, []);

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.round_name.trim()) {
            newErrors.round_name = "Round name is required";
        } else if (formData.round_name.trim().length < 2) {
            newErrors.round_name = "Round name must be at least 2 characters";
        } else if (formData.round_name.trim().length > 200) {
            newErrors.round_name = "Round name must be at most 200 characters";
        }

        if (formData.round_description && formData.round_description.length > 1000) {
            newErrors.round_description = "Description must be at most 1000 characters";
        }

        if (formData.round_venue && formData.round_venue.length > 500) {
            newErrors.round_venue = "Venue must be at most 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
        if (!roundId) {
            showToast({ type: "error", title: "Error", description: "No round selected" });
            return;
        }

        if (!validate()) {
            showToast({
                type: "warning",
                title: "Validation Failed",
                description: "Please check the form fields",
            });
            return;
        }

        setLoading(true);

        try {
            const payload: Record<string, string> = {};
            if (formData.round_name.trim()) payload.round_name = formData.round_name.trim();
            if (formData.round_description.trim()) payload.round_description = formData.round_description.trim();
            if (formData.round_type) payload.round_type = formData.round_type;
            if (formData.round_date) payload.round_date = formData.round_date;
            if (formData.round_venue.trim()) payload.round_venue = formData.round_venue.trim();

            if (Object.keys(payload).length === 0) {
                showToast({
                    type: "warning",
                    title: "No Changes",
                    description: "At least one field must be updated",
                });
                setLoading(false);
                return;
            }

            const response = await CollegeAdminService.updateRound(roundId, payload);

            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Round updated successfully",
            });
            onSuccess?.();
        } catch (error: unknown) {
            const axiosErr = error as AxiosError<{ error?: string; message?: string }>;
            const errorMsg =
                axiosErr?.response?.data?.error ||
                axiosErr?.response?.data?.message ||
                (error instanceof Error ? error.message : "Something went wrong");
            showToast({ type: "error", title: "Error", description: errorMsg });
        } finally {
            setLoading(false);
        }
    }, [formData, roundId, validate, onSuccess]);

    return {
        formData,
        errors,
        loading,
        roundId,
        handleChange,
        handleSubmit,
        loadRound,
    };
};
