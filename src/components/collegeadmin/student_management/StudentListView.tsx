import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Users, ArrowLeft, X } from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useStudentList } from "@/hooks/collegeadmin/student_management/useStudentList";

const STUDENT_STATUSES = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-700 border-green-300" },
    { value: "inactive", label: "Inactive", color: "bg-red-100 text-red-700 border-red-300" },
    { value: "suspended", label: "Suspended", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { value: "graduated", label: "Graduated", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { value: "dropout", label: "Dropout", color: "bg-gray-100 text-gray-700 border-gray-300" },
];

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
        updateStudentStatus,
    } = useStudentList({
        initialDeptId: deptId,
        initialPassoutYear,
        initialStatus,
    });

    // Modal state
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [newStatus, setNewStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Find current department name when filtered by deptId
    const currentDept = deptId
        ? departments.find((d: any) => d.dept_id === deptId)
        : null;

    const breadcrumbs = [
        { label: "College Admin" },
        { label: "Students" },
        ...(deptId
            ? [{ label: "All Registration" }, { label: currentDept?.dept_name || "Department", active: true }]
            : [{ label: "View List", active: true }]
        ),
    ];

    // Generate passout year options (current year -2 to +4)
    const currentYear = new Date().getFullYear();
    const passoutYearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 2 + i);

    const startEntry = students.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    const handleRowClick = (student: any) => {
        setSelectedStudent(student);
        setNewStatus(student.student_status || "");
    };

    const handleSubmitStatus = async () => {
        if (!selectedStudent || !newStatus || newStatus === selectedStudent.student_status) return;
        setUpdatingStatus(true);
        await updateStudentStatus(selectedStudent.student_id, newStatus);
        setUpdatingStatus(false);
        setSelectedStudent(null);
    };

    const closeModal = () => {
        if (!updatingStatus) {
            setSelectedStudent(null);
            setNewStatus("");
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title={currentDept ? `${currentDept.dept_name} — Students` : "Students List"}
                breadcrumbs={breadcrumbs}
            />

            <div className="w-full">
                <div className="p-8 bg-white rounded-xl border">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div className="flex items-center gap-3">
                            {deptId && (
                                <button
                                    onClick={() => navigate("/collegeadmin/students")}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 font-medium transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </button>
                            )}
                            <h1 className="text-xl font-semibold text-gray-800">
                                {currentDept ? `${currentDept.dept_name} Students` : "Manage Students"}
                            </h1>
                            {!loading && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                    Total Students : {pagination.total}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => navigate("/collegeadmin/bulk-register")}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold mt-3 sm:mt-0"
                        >
                            <Users size={16} />
                            Bulk Register
                        </button>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Entries per page */}
                            <div className="text-sm text-gray-600 font-semibold">
                                Show
                                <select
                                    value={filters.limit}
                                    onChange={(e) => updateFilters({ limit: Number(e.target.value) })}
                                    className="mx-2 border rounded px-2 py-1"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                entries
                            </div>

                            {/* Department Filter — only show if not pre-filtered */}
                            {!deptId && (
                                <select
                                    value={filters.deptId}
                                    onChange={(e) => updateFilters({ deptId: e.target.value })}
                                    className="border rounded-md px-3 py-2 text-sm text-gray-700"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((dept: any) => (
                                        <option key={dept.dept_id} value={dept.dept_id}>
                                            {dept.dept_name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Passout Year Filter */}
                            <select
                                value={filters.passoutYear}
                                onChange={(e) => updateFilters({ passoutYear: Number(e.target.value) })}
                                className="border rounded-md px-3 py-2 text-sm text-gray-700"
                            >
                                {passoutYearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={filters.status}
                                onChange={(e) => updateFilters({ status: e.target.value })}
                                className="border rounded-md px-3 py-2 text-sm text-gray-700"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                                <option value="graduated">Graduated</option>
                                <option value="dropout">Dropout</option>
                                <option value="">All Status</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">STUDENT NAME</th>
                                    <th className="px-4 py-3">EMAIL</th>
                                    {!deptId && <th className="px-4 py-3">DEPARTMENT</th>}
                                    <th className="px-4 py-3">PASSOUT YEAR</th>
                                    <th className="px-4 py-3">STATUS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={deptId ? 5 : 6} className="text-center py-10 italic text-gray-500">
                                            Loading students...
                                        </td>
                                    </tr>
                                ) : students.length > 0 ? (
                                    students.map((student: any, index: number) => (
                                        <tr
                                            key={student.student_id}
                                            onClick={() => handleRowClick(student)}
                                            className="border-b hover:bg-blue-50 text-sm cursor-pointer transition-colors"
                                        >
                                            <td className="px-4 py-3 text-gray-500">
                                                {(pagination.page - 1) * pagination.limit + index + 1}
                                            </td>

                                            <td className="px-4 py-3 font-medium">
                                                {student.first_name} {student.last_name}
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
                                                {student.student_passout_year}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${student.student_status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : student.student_status === "graduated"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : student.student_status === "suspended"
                                                                ? "bg-orange-100 text-orange-700"
                                                                : student.student_status === "dropout"
                                                                    ? "bg-gray-100 text-gray-700"
                                                                    : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {student.student_status
                                                        ? student.student_status.charAt(0).toUpperCase() +
                                                        student.student_status.slice(1)
                                                        : "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={deptId ? 5 : 6} className="text-center py-6 text-gray-500">
                                            No students found
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
                                    onClick={() => updateFilters({ page: pagination.page - 1 })}
                                    disabled={pagination.page <= 1}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <span className="text-sm font-semibold text-gray-700 px-2">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => updateFilters({ page: pagination.page + 1 })}
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

            {/* ===== Status Change Modal ===== */}
            {selectedStudent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Change Student Status</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {selectedStudent.first_name} {selectedStudent.last_name}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                disabled={updatingStatus}
                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body — Dropdown */}
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600 mb-1">
                                Current status:{" "}
                                <span className="font-semibold capitalize">
                                    {selectedStudent.student_status || "—"}
                                </span>
                            </p>

                            <label className="block text-sm font-semibold text-gray-700 mt-4 mb-1.5">
                                New Status
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                disabled={updatingStatus}
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors disabled:opacity-50"
                            >
                                {STUDENT_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                onClick={closeModal}
                                disabled={updatingStatus}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitStatus}
                                disabled={updatingStatus || newStatus === selectedStudent.student_status}
                                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {updatingStatus && (
                                    <div className="h-4 w-4 border-2 border-blue-200 border-t-white rounded-full animate-spin" />
                                )}
                                {updatingStatus ? "Updating..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentListView;
