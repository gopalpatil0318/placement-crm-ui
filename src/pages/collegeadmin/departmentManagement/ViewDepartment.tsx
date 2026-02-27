"use client";

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Pencil,
    Building2,
    Hash,
    Layers,
    Clock,
    BookOpen,
    CheckCircle,
    XCircle,
    Calendar,
    Users,
    GraduationCap,
} from "lucide-react";
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
                    <div className="flex justify-center items-center py-24">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                        <span className="ml-3 text-slate-500 text-lg">
                            Loading department...
                        </span>
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
                    <div className="text-center py-24">
                        <p className="text-red-500 text-lg font-medium">
                            {error || "Department not found"}
                        </p>
                        <button
                            onClick={() => navigate("/collegeadmin/departments")}
                            className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow-sm"
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
            icon: <Building2 size={18} className="text-blue-600" />,
            label: "Department Name",
            value: department.dept_name,
        },
        {
            icon: <Hash size={18} className="text-purple-600" />,
            label: "Department Code",
            value: department.dept_code,
        },
        {
            icon: <Layers size={18} className="text-indigo-600" />,
            label: "Department Type",
            value: department.dept_type,
            capitalize: true,
        },
        {
            icon: <Clock size={18} className="text-amber-600" />,
            label: "Program Duration",
            value: `${department.program_duration_years} ${department.program_duration_years === 1 ? "Year" : "Years"
                }`,
        },
        {
            icon: <BookOpen size={18} className="text-teal-600" />,
            label: "Total Semesters",
            value: department.total_semesters,
        },
        {
            icon: department.is_active ? (
                <CheckCircle size={18} className="text-emerald-600" />
            ) : (
                <XCircle size={18} className="text-red-600" />
            ),
            label: "Status",
            value: department.is_active ? "Active" : "Inactive",
            badge: true,
            badgeColor: department.is_active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700",
        },
        {
            icon: <Users size={18} className="text-cyan-600" />,
            label: "User Count",
            value: department.user_count ?? 0,
        },
        {
            icon: <GraduationCap size={18} className="text-orange-600" />,
            label: "Student Count",
            value: department.student_count ?? 0,
        },
        {
            icon: <Calendar size={18} className="text-gray-600" />,
            label: "Created At",
            value: department.created_at
                ? new Date(department.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })
                : "N/A",
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Department Details" breadcrumbs={breadcrumbs} />

                <div className="w-full">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate("/collegeadmin/departments")}
                                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </button>

                                <div className="h-6 w-px bg-slate-200" />

                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900">
                                        {department.dept_name}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Department Overview & Configuration
                                    </p>
                                </div>

                                <span
                                    className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${department.is_active
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {department.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        `/collegeadmin/update-department/${department.dept_id}`
                                    )
                                }
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
                            >
                                <Pencil size={16} />
                                Edit Department
                            </button>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {infoCards.map((card, index) => (
                                <div
                                    key={index}
                                    className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="absolute -top-4 left-6">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm">
                                            {card.icon}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            {card.label}
                                        </p>

                                        {card.badge ? (
                                            <span
                                                className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${card.badgeColor}`}
                                            >
                                                {card.value}
                                            </span>
                                        ) : (
                                            <p
                                                className={`mt-2 text-lg font-semibold text-slate-900 ${card.capitalize ? "capitalize" : ""
                                                    }`}
                                            >
                                                {card.value}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t border-slate-100">
                            <p className="text-xs text-slate-400">
                                Department ID:{" "}
                                <span className="font-mono text-slate-500">
                                    {department.dept_id}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ViewDepartment;