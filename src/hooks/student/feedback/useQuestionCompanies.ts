import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { FeedbackService } from "@/services/student/feedback.service"
import type { QuestionCompany } from "@/validators/FeedbackSchema"

export function useQuestionCompanies(enabled = true) {
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.questionCompanies(),
    queryFn: FeedbackService.getInterviewQuestionCompanies,
    staleTime: 2 * 60 * 1000,
    enabled,
  })

  const companies: QuestionCompany[] = data?.companies ?? []

  return { companies, isLoading, isFetching, isError, refetch }
}
