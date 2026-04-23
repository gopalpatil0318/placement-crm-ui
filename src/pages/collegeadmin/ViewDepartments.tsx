import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Search,
    Building2,
    AlertCircle,
    RefreshCw,
    Users,
    GraduationCap,
    Clock,
} from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList";
import { useViewDepartments, type Department } from "@/hooks/collegeadmin/departmentManagement/useViewDepartments";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Departments", active: true },
];

// ========================
// SUB-COMPONENTS
// ========================

/** Department avatar: code badge or initials */
const DeptAvatar = ({ dept }: { dept: Department }) => {
    const display = dept.dept_code || dept.dept_name.slice(0, 2).toUpperCase();
    const COLORS = [
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
        "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
        "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
        "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    ] as const;
    const color = COLORS[(dept.dept_name.codePointAt(0) ?? 0) % COLORS.length];

    return (
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold uppercase ${color}`}>
            {display}
        </div>
    );
};

/** Numbered pagination with ellipsis */
const PaginationNav = ({
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
    const addPage = (p: number) => { if (!pages.includes(p)) pages.push(p); };

    addPage(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) addPage(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) addPage(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="min-w-[44px] h-11 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map((p, idx) =>
                p === "ellipsis" ? (
                    <span key={`ellipsis-${idx < pages.length / 2 ? "start" : "end"}`} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">...</span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        className={`min-w-[44px] h-11 rounded-md text-sm font-medium transition ${
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
                className="min-w-[44px] h-11 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

/** Empty state */
const EmptyState = ({ hasFilters, onAdd }: { hasFilters: boolean; onAdd?: () => void }) => (
    <div className="flex flex-col items-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
            <Building2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            {hasFilters ? "No departments match your filters" : "No departments yet"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {hasFilters
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by creating your first department. You can add students and users later."}
        </p>
        {!hasFilters && onAdd && (
            <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
                <Plus className="h-4 w-4" />
                Add Your First Department
            </button>
        )}
    </div>
);

// ========================
// COMPONENT
// ========================

const ViewDepartments = () => {
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const canManage = hasPermission("departments.manage");
    const {
        departments,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        refresh,
    } = useViewDepartments();

    const hasFilters = search !== "" || statusFilter !== "";
    const startEntry = departments.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    // Skeleton rows matching real column layout
    const skeletonRows = useMemo(
        () =>
            Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-desk-${String(i)}`} className="border-b border-gray-50 dark:border-gray-800 animate-pulse">
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-6" /></td>
                    <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
                            <div className="space-y-1.5">
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-12" /></td>
                    <td className="px-4 py-3.5 text-center"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8 mx-auto" /></td>
                    <td className="px-4 py-3.5 text-center"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8 mx-auto" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-16" /></td>
                </tr>
            )),
        []
    );

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Department Management" breadcrumbs={BREADCRUMBS} />

                {/* ── Error State ── */}
                {error && !loading && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800/50 p-10 flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Failed to load departments</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => refresh()}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                )}

                {!error && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Departments</h2>
                                {!loading && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {pagination.total} {pagination.total === 1 ? "department" : "departments"} registered
                                    </p>
                                )}
                            </div>
                        </div>

                        {canManage && (
                            <button
                                type="button"
                                onClick={() => navigate("/college/create-department")}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Add Department
                            </button>
                        )}
                    </div>

                    {/* ── Filters bar ── */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                aria-label="Search departments by name or code"
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value as "" | "true" | "false")}
                            aria-label="Filter by department status"
                            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>

                        {/* Show entries */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 ml-auto">
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

                    {/* ── Table (desktop md+) ── */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                    <th scope="col" className="px-4 py-3 w-12">#</th>
                                    <th scope="col" className="px-4 py-3">Department</th>
                                    <th scope="col" className="px-4 py-3">Type</th>
                                    <th scope="col" className="px-4 py-3">Duration</th>
                                    <th scope="col" className="px-4 py-3 text-center">Users</th>
                                    <th scope="col" className="px-4 py-3 text-center">Students</th>
                                    <th scope="col" className="px-4 py-3">Status</th>
                                </tr>
                            </thead>

                            {(() => {
                                if (loading) {
                                    return <tbody className="divide-y divide-gray-50 dark:divide-gray-800">{skeletonRows}</tbody>;
                                }
                                if (departments.length === 0) {
                                    return (
                                        <tbody>
                                            <tr>
                                                <td colSpan={7}>
                                                    <EmptyState
                                                        hasFilters={hasFilters}
                                                        onAdd={canManage ? () => navigate("/college/create-department") : undefined}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    );
                                }
                                return (
                                <AnimatedTableBody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {departments.map((dept, index) => (
                                        <AnimatedRow
                                            key={dept.dept_id}
                                            className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors text-sm cursor-pointer"
                                            onClick={() => navigate(`/college/department/${dept.dept_id}`)}
                                        >
                                            {/* # */}
                                            <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 text-xs">
                                                {(pagination.page - 1) * pagination.limit + index + 1}
                                            </td>

                                            {/* Department: avatar + name + code */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <DeptAvatar dept={dept} />
                                                    <div className="min-w-0">
                                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate block">
                                                            {dept.dept_name}
                                                        </span>
                                                        {dept.dept_code && (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono uppercase">
                                                                {dept.dept_code}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 capitalize text-sm">
                                                {dept.dept_type || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                            </td>

                                            {/* Duration */}
                                            <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
                                                {dept.program_duration_years}Y / {dept.total_semesters}S
                                            </td>

                                            {/* Users count */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                    {dept.user_count ?? 0}
                                                </span>
                                            </td>

                                            {/* Students count */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                    {dept.student_count ?? 0}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        dept.is_active
                                                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            dept.is_active ? "bg-emerald-500" : "bg-red-400"
                                                        }`}
                                                    />
                                                    {dept.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                        </AnimatedRow>
                                    ))}
                                </AnimatedTableBody>
                                );
                            })()}
                        </table>
                    </div>

                    {/* ── Mobile Card Layout (<md) ── */}
                    <div className="md:hidden">
                        {(() => {
                            if (loading) {
                                return (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={`skel-mob-${String(i)}`} className="px-4 py-4 animate-pulse space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" />
                                                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                                                    </div>
                                                    <div className="h-5 w-14 bg-gray-100 dark:bg-gray-800 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            if (departments.length === 0) {
                                return (
                                    <EmptyState
                                        hasFilters={hasFilters}
                                        onAdd={canManage ? () => navigate("/college/create-department") : undefined}
                                    />
                                );
                            }
                            return (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {departments.map((dept) => (
                                    <button
                                        key={dept.dept_id}
                                        type="button"
                                        onClick={() => navigate(`/college/department/${dept.dept_id}`)}
                                        className="w-full px-4 py-4 flex items-start gap-3 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors text-left"
                                    >
                                        <DeptAvatar dept={dept} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                                    {dept.dept_name}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0 ${
                                                        dept.is_active
                                                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${dept.is_active ? "bg-emerald-500" : "bg-red-400"}`} />
                                                    {dept.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            {dept.dept_code && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono uppercase mb-1.5">
                                                    {dept.dept_code}
                                                    {dept.dept_type && <span className="font-sans normal-case capitalize"> · {dept.dept_type}</span>}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {dept.user_count ?? 0}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <GraduationCap className="h-3 w-3" />
                                                    {dept.student_count ?? 0}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {dept.program_duration_years}Y / {dept.total_semesters}S
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1" />
                                    </button>
                                ))}
                            </div>
                            );
                        })()}
                    </div>

                    {/* ── Pagination footer ── */}
                    {!loading && departments.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>
                                Showing{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">{startEntry}</span>
                                {"–"}
                                <span className="font-medium text-gray-700 dark:text-gray-300">{endEntry}</span>
                                {" of "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span>
                            </span>

                            <PaginationNav
                                page={pagination.page}
                                totalPages={pagination.totalPages}
                                loading={loading}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>)}
            </div>
        </AnimatedPage>
    );
};

export default ViewDepartments;
