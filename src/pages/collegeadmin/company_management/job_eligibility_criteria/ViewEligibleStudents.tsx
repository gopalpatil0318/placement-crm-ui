import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, ArrowLeft, Users } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useEligibleStudents } from "@/hooks/collegeadmin/company_management/Job_eligibility_criteria/useEligibleStudents";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [20, 50, 100];

// ========================
// COMPONENT
// ========================

const ViewEligibleStudents = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    const {
        students,
        job,
        criteria,
        eligibleCount,
        totalStudents,
        eligibilityPercentage,
        loading,
        error,
        pagination,
        search,
        deptFilter,
        handleSearchChange,
        handleDeptFilterChange,
        handlePageChange,
        handleLimitChange,
    } = useEligibleStudents(jobId);

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Eligibility Criteria", path: "/college/job-criteria" },
        { label: job?.job_title || "Job", path: `/college/job/${jobId}` },
        { label: "Eligible Students", active: true },
    ];

    const startEntry = students.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total || eligibleCount);

    const skeletonRows = useMemo(
        () =>
            Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b animate-pulse">
                    {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded w-3/4" />
                        </td>
                    ))}
                </tr>
            )),
        []
    );

    // Extract unique departments from criteria for the filter dropdown
    const deptOptions = useMemo(() => {
        if (!criteria?.allowed_departments || criteria.allowed_departments.length === 0) return [];
        return criteria.allowed_departments;
    }, [criteria]);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Eligible Students" breadcrumbs={breadcrumbs} />

                <div className="w-full">
                    <div className="p-8 bg-white rounded-xl border">
                        {error && !job ? (
                            <div className="text-center py-8">
                                <p className="text-red-500 font-medium">{error || "Failed to load data"}</p>
                                <button
                                    type="button"
                                    onClick={() => navigate("/college/job-criteria")}
                                    className="mt-4 text-blue-600 hover:underline font-medium flex items-center gap-2 mx-auto"
                                >
                                    <ArrowLeft size={16} /> Back to Jobs
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Job Info */}
                                {job && (
                                    <div className="mb-5 pb-4 border-b">
                                        <h2 className="text-xl font-semibold text-gray-800">{job.job_title}</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {job.company_name} — Passout Year: {job.passout_year}
                                        </p>
                                    </div>
                                )}

                                {/* Stats Bar */}
                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Users size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-800">
                                                    {eligibleCount} <span className="text-sm font-normal text-gray-500">of {totalStudents} eligible</span>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {eligibilityPercentage}% eligibility rate
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-48">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(eligibilityPercentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Criteria Summary */}
                                {criteria && (
                                    <div className="mb-5 flex flex-wrap gap-2">
                                        {criteria.min_overall_cgpa != null && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                CGPA ≥ {criteria.min_overall_cgpa}
                                            </span>
                                        )}
                                        {criteria.max_live_kts != null && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                KTs ≤ {criteria.max_live_kts}
                                            </span>
                                        )}
                                        {criteria.min_tenth_percentage != null && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                                                10th ≥ {criteria.min_tenth_percentage}%
                                            </span>
                                        )}
                                        {criteria.min_twelfth_percentage != null && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700">
                                                12th ≥ {criteria.min_twelfth_percentage}%
                                            </span>
                                        )}
                                        {criteria.min_diploma_percentage != null && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                                Diploma ≥ {criteria.min_diploma_percentage}%
                                            </span>
                                        )}
                                        {criteria.exclude_already_placed && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                Placed Excluded
                                            </span>
                                        )}
                                        {criteria.allowed_genders && criteria.allowed_genders.length > 0 && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
                                                Gender: {criteria.allowed_genders.join(", ")}
                                            </span>
                                        )}
                                        {criteria.allowed_departments && criteria.allowed_departments.length > 0 && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                {criteria.allowed_departments.length} Dept(s)
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Filters */}
                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={search}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            className="w-full md:w-64 border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {deptOptions.length > 0 && (
                                        <select
                                            value={deptFilter}
                                            onChange={(e) => handleDeptFilterChange(e.target.value)}
                                            className="border rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Departments</option>
                                            {deptOptions.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    )}

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

                                {/* Students Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                                                <th className="px-4 py-3">#</th>
                                                <th className="px-4 py-3">NAME</th>
                                                <th className="px-4 py-3">EMAIL</th>
                                                <th className="px-4 py-3">DEPARTMENT</th>
                                                <th className="px-4 py-3">CGPA</th>
                                                <th className="px-4 py-3">KTs</th>
                                                <th className="px-4 py-3">10th %</th>
                                                <th className="px-4 py-3">12th/Diploma %</th>
                                                <th className="px-4 py-3">GENDER</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading ? (
                                                skeletonRows
                                            ) : students.length > 0 ? (
                                                students.map((s, index) => (
                                                    <tr
                                                        key={s.student_id}
                                                        className="border-b hover:bg-blue-50 text-sm transition-colors"
                                                    >
                                                        <td className="px-4 py-3 text-gray-500">
                                                            {(pagination.page - 1) * pagination.limit + index + 1}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">
                                                            {s.student_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {s.student_email}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                                {s.dept_name}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`font-semibold ${s.overall_cgpa >= 7 ? "text-green-600" : s.overall_cgpa >= 5 ? "text-yellow-600" : "text-red-600"}`}>
                                                                {s.overall_cgpa}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.total_live_kts === 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                                {s.total_live_kts}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700">
                                                            {s.tenth_percentage}%
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700">
                                                            {s.twelfth_or_diploma === "12th"
                                                                ? `${s.twelfth_percentage ?? "—"}%`
                                                                : `${s.diploma_percentage ?? "—"}%`}
                                                            <span className="text-xs text-gray-400 ml-1">
                                                                ({s.twelfth_or_diploma})
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700">
                                                            {s.gender}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={9} className="text-center py-10 text-gray-500">
                                                        No eligible students found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 mt-4 border-t text-sm text-gray-600 font-semibold">
                                    <div>
                                        Showing {startEntry} to {endEntry} of {pagination.total || eligibleCount} entries
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ViewEligibleStudents;
