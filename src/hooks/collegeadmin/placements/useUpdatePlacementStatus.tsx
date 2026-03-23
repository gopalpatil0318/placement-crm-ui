import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import {
    PLACEMENT_STATUS_TRANSITIONS,
    type PlacementStatus,
} from "@/validators/PlacementSchema";
import { queryKeys } from "@/lib/queryKeys";

export const useUpdatePlacementStatus = (onSuccess: () => void) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({
            placementId,
            payload,
        }: {
            placementId: string;
            payload: { placement_status: string; remarks?: string };
        }) => CollegeAdminService.updatePlacementStatus(placementId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.placements.all() });
            showToast({
                type: "success",
                title: "Success",
                description:
                    response?.message ||
                    "Placement status updated successfully",
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

    const updateStatus = useCallback(
        (
            placementId: string,
            newStatus: PlacementStatus,
            remarks?: string,
        ) => {
            if (mutation.isPending) return;

            const payload: { placement_status: string; remarks?: string } =
                { placement_status: newStatus };
            if (remarks?.trim()) payload.remarks = remarks.trim();

            mutation.mutate({ placementId, payload });
        },
        [mutation],
    );

    return { loading: mutation.isPending, updateStatus, PLACEMENT_STATUS_TRANSITIONS };
};
