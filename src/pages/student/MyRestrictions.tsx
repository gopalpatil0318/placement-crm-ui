import AnimatedPage from "@/components/ui/AnimatedPage"
import RestrictionDashboard from "@/components/student/restrictions/RestrictionDashboard"

export default function MyRestrictions() {
  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8">
        <RestrictionDashboard />
      </div>
    </AnimatedPage>
  )
}
