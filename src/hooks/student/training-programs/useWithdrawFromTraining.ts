import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { showToast, getErrorTitle } from "@/utils/ToastUtils"
import { TrainingProgramsService } from "@/services/student/trainingPrograms.service"

export function useWithdrawFromTraining() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (programId: string) =>
      TrainingProgramsService.withdrawFromTraining(programId),
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Withdrawn",
        description: "You have been withdrawn from the training program.",
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.myEnrollments() })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.availableTrainings() })
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Failed to withdraw from training"
      const status = error instanceof ApiError ? error.status : undefined
      showToast({ type: "error", title: getErrorTitle(status), description: message })
    },
  })

  return {
    withdraw: mutation.mutate,
    isWithdrawing: mutation.isPending,
  }
}
