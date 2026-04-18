import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { FeedbackService } from "@/services/student/feedback.service"
import type { AppliedJobOption } from "@/validators/FeedbackSchema"

export function useAppliedJobOptions() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.studentPortal.appliedJobOptions(),
    queryFn: FeedbackService.getAppliedJobOptions,
    staleTime: 5 * 60 * 1000,
  })

  const companies: AppliedJobOption[] = data?.companies ?? []

  return { companies, isLoading, isError }
}
