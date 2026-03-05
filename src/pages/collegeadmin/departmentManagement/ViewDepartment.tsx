"use client";

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Building2, Hash, Layers, Clock, BookOpen, CheckCircle, XCircle, Calendar, Users, GraduationCap } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewDepartment } from "@/hooks/collegeadmin/departmentManagement/useViewDepartment";

const ViewDepartment: React.FC = () => {
    const { deptId } = useParams<{ deptId: string }>();
    const navigate = useNavigate();
    const { department, loading, error } = useViewDepartment(deptId);

    const breadcrumbs = [
        { label: "College Admin" },
        { label: "Departments" },
        { label: "View Department", active: true },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-8">
                    <PageHeader title="Department Details" breadcrumbs={breadcrumbs} />
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-500 text-lg">Loading department...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !department) {
        return (
            <DashboardLayout>
                <div className="space-y-8">
                    <PageHeader title="Department Details" breadcrumbs={breadcrumbs} />
                    <div className="text-center py-20">
                        <p className="text-red-500 text-lg font-medium">{error || "Department not found"}</p>
                        <button
                            onClick={() => navigate("/collegeadmin/departments")}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                            Back to Departments
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const infoCards = [
        {
            icon: <Building2 size={20} className="text-blue-600" />,
            label: "Department Name",
            value: department.dept_name,
            bg: "bg-blue-50",
        },
        {
            icon: <Hash size={20} className="text-purple-600" />,
            label: "Department Code",
            value: department.dept_code,
            bg: "bg-purple-50",
        },
        {
            icon: <Layers size={20} className="text-indigo-600" />,
            label: "Department Type",
            value: department.dept_type,
            bg: "bg-indigo-50",
            capitalize: true,
        },
        {
            icon: <Clock size={20} className="text-amber-600" />,
            label: "Program Duration",
            value: `${department.program_duration_years} ${department.program_duration_years === 1 ? "Year" : "Years"}`,
            bg: "bg-amber-50",
        },
        {
            icon: <BookOpen size={20} className="text-teal-600" />,
            label: "Total Semesters",
            value: department.total_semesters,
            bg: "bg-teal-50",
        },
        {
            icon: department.is_active
                ? <CheckCircle size={20} className="text-green-600" />
                : <XCircle size={20} className="text-red-600" />,
            label: "Status",
            value: department.is_active ? "Active" : "Inactive",
            bg: department.is_active ? "bg-green-50" : "bg-red-50",
            badge: true,
            badgeColor: department.is_active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700",
        },
        {
            icon: <Users size={20} className="text-cyan-600" />,
            label: "User Count",
            value: department.user_count ?? 0,
            bg: "bg-cyan-50",
        },
        {
            icon: <GraduationCap size={20} className="text-orange-600" />,
            label: "Student Count",
            value: department.student_count ?? 0,
            bg: "bg-orange-50",
        },
        {
            icon: <Calendar size={20} className="text-gray-600" />,
            label: "Created At",
            value: department.created_at
                ? new Date(department.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })
                : "N/A",
            bg: "bg-gray-50",
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Department Details" breadcrumbs={breadcrumbs} />

                <div className="w-full">
                    <div className="p-8 bg-white rounded-xl border">
                        {/* Header with actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate("/collegeadmin/departments")}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </button>
                                <h1 className="text-xl font-semibold text-gray-800">
                                    {department.dept_name}
                                </h1>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${department.is_active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}>
                                    {department.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <button
                                onClick={() => navigate(`/collegeadmin/update-department/${department.dept_id}`)}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold mt-4 sm:mt-0"
                            >
                                <Pencil size={16} />
                                Edit Department
                            </button>
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {infoCards.map((card, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start gap-4 p-5 rounded-xl border ${card.bg} transition-shadow hover:shadow-sm`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {card.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                            {card.label}
                                        </p>
                                        {card.badge ? (
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${card.badgeColor}`}>
                                                {card.value}
                                            </span>
                                        ) : (
                                            <p className={`text-base font-semibold text-gray-800 ${card.capitalize ? "capitalize" : ""}`}>
                                                {card.value}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Department ID footer */}
                        <div className="mt-8 pt-5 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Department ID: <span className="font-mono">{department.dept_id}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ViewDepartment;
