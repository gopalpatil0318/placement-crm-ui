import { useState, useCallback, useMemo } from "react";
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
    Power,
    X,
} from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useViewDepartment } from "@/hooks/collegeadmin/departmentManagement/useViewDepartment";
import { useToggleDepartmentStatus } from "@/hooks/collegeadmin/departmentManagement/useToggleDepartmentStatus";

// ========================
// COMPONENT
// ========================

const ViewDepartment = () => {
    const { deptId } = useParams<{ deptId: string }>();
    const navigate = useNavigate();
    const { department, loading, error, refresh } = useViewDepartment(deptId);
    const { toggleStatus, loading: toggleLoading } = useToggleDepartmentStatus();

    // Toggle confirmation modal state
    const [showToggleModal, setShowToggleModal] = useState(false);

    const handleToggleConfirm = useCallback(async () => {
        if (!department) return;
        await toggleStatus(department.dept_id, department.is_active, refresh);
        setShowToggleModal(false);
    }, [department, toggleStatus, refresh]);

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Departments", path: "/college/departments" },
            { label: department?.dept_name || "View Department", active: true },
        ],
        [department?.dept_name]
    );

    // ========================
    // SKELETON LOADING
    // ========================
    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-8">
                    <PageHeader title="Department Details" breadcrumbs={breadcrumbs} />
                    <div className="bg-white rounded-2xl border p-10 animate-pulse">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-5 w-16 bg-gray-200 rounded" />
                            <div className="h-6 w-px bg-gray-200" />
                            <div className="space-y-2">
                                <div className="h-7 w-64 bg-gray-200 rounded" />
                                <div className="h-4 w-48 bg-gray-100 rounded" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="border rounded-xl p-6 pt-10">
                                    <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
                                    <div className="h-5 w-32 bg-gray-100 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ========================
    // ERROR STATE
    // ========================
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
                            type="button"
                            onClick={() => navigate("/college/departments")}
                            className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow-sm"
                        >
                            Back to Departments
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ========================
    // INFO CARDS DATA
    // ========================
    const infoCards = [
        {
            icon: <Building2 size={18} className="text-blue-600" />,
            label: "Department Name",
            value: department.dept_name,
        },
        {
            icon: <Hash size={18} className="text-purple-600" />,
            label: "Department Code",
            value: department.dept_code || "Not set",
            mono: !!department.dept_code,
        },
        {
            icon: <Layers size={18} className="text-indigo-600" />,
            label: "Department Type",
            value: department.dept_type || "Not set",
            capitalize: !!department.dept_type,
        },
        {
            icon: <Clock size={18} className="text-amber-600" />,
            label: "Program Duration",
            value: `${department.program_duration_years} ${department.program_duration_years === 1 ? "Year" : "Years"}`,
        },
        {
            icon: <BookOpen size={18} className="text-teal-600" />,
            label: "Total Semesters",
            value: `${department.total_semesters} Semesters`,
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
            label: "Active Users",
            value: department.user_count ?? 0,
        },
        {
            icon: <GraduationCap size={18} className="text-orange-600" />,
            label: "Active Students",
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
                    hour: "2-digit",
                    minute: "2-digit",
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
                                    type="button"
                                    onClick={() => navigate("/college/departments")}
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
                                    className={`ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${department.is_active
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${department.is_active ? "bg-emerald-500" : "bg-red-500"}`}
                                    />
                                    {department.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/college/update-department/${department.dept_id}`
                                        )
                                    }
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
                                >
                                    <Pencil size={16} />
                                    Edit Department
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowToggleModal(true)}
                                    disabled={toggleLoading}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 ${department.is_active
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-green-600 text-white hover:bg-green-700"
                                        }`}
                                >
                                    <Power size={16} />
                                    {department.is_active ? "Deactivate" : "Activate"}
                                </button>
                            </div>
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
                                                className={`mt-2 text-lg font-semibold text-slate-900 ${card.capitalize ? "capitalize" : ""} ${card.mono ? "font-mono" : ""}`}
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

            {/* ===== Toggle Status Confirmation Modal ===== */}
            {showToggleModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => !toggleLoading && setShowToggleModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">
                                {department.is_active
                                    ? "Deactivate Department"
                                    : "Activate Department"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowToggleModal(false)}
                                disabled={toggleLoading}
                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to{" "}
                                <span className="font-bold">
                                    {department.is_active ? "deactivate" : "activate"}
                                </span>{" "}
                                <span className="font-bold">
                                    "{department.dept_name}"
                                    {department.dept_code && (
                                        <> ({department.dept_code})</>
                                    )}
                                </span>
                                ?
                            </p>
                            {department.is_active && (
                                <p className="text-xs text-amber-600 mt-3 bg-amber-50 px-3 py-2 rounded-lg">
                                    ⚠️ Students and users in this department will
                                    still exist but the department will be marked as
                                    inactive.
                                </p>
                            )}
                        </div>

                        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowToggleModal(false)}
                                disabled={toggleLoading}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleToggleConfirm}
                                disabled={toggleLoading}
                                className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${department.is_active
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {toggleLoading && (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                )}
                                {toggleLoading
                                    ? "Updating..."
                                    : department.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ViewDepartment;