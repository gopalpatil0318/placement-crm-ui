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
            payload: { offer_letter_verified: boolean; remarks?: string };
        }) => CollegeAdminService.verifyOfferLetter(placementId, payload),
        onSuccess: (response, { payload }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.placements.all() });
            showToast({
                type: "success",
                title: "Success",
                description:
                    response?.message ||
                    (payload.offer_letter_verified
                        ? "Offer letter verified"
                        : "Verification removed"),
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
            verified: boolean,
            remarks?: string,
        ) => {
            if (mutation.isPending) return;

            const payload: {
                offer_letter_verified: boolean;
                remarks?: string;
            } = { offer_letter_verified: verified };
            if (remarks?.trim()) payload.remarks = remarks.trim();

            mutation.mutate({ placementId, payload });
        },
        [mutation],
    );

    return { loading: mutation.isPending, verifyOffer };
};
