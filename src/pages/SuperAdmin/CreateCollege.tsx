import DashboardLayout from "@/components/sysadmin/DashboardLayout";
import CreateCollegeForm from "@/components/sysadmin/CreateCollegeForm";
import PageHeader from "@/components/sysadmin/PageHeader";

const BREADCRUMBS = [
  { label: "Super Admin" },
  { label: "Colleges", path: "/sysadmin/colleges" },
  { label: "Create New", active: true },
];

export default function CreateCollege() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Create New College" breadcrumbs={BREADCRUMBS} />
        <CreateCollegeForm />
      </div>
    </DashboardLayout>
  );
}