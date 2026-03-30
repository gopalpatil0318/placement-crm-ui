import { useNavigate } from "react-router-dom";
import {
    Briefcase,
    Search,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    MapPin,
    Calendar,
    Users,
    FileText,
} from "lucide-react";
import { useViewCompanyJobs } from "@/hooks/collegeadmin/company_management/useViewCompanyJobs";

// (JobItem type is imported from useViewCompanyJobs hook)

// ========================
// CONSTANTS
// ========================

const JOB_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    draft: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400" },
    published: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    closed: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    cancelled: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", dot: "bg-red-400" },
};

const JOB_STATUS_LABELS: Record<string, string> = {
    draft: "Draft",
    published: "Published",
    closed: "Closed",
    cancelled: "Cancelled",
};

const JOB_TYPE_LABELS: Record<string, string> = {
    "full-time": "Full-Time",
    internship: "Internship",
    both: "Both",
};

const PAGE_SIZES = [10, 20, 50];

// ========================
// HELPERS
// ========================

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// ========================
// SUB-COMPONENTS
// ========================

const StatusBadge = ({ status }: { status: string }) => {
    const colors = JOB_STATUS_COLORS[status] || JOB_STATUS_COLORS.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {JOB_STATUS_LABELS[status] || status}
        </span>
    );
};

const TypeBadge = ({ type }: { type: string }) => {
    const colors: Record<string, string> = {
        "full-time": "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
        internship: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
        both: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[type] || "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
            {JOB_TYPE_LABELS[type] || type}
        </span>
    );
};

const TableSkeleton = () => (
    <div className="animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 dark:border-gray-800">
                <div className="h-4 w-6 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-3 w-32 bg-gray-50 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="h-4 w-20 bg-gray-50 dark:bg-gray-700 rounded" />
                <div className="h-5 w-14 bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="h-4 w-8 bg-gray-50 dark:bg-gray-700 rounded" />
                <div className="h-4 w-8 bg-gray-50 dark:bg-gray-700 rounded" />
                <div className="h-4 w-20 bg-gray-50 dark:bg-gray-700 rounded" />
            </div>
        ))}
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

interface CompanyJobsTabProps {
    companyId: string;
    companyName: string;
}

const CompanyJobsTab = ({ companyId, companyName }: CompanyJobsTabProps) => {
    const navigate = useNavigate();

    const {
        jobs,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        typeFilter,
        handleSearchChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        handlePageChange,
        handleLimitChange,
    } = useViewCompanyJobs(companyId);

    const hasFilters = !!(search || statusFilter || typeFilter);
    const startEntry = jobs.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    // Error state
    if (error && !loading && jobs.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400 dark:text-red-500" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">Failed to load jobs</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Job Postings</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {pagination.total} total for {companyName}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by job title, location..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => handleTypeFilterChange(e.target.value)}
                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="">All Types</option>
                    <option value="full-time">Full-Time</option>
                    <option value="internship">Internship</option>
                    <option value="both">Both</option>
                </select>
            </div>

            {/* ── Table ── */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                                    #
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[220px]">
                                    Job Title
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Location
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Positions
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Applications
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Deadline
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8}>
                                        <TableSkeleton />
                                    </td>
                                </tr>
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="flex flex-col items-center py-16 text-center">
                                            {hasFilters ? (
                                                <>
                                                    <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                                                        <Search className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                                        No jobs match your filters
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        Try adjusting your search or filter criteria
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-14 w-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                                                        <Briefcase className="h-7 w-7 text-orange-400 dark:text-orange-500" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                                        No jobs posted yet
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        Once job postings are created for {companyName}, they will appear here.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job, idx) => (
                                    <tr
                                        key={job.job_id}
                                        onClick={() => navigate(`/college/job/${job.job_id}`)}
                                        className="group border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                                            {startEntry + idx}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {job.job_title}
                                                </p>
                                                {job.salary_package && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                        {job.salary_package}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <TypeBadge type={job.job_type} />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                {job.job_location || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusBadge status={job.job_status} />
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <FileText className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                {job.positions_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <Users className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                {job.applications_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                {formatDate(job.application_deadline)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.totalPages > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                                Showing {startEntry}–{endEntry} of {pagination.total} results
                            </span>
                            <select
                                value={pagination.limit}
                                onChange={(e) => handleLimitChange(Number(e.target.value))}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {PAGE_SIZES.map((s) => (
                                    <option key={s} value={s}>
                                        {s} / page
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </button>

                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter((p) => {
                                    const current = pagination.page;
                                    return p === 1 || p === pagination.totalPages || Math.abs(p - current) <= 1;
                                })
                                .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((item, i) =>
                                    item === "ellipsis" ? (
                                        <span key={`e-${i}`} className="px-1 text-gray-400 dark:text-gray-500">
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => handlePageChange(item as number)}
                                            className={`min-w-[44px] min-h-[44px] rounded-lg text-xs font-medium transition ${
                                                pagination.page === item
                                                    ? "bg-blue-600 text-white"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ),
                                )}

                            <button
                                type="button"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyJobsTab;
