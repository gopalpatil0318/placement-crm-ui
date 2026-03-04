"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Eye } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewUsers, type User } from "@/hooks/collegeadmin/user_management/useViewUsers";
import ViewUserDetail from "@/components/collegeadmin/user_management/ViewUser";

const ViewUser: React.FC = () => {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { users, loading } = useViewUsers();

  // Filter users
  const filteredData = users.filter((user) => {
    const query = search.toLowerCase();
    return (
      user.user_name?.toLowerCase().includes(query) ||
      user.user_email?.toLowerCase().includes(query) ||
      user.user_role?.toLowerCase().includes(query)
    );
  });

  const paginatedData = filteredData.slice(0, entriesPerPage);

  const breadcrumbs = [
    { label: "College Admin" },
    { label: "Users" },
    { label: "View List", active: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Users List" breadcrumbs={breadcrumbs} />

        {/* User Detail Modal */}
        {selectedUser && (
          <ViewUserDetail
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}

        <div className="w-full">
          <div className="p-8 bg-white rounded-xl border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-800">
                Manage Users
              </h1>

              <button
                onClick={() => navigate("/collegeadmin/create-user")}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold"
              >
                <Plus size={16} />
                Add User
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
                placeholder="Search by name, email or role..."
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
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">EMAIL</th>
                    <th className="px-4 py-3">PHONE</th>
                    <th className="px-4 py-3">ROLE</th>
                    <th className="px-4 py-3 text-center">ACTION</th>
                    <th className="px-4 py-3 text-center">STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 italic">
                        Loading users...
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((user) => (
                      <tr
                        key={user.user_id}
                        className="border-b hover:bg-gray-50 text-sm"
                      >
                        <td className="px-4 py-3 font-medium">
                          {user.user_name}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {user.user_email}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {user.user_phone || "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                            {user.user_role || "Admin"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3 text-gray-500">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="hover:text-blue-600"
                              title="View User"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/collegeadmin/update-user/${user.user_id}`
                                )
                              }
                              className="hover:text-green-600"
                              title="Edit User"
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
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        No users found
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

export default ViewUser;
