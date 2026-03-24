import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// HOOK
// ========================

export const useDeleteQuestion = (jobId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (questionId: string) => CollegeAdminService.deleteQuestion(questionId),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.questions(jobId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Question deleted successfully",
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            showToast({
                type: "error",
                title: status === 400 ? "Invalid Action" : status === 404 ? "Not Found" : "Error",
                description: message,
            });
        },
    });

    const deleteQuestion = useCallback(
        (questionId: string) => {
            mutation.mutate(questionId);
        },
        [mutation]
    );

    return {
        deleteQuestion,
        loading: mutation.isPending,
    };
};
