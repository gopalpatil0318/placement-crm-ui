import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, Plus, Users } from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useStudentList } from "@/hooks/collegeadmin/student_management/useStudentList";

// ========================
// CONSTANTS
// ========================

const STATUS_BADGE_MAP: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    inactive: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
    suspended: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
    graduated: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    dropout: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function formatYearLabel(year: number): string {
    const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
    return `${year}${suffixes[year] || "th"} Year`;
}

// ========================
// SKELETON
// ========================

const SkeletonRow = () => (
    <tr className="border-b animate-pulse">
        {Array.from({ length: 9 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
            </td>
        ))}
    </tr>
);

// ========================
// COMPONENT
// ========================

interface StudentListViewProps {
    deptId?: string;
    initialPassoutYear?: number;
    initialStatus?: string;
}

const StudentListView: React.FC<StudentListViewProps> = ({ deptId, initialPassoutYear, initialStatus }) => {
    const navigate = useNavigate();
    const {
        students,
        departments,
        loading,
        pagination,
        filters,
        updateFilters,
        handleSearchChange,
        handleLimitChange,
        handlePageChange,
    } = useStudentList({
        initialDeptId: deptId,
        initialPassoutYear,
        initialStatus,
    });

    // Find current department name when filtered by deptId
    const currentDept = deptId
        ? departments.find((d: any) => d.dept_id === deptId)
        : null;

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Students", active: !deptId },
        ...(deptId ? [{ label: currentDept?.dept_name || "Department", active: true }] : []),
    ], [deptId, currentDept]);

    // Generate passout year options (current year -2 to +4)
    const currentYear = new Date().getFullYear();
    const passoutYearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 2 + i);

    const startEntry = students.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    const skeletonRows = useMemo(
        () => Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`skel-${i}`} />),
        []
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title={currentDept ? `${currentDept.dept_name} — Students` : "Students"}
                breadcrumbs={breadcrumbs}
            />

            <div className="w-full">
                <div className="p-8 bg-white rounded-xl border">
                    {/* Header with buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h1 className="text-xl font-semibold text-gray-800">
                            {currentDept ? `${currentDept.dept_name} Students` : "Manage Students"}
                        </h1>

                        <div className="flex items-center gap-3 mt-3 sm:mt-0">
                            <button
                                onClick={() => navigate("/college/create-student")}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold transition"
                            >
                                <Plus size={16} />
                                Register Student
                            </button>
                            <button
                                onClick={() => navigate("/college/bulk-register")}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 font-bold transition"
                            >
                                <Users size={16} />
                                Bulk Register
                            </button>
                        </div>
                    </div>

                    {/* Filters Row — Search left, Entries right */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {/* Search */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search by name or email..."
                                className="pl-9 pr-4 py-2 border rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filters.status}
                            onChange={(e) => updateFilters({ status: e.target.value })}
                            className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                            <option value="graduated">Graduated</option>
                            <option value="dropout">Dropout</option>
                        </select>

                        {/* Department Filter — only if not pre-filtered */}
                        {!deptId && (
                            <select
                                value={filters.deptId}
                                onChange={(e) => updateFilters({ deptId: e.target.value })}
                                className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept: any) => (
                                    <option key={dept.dept_id} value={dept.dept_id}>
                                        {dept.dept_name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Passout Year */}
                        <select
                            value={filters.passoutYear}
                            onChange={(e) => updateFilters({ passoutYear: Number(e.target.value) })}
                            className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={0}>All Years</option>
                            {passoutYearOptions.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        {/* Profile Complete */}
                        <select
                            value={filters.profileComplete}
                            onChange={(e) => updateFilters({ profileComplete: e.target.value })}
                            className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Profiles</option>
                            <option value="true">Profile Complete</option>
                            <option value="false">Profile Incomplete</option>
                        </select>

                        {/* Profile Approved */}
                        <select
                            value={filters.profileApproved}
                            onChange={(e) => updateFilters({ profileApproved: e.target.value })}
                            className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Approval</option>
                            <option value="true">Approved</option>
                            <option value="false">Pending Approval</option>
                        </select>

                        {/* Show entries — right */}
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
                                    <th className="px-4 py-3">NAME</th>
                                    <th className="px-4 py-3">EMAIL</th>
                                    {!deptId && <th className="px-4 py-3">DEPARTMENT</th>}
                                    <th className="px-4 py-3">YEAR</th>
                                    <th className="px-4 py-3">PASSOUT</th>
                                    <th className="px-4 py-3">STATUS</th>
                                    <th className="px-4 py-3">PROFILE</th>
                                    <th className="px-4 py-3">APPROVED</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    skeletonRows
                                ) : students.length > 0 ? (
                                    students.map((student: any, index: number) => {
                                        const statusBadge = STATUS_BADGE_MAP[student.student_status] || STATUS_BADGE_MAP.active;
                                        const fullName = [student.first_name, student.middle_name, student.last_name]
                                            .filter(Boolean)
                                            .join(" ");

                                        return (
                                            <tr
                                                key={student.student_id}
                                                onClick={() => navigate(`/college/student/${student.student_id}`)}
                                                className="border-b hover:bg-blue-50 text-sm cursor-pointer transition-colors"
                                            >
                                                <td className="px-4 py-3 text-gray-500">
                                                    {(pagination.page - 1) * pagination.limit + index + 1}
                                                </td>

                                                <td className="px-4 py-3 font-medium">
                                                    <span className="text-blue-600 hover:text-blue-800 hover:underline">
                                                        {fullName}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-gray-600">
                                                    {student.student_email}
                                                </td>

                                                {!deptId && (
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                            {student.dept_name || "—"}
                                                        </span>
                                                    </td>
                                                )}

                                                <td className="px-4 py-3 text-gray-600">
                                                    {student.current_year ? formatYearLabel(student.current_year) : "—"}
                                                </td>

                                                <td className="px-4 py-3 text-gray-600">
                                                    {student.student_passout_year}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                                                        {student.student_status
                                                            ? student.student_status.charAt(0).toUpperCase() + student.student_status.slice(1)
                                                            : "—"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3">
                                                    {student.profile_complete ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                            Complete
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                                            Incomplete
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {student.profile_is_approved ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={deptId ? 8 : 9} className="text-center py-10 text-gray-500">
                                            {filters.search || filters.status || filters.deptId
                                                ? "No students match your filters."
                                                : "No students found. Click 'Register Student' to add one."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer — Pagination */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-sm text-gray-600 font-semibold italic">
                            {pagination.total > 0
                                ? `Showing ${startEntry} to ${endEntry} of ${pagination.total} entries`
                                : "No entries to display"}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <span className="text-sm font-semibold text-gray-700 px-2">
                                    {pagination.page} of {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentListView;
