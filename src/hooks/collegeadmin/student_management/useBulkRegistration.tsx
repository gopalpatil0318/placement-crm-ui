import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { showToast } from "@/utils/ToastUtils";

interface BulkRegisterResponse {
    success: boolean;
    message: string;
    data: {
        total: number;
        successful: number;
        failed: number;
        errors?: unknown[];
        [key: string]: unknown;
    };
}

export const useBulkRegistration = () => {
    const queryClient = useQueryClient();
    const [result, setResult] = useState<BulkRegisterResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: (students: Record<string, unknown>[]) =>
            CollegeAdminService.bulkRegistration(students),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.students.departments() });
            setResult({
                success: response.success,
                message: response.message,
                data: response.data,
            });
            showToast({
                type: "success",
                title: "Process Completed",
                description: response.message || "Bulk registration process finished",
            });
        },
        onError: (err: unknown) => {
            const errorMessage = err instanceof ApiError ? err.message : "Failed to upload file";
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Error / Warning",
                description: errorMessage,
            });
        },
    });

    const registerDefault = async (students: Record<string, unknown>[]) => {
        setError(null);
        setResult(null);
        try {
            await mutation.mutateAsync(students);
            return true;
        } catch {
            return false;
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
    };

    return {
        registerDefault,
        loading: mutation.isPending,
        error,
        result,
        reset,
    };
};
