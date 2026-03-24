import AnimatedPage from "@/components/ui/AnimatedPage"
import PlacementDashboard from "@/components/student/placements/PlacementDashboard"

export default function MyPlacements() {
  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8">
        <PlacementDashboard />
      </div>
    </AnimatedPage>
  )
}
