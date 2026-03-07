import React from "react";
import DashboardLayout from "@/components/sysadmin/DashboardLayout";
import PageHeader from "@/components/sysadmin/PageHeader";
import { useViewColleges } from "@/hooks/sysadmin/useViewColleges";

const BREADCRUMBS = [
  { label: "Dashboard", path: "/sysadmin/dashboard" },
  { label: "Colleges", active: true },
];

const COLLEGE_TYPES = [
  { value: "", label: "All Types" },
  { value: "engineering", label: "Engineering" },
  { value: "diploma", label: "Diploma" },
  { value: "mba", label: "MBA" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "degree", label: "Degree" },
  { value: "medical", label: "Medical" },
];

const PAGE_SIZES = [10, 25, 50];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ViewColleges: React.FC = () => {
  const {
    colleges,
    loading,
    search,
    page,
    limit,
    pagination,
    statusFilter,
    typeFilter,
    handleSearchChange,
    handleLimitChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    setPage,
    handleNavigateToAddCollege,
    handleNavigateToViewCollege,
  } = useViewColleges();



  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Colleges List" breadcrumbs={BREADCRUMBS} />
        <div className="w-full">
          <div className="p-8 bg-white rounded-xl border">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                College List
              </h2>
              <button
                type="button"
                onClick={handleNavigateToAddCollege}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all font-bold"
              >
                Add New College
              </button>
            </div>

            {/* Filters Row — Search left, filters middle, Show entries right */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <input
                type="search"
                placeholder="Search colleges..."
                value={search}
                onChange={handleSearchChange}
                className="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COLLEGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <div className="text-sm text-gray-600 font-semibold ml-auto flex items-center gap-2">
                Show
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
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
                    <th className="px-4 py-3">COLLEGE NAME</th>
                    <th className="px-4 py-3">SUBDOMAIN</th>
                    <th className="px-4 py-3">TYPE</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3">CITY</th>
                    <th className="px-4 py-3">STATE</th>
                    <th className="px-4 py-3">YEAR</th>
                    <th className="px-4 py-3">CREATED</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <tr key={i} className="border-b animate-pulse">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : colleges.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-10 text-gray-500"
                      >
                        {search || statusFilter || typeFilter
                          ? "No colleges match your search criteria."
                          : "No colleges found. Click 'Add New College' to get started."}
                      </td>
                    </tr>
                  ) : (
                    colleges.map((college) => (
                      <tr
                        key={college.college_id}
                        onClick={() =>
                          handleNavigateToViewCollege(college.college_id)
                        }
                        className="border-b hover:bg-gray-50 text-sm cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">
                          <span className="text-blue-600 hover:text-blue-800 hover:underline">
                            {college.college_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">
                            {college.college_subdomain}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 capitalize">
                          {college.college_type || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${college.college_status === "active"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                              }`}
                          >
                            {college.college_status}
                          </span>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 0 && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 mt-4 border-t text-sm text-gray-600 font-semibold">
                <div>
                  {loading ? (
                    <span className="text-gray-400">Loading page {page}...</span>
                  ) : (
                    <>
                      Showing {(page - 1) * limit + 1} to{" "}
                      {Math.min(page * limit, pagination.total)} of{" "}
                      {pagination.total} entries
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1 || loading}
                    className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((p) => (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - page) <= 1
                    ))
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-gray-400">…</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPage(p)}
                          disabled={loading}
                          className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${p === page
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "hover:bg-gray-100"
                            }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    type="button"
                    onClick={() =>
                      setPage(Math.min(pagination.totalPages, page + 1))
                    }
                    disabled={page >= pagination.totalPages || loading}
                    className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
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