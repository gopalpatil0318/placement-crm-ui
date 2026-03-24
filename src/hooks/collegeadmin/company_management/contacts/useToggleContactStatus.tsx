import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

interface ToggleContactVars {
    contactId: string;
    contactName: string;
    newStatus: boolean;
}

export const useToggleContactStatus = (companyId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ contactId, newStatus }: ToggleContactVars) =>
            CollegeAdminService.toggleContactStatus(contactId, newStatus),
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.contacts(companyId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
            showToast({
                type: "success",
                title: "Status Updated",
                description: `${variables.contactName} is now ${variables.newStatus ? "active" : "inactive"}.`,
            });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const msg = error instanceof ApiError ? error.message : "Failed to update status";
            showToast({ type: "error", title: "Error", description: msg });
        },
    });

    return {
        toggleStatus: (contactId: string, contactName: string, newStatus: boolean) =>
            mutation.mutate({ contactId, contactName, newStatus }),
        isToggling: mutation.isPending,
    };
};
