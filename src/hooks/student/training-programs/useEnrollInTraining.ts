import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { showToast } from "@/utils/ToastUtils"
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
      queryClient.invalidateQueries({ queryKey: ["studentPortal", "availableTrainings"] })
      queryClient.invalidateQueries({ queryKey: ["studentPortal", "myEnrollments"] })
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : "Failed to enroll"
      const status = error instanceof ApiError ? error.status : undefined
      const title =
        status === 400 ? "Cannot Enroll"
        : status === 409 ? "Already Enrolled"
        : status === 404 ? "Not Found"
        : status === 429 ? "Too Many Requests"
        : "Enrollment Failed"
      showToast({ type: "error", title, description: message })
    },
  })

  return {
    enroll: mutation.mutate,
    isEnrolling: mutation.isPending,
  }
}
