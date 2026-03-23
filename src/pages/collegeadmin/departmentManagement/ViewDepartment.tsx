import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Building2,
    Hash,
    Layers,
    Clock,
    BookOpen,
    Calendar,
    Users,
    GraduationCap,
    Pencil,
    Power,
    AlertTriangle,
    AlertCircle,
    Loader2,
} from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import ModalWrapper from "@/components/ui/ModalWrapper";
import { useViewDepartment } from "@/hooks/collegeadmin/departmentManagement/useViewDepartment";
import { useToggleDepartmentStatus } from "@/hooks/collegeadmin/departmentManagement/useToggleDepartmentStatus";

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

const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
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
    value: number | string;
    label: string;
    color: "cyan" | "blue" | "orange" | "purple";
}) => {
    const colors = {
        cyan: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400",
        blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400",
        orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400",
        purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400",
    };
    const numColors = {
        cyan: "text-cyan-700 dark:text-cyan-300",
        blue: "text-blue-700 dark:text-blue-300",
        orange: "text-orange-700 dark:text-orange-300",
        purple: "text-purple-700 dark:text-purple-300",
    };

    return (
        <div className={`flex items-center gap-4 p-5 rounded-xl border ${colors[color]}`}>
            <div className="h-11 w-11 rounded-lg bg-white/80 dark:bg-gray-800/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                {icon}
            </div>
            <div>
                <p className={`text-2xl font-bold ${numColors[color]}`}>{value}</p>
                <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
        </div>
    );
};

/** Info row for overview grid */
const InfoRow = ({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) => (
    <div className="flex items-start gap-3 py-3.5">
        <div className="h-8 w-8 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
            <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
        </div>
    </div>
);

// ========================
// LOADING SKELETON
// ========================

const DetailSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
        {/* Hero skeleton */}
        <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
                <div className="space-y-2 flex-1">
                    <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-56" />
                    <div className="flex gap-2">
                        <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                        <div className="h-5 w-24 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-28 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    <div className="h-10 w-28 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                </div>
            </div>
        </div>
        {/* Stats skeleton */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700" />
                ))}
            </div>
        </div>
        {/* Body skeleton */}
        <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
        </div>
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

const ViewDepartment = () => {
    const { deptId } = useParams<{ deptId: string }>();
    const navigate = useNavigate();
    const { department, loading, error, refresh } = useViewDepartment(deptId);
    const { toggleStatus, loading: toggling } = useToggleDepartmentStatus();
    const [showConfirm, setShowConfirm] = useState(false);

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Departments", path: "/college/departments" },
            { label: department?.dept_name || "Details", active: true },
        ],
        [department?.dept_name]
    );

    const handleCloseConfirm = useCallback(() => {
        if (!toggling) setShowConfirm(false);
    }, [toggling]);

    const handleToggleStatus = useCallback(async () => {
        if (!department) return;
        toggleStatus(department.dept_id, department.is_active, () => {
            refresh();
            setShowConfirm(false);
        });
    }, [department, toggleStatus, refresh]);

    // ── Loading ──
    if (loading) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Department Details" breadcrumbs={breadcrumbs} />
                    <DetailSkeleton />
                </div>
            </AnimatedPage>
        );
    }

    // ── Error ──
    if (error || !department) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Department Details" breadcrumbs={breadcrumbs} />
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Failed to load department</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{error || "Department not found"}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/college/departments")}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                        >
                            ← Back to Departments
                        </button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    const isActive = department.is_active;

    return (
        <>
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Department Details" breadcrumbs={breadcrumbs} />

                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        {/* ── Hero Header ── */}
                        <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                                {/* Left: Avatar + info */}
                                <div className="flex items-center gap-4 min-w-0">
                                    <div
                                        className={`h-16 w-16 rounded-xl bg-gradient-to-br ${getAvatarGradient(department.dept_name)} flex items-center justify-center flex-shrink-0 shadow-sm text-white text-xl font-bold`}
                                    >
                                        {department.dept_code || getInitials(department.dept_name)}
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                            {department.dept_name}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            {/* Status badge */}
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    isActive
                                                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                                        : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        isActive ? "bg-emerald-500" : "bg-red-400"
                                                    }`}
                                                />
                                                {isActive ? "Active" : "Inactive"}
                                            </span>

                                            {/* Type tag */}
                                            {department.dept_type && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 capitalize">
                                                    {department.dept_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Action buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/college/update-department/${department.dept_id}`)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(true)}
                                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition shadow-sm ${
                                            isActive
                                                ? "bg-red-600 hover:bg-red-700 text-white"
                                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        }`}
                                    >
                                        <Power className="h-4 w-4" />
                                        {isActive ? "Deactivate" : "Activate"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Stats Row ── */}
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    icon={<Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
                                    value={department.user_count ?? 0}
                                    label="Active Users"
                                    color="cyan"
                                />
                                <StatCard
                                    icon={<GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                                    value={department.student_count ?? 0}
                                    label="Active Students"
                                    color="orange"
                                />
                                <StatCard
                                    icon={<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                                    value={`${department.program_duration_years} ${department.program_duration_years === 1 ? "Year" : "Years"}`}
                                    label="Program Duration"
                                    color="blue"
                                />
                                <StatCard
                                    icon={<BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                                    value={department.total_semesters}
                                    label="Total Semesters"
                                    color="purple"
                                />
                            </div>
                        </div>

                        {/* ── Overview Content ── */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                <InfoRow icon={<Building2 className="h-4 w-4" />} label="Department Name">
                                    {department.dept_name}
                                </InfoRow>

                                <InfoRow icon={<Hash className="h-4 w-4" />} label="Department Code">
                                    {department.dept_code ? (
                                        <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded uppercase">
                                            {department.dept_code}
                                        </code>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">Not set</span>
                                    )}
                                </InfoRow>

                                <InfoRow icon={<Layers className="h-4 w-4" />} label="Department Type">
                                    {department.dept_type ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 capitalize">
                                            {department.dept_type}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">Not set</span>
                                    )}
                                </InfoRow>

                                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Created">
                                    {formatDate(department.created_at)}
                                </InfoRow>

                                <InfoRow icon={<Hash className="h-4 w-4" />} label="Department ID">
                                    <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">
                                        {department.dept_id}
                                    </code>
                                </InfoRow>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedPage>

            {/* ── Toggle Confirmation Modal ── */}
            <ModalWrapper
                isOpen={showConfirm}
                onClose={handleCloseConfirm}
                disabled={toggling}
                title={isActive ? "Deactivate Department" : "Activate Department"}
                titleIcon={
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                        isActive ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"
                    }`}>
                        <Power className={`h-4 w-4 ${
                            isActive ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                        }`} />
                    </div>
                }
                size="md"
            >
                {/* Modal body */}
                <div className="px-6 py-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to{" "}
                        <span className="font-semibold">
                            {isActive ? "deactivate" : "activate"}
                        </span>{" "}
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {department.dept_name}
                            {department.dept_code && ` (${department.dept_code})`}
                        </span>
                        ?
                    </p>

                    {isActive ? (
                        <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                <p className="font-medium">This action will:</p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    <li>Mark this department as inactive across the system</li>
                                    <li>Students and users in this department will not be affected</li>
                                    <li>You can re-activate the department at any time</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                            <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                This department will be available for new student registrations and visible across the platform.
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleCloseConfirm}
                        disabled={toggling}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleStatus}
                        disabled={toggling}
                        className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${
                            isActive
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                    >
                        {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
                        {toggling ? "Updating..." : isActive ? "Deactivate" : "Activate"}
                    </button>
                </div>
            </ModalWrapper>
        </>
    );
};

export default ViewDepartment;
