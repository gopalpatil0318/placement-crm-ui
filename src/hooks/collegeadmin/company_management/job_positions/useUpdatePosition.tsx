import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { updatePositionSchema } from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

interface UpdatePositionFormData {
    position_name: string;
    position_description: string;
    vacancies: number | "";
}

type FormErrors = Partial<Record<keyof UpdatePositionFormData, string>>;

// ========================
// HOOK
// ========================

export const useUpdatePosition = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdatePositionFormData>({
        position_name: "",
        position_description: "",
        vacancies: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const originalData = useRef<UpdatePositionFormData | null>(null);

    const mutation = useMutation({
        mutationFn: ({ positionId, payload }: { positionId: string; payload: Record<string, unknown> }) =>
            CollegeAdminService.updatePosition(positionId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.positions(jobId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
            showToast({ type: "success", title: "Success", description: response?.message || "Position updated successfully" });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;
            if (status === 409) {
                setErrors({ position_name: message });
            }
            showToast({ type: "error", title: "Error", description: message });
        },
    });

    const loadPosition = useCallback(
        (position: { position_name: string; position_description: string | null; vacancies: number }) => {
            const loaded: UpdatePositionFormData = {
                position_name: position.position_name || "",
                position_description: position.position_description || "",
                vacancies: position.vacancies || "",
            };
            setFormData(loaded);
            originalData.current = { ...loaded };
            setErrors({});
        },
        []
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
            }));
            setErrors((prev) => {
                if (!prev[name as keyof UpdatePositionFormData]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    const handleSubmit = useCallback(
        async (positionId: string) => {
            // Diff-based payload — only send changed fields
            const orig = originalData.current;
            const payload: Record<string, unknown> = {};

            const trimmedName = formData.position_name.trim();
            const trimmedDesc = formData.position_description.trim();

            if (orig && trimmedName !== orig.position_name.trim()) {
                payload.position_name = trimmedName;
            }
            if (orig && trimmedDesc !== (orig.position_description || "").trim()) {
                payload.position_description = trimmedDesc;
            }
            if (orig && formData.vacancies !== orig.vacancies) {
                if (formData.vacancies !== "" && formData.vacancies >= 1) {
                    payload.vacancies = formData.vacancies;
                }
            }

            if (Object.keys(payload).length === 0) {
                showToast({ type: "warning", title: "No Changes", description: "Nothing has been changed." });
                return;
            }

            // Build parse-ready object for Zod validation on changed fields only
            const parseData: Record<string, unknown> = {};
            if (payload.position_name !== undefined) parseData.position_name = payload.position_name;
            if (payload.position_description !== undefined) parseData.position_description = payload.position_description;
            if (payload.vacancies !== undefined) parseData.vacancies = payload.vacancies;

            const result = updatePositionSchema.safeParse(parseData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof UpdatePositionFormData;
                    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
                }
                setErrors(fieldErrors);
                showToast({ type: "warning", title: "Validation Failed", description: result.error.issues[0].message });
                return;
            }
            setErrors({});

            mutation.mutate({ positionId, payload });
        },
        [formData, mutation]
    );

    return { formData, errors, loading: mutation.isPending, handleChange, handleSubmit, loadPosition };
};
