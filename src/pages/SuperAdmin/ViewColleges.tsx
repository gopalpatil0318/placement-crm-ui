import React, { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/sysadmin/DashboardLayout";
import PageHeader from "@/components/sysadmin/PageHeader";

interface College {
  id: number;
  name: string;
  subdomain: string;
  adminEmail: string;
}

const collegesData: College[] = [
  {
    id: 1,
    name: "ABC Engineering College",
    subdomain: "abc.college.com",
    adminEmail: "admin@abc.com",
  },
  {
    id: 2,
    name: "XYZ Medical College",
    subdomain: "xyz.college.com",
    adminEmail: "admin@xyz.com",
  },
  {
    id: 3,
    name: "National Arts College",
    subdomain: "arts.college.com",
    adminEmail: "admin@arts.com",
  },
];

const ViewCollege: React.FC = () => {
  const [search, setSearch] = useState("");

  const filteredData = collegesData.filter(
    (college) =>
      college.name.toLowerCase().includes(search.toLowerCase()) ||
      college.subdomain.toLowerCase().includes(search.toLowerCase()) ||
      college.adminEmail.toLowerCase().includes(search.toLowerCase())
  );

  const breadcrumbs = [
    { label: "Super Admin" },
    { label: "Colleges" },
    { label: "View List", active: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader title="Colleges List" breadcrumbs={breadcrumbs} />
        <div className="w-full">
          <div className="p-8 bg-white rounded-xl border">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-800">
                College List
              </h1>

              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                  Apply College
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add College
                </button>
              </div>
            </div>

            {/* Body */}
            <div>
              {/* Top Controls */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="text-sm text-gray-600">
                  Show
                  <select className="mx-2 border border-gray-300 rounded px-2 py-1">
                    <option>5</option>
                    <option selected>10</option>
                    <option>15</option>
                    <option>20</option>
                  </select>
                  entries
                </div>

                <input
                  type="search"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                      <th className="px-4 py-3">COLLEGE NAME</th>
                      <th className="px-4 py-3">SUBDOMAIN</th>
                      <th className="px-4 py-3">ADMIN EMAIL</th>
                      <th className="px-4 py-3 text-center">ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.map((college) => (
                      <tr
                        key={college.id}
                        className="border-b hover:bg-gray-50 text-sm"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {college.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {college.subdomain}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {college.adminEmail}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3 text-gray-500">
                            <button className="hover:text-blue-600">
                              <Eye size={18} />
                            </button>
                            <button className="hover:text-green-600">
                              <Pencil size={18} />
                            </button>
                            <button className="hover:text-red-600">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredData.length === 0 && (
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

              {/* Footer */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 text-sm text-gray-600">
                <div>Showing 1 to {filteredData.length} entries</div>

                <div className="flex items-center gap-1 mt-2 md:mt-0">
                  <button className="px-3 py-1 border rounded hover:bg-gray-100">
                    ‹
                  </button>
                  <button className="px-3 py-1 border rounded bg-blue-600 text-white">
                    1
                  </button>
                  <button className="px-3 py-1 border rounded hover:bg-gray-100">
                    2
                  </button>
                  <button className="px-3 py-1 border rounded hover:bg-gray-100">
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
