import CreateCompanyForm from "@/components/collegeadmin/company_management/Company/CreateCompanyForm";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";

const CreateCompany = () => {
    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Companies", path: "/college/companies" },
        { label: "Create New", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <PageHeader title="Create New Company" breadcrumbs={breadcrumbs} />

                {/* Form Component with hook logic */}
                <CreateCompanyForm />
            </div>
        </DashboardLayout>
    );
};

export default CreateCompany;
