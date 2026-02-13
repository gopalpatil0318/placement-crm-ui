"use client"

import DashboardLayout from '@/components/sysadmin/DashboardLayout';
import CollegeProfile from "@/components/sysadmin/CollegeProfile";
import PageHeader from '@/components/sysadmin/PageHeader';

const BREADCRUMBS = [
  { label: "Super Admin" },
  { label: "Colleges" },
  { label: "College Profile", active: true },
];

const CollegePage = () => {


  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader title="Institution Profile" breadcrumbs={BREADCRUMBS} />
        <CollegeProfile />
      </div>
    </DashboardLayout>
  );
};

export default CollegePage;