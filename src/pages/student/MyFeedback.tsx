import AnimatedPage from "@/components/ui/AnimatedPage"
import FeedbackDashboard from "@/components/student/feedback/FeedbackDashboard"

export default function MyFeedback() {
  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8">
        <FeedbackDashboard />
      </div>
    </AnimatedPage>
  )
}
