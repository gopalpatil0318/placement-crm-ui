import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PlacementService } from "@/services/student/placement.service"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { queryKeys } from "@/lib/queryKeys"

export const useUploadPlacementDocuments = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({
            placementId,
            payload,
        }: {
            placementId: string
            payload: { offer_letter_url?: string; joining_letter_url?: string }
        }) => PlacementService.uploadPlacementDocuments(placementId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.myPlacements() })
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Documents uploaded successfully",
            })
            onSuccess?.()
        },
        onError: (err: unknown) => {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "Something went wrong"
            showToast({
                type: "error",
                title: "Error",
                description: message,
            })
        },
    })

    const uploadDocuments = useCallback(
        (
            placementId: string,
            payload: { offer_letter_url?: string; joining_letter_url?: string },
        ) => {
            if (mutation.isPending) return
            mutation.mutate({ placementId, payload })
        },
        [mutation],
    )

    return { loading: mutation.isPending, uploadDocuments }
}
