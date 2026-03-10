import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Mail, Phone, User as UserIcon, Star } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewCompanies } from "@/hooks/collegeadmin/company_management/Company/useViewCompanies";
import { useViewCompanyContacts } from "@/hooks/collegeadmin/company_management/Company_Contact/useViewCompanyContacts";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Companies", path: "/college/companies" },
    { label: "Contacts", active: true },
];

const CompanyContactsList = () => {
    const navigate = useNavigate();

    // Fetch companies (for simplicity, using the hook directly; you could pass limit: 100 to get a larger list or rely on search)
    const { companies, loading: companiesLoading } = useViewCompanies();

    // State for selected company
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

    // Automatically set the first company initially if none is selected
    useMemo(() => {
        if (!selectedCompanyId && companies.length > 0) {
            setSelectedCompanyId(String(companies[0].company_id));
        }
    }, [companies, selectedCompanyId]);

    // Fetch contacts for selected company
    const { contacts, loading: contactsLoading } = useViewCompanyContacts(selectedCompanyId);

    const handleAddContact = () => {
        if (selectedCompanyId) {
            navigate(`/college/add-company-contact?companyId=${selectedCompanyId}`);
        } else {
            navigate(`/college/add-company-contact`);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Company Contacts" breadcrumbs={BREADCRUMBS} />

                <div className="p-8 bg-white rounded-xl border space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 max-w-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select a Company to view its contacts:
                            </label>
                            <select
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                disabled={companiesLoading}
                                className="w-full border rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="" disabled>-- Select Company --</option>
                                {companies.map((company) => (
                                    <option key={company.company_id} value={company.company_id}>
                                        {company.company_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="self-end">
                            <button
                                type="button"
                                onClick={handleAddContact}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors"
                            >
                                <Plus size={16} />
                                Add Contact
                            </button>
                        </div>
                    </div>

                    {/* Contacts Grid */}
                    <div className="border-t pt-6">
                        {contactsLoading || companiesLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600" />
                            </div>
                        ) : !selectedCompanyId ? (
                            <div className="text-center py-12 text-gray-500">
                                Please select a company from the dropdown above.
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4 text-blue-600">
                                    <UserIcon size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No Contacts Found</h3>
                                <p className="text-gray-500 mb-4">This company doesn't have any contacts listed yet.</p>
                                <button
                                    onClick={handleAddContact}
                                    className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800"
                                >
                                    <Plus size={16} /> Add the first contact
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {contacts.map((contact: any) => (
                                    <div key={contact.contact_id} className="p-5 border rounded-xl hover:shadow-md transition-shadow bg-white relative">
                                        {contact.is_primary && (
                                            <div className="absolute top-4 right-4 text-amber-400 group relative" title="Primary Contact">
                                                <Star size={18} fill="currentColor" />
                                            </div>
                                        )}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                                                {contact.contact_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-md font-bold text-gray-900 truncate pr-6">{contact.contact_name}</h3>
                                                <p className="text-sm text-gray-500 font-medium">
                                                    {contact.contact_designation || "No Designation"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-4 text-sm text-gray-600">
                                            {contact.contact_email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail size={16} className="text-gray-400" />
                                                    <a href={`mailto:${contact.contact_email}`} className="hover:text-blue-600 hover:underline">
                                                        {contact.contact_email}
                                                    </a>
                                                </div>
                                            )}
                                            {contact.contact_phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone size={16} className="text-gray-400" />
                                                    <a href={`tel:${contact.contact_phone}`} className="hover:text-blue-600 hover:underline">
                                                        {contact.contact_phone}
                                                    </a>
                                                </div>
                                            )}
                                            {!contact.contact_email && !contact.contact_phone && (
                                                <p className="text-gray-400 italic">No contact info provided</p>
                                            )}

                                            {contact.notes && (
                                                <div className="pt-3 mt-3 border-t text-xs text-gray-500">
                                                    <span className="font-semibold block mb-1">Notes:</span>
                                                    <p className="line-clamp-2">{contact.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CompanyContactsList;
