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
        onMutate: async (questionId: string) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.jobs.questions(jobId) });
            const snapshot = queryClient.getQueryData(queryKeys.jobs.questions(jobId));
            queryClient.setQueryData(queryKeys.jobs.questions(jobId), (old: unknown) => {
                if (!old || typeof old !== "object") return old;
                const data = old as { data?: { questions?: { question_id: string }[] } };
                if (!data.data?.questions) return old;
                return {
                    ...data,
                    data: {
                        ...data.data,
                        questions: data.data.questions.filter((q) => q.question_id !== questionId),
                        total: data.data.questions.length - 1,
                    },
                };
            });
            return { snapshot };
        },
        onError: (error: unknown, _questionId: string, context?: { snapshot: unknown }) => {
            if (context?.snapshot) {
                queryClient.setQueryData(queryKeys.jobs.questions(jobId), context.snapshot);
            }
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            showToast({
                type: "error",
                title: status === 400 ? "Invalid Action" : status === 404 ? "Not Found" : "Error",
                description: message,
            });
        },
        onSuccess: (response) => {
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Question deleted successfully",
            });
            onSuccess?.();
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.questions(jobId) });
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
