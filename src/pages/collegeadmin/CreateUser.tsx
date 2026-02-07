import UserForm from '@/components/collegeadmin/CreateUserForm';
import DashboardLayout from '@/components/collegeadmin/DashboardLayout';

import PageHeader from '@/components/collegeadmin/PageHeader';


const CreateUser = () => {
  const breadcrumbs = [
    { label: "College Admin" },
    { label: "Users" },
    { label: "Create New", active: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader title="Create New User" breadcrumbs={breadcrumbs} />

        {/* Form Component with hook logic */}
        <UserForm />
      </div>
    </DashboardLayout>
  );
};

export default CreateUser;