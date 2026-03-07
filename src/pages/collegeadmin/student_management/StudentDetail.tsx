import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Mail, Building2, Calendar, Clock, GraduationCap,
    CheckCircle, XCircle, Power, Pencil, X, User, Hash,
} from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useStudentDetail } from "@/hooks/collegeadmin/student_management/useStudentDetail";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// CONSTANTS
// ========================

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    active: { label: "Active", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    inactive: { label: "Inactive", bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
    suspended: { label: "Suspended", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
    graduated: { label: "Graduated", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    dropout: { label: "Dropout", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const ALL_STATUSES = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
    { value: "graduated", label: "Graduated" },
    { value: "dropout", label: "Dropout" },
];

function formatDateTime(dateStr: string): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function formatYearLabel(year: number): string {
    const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
    return `${year}${suffixes[year] || "th"} Year`;
}

// ========================
// INFO ROW
// ========================

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
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
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-5 w-40 bg-gray-100 rounded" />
                </div>
            ))}
        </div>
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

export default function StudentDetail() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const { student, loading, error, refresh } = useStudentDetail(studentId || "");

    // Status change modal state
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Approve modal state
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approveAction, setApproveAction] = useState<boolean>(true);
    const [approvingProfile, setApprovingProfile] = useState(false);

    const handleOpenStatusModal = useCallback(() => {
        if (student) {
            setNewStatus(student.student_status);
            setShowStatusModal(true);
        }
    }, [student]);

    const handleStatusSubmit = useCallback(async () => {
        if (!student || !newStatus || newStatus === student.student_status) return;
        setUpdatingStatus(true);
        try {
            const response = await CollegeAdminService.updateStudentStatus(student.student_id, newStatus);
            showToast({
                type: "success",
                title: "Status Updated",
                description: response?.message || `Student status changed to ${newStatus}`,
            });
            refresh();
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Error",
                description: err?.response?.data?.error || err?.message || "Failed to update status",
            });
        } finally {
            setUpdatingStatus(false);
            setShowStatusModal(false);
        }
    }, [student, newStatus, refresh]);

    const handleApproveSubmit = useCallback(async () => {
        if (!student) return;
        setApprovingProfile(true);
        try {
            const response = await CollegeAdminService.approveStudentProfile(student.student_id, approveAction);
            showToast({
                type: "success",
                title: approveAction ? "Profile Approved" : "Approval Revoked",
                description: response?.message || `Profile ${approveAction ? "approved" : "rejected"} successfully`,
            });
            refresh();
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Error",
                description: err?.response?.data?.error || err?.message || "Failed to update profile approval",
            });
        } finally {
            setApprovingProfile(false);
            setShowApproveModal(false);
        }
    }, [student, approveAction, refresh]);

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Students", path: "/college/students" },
        { label: student ? `${student.first_name} ${student.last_name}` : "Student Detail", active: true },
    ], [student]);

    const statusBadge = STATUS_MAP[student?.student_status || ""] || STATUS_MAP.active;
    const fullName = student
        ? [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ")
        : "";
    const initials = student
        ? (student.first_name[0] + (student.last_name[0] || "")).toUpperCase()
        : "?";

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader title="Student Details" breadcrumbs={breadcrumbs} />

                {/* Back button */}
                <button
                    type="button"
                    onClick={() => navigate("/college/students")}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium transition"
                >
                    <ArrowLeft size={16} />
                    Back to Students
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
                            onClick={() => navigate("/college/students")}
                            className="mt-4 text-sm text-blue-600 hover:underline"
                        >
                            Return to Students List
                        </button>
                    </div>
                ) : student ? (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        {/* Header */}
                        <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                        {initials}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                                                {statusBadge.label}
                                            </span>
                                            {student.profile_complete ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    Profile Complete
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                                    Profile Incomplete
                                                </span>
                                            )}
                                            {student.profile_is_approved ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    ✅ Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                    Pending Approval
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/college/student/${student.student_id}/edit`)}
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleOpenStatusModal}
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                                    >
                                        <Power size={16} />
                                        Change Status
                                    </button>

                                    {/* Approve/Reject button */}
                                    {student.profile_complete && !student.profile_is_approved && (
                                        <button
                                            type="button"
                                            onClick={() => { setApproveAction(true); setShowApproveModal(true); }}
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                                        >
                                            <CheckCircle size={16} />
                                            Approve Profile
                                        </button>
                                    )}
                                    {student.profile_is_approved && (
                                        <button
                                            type="button"
                                            onClick={() => { setApproveAction(false); setShowApproveModal(true); }}
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                                        >
                                            <XCircle size={16} />
                                            Revoke Approval
                                        </button>
                                    )}
                                    {!student.profile_complete && (
                                        <span className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                            ⚠️ Profile must be complete before approval
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                                <InfoRow
                                    icon={<Mail size={16} className="text-gray-500" />}
                                    label="Email Address"
                                    value={student.student_email}
                                />
                                <InfoRow
                                    icon={<Building2 size={16} className="text-gray-500" />}
                                    label="Department"
                                    value={student.dept_name || "—"}
                                />
                                <InfoRow
                                    icon={<GraduationCap size={16} className="text-gray-500" />}
                                    label="Current Year"
                                    value={student.current_year ? formatYearLabel(student.current_year) : "—"}
                                />
                                <InfoRow
                                    icon={<User size={16} className="text-gray-500" />}
                                    label="Passout Year"
                                    value={String(student.student_passout_year)}
                                />
                                <InfoRow
                                    icon={<Hash size={16} className="text-gray-500" />}
                                    label="Student ID"
                                    value={
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            {student.student_id}
                                        </code>
                                    }
                                />
                                <InfoRow
                                    icon={<Calendar size={16} className="text-gray-500" />}
                                    label="Created At"
                                    value={formatDateTime(student.created_at)}
                                />
                                <InfoRow
                                    icon={<Clock size={16} className="text-gray-500" />}
                                    label="Last Updated"
                                    value={formatDateTime(student.updated_at)}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ===== Status Change Modal ===== */}
            {showStatusModal && student && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => !updatingStatus && setShowStatusModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Change Student Status</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{fullName}</p>
                            </div>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                disabled={updatingStatus}
                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600 mb-1">
                                Current status:{" "}
                                <span className="font-semibold capitalize">{student.student_status}</span>
                            </p>
                            <label className="block text-sm font-semibold text-gray-700 mt-4 mb-1.5">
                                New Status
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                disabled={updatingStatus}
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors disabled:opacity-50"
                            >
                                {ALL_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            {(newStatus === "suspended" || newStatus === "dropout" || newStatus === "inactive") && newStatus !== student.student_status && (
                                <p className="text-xs text-amber-600 mt-3 bg-amber-50 px-3 py-2 rounded-lg">
                                    ⚠️ This will block the student from logging in.
                                </p>
                            )}
                        </div>

                        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                disabled={updatingStatus}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusSubmit}
                                disabled={updatingStatus || newStatus === student.student_status}
                                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {updatingStatus && (
                                    <div className="h-4 w-4 border-2 border-blue-200 border-t-white rounded-full animate-spin" />
                                )}
                                {updatingStatus ? "Updating..." : "Update Status"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Approve/Reject Modal ===== */}
            {showApproveModal && student && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => !approvingProfile && setShowApproveModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">
                                {approveAction ? "Approve Profile" : "Revoke Approval"}
                            </h2>
                            <button
                                onClick={() => setShowApproveModal(false)}
                                disabled={approvingProfile}
                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-5">
                            {approveAction ? (
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to <span className="font-bold">approve</span>{" "}
                                    <span className="font-bold">{fullName}</span>'s profile?
                                    This will make them visible in placement eligibility checks.
                                </p>
                            ) : (
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to <span className="font-bold">revoke approval</span> for{" "}
                                    <span className="font-bold">{fullName}</span>?
                                    They will no longer be eligible for placements.
                                </p>
                            )}
                        </div>

                        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                disabled={approvingProfile}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApproveSubmit}
                                disabled={approvingProfile}
                                className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${approveAction
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {approvingProfile && (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                )}
                                {approvingProfile
                                    ? "Processing..."
                                    : approveAction
                                        ? "Approve"
                                        : "Revoke Approval"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
