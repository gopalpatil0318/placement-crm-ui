import DashboardLayout from '@/components/sysadmin/DashboardLayout';
import EditCollegeForm from "@/components/sysadmin/EditCollegeForm";
import PageHeader from '@/components/sysadmin/PageHeader';

const EditCollege = () => {
  const breadcrumbs = [
    { label: "Dashboard", path: "/sysadmin/dashboard" },
    { label: "Colleges", path: "/sysadmin/colleges" },
    { label: "Edit College", active: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Edit College" breadcrumbs={breadcrumbs} />
        <EditCollegeForm />
      </div>
    </DashboardLayout>
  );
};

export default EditCollege;