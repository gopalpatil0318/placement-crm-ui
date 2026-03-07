import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewUsers } from "@/hooks/collegeadmin/user_management/useViewUsers";

// ========================
// CONSTANTS (module-level)
// ========================

const ROLE_BADGE_MAP: Record<string, { label: string; bg: string; text: string }> = {
  collegeadmin: { label: "College Admin", bg: "bg-purple-100", text: "text-purple-700" },
  tpo: { label: "TPO", bg: "bg-blue-100", text: "text-blue-700" },
  tpc: { label: "TPC", bg: "bg-indigo-100", text: "text-indigo-700" },
  hod: { label: "HOD", bg: "bg-teal-100", text: "text-teal-700" },
  teacher: { label: "Teacher", bg: "bg-gray-100", text: "text-gray-700" },
};

const STATUS_BADGE_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  inactive: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "collegeadmin", label: "College Admin" },
  { value: "tpo", label: "TPO" },
  { value: "tpc", label: "TPC" },
  { value: "hod", label: "HOD" },
  { value: "teacher", label: "Teacher" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const BREADCRUMBS = [
  { label: "Dashboard", path: "/college/dashboard" },
  { label: "Users", active: true },
];

// ========================
// SKELETON TABLE ROWS
// ========================

const SkeletonRow = () => (
  <tr className="border-b">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className={`h-4 bg-gray-200 rounded animate-pulse ${i === 0 ? "w-32" : i === 5 ? "w-20" : "w-24"}`} />
      </td>
    ))}
  </tr>
);

// ========================
// MAIN COMPONENT
// ========================

const ViewUsers: React.FC = () => {
  const navigate = useNavigate();
  const {
    users, loading, pagination, search, roleFilter, statusFilter,
    handleSearchChange, handlePageChange, handleLimitChange,
    handleRoleFilterChange, handleStatusFilterChange,
  } = useViewUsers();

  const startEntry = users.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Users List" breadcrumbs={BREADCRUMBS} />

        <div className="w-full">
          <div className="p-8 bg-white rounded-xl border">
            {/* Header with Create button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-800">
                Manage Users
              </h1>
              <button
                type="button"
                onClick={() => navigate("/college/create-user")}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold transition mt-3 sm:mt-0"
              >
                <Plus size={16} />
                Add New User
              </button>
            </div>

            {/* Filters Row — Search left, filters middle, Show entries right */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              {/* Left: Search */}
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

              {/* Middle: Filters */}
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLE_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Right: Show entries */}
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

            {/* Table — No ACTION column */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">EMAIL</th>
                    <th className="px-4 py-3">ROLE</th>
                    <th className="px-4 py-3">DEPARTMENT</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3">CREATED</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-500">
                        {search || roleFilter || statusFilter
                          ? "No users match your filters."
                          : "No users found. Click 'Add New User' to create one."}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const roleBadge = ROLE_BADGE_MAP[user.user_role] || ROLE_BADGE_MAP.teacher;
                      const statusBadge = STATUS_BADGE_MAP[user.user_status] || STATUS_BADGE_MAP.active;

                      return (
                        <tr
                          key={user.user_id}
                          onClick={() => navigate(`/college/user/${user.user_id}`)}
                          className="border-b hover:bg-blue-50 text-sm cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-medium">
                            <span className="text-blue-600 hover:text-blue-800 hover:underline">
                              {user.user_name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{user.user_email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge.bg} ${roleBadge.text}`}>
                              {roleBadge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {user.dept_name || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                              {user.user_status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {formatDate(user.created_at)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
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

export default ViewUsers;
