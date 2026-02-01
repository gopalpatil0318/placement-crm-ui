"use client"

import DashboardLayout from '@/components/sysadmin/DashboardLayout';
import CollegeProfile from "@/components/sysadmin/CollegeProfile";
import PageHeader from '@/components/sysadmin/PageHeader';

const CollegePage = () => {
  const breadcrumbs = [
    { label: "Super Admin" },
    { label: "Colleges" },
    { label: "College Profile", active: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader title="Institution Profile" breadcrumbs={breadcrumbs} />

        {/* Profile Component with internal hook logic */}
        <CollegeProfile />
      </div>
    </DashboardLayout>
  );
};

export default CollegePage;