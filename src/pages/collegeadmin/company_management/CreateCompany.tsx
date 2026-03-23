import CreateCompanyForm from "@/components/collegeadmin/company_management/CreateCompanyForm";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Companies", path: "/college/companies" },
    { label: "Register New", active: true },
];

const CreateCompany = () => {
    return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Register New Company" breadcrumbs={BREADCRUMBS} />
                    <CreateCompanyForm />
                </div>
            </AnimatedPage>
    );
};

export default CreateCompany;
