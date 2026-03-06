import DashboardLayout from "@/components/sysadmin/DashboardLayout";
import EditCollegeForm from "@/components/sysadmin/EditCollegeForm";
import PageHeader from "@/components/sysadmin/PageHeader";

const BREADCRUMBS = [
  { label: "Super Admin" },
  { label: "Colleges", path: "/sysadmin/colleges" },
  { label: "Edit College", active: true },
];

export default function EditCollege() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Edit College" breadcrumbs={BREADCRUMBS} />
        <EditCollegeForm />
      </div>
    </DashboardLayout>
  );
}