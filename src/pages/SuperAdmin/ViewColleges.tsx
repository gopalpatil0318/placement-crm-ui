import React from "react";
import { Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/sysadmin/DashboardLayout";
import PageHeader from "@/components/sysadmin/PageHeader";
import { useViewColleges } from "@/hooks/sysadmin/useViewColleges";

const BREADCRUMBS = [
  { label: "Super Admin" },
  { label: "Colleges" },
  { label: "View List", active: true },
];

const ViewColleges: React.FC = () => {
  const {
    colleges,
    loading,
    search,
    statusFilter,
    typeFilter,
    limit,
    pagination,
    handleSearchChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleLimitChange,
    handlePageChange,
    handleNavigateToAddCollege,
    handleNavigateToViewCollege,
    handleNavigateToEditCollege,
  } = useViewColleges();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === "active";
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActive
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-700 border border-red-200"
          }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    const end = Math.min(pagination.totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Colleges List" breadcrumbs={BREADCRUMBS} />
        <div className="w-full">
          <div className="p-8 bg-white rounded-xl border">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-800">
                College List
              </h1>
              <button
                onClick={handleNavigateToAddCollege}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all font-bold"
              >
                Add New College
              </button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <input
                type="search"
                placeholder="Search by name or subdomain..."
                value={search}
                onChange={handleSearchChange}
                className="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={typeFilter}
                onChange={handleTypeFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Types</option>
                <option value="engineering">Engineering</option>
                <option value="diploma">Diploma</option>
                <option value="mba">MBA</option>
                <option value="polytechnic">Polytechnic</option>
                <option value="degree">Degree</option>
                <option value="medical">Medical</option>
              </select>

              <div className="text-sm text-gray-600 font-semibold ml-auto flex items-center gap-2">
                Show
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                per page
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-3">COLLEGE NAME</th>
                    <th className="px-4 py-3">SUBDOMAIN</th>
                    <th className="px-4 py-3">TYPE</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3">CITY</th>
                    <th className="px-4 py-3">STATE</th>
                    <th className="px-4 py-3">YEAR</th>
                    <th className="px-4 py-3">CREATED</th>
                    <th className="px-4 py-3 text-center">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-500 italic">
                        Loading data...
                      </td>
                    </tr>
                  ) : colleges.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-500">
                        {search || statusFilter || typeFilter
                          ? "No colleges match your search criteria."
                          : "No colleges found. Click 'Add New College' to get started."}
                      </td>
                    </tr>
                  ) : (
                    colleges.map((college) => (
                      <tr
                        key={college.college_id}
                        onClick={() => handleNavigateToViewCollege(college.college_id)}
                        className="border-b hover:bg-gray-50 text-sm cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {college.college_name}
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                          {college.college_subdomain}
                        </td>
                        <td className="px-4 py-3 text-gray-600 capitalize">
                          {college.college_type}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(college.college_status)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {college.college_city || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {college.college_state || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {college.default_academic_year || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(college.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3 text-gray-500">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToViewCollege(college.college_id);
                              }}
                              className="hover:text-blue-600 transition-colors"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToEditCollege(college.college_id);
                              }}
                              className="hover:text-green-600 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 0 && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 text-sm text-gray-600">
                <div>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} entries
                </div>

                <div className="flex items-center gap-1 mt-2 md:mt-0">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border rounded transition-colors ${pageNum === pagination.page
                          ? "bg-blue-600 text-white font-bold shadow-sm"
                          : "hover:bg-gray-100"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewColleges;