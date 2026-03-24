import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

export const useToggleDepartmentStatus = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ deptId, newStatus }: { deptId: string; newStatus: boolean }) =>
            CollegeAdminService.toggleDepartmentStatus(deptId, newStatus),
        onSuccess: (response, { deptId, newStatus }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(deptId) });
            showToast({
                type: "success",
                title: "Status Updated",
                description:
                    response?.message ||
                    `Department ${newStatus ? "activated" : "deactivated"} successfully`,
            });
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Failed to toggle department status";
            showToast({ type: "error", title: "Error", description: message });
        },
    });

    const toggleStatus = (
        deptId: string,
        currentStatus: boolean,
        onSuccess?: () => void
    ) => {
        mutation.mutate(
            { deptId, newStatus: !currentStatus },
            { onSuccess: () => onSuccess?.() }
        );
    };

    return {
        toggleStatus,
        loading: mutation.isPending,
    };
};
