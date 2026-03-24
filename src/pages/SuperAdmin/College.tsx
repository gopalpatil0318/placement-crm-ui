import CollegeProfile from "@/components/sysadmin/CollegeProfile"
import PageHeader from "@/components/sysadmin/PageHeader"
import AnimatedPage from "@/components/ui/AnimatedPage"

const BREADCRUMBS = [
  { label: "Dashboard", path: "/sysadmin/dashboard" },
  { label: "Colleges", path: "/sysadmin/colleges" },
  { label: "College Profile", active: true },
]

export default function CollegePage() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <PageHeader title="Institution Profile" breadcrumbs={BREADCRUMBS} />
        <CollegeProfile />
      </div>
    </AnimatedPage>
  )
}