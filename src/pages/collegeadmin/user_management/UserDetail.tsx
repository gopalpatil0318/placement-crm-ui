import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Mail, Shield, Building2, Calendar, Clock, Hash,
    Pencil, Power, AlertTriangle, AlertCircle, Loader2,
} from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import ModalWrapper from "@/components/ui/ModalWrapper";
import { useUserDetail } from "@/hooks/collegeadmin/user_management/useUserDetail";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// HELPERS
// ========================

const AVATAR_COLORS = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600",
] as const;

const getAvatarGradient = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const formatDateTime = (dateStr: string | undefined | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const ROLE_BADGE_MAP: Record<string, { label: string; bg: string }> = {
    collegeadmin: { label: "College Admin", bg: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800" },
    tpo: { label: "TPO (Training & Placement Officer)", bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" },
    tpc: { label: "TPC (Training & Placement Coordinator)", bg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" },
    hod: { label: "HOD (Head of Department)", bg: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800" },
    teacher: { label: "Teacher", bg: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700" },
};

// ========================
// SUB-COMPONENTS
// ========================

/** Stat card */
const StatCard = ({
    icon,
    value,
    label,
    color,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
    color: "blue" | "purple" | "cyan" | "orange";
}) => {
    const colors = {
        blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400",
        purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400",
        cyan: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400",
        orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400",
    };
    const numColors = {
        blue: "text-blue-700 dark:text-blue-300",
        purple: "text-purple-700 dark:text-purple-300",
        cyan: "text-cyan-700 dark:text-cyan-300",
        orange: "text-orange-700 dark:text-orange-300",
    };
    return (
        <div className={`flex items-center gap-4 p-5 rounded-xl border ${colors[color]}`}>
            <div className="h-11 w-11 rounded-lg bg-white/80 dark:bg-gray-800/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                {icon}
            </div>
            <div>
                <p className={`text-lg font-bold ${numColors[color]}`}>{value}</p>
                <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
        </div>
    );
};

/** Info row */
const InfoRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) => (
    <div className="flex items-start gap-3 py-3">
        <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{value}</div>
        </div>
    </div>
);

/** Detail skeleton */
const DetailSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Hero */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2 flex-1">
                        <div className="h-6 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="flex gap-2">
                            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    </div>
                </div>
            </div>
            {/* Stats */}
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                ))}
            </div>
        </div>
        {/* Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        <div className="space-y-1.5">
                            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
                        </div>
                    </div>
                ))}
            </div>
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

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Users", path: "/college/view-users" },
        { label: user?.user_name || "User Detail", active: true },
    ], [user?.user_name]);

    const roleBadge = ROLE_BADGE_MAP[user?.user_role || ""] || ROLE_BADGE_MAP.teacher;
    const isActive = user?.user_status === "active";
    const isAdmin = user?.user_role === "collegeadmin";

    // Loading
    if (loading) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="User Details" breadcrumbs={breadcrumbs} />
                    <DetailSkeleton />
                </div>
            </AnimatedPage>
        );
    }

    // Error
    if (error || !user) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="User Details" breadcrumbs={breadcrumbs} />
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">
                            {error || "User not found"}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/college/view-users")}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Return to Users List
                        </button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="User Details" breadcrumbs={breadcrumbs} />

                {/* Hero Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Hero Header */}
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-5">
                                {/* Avatar */}
                                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getAvatarGradient(user.user_name)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                                    {getInitials(user.user_name)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        {user.user_name}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadge.bg}`}>
                                            {roleBadge.label}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            isActive
                                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                        }`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                                            {isActive ? "Active" : "Inactive"}
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
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowToggleModal(true)}
                                        className={`inline-flex items-center gap-2 px-5 py-2 text-white rounded-xl text-sm font-medium transition shadow-sm ${
                                            isActive
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-emerald-600 hover:bg-emerald-700"
                                        }`}
                                    >
                                        <Power className="h-4 w-4" />
                                        {isActive ? "Deactivate" : "Activate"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={<Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                            value={user.user_email.split("@")[0]}
                            label="Email Prefix"
                            color="blue"
                        />
                        <StatCard
                            icon={<Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                            value={(ROLE_BADGE_MAP[user.user_role]?.label || user.user_role).split(" ")[0]}
                            label="Role"
                            color="purple"
                        />
                        <StatCard
                            icon={<Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
                            value={user.dept_name || "None"}
                            label="Department"
                            color="cyan"
                        />
                        <StatCard
                            icon={<Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                            value={user.created_at ? new Date(user.created_at).getFullYear().toString() : "—"}
                            label="Member Since"
                            color="orange"
                        />
                    </div>
                </div>

                {/* Info Grid */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">
                        Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                        <InfoRow
                            icon={<Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                            label="Email Address"
                            value={user.user_email}
                        />
                        <InfoRow
                            icon={<Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                            label="Role"
                            value={roleBadge.label}
                        />
                        <InfoRow
                            icon={<Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                            label="Department"
                            value={user.dept_name || <span className="text-gray-400 dark:text-gray-600 italic">No department assigned</span>}
                        />
                        <InfoRow
                            icon={<Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                            label="College"
                            value={user.college_name || "—"}
                        />
                        <InfoRow
                            icon={<Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                            label="User ID"
                            value={
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-600 dark:text-gray-400">
                                    {user.user_id}
                                </code>
                            }
                        />
                        <InfoRow
                            icon={<Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                            label="Created At"
                            value={formatDateTime(user.created_at)}
                        />
                        <InfoRow
                            icon={<Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                            label="Last Updated"
                            value={formatDateTime(user.updated_at)}
                        />
                    </div>
                </div>
            </div>

            {/* Toggle Status Modal */}
            <ModalWrapper
                isOpen={showToggleModal}
                onClose={() => setShowToggleModal(false)}
                disabled={toggling}
                title={`${isActive ? "Deactivate" : "Activate"} User`}
                titleIcon={
                    isActive
                        ? <AlertTriangle className="h-5 w-5 text-amber-500" />
                        : <Power className="h-5 w-5 text-emerald-500" />
                }
            >
                <div className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to{" "}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {isActive ? "deactivate" : "activate"}
                        </span>{" "}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {user.user_name}
                        </span>{" "}
                        ({roleBadge.label})?
                    </p>

                    {isActive && (
                        <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    This user will no longer be able to log in until reactivated.
                                </p>
                            </div>
                        </div>
                    )}

                    {!isActive && (
                        <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <Power className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                    This user will regain access and can log in again.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setShowToggleModal(false)}
                        disabled={toggling}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleConfirm}
                        disabled={toggling}
                        className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${
                            isActive
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                    >
                        {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
                        {toggling
                            ? "Updating..."
                            : isActive ? "Deactivate" : "Activate"}
                    </button>
                </div>
            </ModalWrapper>
        </AnimatedPage>
    );
}
