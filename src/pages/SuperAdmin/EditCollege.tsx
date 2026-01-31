import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/sysadmin/DashboardLayout";
import CollegeForm from "@/components/sysadmin/CollegeForm";
import PageHeader from "@/components/sysadmin/PageHeader";

const EditCollege = () => {
    const { collegeId } = useParams();

    // Mock initial data - in a real app, you'd fetch this using collegeId
    const mockCollegeData = {
        college_name: "Example University",
        subdomain: "example",
        admin_name: "Admin User",
        admin_email: "admin@example.com",
    };

    const breadcrumbs = [
        { label: "Super Admin" },
        { label: "Colleges" },
        { label: "Edit College", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <PageHeader title={`Edit College: #${collegeId}`} breadcrumbs={breadcrumbs} />

                {/* Form Component in Edit Mode */}
                <CollegeForm isEdit={true} initialData={mockCollegeData} />
            </div>
        </DashboardLayout>
    );
};

export default EditCollege;
