import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import UpdateCompanyForm from "@/components/collegeadmin/company_management/UpdateCompanyForm";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const UpdateCompany = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const [companyName, setCompanyName] = useState("");

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Companies", path: "/college/companies" },
            { label: companyName || "Edit Company", active: true },
        ],
        [companyName]
    );

    const handleCompanyLoaded = useCallback((name: string) => {
        setCompanyName(name);
    }, []);

    return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Edit Company" breadcrumbs={breadcrumbs} />
                    <UpdateCompanyForm companyId={companyId} onCompanyLoaded={handleCompanyLoaded} />
                </div>
            </AnimatedPage>
    );
};

export default UpdateCompany;
