import CreateCollegeForm from "@/components/sysadmin/CreateCollegeForm"
import PageHeader from "@/components/sysadmin/PageHeader"
import AnimatedPage from "@/components/ui/AnimatedPage"

const BREADCRUMBS = [
  { label: "Dashboard", path: "/sysadmin/dashboard" },
  { label: "Colleges", path: "/sysadmin/colleges" },
  { label: "Register New College", active: true },
]

export default function CreateCollege() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <PageHeader title="Register New College" breadcrumbs={BREADCRUMBS} />
        <CreateCollegeForm />
      </div>
    </AnimatedPage>
  )
}