"use client"

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import DashboardLayout from "@/components/sysadmin/DashboardLayout"; 
import PageHeader from "@/components/sysadmin/PageHeader";
import { useViewUsers } from "@/hooks/collegeadmin/useViewUsers";

const ViewUser: React.FC = () => {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate();
  const { users, loading } = useViewUsers();

  
  const filteredData = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

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
        
        <div className="w-full">
          <div className="p-8 bg-white rounded-xl border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-800">
                Manage Users
              </h1>

              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/collegeadmin/create-user')} 
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all font-bold"
                >
                  <UserPlus size={16} />
                  Add User
                </button>
              </div>
            </div>

            <div>
              {/* Entries selection and Search */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="text-sm text-gray-600 font-semibold">
                  Show
                  <select 
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    className="mx-2 border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                      <th className="px-4 py-3">FULL NAME</th>
                      <th className="px-4 py-3">EMAIL</th>
                      <th className="px-4 py-3">ROLE</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3 text-center">ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-500 italic">
                          Loading users...
                        </td>
                      </tr>
                    ) : paginatedData.map((user) => (
                      <tr
                        key={user.user_id}
                        onClick={() => navigate(`/collegeadmin/view-user/${user.user_id}`)}
                        className="border-b hover:bg-gray-50 text-sm cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {user.full_name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold uppercase">
                            {user.role}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-semibold capitalize ${user.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                          {user.status}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3 text-gray-500">
                            <button className="hover:text-blue-600 transition-colors">
                              <Eye size={18} />
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/collegeadmin/edit-user/${user.user_id}`);
                              }}
                              className="hover:text-green-600 transition-colors"
                            >
                              <Pencil size={18} />
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle Delete Logic here
                              }}
                              className="hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!loading && filteredData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Info */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 text-sm text-gray-600 font-semibold italic">
                <div>
                  Showing 1 to {Math.min(entriesPerPage, filteredData.length)} of {filteredData.length} entries
                </div>

                <div className="flex items-center gap-1 mt-2 md:mt-0">
                  <button className="px-3 py-1 border rounded hover:bg-gray-100">‹</button>
                  <button className="px-3 py-1 border rounded bg-blue-600 text-white font-bold shadow-sm">1</button>
                  <button className="px-3 py-1 border rounded hover:bg-gray-100 transition-colors">›</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewUser;