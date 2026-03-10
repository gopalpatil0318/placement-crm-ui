import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import CreateCompanyContactForm from "@/components/collegeadmin/company_management/Company_Contact/CreateCompanyContactForm";
import { useViewCompanies } from "@/hooks/collegeadmin/company_management/Company/useViewCompanies";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Company Contacts", path: "/college/company-contacts" },
    { label: "Add Contact", active: true },
];

const AddCompanyContact = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlCompanyId = searchParams.get("companyId");

    const { companies, loading } = useViewCompanies();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(urlCompanyId || "");

    useEffect(() => {
        if (urlCompanyId && !selectedCompanyId) {
            setSelectedCompanyId(urlCompanyId);
        }
    }, [urlCompanyId, selectedCompanyId]);

    const handleSuccess = () => {
        navigate("/college/company-contacts");
    };

    const handleCancel = () => {
        navigate("/college/company-contacts");
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Add Company Contact" breadcrumbs={BREADCRUMBS} />

                <div className="max-w-3xl">
                    <div className="p-8 bg-white rounded-xl border mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Which Company are you adding a contact for? <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                            disabled={loading}
                            className={`w-full border rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${!selectedCompanyId ? "border-amber-300 bg-amber-50" : "border-gray-300"}`}
                        >
                            <option value="">-- Select a Company --</option>
                            {companies.map((company) => (
                                <option key={company.company_id} value={company.company_id}>
                                    {company.company_name}
                                </option>
                            ))}
                        </select>
                        {!selectedCompanyId && !loading && (
                            <p className="text-sm text-amber-600 mt-2 font-medium">Please select a company above first to proceed.</p>
                        )}
                    </div>

                    {selectedCompanyId && (
                        <CreateCompanyContactForm
                            companyId={selectedCompanyId}
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddCompanyContact;
