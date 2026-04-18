import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { TrainingProgramsService } from "@/services/student/trainingPrograms.service"

export function useMySessionSchedule(programId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.studentPortal.mySessionSchedule(programId ?? ""),
    queryFn: () => TrainingProgramsService.getMySessionSchedule(programId!),
    enabled: !!programId,
  })

  return {
    schedule: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
