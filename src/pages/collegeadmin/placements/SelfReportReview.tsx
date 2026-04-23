import AnimatedPage from "@/components/ui/AnimatedPage"
import SelfReportQueue from "@/components/collegeadmin/placements/SelfReportQueue"

export default function SelfReportReview() {
  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8">
        <SelfReportQueue />
      </div>
    </AnimatedPage>
  )
}
