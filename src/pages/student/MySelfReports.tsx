import AnimatedPage from "@/components/ui/AnimatedPage"
import SelfReportDashboard from "@/components/student/self-report/SelfReportDashboard"

export default function MySelfReports() {
  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8">
        <SelfReportDashboard />
      </div>
    </AnimatedPage>
  )
}
