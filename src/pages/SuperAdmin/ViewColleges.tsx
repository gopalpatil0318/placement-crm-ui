"use client";

import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/sysadmin/DashboardLayout";
import PageHeader from "@/components/sysadmin/PageHeader";
import { useViewColleges } from "@/hooks/sysadmin/useViewColleges";


const BREADCRUMBS = [
  { label: "Super Admin" },
  { label: "Colleges" },
  { label: "View List", active: true },
];


const ViewCollege: React.FC = () => {
  const {
    loading,
    search,
    entriesPerPage,
    filteredData,
    paginatedData,
    handleSearchChange,
    handleEntriesChange,
    handleNavigateToAddCollege,
    handleNavigateToViewCollege,
    handleNavigateToEditCollege,
  } = useViewColleges();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Colleges List" breadcrumbs={BREADCRUMBS} />
        <div className="w-full">
          <div className="p-8 bg-white rounded-xl border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-800">
                College List
              </h1>

              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                  Apply College
                </button>
                <button
                  onClick={handleNavigateToAddCollege}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all font-bold"
                >
                  Add College
                </button>
              </div>
            </div>

            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="text-sm text-gray-600 font-semibold">
                  Show
                  <select
                    value={entriesPerPage}
                    onChange={handleEntriesChange}
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
                  placeholder="Search..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                      <th className="px-4 py-3">COLLEGE NAME</th>
                      <th className="px-4 py-3">SUBDOMAIN</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3 text-center">ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-10 text-gray-500 italic"
                        >
                          Loading data...
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((college) => (
                        <tr
                          key={college.college_id}
                          // --- Added onClick to entire Row ---
                          onClick={() =>
                            handleNavigateToViewCollege(college.college_id)
                          }
                          className="border-b hover:bg-gray-50 text-sm cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {college.college_name}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {college.college_subdomain}
                          </td>
                          <td className="px-4 py-3 text-gray-600 capitalize font-semibold">
                            {college.college_status}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-3 text-gray-500">
                              {/* Eye icon also works, but row handles it now */}
                              <button className="hover:text-blue-600 transition-colors">
                                <Eye size={18} />
                              </button>

                              {/* e.stopPropagation ensures clicking Edit/Delete doesn't open the profile row click */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigateToEditCollege(
                                    college.college_id
                                  );
                                }}
                                className="hover:text-green-600 transition-colors"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Logic for delete can go here
                                }}
                                className="hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}

                    {!loading && filteredData.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-6 text-gray-500"
                        >
                          No colleges found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 text-sm text-gray-600 font-semibold italic">
                <div>
                  Showing 1 to {Math.min(entriesPerPage, filteredData.length)} of{" "}
                  {filteredData.length} entries
                </div>

                <div className="flex items-center gap-1 mt-2 md:mt-0">
                  <button className="px-3 py-1 border rounded hover:bg-gray-100">
                    ‹
                  </button>
                  <button className="px-3 py-1 border rounded bg-blue-600 text-white font-bold shadow-sm">
                    1
                  </button>
                  <button className="px-3 py-1 border rounded hover:bg-gray-100 transition-colors">
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewCollege;