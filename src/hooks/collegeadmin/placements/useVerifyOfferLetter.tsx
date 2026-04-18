import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

export const useVerifyOfferLetter = (onSuccess: () => void) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({
            placementId,
            payload,
        }: {
            placementId: string;
            payload: { action: "approved" | "rejected"; rejection_reason?: string };
        }) => CollegeAdminService.verifyOfferLetter(placementId, payload),
        onSuccess: (response, { payload }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.placements.all() });
            showToast({
                type: "success",
                title: "Success",
                description:
                    response?.message ||
                    (payload.action === "approved"
                        ? "Offer letter verified"
                        : "Offer letter rejected"),
            });
            onSuccess();
        },
        onError: (err: unknown) => {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "Something went wrong";
            showToast({
                type: "error",
                title: "Error",
                description: message,
            });
        },
    });

    const verifyOffer = useCallback(
        (
            placementId: string,
            action: "approved" | "rejected",
            rejectionReason?: string,
        ) => {
            if (mutation.isPending) return;

            const payload: {
                action: "approved" | "rejected";
                rejection_reason?: string;
            } = { action };
            if (action === "rejected" && rejectionReason?.trim()) {
                payload.rejection_reason = rejectionReason.trim();
            }

            mutation.mutate({ placementId, payload });
        },
        [mutation],
    );

    return { loading: mutation.isPending, verifyOffer };
};
