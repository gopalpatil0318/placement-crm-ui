import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Search,
    Briefcase,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    SlidersHorizontal,
    MapPin,
    Calendar,
    Users,
} from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { useViewJobs, type JobListItem } from "@/hooks/collegeadmin/company_management/job_postings/useViewJobs";
import { useViewCompanies } from "@/hooks/collegeadmin/company_management/useViewCompanies";
import { DRIVE_TYPE_LABELS } from "@/validators/JobPostingSchema";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Jobs", active: true },
];

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
    draft:     { bg: "bg-gray-100 dark:bg-gray-800",           text: "text-gray-700 dark:text-gray-300",       dot: "bg-gray-500" },
    published: { bg: "bg-emerald-50 dark:bg-emerald-900/20",   text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    closed:    { bg: "bg-blue-50 dark:bg-blue-900/20",         text: "text-blue-700 dark:text-blue-400",       dot: "bg-blue-500" },
    cancelled: { bg: "bg-red-50 dark:bg-red-900/20",           text: "text-red-600 dark:text-red-400",         dot: "bg-red-400" },
};

const DRIVE_TYPE_BADGE: Record<string, string> = {
    on_campus:   "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
    off_campus:  "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    pool_campus: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
};

// ========================
// COMPANY AVATAR
// ========================

const AVATAR_COLORS = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
];

const CompanyCell = ({ job }: { job: JobListItem }) => {
    const colorIdx = job.company_name.charCodeAt(0) % AVATAR_COLORS.length;
    const initials = job.company_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex items-center gap-3">
            {job.company_logo ? (
                <img
                    src={job.company_logo}
                    alt={job.company_name}
                    className="h-8 w-8 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                />
            ) : (
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[colorIdx]}`}>
                    {initials}
                </div>
            )}
            <span className="text-gray-700 dark:text-gray-300 font-medium">{job.company_name}</span>
        </div>
    );
};

// ========================
// SORTABLE COLUMN HEADER
// ========================

const SortHeader = ({
    label,
    field,
    currentSort,
    currentOrder,
    onSort,
}: {
    label: string;
    field: string;
    currentSort: string;
    currentOrder: string;
    onSort: (field: string) => void;
}) => {
    const isActive = currentSort === field;
    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
            {label}
            {isActive ? (
                currentOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3 text-blue-600" />
                ) : (
                    <ArrowDown className="h-3 w-3 text-blue-600" />
                )
            ) : (
                <ArrowUpDown className="h-3 w-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500" />
            )}
        </button>
    );
};

// ========================
// NUMBERED PAGINATION WITH ELLIPSIS
// ========================

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

    const pages: (number | "ellipsis")[] = [];
    const addPage = (p: number) => {
        if (!pages.includes(p)) pages.push(p);
    };

    addPage(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        addPage(i);
    }
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) addPage(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition text-gray-600 dark:text-gray-400"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((p, idx) =>
                p === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        className={`min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium transition ${
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
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition text-gray-600 dark:text-gray-400"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

// ========================
// EMPTY STATES
// ========================

const EmptyState = ({
    hasFilters,
    onCreateJob,
}: {
    hasFilters: boolean;
    onCreateJob: () => void;
}) =>
    hasFilters ? (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No results match your filters</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">No job postings yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first job posting for campus placements.</p>
            <button
                type="button"
                onClick={onCreateJob}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Plus size={16} /> Create Job
            </button>
        </div>
    );

// ========================
// SKELETON
// ========================

const SkeletonRows = () => (
    <>
        {Array.from({ length: 6 }).map((_, i) => (
            <tr key={`skel-${i}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-6" /></td>
                <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800" />
                        <div className="space-y-1.5">
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-44" />
                            <div className="h-3 bg-gray-50 dark:bg-gray-800/50 rounded w-24" />
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" />
                    </div>
                </td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800/50 rounded-full w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800/50 rounded-full w-20" /></td>
                <td className="px-4 py-3.5"><div className="h-6 bg-gray-50 dark:bg-gray-800/50 rounded-full w-10" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800/50 rounded w-24" /></td>
                <td className="px-4 py-3.5"><div className="h-4 bg-gray-50 dark:bg-gray-800/50 rounded w-24" /></td>
            </tr>
        ))}
    </>
);

// ========================
// COMPONENT
// ========================

const ViewJobs = () => {
    const navigate = useNavigate();
    const {
        jobs,
        loading,
        pagination,
        search,
        statusFilter,
        jobTypeFilter,
        driveTypeFilter,
        companyFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleJobTypeFilterChange,
        handleDriveTypeFilterChange,
        handleCompanyFilterChange,
        handleSortChange,
    } = useViewJobs();

    const { companies: activeCompanies, loading: companiesLoading } = useViewCompanies({ limit: 100, status: "active" });

    const hasFilters = !!(search || statusFilter || jobTypeFilter || driveTypeFilter || companyFilter);
    const startEntry = jobs.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    const handleCreateJob = useCallback(() => navigate("/college/create-job"), [navigate]);

    const selectClass = "border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors appearance-none [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800";

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Job Postings" breadcrumbs={BREADCRUMBS} />

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Manage Jobs</h2>
                                {!loading && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{pagination.total} total job posting{pagination.total !== 1 ? "s" : ""}</p>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCreateJob}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm mt-4 sm:mt-0"
                        >
                            <Plus size={16} /> Create Job
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 max-w-sm">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by title, company, location..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    maxLength={100}
                                    aria-label="Search jobs"
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                                />
                            </div>

                            {/* Status */}
                            <select value={statusFilter} onChange={(e) => handleStatusFilterChange(e.target.value)} aria-label="Filter by status" className={selectClass}>
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="closed">Closed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            {/* Job Type */}
                            <select value={jobTypeFilter} onChange={(e) => handleJobTypeFilterChange(e.target.value)} aria-label="Filter by job type" className={selectClass}>
                                <option value="">All Types</option>
                                <option value="full-time">Full-time</option>
                                <option value="internship">Internship</option>
                                <option value="both">Both</option>
                            </select>

                            {/* Drive Type */}
                            <select value={driveTypeFilter} onChange={(e) => handleDriveTypeFilterChange(e.target.value)} aria-label="Filter by drive type" className={selectClass}>
                                <option value="">All Drives</option>
                                <option value="on_campus">On Campus</option>
                                <option value="off_campus">Off Campus</option>
                                <option value="pool_campus">Pool Campus</option>
                            </select>

                            {/* Company */}
                            <select value={companyFilter} onChange={(e) => handleCompanyFilterChange(e.target.value)} disabled={companiesLoading} aria-label="Filter by company" className={selectClass}>
                                <option value="">{companiesLoading ? "Loading..." : "All Companies"}</option>
                                {activeCompanies.map((c) => (
                                    <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                                ))}
                            </select>

                            {/* Page Size */}
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ml-auto">
                                Show
                                <select
                                    value={pagination.limit}
                                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Mobile card layout */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={`mob-skel-${i}`} className="px-4 py-4 animate-pulse space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                                            <div className="h-3 bg-gray-50 dark:bg-gray-800/50 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-5 bg-gray-50 dark:bg-gray-800/50 rounded-full w-16" />
                                        <div className="h-5 bg-gray-50 dark:bg-gray-800/50 rounded-full w-16" />
                                    </div>
                                </div>
                            ))
                        ) : jobs.length > 0 ? (
                            jobs.map((job) => {
                                const badge = STATUS_BADGE[job.job_status] || STATUS_BADGE.draft;
                                const colorIdx = job.company_name.charCodeAt(0) % AVATAR_COLORS.length;
                                const initials = job.company_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                                return (
                                    <button
                                        key={job.job_id}
                                        type="button"
                                        onClick={() => navigate(`/college/job/${job.job_id}`)}
                                        className="w-full text-left px-4 py-4 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            {job.company_logo ? (
                                                <img src={job.company_logo} alt={job.company_name} className="h-10 w-10 rounded-xl object-cover border border-gray-100 dark:border-gray-700 flex-shrink-0" />
                                            ) : (
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[colorIdx]}`}>
                                                    {initials}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{job.job_title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company_name}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                        {job.job_status.charAt(0).toUpperCase() + job.job_status.slice(1)}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                                                        {job.job_type}
                                                    </span>
                                                    {job.drive_type && job.drive_type !== "on_campus" && (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DRIVE_TYPE_BADGE[job.drive_type] || DRIVE_TYPE_BADGE.on_campus}`}>
                                                            {DRIVE_TYPE_LABELS[job.drive_type] || job.drive_type}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {job.job_location}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> {job.positions_count ?? 0} pos.
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(job.application_deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1" />
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <EmptyState hasFilters={hasFilters} onCreateJob={handleCreateJob} />
                        )}
                    </div>

                    {/* Desktop table layout */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 dark:bg-gray-800/50 text-left text-gray-500 dark:text-gray-400">
                                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-12">#</th>
                                    <th scope="col" className="px-4 py-3">
                                        <SortHeader label="Job Title" field="job_title" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        <SortHeader label="Company" field="company_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-4 py-3">
                                        <SortHeader label="Status" field="job_status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Positions</th>
                                    <th scope="col" className="px-4 py-3">
                                        <SortHeader label="Deadline" field="application_deadline" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        <SortHeader label="Created" field="created_at" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSortChange} />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <SkeletonRows />
                                ) : jobs.length > 0 ? (
                                    jobs.map((job, index) => {
                                        const badge = STATUS_BADGE[job.job_status] || STATUS_BADGE.draft;
                                        return (
                                            <tr
                                                key={job.job_id}
                                                className="group border-b border-gray-50 dark:border-gray-800 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/college/job/${job.job_id}`)}
                                            >
                                                <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-sm">
                                                    {(pagination.page - 1) * pagination.limit + index + 1}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                                            <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {job.job_title}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{job.job_location}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <CompanyCell job={job} />
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                                                            {job.job_type}
                                                        </span>
                                                        {job.drive_type && job.drive_type !== "on_campus" && (
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${DRIVE_TYPE_BADGE[job.drive_type] || DRIVE_TYPE_BADGE.on_campus}`}>
                                                                {DRIVE_TYPE_LABELS[job.drive_type] || job.drive_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                        {job.job_status.charAt(0).toUpperCase() + job.job_status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                                                        {job.positions_count ?? 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(job.application_deadline).toLocaleDateString("en-IN", {
                                                        day: "2-digit", month: "short", year: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(job.created_at).toLocaleDateString("en-IN", {
                                                        day: "2-digit", month: "short", year: "numeric",
                                                    })}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8}>
                                            <EmptyState hasFilters={hasFilters} onCreateJob={handleCreateJob} />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {!loading && jobs.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-8 py-4 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startEntry}–{endEntry}</span> of{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span> results
                            </p>
                            <div className="mt-2 sm:mt-0">
                                <Pagination
                                    page={pagination.page}
                                    totalPages={pagination.totalPages}
                                    loading={loading}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ViewJobs;
