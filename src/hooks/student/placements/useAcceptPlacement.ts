import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
import { PlacementService } from "@/services/student/placement.service"
import type {
  StudentPlacementsResponse,
} from "@/validators/PlacementSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useAcceptPlacement() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (placementId: string) =>
      PlacementService.acceptPlacement(placementId),
    onSuccess: (data) => {
      showToast({
        type: "success",
        title: "Congratulations! 🎉",
        description: `Offer accepted for ${data.job_title} at ${data.company_name}.`,
      })

      // Optimistic: update placement status in cached lists
      queryClient.setQueriesData<StudentPlacementsResponse>(
        { queryKey: ["studentPortal", "placements"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            placements: old.placements.map((p) =>
              p.placement_id === data.placement_id
                ? { ...p, placement_status: "accepted" as const, acceptance_status: "accepted" as const, updated_at: data.updated_at }
                : p,
            ),
            statusSummary: {
              ...old.statusSummary,
              offered: Math.max(0, old.statusSummary.offered - 1),
              accepted: old.statusSummary.accepted + 1,
            },
          }
        },
      )
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Failed to accept placement"
      const status = error instanceof ApiError ? error.status : undefined
      const title =
        status === 409 ? "Already Processed"
        : status === 404 ? "Not Found"
        : status === 400 ? "Invalid Request"
        : status === 429 ? "Too Many Requests"
        : "Error"
      const description = status === 429 ? "You're acting too quickly. Please wait a moment." : message
      showToast({ type: "error", title, description })
    },
  })

  return {
    acceptPlacement: mutation.mutate,
    isAccepting: mutation.isPending,
  }
}
