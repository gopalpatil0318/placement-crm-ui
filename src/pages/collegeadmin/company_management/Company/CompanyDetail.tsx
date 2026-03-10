import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Building2,
    Globe,
    ArrowLeft,
    ExternalLink,
    Users,
    Briefcase,
    Pencil,
    Power,
    X,
} from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewCompany } from "@/hooks/collegeadmin/company_management/Company/useViewCompany";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import EditCompanyContactModal from "@/components/collegeadmin/company_management/Company_Contact/EditCompanyContactModal";

// ========================
// COMPONENT
// ========================

const CompanyDetail = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const navigate = useNavigate();
    const { company, loading, error, refresh } = useViewCompany(companyId);
    const [toggling, setToggling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [contactToEdit, setContactToEdit] = useState<any>(null);

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Companies", path: "/college/companies" },
        { label: company?.company_name || "Company Detail", active: true },
    ];

    // ========================
    // STATUS TOGGLE
    // ========================

    const handleToggleStatus = async () => {
        if (!company) return;
        setToggling(true);

        try {
            const newStatus = company.company_status === "active" ? "inactive" : "active";
            await CollegeAdminService.toggleCompanyStatus(company.company_id, newStatus);
            showToast({
                type: "success",
                title: "Status Updated",
                description: `Company ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
            });
            refresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to toggle company status";
            showToast({ type: "error", title: "Error", description: msg });
        } finally {
            setToggling(false);
            setShowConfirm(false);
        }
    };

    const handleToggleContactStatus = async (contactId: string, currentStatus: boolean) => {
        try {
            await CollegeAdminService.toggleContactStatus(contactId, !currentStatus);
            showToast({
                type: "success",
                title: "Status Updated",
                description: `Contact ${!currentStatus ? "activated" : "deactivated"} successfully`,
            });
            refresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to toggle contact status";
            showToast({ type: "error", title: "Error", description: msg });
        }
    };

    // ========================
    // LOADING / ERROR
    // ========================

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-8">
                    <PageHeader title="Company Detail" breadcrumbs={breadcrumbs} />
                    <div className="p-8 bg-white rounded-xl border animate-pulse">
                        <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
                        <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                        <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !company) {
        return (
            <DashboardLayout>
                <div className="space-y-8">
                    <PageHeader title="Company Detail" breadcrumbs={breadcrumbs} />
                    <div className="p-8 bg-white rounded-xl border text-center">
                        <p className="text-red-500 font-medium">
                            {error || "Company not found"}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/college/companies")}
                            className="mt-4 text-blue-600 hover:underline font-medium"
                        >
                            ← Back to Companies
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const isActive = company.company_status === "active";

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader
                    title="Company Details"
                    breadcrumbs={breadcrumbs}
                />

                <div className="w-full">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/college/companies")}
                                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </button>

                                <div className="h-6 w-px bg-slate-200" />

                                {company.company_logo ? (
                                    <img
                                        src={company.company_logo}
                                        alt={company.company_name}
                                        className="h-12 w-12 rounded-xl object-contain border bg-white flex-shrink-0"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Building2 size={22} className="text-blue-600" />
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900">
                                        {company.company_name}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Company Overview & Details
                                    </p>
                                </div>

                                <span
                                    className={`ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isActive
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`}
                                    />
                                    {isActive ? "Active" : "Inactive"}
                                </span>

                                {company.industry && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                        {company.industry}
                                    </span>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/college/update-company/${company.company_id}`)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
                                >
                                    <Pencil size={16} />
                                    Edit Company
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(true)}
                                    disabled={toggling}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 ${isActive
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-green-600 text-white hover:bg-green-700"
                                        }`}
                                >
                                    <Power size={16} />
                                    {isActive ? "Deactivate" : "Activate"}
                                </button>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {company.company_website && (
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Globe size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">
                                            Website
                                        </p>
                                        <a
                                            href={company.company_website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            {company.company_website}
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {company.company_description && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">
                                    Description
                                </p>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {company.company_description}
                                </p>
                            </div>
                        )}

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                                <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                    <Users size={18} className="text-cyan-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-cyan-700">
                                        {company.contacts_count ?? 0}
                                    </p>
                                    <p className="text-xs text-cyan-600 font-medium">
                                        Total Contacts
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Users size={18} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {company.active_contacts_count ?? 0}
                                    </p>
                                    <p className="text-xs text-blue-600 font-medium">
                                        Active Contacts
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Briefcase size={18} className="text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-orange-700">
                                        {company.jobs_count ?? 0}
                                    </p>
                                    <p className="text-xs text-orange-600 font-medium">
                                        Jobs Posted
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contacts Section */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Company Contacts
                                </h3>
                                <button
                                    onClick={() => navigate(`/college/add-company-contact?companyId=${company.company_id}`)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold"
                                >
                                    Add Contact
                                </button>
                            </div>

                            {company.contacts && company.contacts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                                                <th className="px-4 py-3">#</th>
                                                <th className="px-4 py-3">NAME</th>
                                                <th className="px-4 py-3">DESIGNATION</th>
                                                <th className="px-4 py-3">EMAIL</th>
                                                <th className="px-4 py-3">PHONE</th>
                                                <th className="px-4 py-3">TYPE</th>
                                                <th className="px-4 py-3">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {company.contacts
                                                // Sort primary first
                                                .sort((a: any, b: any) => (b.is_primary === a.is_primary ? 0 : b.is_primary ? 1 : -1))
                                                .map((contact: any, idx: number) => (
                                                    <tr
                                                        key={contact.contact_id}
                                                        className={`border-b text-sm ${contact.is_primary ? "bg-amber-50/30" : ""}`}
                                                    >
                                                        <td className="px-4 py-3 text-gray-500">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">
                                                            {contact.contact_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {contact.contact_designation || (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {contact.contact_email || (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {contact.contact_phone || (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {contact.is_primary ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                                                                    ⭐ Primary
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                                    Secondary
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => setContactToEdit(contact)}
                                                                    title="Edit Contact"
                                                                    className="p-1.5 rounded-md text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                                                                >
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleContactStatus(contact.contact_id, contact.is_active)}
                                                                    title={contact.is_active ? "Deactivate Contact" : "Activate Contact"}
                                                                    className={`p-1.5 rounded-md text-white transition-opacity hover:opacity-80 ${contact.is_active ? "bg-red-500" : "bg-green-500"}`}
                                                                >
                                                                    <Power size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                    <p className="text-gray-500 mb-2 font-medium">No contacts added yet.</p>
                                    <p className="text-sm text-gray-400 mb-4">Add a contact to easily communicate with this company.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t border-slate-100">
                            <p className="text-xs text-slate-400">
                                Company ID:{" "}
                                <span className="font-mono text-slate-500">
                                    {company.company_id}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Toggle Status Confirmation Modal ===== */}
            {
                showConfirm && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        onClick={() => !toggling && setShowConfirm(false)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-800">
                                    {isActive
                                        ? "Deactivate Company"
                                        : "Activate Company"}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(false)}
                                    disabled={toggling}
                                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="px-6 py-5">
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to{" "}
                                    <span className="font-bold">
                                        {isActive ? "deactivate" : "activate"}
                                    </span>{" "}
                                    <span className="font-bold">
                                        "{company.company_name}"
                                    </span>
                                    ?
                                </p>
                                {isActive && (
                                    <p className="text-xs text-amber-600 mt-3 bg-amber-50 px-3 py-2 rounded-lg">
                                        ⚠️ This company will be hidden from new job creation.
                                    </p>
                                )}
                            </div>

                            <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(false)}
                                    disabled={toggling}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleToggleStatus}
                                    disabled={toggling}
                                    className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${isActive
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                        }`}
                                >
                                    {toggling && (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    )}
                                    {toggling
                                        ? "Updating..."
                                        : isActive
                                            ? "Deactivate"
                                            : "Activate"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* ===== Edit Contact Modal ===== */}
            {contactToEdit && (
                <EditCompanyContactModal
                    contact={contactToEdit}
                    onClose={() => setContactToEdit(null)}
                    onSuccess={() => {
                        setContactToEdit(null);
                        refresh();
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default CompanyDetail;



