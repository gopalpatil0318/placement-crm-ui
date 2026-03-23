import AnimatedPage from "@/components/ui/AnimatedPage"
import TrainingDashboard from "@/components/student/training-programs/TrainingDashboard"

export default function MyTrainings() {
  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8">
        <TrainingDashboard />
      </div>
    </AnimatedPage>
  )
}
