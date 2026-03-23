import { useState, useMemo, useCallback } from "react"
import EditCollegeForm from "@/components/sysadmin/EditCollegeForm"
import PageHeader from "@/components/sysadmin/PageHeader"
import AnimatedPage from "@/components/ui/AnimatedPage"

export default function EditCollege() {
  const [collegeName, setCollegeName] = useState("")

  const onItemLoaded = useCallback((name: string) => {
    setCollegeName(name)
  }, [])

  const breadcrumbs = useMemo(
    () => [
      { label: "Dashboard", path: "/sysadmin/dashboard" },
      { label: "Colleges", path: "/sysadmin/colleges" },
      { label: collegeName || "Edit College", active: true },
    ],
    [collegeName]
  )

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <PageHeader title={collegeName ? `Edit — ${collegeName}` : "Edit College"} breadcrumbs={breadcrumbs} />
        <EditCollegeForm onItemLoaded={onItemLoaded} />
      </div>
    </AnimatedPage>
  )
}