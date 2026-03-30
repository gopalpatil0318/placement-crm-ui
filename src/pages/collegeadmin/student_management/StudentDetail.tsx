import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, LayoutGroup, useReducedMotion } from "framer-motion";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
    Mail, Building2, Calendar, Clock, GraduationCap, Hash,
    CheckCircle, XCircle, Power, Pencil, AlertTriangle, AlertCircle,
    Loader2, User, Shield, BookOpen, RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import AnimatedTabContent from "@/components/ui/AnimatedTabContent";
import ModalWrapper from "@/components/ui/ModalWrapper";
import { useStudentDetail } from "@/hooks/collegeadmin/student_management/useStudentDetail";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { showToast } from "@/utils/ToastUtils";
import { useStudentReviewProfile } from "@/hooks/collegeadmin/verification/useStudentReviewProfile";
import { useVerifyItem } from "@/hooks/collegeadmin/verification/useVerifyItem";
import { useApproveStudentProfile } from "@/hooks/collegeadmin/verification/useApproveStudentProfile";
import { VERIFICATION_STATUS_CONFIG } from "@/validators/VerificationSchema";
import ExperienceSection from "@/components/student/profile/ExperienceSection";
import AchievementsSection from "@/components/student/profile/AchievementsSection";
import CertificatesSection from "@/components/student/profile/CertificatesSection";
import SkillsSection from "@/components/student/profile/SkillsSection";
import ProjectsSection from "@/components/student/profile/ProjectsSection";
import AboutSection from "@/components/student/profile/AboutSection";
import ActivitiesSection from "@/components/student/profile/ActivitiesSection";
import StudentRestrictionsTab from "@/components/collegeadmin/student_management/restrictions/StudentRestrictionsTab";

// ========================
// CONSTANTS
// ========================

const STATUS_MAP: Record<string, { label: string; bg: string; dot: string }> = {
    active: { label: "Active", bg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
    inactive: { label: "Inactive", bg: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700", dot: "bg-gray-400" },
    suspended: { label: "Suspended", bg: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800", dot: "bg-orange-500" },
    graduated: { label: "Graduated", bg: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800", dot: "bg-blue-500" },
    dropout: { label: "Dropout", bg: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800", dot: "bg-red-500" },
};

const ALL_STATUSES = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
    { value: "graduated", label: "Graduated" },
    { value: "dropout", label: "Dropout" },
];

const TAB_KEYS = ["overview", "details", "profile", "restrictions"] as const;

const AVATAR_COLORS = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600",
] as const;

// ========================
// HELPERS
// ========================

const getAvatarGradient = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (first: string, last: string) =>
    (first[0] + (last[0] || "")).toUpperCase();

const formatDateTime = (dateStr: string | undefined | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
    });
};

const formatYearLabel = (year: number) => {
    const s: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
    return `${year}${s[year] || "th"} Year`;
};

// ========================
// SUB-COMPONENTS
// ========================

const StatCard = ({ icon, value, label, color }: {
    icon: React.ReactNode; value: string | number; label: string;
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
            <div className="h-11 w-11 rounded-lg bg-white/80 dark:bg-gray-800/80 flex items-center justify-center flex-shrink-0 shadow-sm">{icon}</div>
            <div>
                <p className={`text-2xl font-bold ${numColors[color]}`}>{value}</p>
                <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
        </div>
    );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-3">
        <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">{icon}</div>
        <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{value}</div>
        </div>
    </div>
);

const DetailSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2 flex-1">
                        <div className="h-6 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="flex gap-2">
                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                ))}
            </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        <div className="space-y-1.5"><div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" /><div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

export default function StudentDetail() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const shouldReduce = useReducedMotion();
    const queryClient = useQueryClient();
    const isReviewMode = searchParams.get("review") === "true";
    const { student, loading, error, refresh } = useStudentDetail(studentId || "");

    const [activeTab, setActiveTab] = useState<typeof TAB_KEYS[number]>(isReviewMode ? "profile" : "overview");

    // Status change modal
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState("");

    // Approve modal
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approveAction, setApproveAction] = useState(true);
    const [revokeReason, setRevokeReason] = useState("");

    // Review mode: full profile data + verification hooks
    const { profileData, isLoading: reviewLoading, refetch: refetchProfile } = useStudentReviewProfile(
        studentId || "",
        activeTab === "profile",
    );
    const expVerify = useVerifyItem("experiences");
    const achVerify = useVerifyItem("achievements");
    const certVerify = useVerifyItem("certificates");
    const profileApproval = useApproveStudentProfile(studentId || "");

    // Reject modal for review mode
    const [reviewRejectOpen, setReviewRejectOpen] = useState(false);
    const [reviewRejectTarget, setReviewRejectTarget] = useState<{
        category: "experiences" | "achievements" | "certificates" | "profile";
        id: string;
    } | null>(null);
    const [reviewRejectReason, setReviewRejectReason] = useState("");

    const handleOpenStatusModal = useCallback(() => {
        if (student) { setNewStatus(student.student_status); setShowStatusModal(true); }
    }, [student]);

    // Status toggle mutation
    const statusMutation = useMutation({
        mutationFn: ({ sid, status }: { sid: string; status: string }) =>
            CollegeAdminService.updateStudentStatus(sid, status),
        onSuccess: (response) => {
            const msg = (response as { message?: string })?.message || `Status changed to ${newStatus}`;
            showToast({ type: "success", title: "Status Updated", description: msg });
            refresh();
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all() });
            setShowStatusModal(false);
        },
        onError: (err: unknown) => {
            const msg = err instanceof ApiError ? err.message : "Failed to update status";
            showToast({ type: "error", title: "Error", description: msg });
        },
    });

    const handleStatusSubmit = useCallback(() => {
        if (!student || !newStatus || newStatus === student.student_status) return;
        statusMutation.mutate({ sid: student.student_id, status: newStatus });
    }, [student, newStatus, statusMutation]);

    const handleApproveSubmit = useCallback(() => {
        if (!student) return;
        if (approveAction) {
            profileApproval.approve();
        } else {
            profileApproval.reject(revokeReason);
        }
        setShowApproveModal(false);
        setRevokeReason("");
    }, [student, approveAction, revokeReason, profileApproval]);

    const breadcrumbs = useMemo(() => {
        const crumbs = [
            { label: "Dashboard", path: "/college/dashboard" },
        ];
        if (isReviewMode) {
            crumbs.push({ label: "Verification Center", path: "/college/verifications" });
        }
        crumbs.push(
            { label: "Students", path: "/college/students" },
            { label: student ? `${student.first_name} ${student.last_name}` : "Student Detail", active: true } as never,
        );
        return crumbs;
    }, [student, isReviewMode]);

    const statusBadge = STATUS_MAP[student?.student_status || ""] || STATUS_MAP.active;
    const fullName = student ? [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ") : "";

    // Loading
    if (loading) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Student Details" breadcrumbs={breadcrumbs} />
                    <DetailSkeleton />
                </div>
            </AnimatedPage>
        );
    }

    // Error
    if (error || !student) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Student Details" breadcrumbs={breadcrumbs} />
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">{error || "Student not found"}</p>
                        <button type="button" onClick={() => navigate("/college/students")} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Return to Students</button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Student Details" breadcrumbs={breadcrumbs} />

                {/* Hero Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Hero Header */}
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-5">
                                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getAvatarGradient(student.first_name)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                                    {getInitials(student.first_name, student.last_name)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{fullName}</h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge.bg}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                                            {statusBadge.label}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${student.profile_complete ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"}`}>
                                            {student.profile_complete ? "Profile Complete" : "Profile Incomplete"}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${student.profile_is_approved ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"}`}>
                                            {student.profile_is_approved ? "Approved" : "Pending Approval"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap items-center gap-3">
                                <button type="button" onClick={() => navigate(`/college/student/${student.student_id}/edit`)} className="inline-flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </button>
                                <button type="button" onClick={handleOpenStatusModal} className="inline-flex items-center gap-2 px-5 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-500 transition shadow-sm">
                                    <Power className="h-4 w-4" />
                                    Change Status
                                </button>
                                {student.profile_complete && !student.profile_is_approved && (
                                    <button type="button" onClick={() => { setApproveAction(true); setShowApproveModal(true); }} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-sm">
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                    </button>
                                )}
                                {student.profile_is_approved && (
                                    <button type="button" onClick={() => { setApproveAction(false); setShowApproveModal(true); }} className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition shadow-sm">
                                        <XCircle className="h-4 w-4" />
                                        Revoke
                                    </button>
                                )}
                                {!student.profile_complete && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                                        Profile must be complete before approval
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={<Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />} value={student.dept_name || "—"} label="Department" color="blue" />
                        <StatCard icon={<GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />} value={student.current_year ? formatYearLabel(student.current_year) : "—"} label="Current Year" color="purple" />
                        <StatCard icon={<Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />} value={String(student.student_passout_year)} label="Passout Year" color="cyan" />
                        <StatCard icon={<Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />} value={student.profile_is_approved ? "Yes" : "No"} label="Approved" color="orange" />
                    </div>
                </div>

                {/* Tab Navigation */}
                <LayoutGroup>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="flex border-b border-gray-100 dark:border-gray-800 px-8">
                            {TAB_KEYS.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative px-5 py-3.5 text-sm font-medium transition-colors ${activeTab === tab ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
                                >
                                    {tab === "overview" ? "Overview" : tab === "details" ? "Details" : tab === "profile" ? "Full Profile" : "Restrictions"}
                                    {activeTab === tab && (
                                        shouldReduce ? (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                        ) : (
                                            <motion.span
                                                layoutId="student-tab-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                            />
                                        )
                                    )}
                                </button>
                            ))}
                        </div>

                        <AnimatedTabContent activeTab={activeTab} tabKeys={TAB_KEYS}>
                            {activeTab === "overview" && (
                                <div className="p-8">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">Account Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                                        <InfoRow icon={<Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Email Address" value={student.student_email} />
                                        <InfoRow icon={<Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Department" value={student.dept_name || "—"} />
                                        <InfoRow icon={<GraduationCap className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Current Year" value={student.current_year ? formatYearLabel(student.current_year) : "—"} />
                                        <InfoRow icon={<User className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Passout Year" value={String(student.student_passout_year)} />
                                    </div>
                                </div>
                            )}
                            {activeTab === "details" && (
                                <div className="p-8">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">System Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                                        <InfoRow icon={<Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Student ID" value={<code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-600 dark:text-gray-400">{student.student_id}</code>} />
                                        <InfoRow icon={<Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Department ID" value={<code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-600 dark:text-gray-400">{student.dept_id}</code>} />
                                        <InfoRow icon={<Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Created At" value={formatDateTime(student.created_at)} />
                                        <InfoRow icon={<Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Last Updated" value={formatDateTime(student.updated_at)} />
                                        <InfoRow icon={<BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Profile Status" value={student.profile_complete ? "Complete" : "Incomplete"} />
                                        <InfoRow icon={<Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />} label="Approval Status" value={student.profile_is_approved ? "Approved" : "Pending"} />
                                    </div>
                                </div>
                            )}
                            {activeTab === "profile" && (
                                <div className="p-8">
                                    {reviewLoading ? (
                                        <div className="space-y-4 animate-pulse">
                                            {Array.from({ length: 4 }).map((_, i) => (
                                                <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800" />
                                            ))}
                                        </div>
                                    ) : profileData ? (
                                        <div className="space-y-8">
                                            {/* Verification Summary Banner */}
                                            {profileData.verification_summary && (
                                                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        Verification Summary
                                                    </h4>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {(["experience", "achievements", "certificates"] as const).map((key) => {
                                                            const summary = profileData.verification_summary[key];
                                                            return (
                                                                <div key={key} className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize mb-1">{key}</p>
                                                                    <div className="flex items-center gap-3">
                                                                        {summary.pending > 0 && (
                                                                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                                                {summary.pending} pending
                                                                            </span>
                                                                        )}
                                                                        {summary.rejected > 0 && (
                                                                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                                                                {summary.rejected} rejected
                                                                            </span>
                                                                        )}
                                                                        {summary.pending === 0 && summary.rejected === 0 && (
                                                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                                                All verified
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Profile-level approve/reject */}
                                                    {profileData.student.profile_approval_status === "pending" && profileData.student.profile_complete && (
                                                        <div className="mt-4 flex items-center gap-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                                                                Approving the profile will auto-approve all pending items.
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={profileApproval.approve}
                                                                disabled={profileApproval.isApproving}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                                                            >
                                                                {profileApproval.isApproving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                                Approve Profile
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setReviewRejectTarget({ category: "profile", id: studentId || "" });
                                                                    setReviewRejectOpen(true);
                                                                }}
                                                                disabled={profileApproval.isRejecting}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                                                            >
                                                                Reject Profile
                                                            </button>
                                                        </div>
                                                    )}

                                                    {profileData.student.profile_approval_status === "rejected" && profileData.student.profile_rejection_reason && (
                                                        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800">
                                                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-0.5">Profile Rejected</p>
                                                            <p className="text-xs text-red-500 dark:text-red-400">{profileData.student.profile_rejection_reason}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Verification Items with Status Badges */}
                                            {isReviewMode && profileData.experience.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Experience</h4>
                                                    <div className="space-y-3">
                                                        {profileData.experience.map((exp) => {
                                                            const status = (exp as Record<string, unknown>).verification_status as string;
                                                            const config = VERIFICATION_STATUS_CONFIG[status] || VERIFICATION_STATUS_CONFIG.pending;
                                                            const expId = exp.experience_id as string;
                                                            return (
                                                                <div key={expId} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{exp.position_title as string}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{exp.company_name as string}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.bg}`}>
                                                                                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                                                                {config.label}
                                                                            </span>
                                                                            {status === "pending" && (
                                                                                <div className="flex gap-1">
                                                                                    <button type="button" onClick={() => expVerify.approve(expId)} disabled={expVerify.processingId === expId} className="h-6 w-6 rounded bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Approve">
                                                                                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                                                    </button>
                                                                                    <button type="button" onClick={() => { setReviewRejectTarget({ category: "experiences", id: expId }); setReviewRejectOpen(true); }} className="h-6 w-6 rounded bg-red-50 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Reject">
                                                                                        <XCircle className="h-3 w-3 text-red-600" />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {status === "rejected" && Boolean((exp as Record<string, unknown>).rejection_reason) && (
                                                                        <p className="mt-2 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded px-2 py-1">
                                                                            Reason: {String((exp as Record<string, unknown>).rejection_reason)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {isReviewMode && profileData.achievements.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Achievements</h4>
                                                    <div className="space-y-3">
                                                        {profileData.achievements.map((ach) => {
                                                            const status = (ach as Record<string, unknown>).verification_status as string;
                                                            const config = VERIFICATION_STATUS_CONFIG[status] || VERIFICATION_STATUS_CONFIG.pending;
                                                            const achId = ach.achievement_id as string;
                                                            return (
                                                                <div key={achId} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{ach.achievement_title as string}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{ach.achievement_type as string} • {ach.achievement_level as string}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.bg}`}>
                                                                                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                                                                {config.label}
                                                                            </span>
                                                                            {status === "pending" && (
                                                                                <div className="flex gap-1">
                                                                                    <button type="button" onClick={() => achVerify.approve(achId)} disabled={achVerify.processingId === achId} className="h-6 w-6 rounded bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Approve">
                                                                                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                                                    </button>
                                                                                    <button type="button" onClick={() => { setReviewRejectTarget({ category: "achievements", id: achId }); setReviewRejectOpen(true); }} className="h-6 w-6 rounded bg-red-50 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Reject">
                                                                                        <XCircle className="h-3 w-3 text-red-600" />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {status === "rejected" && Boolean((ach as Record<string, unknown>).rejection_reason) && (
                                                                        <p className="mt-2 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded px-2 py-1">
                                                                            Reason: {String((ach as Record<string, unknown>).rejection_reason)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {isReviewMode && profileData.certificates.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Certificates</h4>
                                                    <div className="space-y-3">
                                                        {profileData.certificates.map((cert) => {
                                                            const status = (cert as Record<string, unknown>).verification_status as string;
                                                            const config = VERIFICATION_STATUS_CONFIG[status] || VERIFICATION_STATUS_CONFIG.pending;
                                                            const certId = cert.certificate_id as string;
                                                            return (
                                                                <div key={certId} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{cert.certificate_name as string}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{cert.issuing_organization as string}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.bg}`}>
                                                                                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                                                                {config.label}
                                                                            </span>
                                                                            {status === "pending" && (
                                                                                <div className="flex gap-1">
                                                                                    <button type="button" onClick={() => certVerify.approve(certId)} disabled={certVerify.processingId === certId} className="h-6 w-6 rounded bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Approve">
                                                                                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                                                    </button>
                                                                                    <button type="button" onClick={() => { setReviewRejectTarget({ category: "certificates", id: certId }); setReviewRejectOpen(true); }} className="h-6 w-6 rounded bg-red-50 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Reject">
                                                                                        <XCircle className="h-3 w-3 text-red-600" />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {status === "rejected" && Boolean((cert as Record<string, unknown>).rejection_reason) && (
                                                                        <p className="mt-2 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded px-2 py-1">
                                                                            Reason: {String((cert as Record<string, unknown>).rejection_reason)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Also show read-only profile sections when not in review mode */}
                                            {!isReviewMode && (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="space-y-6">
                                                        <AboutSection profileLinks={profileData.profile_links as never} />
                                                        <ProjectsSection projects={{ total_projects: profileData.projects.length, max_projects: 10, projects: profileData.projects as never[] }} />
                                                        <SkillsSection mySkills={profileData.skills as never[]} />
                                                        <ActivitiesSection activities={{ total_activities: profileData.activities.length, max_activities: 10, activities: profileData.activities as never[] }} />
                                                    </div>
                                                    <div className="space-y-6">
                                                        <ExperienceSection experiences={{ total_experience: profileData.experience.length, max_experience: 10, experience: profileData.experience as never[] }} />
                                                        <CertificatesSection certificates={{ total_certificates: profileData.certificates.length, max_certificates: 15, certificates: profileData.certificates as never[] }} />
                                                        <AchievementsSection achievements={{ total_achievements: profileData.achievements.length, max_achievements: 10, achievements: profileData.achievements as never[] }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Unable to load profile data</p>
                                            <button
                                                type="button"
                                                onClick={() => refetchProfile()}
                                                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === "restrictions" && (
                                <div className="p-8">
                                    <StudentRestrictionsTab
                                        studentId={studentId || ""}
                                        studentName={fullName}
                                    />
                                </div>
                            )}
                        </AnimatedTabContent>
                    </div>
                </LayoutGroup>
            </div>

            {/* Status Change Modal */}
            <ModalWrapper
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                disabled={statusMutation.isPending}
                title="Change Student Status"
                titleIcon={<Power className="h-5 w-5 text-gray-500" />}
            >
                <div className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Currently: <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{student.student_status}</span>
                    </p>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-1.5">New Status</label>
                    <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={statusMutation.isPending}
                        aria-label="Select new student status"
                        className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                    >
                        {ALL_STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                    </select>
                    {(newStatus === "suspended" || newStatus === "dropout" || newStatus === "inactive") && newStatus !== student.student_status && (
                        <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-700 dark:text-amber-300">This will block the student from logging in.</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setShowStatusModal(false)} disabled={statusMutation.isPending} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40">Cancel</button>
                    <button type="button" onClick={handleStatusSubmit} disabled={statusMutation.isPending || newStatus === student.student_status} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
                        {statusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {statusMutation.isPending ? "Updating..." : "Update Status"}
                    </button>
                </div>
            </ModalWrapper>

            {/* Approve/Reject Modal */}
            <ModalWrapper
                isOpen={showApproveModal}
                onClose={() => { setShowApproveModal(false); setRevokeReason(""); }}
                disabled={profileApproval.isApproving || profileApproval.isRejecting}
                title={approveAction ? "Approve Profile" : "Revoke Approval"}
                titleIcon={approveAction ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            >
                <div className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to <span className="font-semibold text-gray-900 dark:text-gray-100">{approveAction ? "approve" : "revoke approval for"}</span>{" "}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{fullName}</span>'s profile?
                    </p>
                    {approveAction ? (
                        <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">This will make them visible in placement eligibility checks.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-700 dark:text-red-300">They will no longer be eligible for placements.</p>
                                </div>
                            </div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-1.5">
                                Reason for Revoking <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                maxLength={500}
                                rows={3}
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                                placeholder="Explain why this profile approval is being revoked…"
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                            <p className="mt-1 text-xs text-gray-400 text-right">{revokeReason.length}/500</p>
                        </>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => { setShowApproveModal(false); setRevokeReason(""); }} disabled={profileApproval.isApproving || profileApproval.isRejecting} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40">Cancel</button>
                    <button type="button" onClick={handleApproveSubmit} disabled={profileApproval.isApproving || profileApproval.isRejecting || (!approveAction && revokeReason.trim().length < 3)} className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${approveAction ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
                        {(profileApproval.isApproving || profileApproval.isRejecting) && <Loader2 className="h-4 w-4 animate-spin" />}
                        {(profileApproval.isApproving || profileApproval.isRejecting) ? "Processing..." : approveAction ? "Approve" : "Revoke"}
                    </button>
                </div>
            </ModalWrapper>

            {/* Review Mode Reject Modal */}
            <ModalWrapper
                isOpen={reviewRejectOpen}
                onClose={() => { setReviewRejectOpen(false); setReviewRejectTarget(null); setReviewRejectReason(""); }}
                title="Reject Item"
                titleIcon={<AlertTriangle className="h-5 w-5 text-red-500" />}
            >
                <div className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Send this item back to the student for corrections.
                    </p>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={3}
                        maxLength={500}
                        value={reviewRejectReason}
                        onChange={(e) => setReviewRejectReason(e.target.value)}
                        placeholder="Explain what needs to be corrected..."
                        className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 resize-none"
                    />
                    <p className="text-[11px] text-gray-400 text-right mt-1">{reviewRejectReason.length}/500</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => { setReviewRejectOpen(false); setReviewRejectTarget(null); setReviewRejectReason(""); }} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">Cancel</button>
                    <button
                        type="button"
                        disabled={reviewRejectReason.trim().length < 3}
                        onClick={() => {
                            if (!reviewRejectTarget) return;
                            if (reviewRejectTarget.category === "profile") {
                                profileApproval.reject(reviewRejectReason);
                            } else if (reviewRejectTarget.category === "experiences") {
                                expVerify.reject(reviewRejectTarget.id, reviewRejectReason);
                            } else if (reviewRejectTarget.category === "achievements") {
                                achVerify.reject(reviewRejectTarget.id, reviewRejectReason);
                            } else if (reviewRejectTarget.category === "certificates") {
                                certVerify.reject(reviewRejectTarget.id, reviewRejectReason);
                            }
                            setReviewRejectOpen(false);
                            setReviewRejectTarget(null);
                            setReviewRejectReason("");
                        }}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                    >
                        Send Back for Corrections
                    </button>
                </div>
            </ModalWrapper>
        </AnimatedPage>
    );
}
