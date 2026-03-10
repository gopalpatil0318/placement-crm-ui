import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft, ChevronRight, Search, Building2 } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewCompanies } from "@/hooks/collegeadmin/company_management/Company/useViewCompanies";
import { INDUSTRY_OPTIONS } from "@/validators/CompanySchema";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Companies", active: true },
];

// ========================
// COMPONENT
// ========================

const ViewCompanies = () => {
    const navigate = useNavigate();
    const {
        companies,
        loading,
        pagination,
        search,
        statusFilter,
        industryFilter,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleIndustryFilterChange,
    } = useViewCompanies();

    const startEntry =
        companies.length > 0
            ? (pagination.page - 1) * pagination.limit + 1
            : 0;
    const endEntry = Math.min(
        pagination.page * pagination.limit,
        pagination.total
    );

    // ========================
    // SKELETON ROWS
    // ========================
    const skeletonRows = useMemo(
        () =>
            Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded w-3/4" />
                        </td>
                    ))}
                </tr>
            )),
        []
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Company Management" breadcrumbs={BREADCRUMBS} />

                <div className="w-full">
                    <div className="p-8 bg-white rounded-xl border">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-semibold text-gray-800">
                                    Manage Companies
                                </h1>
                                {!loading && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                        Total : {pagination.total}
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/college/create-company")}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold mt-3 sm:mt-0"
                            >
                                <Plus size={16} />
                                Add Company
                            </button>
                        </div>

                        {/* Filters Row — Search left, filters middle, Show entries right */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            {/* Left: Search */}
                            <div className="relative">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name or industry..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full md:w-64 border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Middle: Status filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    handleStatusFilterChange(
                                        e.target.value as "" | "active" | "inactive"
                                    )
                                }
                                className="border rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            {/* Middle: Industry filter */}
                            <select
                                value={industryFilter}
                                onChange={(e) => handleIndustryFilterChange(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Industries</option>
                                {INDUSTRY_OPTIONS.map((ind) => (
                                    <option key={ind} value={ind}>
                                        {ind}
                                    </option>
                                ))}
                            </select>

                            {/* Right: Show entries */}
                            <div className="text-sm text-gray-600 font-semibold ml-auto flex items-center gap-2">
                                Show
                                <select
                                    value={pagination.limit}
                                    onChange={(e) =>
                                        handleLimitChange(Number(e.target.value))
                                    }
                                    className="border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                entries
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">COMPANY</th>
                                        <th className="px-4 py-3">INDUSTRY</th>
                                        <th className="px-4 py-3">STATUS</th>
                                        <th className="px-4 py-3">CONTACTS</th>
                                        <th className="px-4 py-3">JOBS</th>
                                        <th className="px-4 py-3">CREATED</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        skeletonRows
                                    ) : companies.length > 0 ? (
                                        companies.map((company, index) => (
                                            <tr
                                                key={company.company_id}
                                                className="border-b hover:bg-blue-50 text-sm cursor-pointer transition-colors"
                                                onClick={() =>
                                                    navigate(
                                                        `/college/company/${company.company_id}`
                                                    )
                                                }
                                            >
                                                <td className="px-4 py-3 text-gray-500">
                                                    {(pagination.page - 1) *
                                                        pagination.limit +
                                                        index +
                                                        1}
                                                </td>

                                                <td className="px-4 py-3 font-medium">
                                                    <div className="flex items-center gap-3">
                                                        {company.company_logo ? (
                                                            <img
                                                                src={company.company_logo}
                                                                alt={company.company_name}
                                                                className="h-8 w-8 rounded-lg object-contain border bg-white flex-shrink-0"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = "none";
                                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 ${company.company_logo ? "hidden" : ""}`}>
                                                            <Building2 size={16} className="text-blue-600" />
                                                        </div>
                                                        <span className="text-blue-600 hover:text-blue-800 hover:underline">
                                                            {company.company_name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-gray-600">
                                                    {company.industry ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                            {company.industry}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${company.company_status === "active"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${company.company_status === "active"
                                                                ? "bg-green-500"
                                                                : "bg-red-500"
                                                                }`}
                                                        />
                                                        {company.company_status === "active"
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700">
                                                        {company.contacts_count ?? 0}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                        {company.jobs_count ?? 0}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(company.created_at).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="text-center py-10 text-gray-500"
                                            >
                                                No companies found. Click "Add
                                                Company" to create one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 mt-4 border-t text-sm text-gray-600 font-semibold">
                            <div>
                                Showing {startEntry} to {endEntry} of{" "}
                                {pagination.total} entries
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(pagination.page - 1)
                                        }
                                        disabled={pagination.page <= 1 || loading}
                                        className="flex items-center gap-1 px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
                                    >
                                        <ChevronLeft size={14} />
                                        Previous
                                    </button>

                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
                                        {pagination.page}
                                    </span>
                                    <span className="text-gray-400">
                                        of {pagination.totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(pagination.page + 1)
                                        }
                                        disabled={
                                            pagination.page >= pagination.totalPages || loading
                                        }
                                        className="flex items-center gap-1 px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
                                    >
                                        Next
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ViewCompanies;
