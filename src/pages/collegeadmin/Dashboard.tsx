"use client";

// Importing the specific layout from the collegeadmin components folder
import DashboardLayout from "../../components/collegeadmin/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between px-4 py-4">
        {/* Maintaining consistent typography and spacing */}
        <h2 className="text-xl font-bold tracking-wide">College CRM</h2>
      </div>
    </DashboardLayout>
  );
}