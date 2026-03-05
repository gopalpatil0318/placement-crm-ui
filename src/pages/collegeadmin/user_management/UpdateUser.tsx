import DashboardLayout from '@/components/collegeadmin/DashboardLayout';
import UpdateUserForm from '@/components/collegeadmin/user_management/UpdateUserForm';
import PageHeader from '@/components/collegeadmin/PageHeader';

const UpdateUser = () => {

    const breadcrumbs = [
        { label: "College Admin" },
        { label: "Users" },
        { label: "Update User", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <PageHeader title="Update User Details" breadcrumbs={breadcrumbs} />

                {/* Form Component with hook logic */}
                <UpdateUserForm />
            </div>
        </DashboardLayout>
    );
};

export default UpdateUser;
