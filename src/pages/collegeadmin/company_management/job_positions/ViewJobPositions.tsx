import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, Target } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewJobs } from "@/hooks/collegeadmin/company_management/job_postings/useViewJobs";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Job Positions", active: true },
];

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
    published: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    closed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

// ========================
// COMPONENT
// ========================

const ViewJobPositions = () => {
    const navigate = useNavigate();
    const {
        jobs,
        loading,
        pagination,
        search,
        statusFilter,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
    } = useViewJobs();

    const startEntry = jobs.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    const skeletonRows = useMemo(
        () =>
            Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
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
                <PageHeader title="Job Positions" breadcrumbs={BREADCRUMBS} />

                <div className="w-full">
                    <div className="p-8 bg-white rounded-xl border">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-semibold text-gray-800">Manage Positions by Job</h1>
                                {!loading && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                        Total Jobs : {pagination.total}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by job title or company..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full md:w-64 border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="closed">Closed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <div className="text-sm text-gray-600 font-semibold ml-auto flex items-center gap-2">
                                Show
                                <select
                                    value={pagination.limit}
                                    onChange={(e) => handleLimitChange(Number(e.target.value))}
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
                                        <th className="px-4 py-3">JOB TITLE</th>
                                        <th className="px-4 py-3">COMPANY</th>
                                        <th className="px-4 py-3">POSITIONS</th>
                                        <th className="px-4 py-3">STATUS</th>
                                        <th className="px-4 py-3">ACTIONS</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        skeletonRows
                                    ) : jobs.length > 0 ? (
                                        jobs.map((job, index) => {
                                            const badge = STATUS_BADGE[job.job_status] || STATUS_BADGE.draft;
                                            return (
                                                <tr
                                                    key={job.job_id}
                                                    className="border-b hover:bg-blue-50 text-sm transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {(pagination.page - 1) * pagination.limit + index + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                <Target size={16} className="text-purple-600" />
                                                            </div>
                                                            <span
                                                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                onClick={() => navigate(`/college/job/${job.job_id}`)}
                                                            >
                                                                {job.job_title}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 font-medium">
                                                        {job.company_name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                            {job.positions_count ?? 0} positions
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                            {job.job_status.charAt(0).toUpperCase() + job.job_status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/college/job/${job.job_id}/positions`)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                        >
                                                            <Target size={12} /> Manage
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-500">
                                                No jobs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 mt-4 border-t text-sm text-gray-600 font-semibold">
                            <div>
                                Showing {startEntry} to {endEntry} of {pagination.total} entries
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page <= 1 || loading}
                                        className="flex items-center gap-1 px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
                                    >
                                        <ChevronLeft size={14} />
                                        Previous
                                    </button>

                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
                                        {pagination.page}
                                    </span>
                                    <span className="text-gray-400">of {pagination.totalPages}</span>

                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages || loading}
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

export default ViewJobPositions;
