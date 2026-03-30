import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import type { Contact } from "./useViewContacts";

interface ToggleContactVars {
    contactId: string;
    contactName: string;
    newStatus: boolean;
}

interface ToggleContext {
    previousContacts: unknown;
    previousDetail: unknown;
}

export const useToggleContactStatus = (companyId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<unknown, unknown, ToggleContactVars, ToggleContext>({
        mutationFn: ({ contactId, newStatus }: ToggleContactVars) =>
            CollegeAdminService.toggleContactStatus(contactId, newStatus),

        onMutate: async ({ contactId, newStatus }) => {
            await queryClient.cancelQueries({ queryKey: ["companies", companyId, "contacts"] });
            await queryClient.cancelQueries({ queryKey: queryKeys.companies.detail(companyId) });

            const previousContacts = queryClient.getQueriesData({ queryKey: ["companies", companyId, "contacts"] });
            const previousDetail = queryClient.getQueryData(queryKeys.companies.detail(companyId));

            queryClient.setQueriesData<{ data?: { contacts?: Contact[] } }>(
                { queryKey: ["companies", companyId, "contacts"] },
                (old) => {
                    if (!old?.data?.contacts) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            contacts: old.data.contacts.map((c) =>
                                c.contact_id === contactId ? { ...c, is_active: newStatus } : c
                            ),
                        },
                    };
                }
            );

            return { previousContacts, previousDetail };
        },

        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["companies", companyId, "contacts"] });
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
            showToast({
                type: "success",
                title: "Status Updated",
                description:
                    (response as { message?: string })?.message ||
                    `Contact status updated successfully`,
            });
            onSuccess?.();
        },

        onError: (error: unknown, _vars, context) => {
            if (context?.previousContacts) {
                for (const [key, data] of context.previousContacts as [unknown[], unknown][]) {
                    queryClient.setQueryData(key, data);
                }
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(queryKeys.companies.detail(companyId), context.previousDetail);
            }
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
