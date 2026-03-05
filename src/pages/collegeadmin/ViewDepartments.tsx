"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewDepartments } from "@/hooks/collegeadmin/departmentManagement/useViewDepartments";
import { useToggleDepartmentStatus } from "@/hooks/collegeadmin/departmentManagement/useToggleDepartmentStatus";

const ViewDepartments: React.FC = () => {
    const [search, setSearch] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const navigate = useNavigate();
    const { departments, loading, refresh } = useViewDepartments();
    const { toggleStatus, loading: toggleLoading } = useToggleDepartmentStatus();

    // Filter departments
    const filteredData = departments.filter((dept) => {
        const query = search.toLowerCase();
        return (
            dept.dept_name?.toLowerCase().includes(query) ||
            dept.dept_code?.toLowerCase().includes(query) ||
            dept.dept_type?.toLowerCase().includes(query)
        );
    });

    const paginatedData = filteredData.slice(0, entriesPerPage);

    const breadcrumbs = [
        { label: "College Admin" },
        { label: "Departments" },
        { label: "View List", active: true },
    ];

    const handleToggle = async (deptId: string, currentStatus: boolean) => {
        await toggleStatus(deptId, currentStatus, refresh);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Departments List" breadcrumbs={breadcrumbs} />

                <div className="w-full">
                    <div className="p-8 bg-white rounded-xl border">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <h1 className="text-xl font-semibold text-gray-800">
                                Manage Departments
                            </h1>

                            <button
                                onClick={() => navigate("/collegeadmin/create-department")}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold"
                            >
                                <Plus size={16} />
                                Add Department
                            </button>
                        </div>

                        {/* Search & Entries */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <div className="text-sm text-gray-600 font-semibold">
                                Show
                                <select
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                    className="mx-2 border rounded px-2 py-1"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                </select>
                                entries
                            </div>

                            <input
                                type="search"
                                placeholder="Search by name, code or type..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full md:w-64 border rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                                        <th className="px-4 py-3">DEPARTMENT NAME</th>
                                        <th className="px-4 py-3">CODE</th>
                                        <th className="px-4 py-3">TYPE</th>
                                        <th className="px-4 py-3">DURATION</th>
                                        <th className="px-4 py-3">SEMESTERS</th>
                                        <th className="px-4 py-3">STATUS</th>
                                        <th className="px-4 py-3 text-center">ACTION</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 italic">
                                                Loading departments...
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((dept) => (
                                            <tr
                                                key={dept.dept_id}
                                                className="border-b hover:bg-gray-50 text-sm cursor-pointer"
                                                onClick={() => navigate(`/collegeadmin/department/${dept.dept_id}`)}
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {dept.dept_name}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                        {dept.dept_code}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-gray-600 capitalize">
                                                    {dept.dept_type}
                                                </td>

                                                <td className="px-4 py-3 text-gray-600">
                                                    {dept.program_duration_years} {dept.program_duration_years === 1 ? "Year" : "Years"}
                                                </td>

                                                <td className="px-4 py-3 text-gray-600">
                                                    {dept.total_semesters}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggle(dept.dept_id, dept.is_active);
                                                        }}
                                                        disabled={toggleLoading}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${dept.is_active ? "bg-green-500" : "bg-gray-300"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dept.is_active
                                                                ? "translate-x-6"
                                                                : "translate-x-1"
                                                                }`}
                                                        />
                                                    </button>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center gap-3 text-gray-500">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(
                                                                    `/collegeadmin/update-department/${dept.dept_id}`
                                                                );
                                                            }}
                                                            className="hover:text-green-600"
                                                            title="Edit Department"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}

                                    {!loading && filteredData.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="text-center py-6 text-gray-500"
                                            >
                                                No departments found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 text-sm text-gray-600 font-semibold italic">
                            Showing 1 to {Math.min(entriesPerPage, filteredData.length)} of{" "}
                            {filteredData.length} entries
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ViewDepartments;
