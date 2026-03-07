import CreateDepartmentForm from "@/components/collegeadmin/departmentManagement/CreateDepartmentForm";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";

const CreateDepartment = () => {
    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Departments", path: "/college/departments" },
        { label: "Create New", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <PageHeader title="Create New Department" breadcrumbs={breadcrumbs} />

                {/* Form Component with hook logic */}
                <CreateDepartmentForm />
            </div>
        </DashboardLayout>
    );
};

export default CreateDepartment;
