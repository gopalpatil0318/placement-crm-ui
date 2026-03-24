import AnimatedPage from "@/components/ui/AnimatedPage"
import InterviewQuestionsDashboard from "@/components/student/feedback/InterviewQuestionsDashboard"

export default function InterviewQuestions() {
  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8">
        <InterviewQuestionsDashboard />
      </div>
    </AnimatedPage>
  )
}
