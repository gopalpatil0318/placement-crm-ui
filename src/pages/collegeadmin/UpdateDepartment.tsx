import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import UpdateDepartmentForm from "@/components/collegeadmin/departmentManagement/UpdateDepartmentForm";
import PageHeader from "@/components/collegeadmin/PageHeader";

const UpdateDepartment = () => {
    const breadcrumbs = [
        { label: "College Admin" },
        { label: "Departments" },
        { label: "Update Department", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <PageHeader title="Update Department Details" breadcrumbs={breadcrumbs} />

                {/* Form Component with hook logic */}
                <UpdateDepartmentForm />
            </div>
        </DashboardLayout>
    );
};

export default UpdateDepartment;
