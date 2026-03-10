import { useParams } from "react-router-dom";
import UpdateCompanyForm from "@/components/collegeadmin/company_management/Company/UpdateCompanyForm";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";

const UpdateCompany = () => {
    const { companyId } = useParams<{ companyId: string }>();

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Companies", path: "/college/companies" },
        { label: "Update Company", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <PageHeader title="Update Company" breadcrumbs={breadcrumbs} />

                {/* Form Component with hook logic */}
                <UpdateCompanyForm companyId={companyId} />
            </div>
        </DashboardLayout>
    );
};

export default UpdateCompany;
