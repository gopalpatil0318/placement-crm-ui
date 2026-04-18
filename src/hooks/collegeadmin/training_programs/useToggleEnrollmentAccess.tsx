import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

export const useToggleEnrollmentAccess = (programId: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (allowEnrollments: boolean) =>
            CollegeAdminService.toggleEnrollmentAccess(programId, allowEnrollments),
        onMutate: async (allowEnrollments: boolean) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.trainingPrograms.detail(programId) });

            const previousDetail = queryClient.getQueryData(queryKeys.trainingPrograms.detail(programId));

            queryClient.setQueryData(queryKeys.trainingPrograms.detail(programId), (old: unknown) => {
                if (!old || typeof old !== "object") return old;
                const d = old as { data?: { allow_enrollments?: boolean } };
                if (!d.data) return old;
                return { ...d, data: { ...d.data, allow_enrollments: allowEnrollments } };
            });

            return { previousDetail };
        },
        onSuccess: (response, allowEnrollments) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.detail(programId) });
            showToast({
                type: "success",
                title: allowEnrollments ? "Enrollment Opened" : "Enrollment Closed",
                description: response?.message || "Enrollment access updated",
            });
        },
        onError: (error: unknown, _allowEnrollments, context) => {
            if (context?.previousDetail) {
                queryClient.setQueryData(queryKeys.trainingPrograms.detail(programId), context.previousDetail);
            }
            const message = error instanceof ApiError ? error.message : "Failed to update enrollment access";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: message });
        },
    });

    const toggle = useCallback((allowEnrollments: boolean) => {
        mutation.mutate(allowEnrollments);
    }, [mutation]);

    return {
        toggle,
        loading: mutation.isPending,
    };
};
