import DashboardLayout from '@/components/sysadmin/DashboardLayout';
import EditCollegeForm from "@/components/sysadmin/EditCollegeForm";
import PageHeader from '@/components/sysadmin/PageHeader';

const CreateCollege = () => {
  const breadcrumbs = [
    { label: "Super Admin" },
    { label: "Colleges" },
    { label: "Edit Existing", active: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader title="Create New College" breadcrumbs={breadcrumbs} />

        {/* Form Component with hook logic */}
        
        <EditCollegeForm />
      </div>
    </DashboardLayout>
  );
};

export default CreateCollege;