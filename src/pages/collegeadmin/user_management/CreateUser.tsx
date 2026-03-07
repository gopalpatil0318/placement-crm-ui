import UserForm from '@/components/collegeadmin/user_management/CreateUserForm';
import DashboardLayout from '@/components/collegeadmin/DashboardLayout';
import PageHeader from '@/components/collegeadmin/PageHeader';

const CreateUser = () => {
    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Users", path: "/college/view-users" },
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
