import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { showToast, getErrorTitle } from "@/utils/ToastUtils"
import { TrainingProgramsService } from "@/services/student/trainingPrograms.service"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useEnrollInTraining() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (programId: string) =>
      TrainingProgramsService.enrollInTraining(programId),
    onSuccess: (data) => {
      showToast({
        type: "success",
        title: "Enrolled Successfully! 🎓",
        description: `You are now enrolled in ${data.program_name}.`,
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.availableTrainings() })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.myEnrollments() })
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Failed to enroll"
      const status = error instanceof ApiError ? error.status : undefined
      showToast({ type: "error", title: getErrorTitle(status), description: message })
    },
  })

  return {
    enroll: mutation.mutate,
    isEnrolling: mutation.isPending,
  }
}
