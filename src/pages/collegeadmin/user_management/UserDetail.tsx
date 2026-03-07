import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Shield, Building2, Calendar, Clock, Hash, Power, X } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useUserDetail } from "@/hooks/collegeadmin/user_management/useUserDetail";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// CONSTANTS
// ========================

const ROLE_BADGE_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
    collegeadmin: { label: "College Admin", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    tpo: { label: "TPO (Training & Placement Officer)", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    tpc: { label: "TPC (Training & Placement Coordinator)", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    hod: { label: "HOD (Head of Department)", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
    teacher: { label: "Teacher", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    active: { label: "Active", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    inactive: { label: "Inactive", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

function formatDateTime(dateStr: string): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ========================
// SKELETON
// ========================

const DetailSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-5 w-40 bg-gray-100 rounded" />
                </div>
            ))}
        </div>
    </div>
);

// ========================
// INFO ROW COMPONENT
// ========================

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
    <div className="flex items-start gap-3 py-3">
        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
            <div className="text-sm font-medium text-gray-800 mt-0.5">{value}</div>
        </div>
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

export default function UserDetail() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { user, loading, error, refresh } = useUserDetail(userId || "");

    // Toggle status modal
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [toggling, setToggling] = useState(false);

    const handleToggleConfirm = useCallback(async () => {
        if (!user) return;
        setToggling(true);
        const newStatus = user.user_status === "active" ? "inactive" : "active";
        try {
            const response = await CollegeAdminService.toggleUserStatus(user.user_id, newStatus);
            showToast({
                type: "success",
                title: "Status Updated",
                description: response?.message || `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
            });
            refresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update status";
            showToast({ type: "error", title: "Error", description: msg });
        } finally {
            setToggling(false);
            setShowToggleModal(false);
        }
    }, [user, refresh]);

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Users", path: "/college/view-users" },
        { label: user?.user_name || "User Detail", active: true },
    ];

    const roleBadge = ROLE_BADGE_MAP[user?.user_role || ""] || ROLE_BADGE_MAP.teacher;
    const statusBadge = STATUS_MAP[user?.user_status || ""] || STATUS_MAP.active;
    const isAdmin = user?.user_role === "collegeadmin";

    // Get initials for the avatar
    const initials = user?.user_name
        ? user.user_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader title="User Details" breadcrumbs={breadcrumbs} />

                {/* Back button */}
                <button
                    type="button"
                    onClick={() => navigate("/college/view-users")}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium transition"
                >
                    <ArrowLeft size={16} />
                    Back to Users
                </button>

                {loading ? (
                    <div className="bg-white rounded-xl border p-8">
                        <DetailSkeleton />
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl border p-8 text-center">
                        <p className="text-red-500 font-medium">{error}</p>
                        <button
                            type="button"
                            onClick={() => navigate("/college/view-users")}
                            className="mt-4 text-sm text-blue-600 hover:underline"
                        >
                            Return to Users List
                        </button>
                    </div>
                ) : user ? (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        {/* Header card with avatar and status */}
                        <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                        {initials}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{user.user_name}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadge.bg} ${roleBadge.text} border ${roleBadge.border}`}>
                                                {roleBadge.label}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                                                {statusBadge.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons — hidden for collegeadmin */}
                                {!isAdmin && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/college/update-user/${user.user_id}`)}
                                            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                        >
                                            Edit User
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowToggleModal(true)}
                                            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition ${user.user_status === "active"
                                                    ? "bg-red-600 hover:bg-red-700"
                                                    : "bg-green-600 hover:bg-green-700"
                                                }`}
                                        >
                                            <Power size={16} />
                                            {user.user_status === "active" ? "Deactivate" : "Activate"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                                <InfoRow
                                    icon={<Mail size={16} className="text-gray-500" />}
                                    label="Email Address"
                                    value={user.user_email}
                                />
                                <InfoRow
                                    icon={<Shield size={16} className="text-gray-500" />}
                                    label="Role"
                                    value={roleBadge.label}
                                />
                                <InfoRow
                                    icon={<Building2 size={16} className="text-gray-500" />}
                                    label="Department"
                                    value={user.dept_name || <span className="text-gray-400 italic">No department assigned</span>}
                                />
                                <InfoRow
                                    icon={<Building2 size={16} className="text-gray-500" />}
                                    label="College"
                                    value={user.college_name || "—"}
                                />
                                <InfoRow
                                    icon={<Hash size={16} className="text-gray-500" />}
                                    label="User ID"
                                    value={
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            {user.user_id}
                                        </code>
                                    }
                                />
                                <InfoRow
                                    icon={<Calendar size={16} className="text-gray-500" />}
                                    label="Created At"
                                    value={formatDateTime(user.created_at)}
                                />
                                <InfoRow
                                    icon={<Clock size={16} className="text-gray-500" />}
                                    label="Last Updated"
                                    value={formatDateTime(user.updated_at)}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Toggle Status Confirmation Modal */}
            {showToggleModal && user && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => !toggling && setShowToggleModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">
                                {user.user_status === "active" ? "Deactivate" : "Activate"} User
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowToggleModal(false)}
                                disabled={toggling}
                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to{" "}
                                <span className="font-bold">
                                    {user.user_status === "active" ? "deactivate" : "activate"}
                                </span>{" "}
                                <span className="font-bold">
                                    {user.user_name}
                                </span>
                                {" "}({ROLE_BADGE_MAP[user.user_role]?.label || user.user_role})?
                            </p>
                            {user.user_status === "active" && (
                                <p className="text-xs text-amber-600 mt-3 bg-amber-50 px-3 py-2 rounded-lg">
                                    ⚠️ This user will not be able to log in until reactivated.
                                </p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowToggleModal(false)}
                                disabled={toggling}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleToggleConfirm}
                                disabled={toggling}
                                className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${user.user_status === "active"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {toggling && (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                )}
                                {toggling
                                    ? "Updating..."
                                    : user.user_status === "active"
                                        ? "Deactivate"
                                        : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
