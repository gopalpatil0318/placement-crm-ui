import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, Plus, Users, GraduationCap, Filter } from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList";
import { useStudentList } from "@/hooks/collegeadmin/student_management/useStudentList";

// ========================
// CONSTANTS
// ========================

const STATUS_BADGE_MAP: Record<string, { bg: string; dot: string }> = {
    active: { bg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
    inactive: { bg: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400", dot: "bg-gray-400" },
    suspended: { bg: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
    graduated: { bg: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
    dropout: { bg: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300", dot: "bg-red-500" },
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatYearLabel = (year: number): string => {
    const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
    return `${year}${suffixes[year] || "th"} Yr`;
};

// ========================
// SUB-COMPONENTS
// ========================

/** Student avatar with deterministic color */
const StudentAvatar = ({ firstName, lastName }: { firstName: string; lastName: string }) => {
    const initials = (firstName[0] + (lastName[0] || "")).toUpperCase();
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
    const color = COLORS[firstName.charCodeAt(0) % COLORS.length];
    return (
        <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${color}`}>
            {initials}
        </div>
    );
};

/** Numbered pagination with ellipsis */
const PaginationNav = ({
    page, totalPages, loading, onPageChange,
}: {
    page: number; totalPages: number; loading: boolean; onPageChange: (p: number) => void;
}) => {
    if (totalPages <= 1) return null;

    const pages: (number | "ellipsis")[] = [];
    const add = (p: number) => { if (!pages.includes(p)) pages.push(p); };
    add(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) add(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map((p, idx) =>
                p === "ellipsis" ? (
                    <span key={`e-${idx}`} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">...</span>
                ) : (
                    <button key={p} type="button" onClick={() => onPageChange(p)} disabled={loading} className={`min-w-[32px] h-8 rounded-md text-sm font-medium transition ${p === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"} disabled:cursor-not-allowed`}>
                        {p}
                    </button>
                )
            )}
            <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

/** Empty state */
const EmptyState = ({ hasFilters, onReset, onAdd }: { hasFilters: boolean; onReset?: () => void; onAdd: () => void }) => (
    <div className="py-16 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            {hasFilters ? <Filter className="h-6 w-6 text-gray-400 dark:text-gray-500" /> : <GraduationCap className="h-6 w-6 text-gray-400 dark:text-gray-500" />}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{hasFilters ? "No students match your filters" : "No students yet"}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
            {hasFilters ? "Try adjusting your search or filter criteria." : "Register your first student to get started."}
        </p>
        {hasFilters ? (
            <button type="button" onClick={onReset} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Clear all filters</button>
        ) : (
            <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm">
                <Plus className="h-4 w-4" />
                Register Student
            </button>
        )}
    </div>
);

/** Skeleton rows matching column widths */
const SkeletonRows = ({ showDept }: { showDept: boolean }) => (
    <>
        {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className="space-y-1.5">
                            <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                    </div>
                </td>
                {showDept && <td className="px-4 py-3.5"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></td>}
                <td className="px-4 py-3.5"><div className="h-3.5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                <td className="px-4 py-3.5"><div className="h-3.5 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                <td className="px-4 py-3.5"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></td>
                <td className="px-4 py-3.5"><div className="h-6 w-18 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></td>
                <td className="px-4 py-3.5"><div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
            </tr>
        ))}
    </>
);

// ========================
// MAIN COMPONENT
// ========================

interface StudentListViewProps {
    deptId?: string;
    initialPassoutYear?: number;
    initialStatus?: string;
}

const StudentListView: React.FC<StudentListViewProps> = ({ deptId, initialPassoutYear, initialStatus }) => {
    const navigate = useNavigate();
    const {
        students, departments, loading, isFetching, pagination, filters,
        updateFilters, handleSearchChange, handleLimitChange, handlePageChange,
    } = useStudentList({ initialDeptId: deptId, initialPassoutYear, initialStatus });

    const currentDept = deptId ? departments.find((d: any) => d.dept_id === deptId) : null;
    const showDeptCol = !deptId;
    const hasActiveFilters = !!(filters.search || filters.status || filters.deptId || filters.passoutYear || filters.profileComplete || filters.profileApproved);

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Students", path: deptId ? "/college/students" : undefined, active: !deptId },
        ...(deptId ? [{ label: currentDept?.dept_name || "Department", active: true }] : []),
    ], [deptId, currentDept]);

    const currentYear = new Date().getFullYear();
    const passoutYearOptions = useMemo(() => Array.from({ length: 7 }, (_, i) => currentYear - 2 + i), [currentYear]);

    const startEntry = students.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    const clearFilters = useMemo(() => () => {
        handleSearchChange("");
        updateFilters({ status: "", deptId: deptId || "", passoutYear: 0, profileComplete: "", profileApproved: "" });
    }, [handleSearchChange, updateFilters, deptId]);

    const selectClass = "px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition";

    return (
        <AnimatedPage>
            <div className="space-y-8">
                <PageHeader title={currentDept ? `${currentDept.dept_name} — Students` : "Students"} breadcrumbs={breadcrumbs} />

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {currentDept ? `${currentDept.dept_name} Students` : "Manage Students"}
                                {pagination.total > 0 && <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">({pagination.total})</span>}
                            </h2>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => navigate("/college/create-student")} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm">
                                    <Plus className="h-4 w-4" />
                                    Register Student
                                </button>
                                <button type="button" onClick={() => navigate("/college/bulk-register")} className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                    <Users className="h-4 w-4" />
                                    Bulk Register
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <input type="text" value={filters.search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
                            </div>

                            <select value={filters.status} onChange={(e) => updateFilters({ status: e.target.value })} className={selectClass}>
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                                <option value="graduated">Graduated</option>
                                <option value="dropout">Dropout</option>
                            </select>

                            {showDeptCol && (
                                <select value={filters.deptId} onChange={(e) => updateFilters({ deptId: e.target.value })} className={selectClass}>
                                    <option value="">All Departments</option>
                                    {departments.map((d: any) => (<option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>))}
                                </select>
                            )}

                            <select value={filters.passoutYear} onChange={(e) => updateFilters({ passoutYear: Number(e.target.value) })} className={selectClass}>
                                <option value={0}>All Years</option>
                                {passoutYearOptions.map((y) => (<option key={y} value={y}>{y}</option>))}
                            </select>

                            <select value={filters.profileComplete} onChange={(e) => updateFilters({ profileComplete: e.target.value })} className={selectClass}>
                                <option value="">All Profiles</option>
                                <option value="true">Complete</option>
                                <option value="false">Incomplete</option>
                            </select>

                            <select value={filters.profileApproved} onChange={(e) => updateFilters({ profileApproved: e.target.value })} className={selectClass}>
                                <option value="">All Approval</option>
                                <option value="true">Approved</option>
                                <option value="false">Pending</option>
                            </select>

                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium ml-auto flex items-center gap-2">
                                Show
                                <select value={pagination.limit} onChange={(e) => handleLimitChange(Number(e.target.value))} className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                                    {PAGE_SIZE_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                                </select>
                                entries
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-4 py-3">Student</th>
                                    {showDeptCol && <th className="px-4 py-3">Department</th>}
                                    <th className="px-4 py-3">Year</th>
                                    <th className="px-4 py-3">Passout</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Profile</th>
                                    <th className="px-4 py-3">Approved</th>
                                </tr>
                            </thead>

                            {loading ? (
                                <tbody><SkeletonRows showDept={showDeptCol} /></tbody>
                            ) : students.length === 0 ? (
                                <tbody>
                                    <tr><td colSpan={showDeptCol ? 7 : 6}>
                                        <EmptyState hasFilters={hasActiveFilters} onReset={clearFilters} onAdd={() => navigate("/college/create-student")} />
                                    </td></tr>
                                </tbody>
                            ) : (
                                <AnimatedTableBody>
                                    {students.map((s: any) => {
                                        const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");
                                        const badge = STATUS_BADGE_MAP[s.student_status] || STATUS_BADGE_MAP.active;

                                        return (
                                            <AnimatedRow key={s.student_id} onClick={() => navigate(`/college/student/${s.student_id}`)} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-sm cursor-pointer transition-colors ${isFetching ? "opacity-60" : ""}`}>
                                                {/* Student (avatar + name + email) */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <StudentAvatar firstName={s.first_name} lastName={s.last_name} />
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{fullName}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.student_email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Department */}
                                                {showDeptCol && (
                                                    <td className="px-4 py-3.5">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">{s.dept_name || "—"}</span>
                                                    </td>
                                                )}

                                                {/* Year */}
                                                <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">{s.current_year ? formatYearLabel(s.current_year) : "—"}</td>

                                                {/* Passout */}
                                                <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 font-mono text-xs">{s.student_passout_year}</td>

                                                {/* Status */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                        {s.student_status ? s.student_status.charAt(0).toUpperCase() + s.student_status.slice(1) : "—"}
                                                    </span>
                                                </td>

                                                {/* Profile */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.profile_complete ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"}`}>
                                                        {s.profile_complete ? "Complete" : "Incomplete"}
                                                    </span>
                                                </td>

                                                {/* Approved */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.profile_is_approved ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                                                        {s.profile_is_approved ? "Approved" : "Pending"}
                                                    </span>
                                                </td>
                                            </AnimatedRow>
                                        );
                                    })}
                                </AnimatedTableBody>
                            )}
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {pagination.total > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{startEntry}</span> to{" "}
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{endEntry}</span> of{" "}
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{pagination.total}</span> entries
                            </p>
                            <PaginationNav page={pagination.page} totalPages={pagination.totalPages} loading={loading} onPageChange={handlePageChange} />
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default StudentListView;
