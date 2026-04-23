import AnimatedPage from "@/components/ui/AnimatedPage"
import SelfReportManager from "@/components/student/placements/SelfReportManager"

export default function ReportPlacement() {
  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8">
        <SelfReportManager />
      </div>
    </AnimatedPage>
  )
}
