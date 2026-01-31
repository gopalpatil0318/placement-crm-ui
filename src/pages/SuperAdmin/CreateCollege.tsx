import DashboardLayout from '@/components/sysadmin/DashboardLayout'
import CollegeForm from "@/components/sysadmin/CollegeForm";
import PageHeader from '@/components/sysadmin/PageHeader';

const CreateCollege = () => {
  const breadcrumbs = [
    { label: "Super Admin" },
    { label: "Colleges" },
    { label: "Create New", active: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader title="Create New College" breadcrumbs={breadcrumbs} />

        {/* Form Component */}
        <CollegeForm />
      </div>
    </DashboardLayout>
  );
};

export default CreateCollege;