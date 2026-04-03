import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Search,
    Building2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList";
import { useViewCompanies, type Company } from "@/hooks/collegeadmin/company_management/useViewCompanies";
import { INDUSTRY_OPTIONS } from "@/validators/CompanySchema";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const SORT_OPTIONS: { value: string; label: string }[] = [
    { value: "created_at", label: "Created Date" },
    { value: "company_name", label: "Company Name" },
    { value: "industry", label: "Industry" },
    { value: "updated_at", label: "Last Updated" },
];

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Companies", active: true },
];

// ========================
// HELPER: initials avatar
// ========================

const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

// Colors rotate by first letter for visual variety
const INITIALS_COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-cyan-100 text-cyan-700",
    "bg-pink-100 text-pink-700",
    "bg-amber-100 text-amber-700",
    "bg-teal-100 text-teal-700",
] as const;

const getInitialsColor = (name: string) =>
    INITIALS_COLORS[(name.codePointAt(0) ?? 0) % INITIALS_COLORS.length];

// ========================
// SUB-COMPONENTS
// ========================

/** Company logo with automatic initials-avatar fallback */
const CompanyAvatar = ({ company }: { company: Company }) => {
    const [imgError, setImgError] = useState(false);

    if (company.company_logo && !imgError) {
        return (
            <img
                src={company.company_logo}
                alt={company.company_name}
                className="h-9 w-9 rounded-lg object-contain border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0"
                onError={() => setImgError(true)}
            />
        );
    }

    return (
        <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${getInitialsColor(company.company_name)}`}
        >
            {getInitials(company.company_name)}
        </div>
    );
};

/** Pagination with numbered pages */
const Pagination = ({
    page,
    totalPages,
    loading,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    loading: boolean;
    onPageChange: (p: number) => void;
}) => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const addPage = (p: number) => {
        if (!pages.includes(p)) pages.push(p);
    };

    addPage(1);
    if (page > 3) pages.push("ellipsis-start");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        addPage(i);
    }
    if (page < totalPages - 2) pages.push("ellipsis-end");
    if (totalPages > 1) addPage(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((p) =>
                typeof p === "string" ? (
                    <span key={p} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        className={`min-w-[44px] min-h-[44px] rounded-md text-sm font-medium transition ${
                            p === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        } disabled:cursor-not-allowed`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

/** Empty state */
const EmptyState = ({ hasFilters, onAdd }: Readonly<{ hasFilters: boolean; onAdd: () => void }>) => (
    <div className="flex flex-col items-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
            <Building2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            {hasFilters ? "No companies match your filters" : "No companies yet"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {hasFilters
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by registering your first company. You can add contacts and job postings later."}
        </p>
        {!hasFilters && (
            <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
                <Plus className="h-4 w-4" />
                Add Your First Company
            </button>
        )}
    </div>
);

// ========================
// COMPONENT
// ========================

const ViewCompanies = () => {
    const navigate = useNavigate();
    const {
        companies,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        industryFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleIndustryFilterChange,
        handleSortChange,
        handleSortOrderToggle,
    } = useViewCompanies();

    const hasFilters = search !== "" || statusFilter !== "" || industryFilter !== "";

    const startEntry = companies.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    // Skeleton rows
    const skeletonRows = useMemo(
        () =>
            ['skel-0', 'skel-1', 'skel-2', 'skel-3', 'skel-4'].map((id) => (
                <tr key={id} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-6" /></td>
                    <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
                            <div className="space-y-1.5">
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-3.5"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-16" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-10" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-10" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                </tr>
            )),
        []
    );

    // Sort direction icon
    const SortIcon = sortOrder === "asc" ? ArrowUp : ArrowDown;

    return (
            <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Company Management" breadcrumbs={BREADCRUMBS} />

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    {/* â”€â”€ Header â”€â”€ */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Companies</h2>
                                {!loading && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {pagination.total} {pagination.total === 1 ? "company" : "companies"} registered
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/college/create-company")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Add Company
                        </button>
                    </div>

                    {/* â”€â”€ Filters bar â”€â”€ */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                aria-label="Search companies"
                                maxLength={100}
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                handleStatusFilterChange(e.target.value as "" | "active" | "inactive")
                            }
                            aria-label="Filter by status"
                            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {/* Industry */}
                        <select
                            value={industryFilter}
                            onChange={(e) => handleIndustryFilterChange(e.target.value)}
                            aria-label="Filter by industry"
                            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="">All Industries</option>
                            {INDUSTRY_OPTIONS.map((ind) => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </select>

                        {/* Sort */}
                        <div className="flex items-center gap-1 ml-auto">
                            <ArrowUpDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                aria-label="Sort by"
                                className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleSortOrderToggle}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                title={sortOrder === "asc" ? "Ascending — click to reverse" : "Descending — click to reverse"}
                            >
                                <SortIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Show entries */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <span>Show</span>
                            <select
                                value={pagination.limit}
                                onChange={(e) => handleLimitChange(Number(e.target.value))}
                                className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* â”€â”€ Table â”€â”€ */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                    <th scope="col" className="px-4 py-3 w-12">#</th>
                                    <th scope="col" className="px-4 py-3">Company</th>
                                    <th scope="col" className="px-4 py-3">Status</th>
                                    <th scope="col" className="px-4 py-3 text-center">Contacts</th>
                                    <th scope="col" className="px-4 py-3 text-center">Jobs</th>
                                    <th scope="col" className="px-4 py-3">Created</th>
                                </tr>
                            </thead>

                            {loading && (
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">{skeletonRows}</tbody>
                            )}
                            {!loading && error && (
                                <tbody>
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please try refreshing the page.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                            {!loading && !error && companies.length > 0 && (
                                <AnimatedTableBody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {companies.map((company, index) => (
                                        <AnimatedRow
                                            key={company.company_id}
                                            className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors text-sm cursor-pointer"
                                            onClick={() => navigate(`/college/company/${company.company_id}`)}
                                        >
                                            {/* # */}
                                            <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-xs">
                                                {(pagination.page - 1) * pagination.limit + index + 1}
                                            </td>

                                            {/* Company: avatar + name + industry */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <CompanyAvatar company={company} />
                                                    <div className="min-w-0">
                                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate block">
                                                            {company.company_name}
                                                        </span>
                                                        {company.industry && (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                {company.industry}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        company.company_status === "active"
                                                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            company.company_status === "active"
                                                                ? "bg-emerald-500"
                                                                : "bg-red-400"
                                                        }`}
                                                    />
                                                    {company.company_status === "active" ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Contacts count */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                    {company.contacts_count ?? 0}
                                                </span>
                                            </td>

                                            {/* Jobs count */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                    {company.jobs_count ?? 0}
                                                </span>
                                            </td>

                                            {/* Created date */}
                                            <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                                {new Date(company.created_at).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                        </AnimatedRow>
                                    ))}
                                </AnimatedTableBody>
                            )}
                            {!loading && !error && companies.length === 0 && (
                                <tbody>
                                    <tr>
                                        <td colSpan={6}>
                                            <EmptyState
                                                hasFilters={hasFilters}
                                                onAdd={() => navigate("/college/create-company")}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>

                    {/* â”€â”€ Pagination footer â”€â”€ */}
                    {!loading && companies.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>
                                {"Showing "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">{startEntry}</span>
                                {"–"}
                                <span className="font-medium text-gray-700 dark:text-gray-300">{endEntry}</span>
                                {" of "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span>
                            </span>

                            <Pagination
                                page={pagination.page}
                                totalPages={pagination.totalPages}
                                loading={loading}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
            </AnimatedPage>
    );
};

export default ViewCompanies;
