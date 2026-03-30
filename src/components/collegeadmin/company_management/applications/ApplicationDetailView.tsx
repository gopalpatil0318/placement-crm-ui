import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Mail,
    Hash,
    GraduationCap,
    FileText,
    ListOrdered,
    Settings2,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    Ban,
    CircleDot,
    CheckSquare,
    MessageSquare,
    Type,
    AlignLeft,
    ToggleRight,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import {
    useViewApplication,
    type ApplicationDetail,
    type ApplicationAnswer,
    type ApplicationRoundResult,
    type AcademicInfo,
} from "@/hooks/collegeadmin/company_management/applications/useViewApplication";
import { useUpdateApplicationStatus } from "@/hooks/collegeadmin/company_management/applications/useUpdateApplicationStatus";
import {
    APPLICATION_STATUS_COLORS,
    APPLICATION_STATUS_LABELS,
    VALID_TRANSITIONS,
} from "@/validators/ApplicationSchema";

// ========================
// TYPES
// ========================

interface ApplicationDetailViewProps {
    applicationId: string;
    jobId: string;
    onApplicationLoaded?: (studentName: string, jobTitle: string) => void;
}

type DetailTab = "answers" | "rounds" | "actions";

// ========================
// CONSTANTS
// ========================

const TABS: { key: DetailTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "answers", label: "Answers", icon: FileText },
    { key: "rounds", label: "Round Results", icon: ListOrdered },
    { key: "actions", label: "Status Actions", icon: Settings2 },
];

const RESULT_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    pending:  { bg: "bg-amber-50 dark:bg-amber-900/20",   text: "text-amber-700 dark:text-amber-400",   dot: "bg-amber-500" },
    passed:   { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    failed:   { bg: "bg-red-50 dark:bg-red-900/20",     text: "text-red-600 dark:text-red-400",     dot: "bg-red-400" },
    on_hold:  { bg: "bg-cyan-50 dark:bg-cyan-900/20",    text: "text-cyan-700 dark:text-cyan-400",    dot: "bg-cyan-500" },
    absent:   { bg: "bg-gray-100 dark:bg-gray-800",   text: "text-gray-600 dark:text-gray-400",    dot: "bg-gray-400" },
};

const RESULT_STATUS_LABELS: Record<string, string> = {
    pending: "Pending", passed: "Passed", failed: "Failed",
    on_hold: "On Hold", absent: "Absent",
};

const QUESTION_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    text: Type,
    essay: AlignLeft,
    yes_no: ToggleRight,
    mcq_single: CircleDot,
    mcq_multiple: CheckSquare,
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
    text: "Short Answer",
    essay: "Essay",
    yes_no: "Yes / No",
    mcq_single: "Single Choice",
    mcq_multiple: "Multiple Choice",
};

const AVATAR_COLORS = [
    { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400" },
    { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
    { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-400" },
    { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400" },
];

const STATUS_ACTION_CONFIG: Record<string, {
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    btnBg: string;
    boxBg: string;
    boxBorder: string;
    boxText: string;
    confirmBg: string;
    consequences: string[];
}> = {
    under_review: {
        icon: Clock, iconBg: "bg-cyan-50 dark:bg-cyan-900/20", iconColor: "text-cyan-600 dark:text-cyan-400",
        btnBg: "bg-cyan-600 hover:bg-cyan-700",
        boxBg: "bg-cyan-50 dark:bg-cyan-900/20", boxBorder: "border-cyan-100 dark:border-cyan-800", boxText: "text-cyan-700 dark:text-cyan-300",
        confirmBg: "bg-cyan-600 hover:bg-cyan-700",
        consequences: [
            "Application moves to review queue",
            "Student will be notified",
            "You can shortlist or reject after review",
        ],
    },
    shortlisted: {
        icon: CheckCircle2, iconBg: "bg-blue-50 dark:bg-blue-900/20", iconColor: "text-blue-600 dark:text-blue-400",
        btnBg: "bg-blue-600 hover:bg-blue-700",
        boxBg: "bg-blue-50 dark:bg-blue-900/20", boxBorder: "border-blue-100 dark:border-blue-800", boxText: "text-blue-700 dark:text-blue-300",
        confirmBg: "bg-blue-600 hover:bg-blue-700",
        consequences: [
            "Student will be marked as shortlisted",
            "Eligible for selection rounds",
            "You can select or reject later",
        ],
    },
    selected: {
        icon: CheckCircle2, iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconColor: "text-emerald-600 dark:text-emerald-400",
        btnBg: "bg-emerald-600 hover:bg-emerald-700",
        boxBg: "bg-emerald-50 dark:bg-emerald-900/20", boxBorder: "border-emerald-100 dark:border-emerald-800", boxText: "text-emerald-700 dark:text-emerald-300",
        confirmBg: "bg-emerald-600 hover:bg-emerald-700",
        consequences: [
            "Student is selected for the position",
            "Placement record can be created next",
            "Student will be notified of selection",
        ],
    },
    offered: {
        icon: FileText, iconBg: "bg-purple-50 dark:bg-purple-900/20", iconColor: "text-purple-600 dark:text-purple-400",
        btnBg: "bg-purple-600 hover:bg-purple-700",
        boxBg: "bg-purple-50 dark:bg-purple-900/20", boxBorder: "border-purple-100 dark:border-purple-800", boxText: "text-purple-700 dark:text-purple-300",
        confirmBg: "bg-purple-600 hover:bg-purple-700",
        consequences: [
            "An offer is being extended",
            "Create a placement record for details",
            "Student will be notified about the offer",
        ],
    },
    rejected: {
        icon: XCircle, iconBg: "bg-red-50 dark:bg-red-900/20", iconColor: "text-red-600 dark:text-red-400",
        btnBg: "bg-red-600 hover:bg-red-700",
        boxBg: "bg-amber-50 dark:bg-amber-900/20", boxBorder: "border-amber-100 dark:border-amber-800", boxText: "text-amber-700 dark:text-amber-300",
        confirmBg: "bg-red-600 hover:bg-red-700",
        consequences: [
            "Application will be permanently rejected",
            "Student will be notified of the decision",
            "This action cannot be undone",
        ],
    },
};

// ========================
// STATUS BADGE
// ========================

const StatusBadge = ({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) => {
    const colors = APPLICATION_STATUS_COLORS[status] || APPLICATION_STATUS_COLORS.pending;
    const label = APPLICATION_STATUS_LABELS[status] || status;
    const sizeClass = size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {label}
        </span>
    );
};

// ========================
// ACADEMIC INFO CARD
// ========================

const AcademicInfoCard = ({ info }: { info: AcademicInfo | null }) => {
    if (!info) {
        return (
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-5 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">Academic information not available</p>
            </div>
        );
    }

    const cgpaColor = (val: number | null) => {
        if (val === null) return "text-gray-400 dark:text-gray-500";
        if (val >= 8) return "text-emerald-600 dark:text-emerald-400";
        if (val >= 6) return "text-amber-600 dark:text-amber-400";
        return "text-red-600 dark:text-red-400";
    };

    const ktColor = (val: number | null) => {
        if (val === null) return "text-gray-400 dark:text-gray-500";
        if (val === 0) return "text-emerald-600 dark:text-emerald-400";
        return "text-red-600 dark:text-red-400";
    };

    const percentColor = (val: number | null) => {
        if (val === null) return "text-gray-400 dark:text-gray-500";
        if (val >= 80) return "text-emerald-600 dark:text-emerald-400";
        if (val >= 60) return "text-amber-600 dark:text-amber-400";
        return "text-red-600 dark:text-red-400";
    };

    const stats = [
        { label: "CGPA", value: info.overall_cgpa === null ? "—" : String(info.overall_cgpa), color: cgpaColor(info.overall_cgpa) },
        { label: "Live KTs", value: info.live_kts === null ? "—" : String(info.live_kts), color: ktColor(info.live_kts) },
        { label: "10th %", value: info.tenth_percentage === null ? "—" : `${info.tenth_percentage}%`, color: percentColor(info.tenth_percentage) },
        { label: "12th / Diploma %", value: info.twelfth_percentage === null ? "—" : `${info.twelfth_percentage}%`, color: percentColor(info.twelfth_percentage) },
    ];

    return (
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Academic Information</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white dark:bg-gray-900 p-4 text-center">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ========================
// ANSWERS TAB
// ========================

const AnswersTab = ({ answers }: { answers: ApplicationAnswer[] }) => {
    if (answers.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No application questions were asked for this job.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {answers.map((answer, idx) => {
                const TypeIcon = QUESTION_TYPE_ICONS[answer.question_type] || Type;
                const typeLabel = QUESTION_TYPE_LABELS[answer.question_type] || answer.question_type;

                return (
                    <div key={answer.answer_id || answer.question_id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-sm transition-shadow">
                        <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                                    {idx + 1}
                                </span>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{answer.question_text}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
                                <TypeIcon className="h-3 w-3" />
                                {typeLabel}
                            </span>
                        </div>
                        <div className="px-5 py-3">
                            {(() => {
                                const isMCQ = (answer.question_type === "mcq_single" || answer.question_type === "mcq_multiple") && Array.isArray(answer.selected_options) && answer.selected_options.length > 0;
                                if (isMCQ) {
                                    const MCQIcon = answer.question_type === "mcq_single" ? CircleDot : CheckSquare;
                                    return (
                                        <div className="flex flex-wrap gap-2">
                                            {answer.selected_options!.map((opt) => (
                                                <span key={opt} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-400 font-medium">
                                                    <MCQIcon className="h-3.5 w-3.5" />
                                                    {opt}
                                                </span>
                                            ))}
                                        </div>
                                    );
                                }
                                if (answer.answer_text) {
                                    return <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{answer.answer_text}</p>;
                                }
                                return <p className="text-sm text-gray-300 dark:text-gray-600 italic">Not answered</p>;
                            })()}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ========================
// ROUND RESULTS TAB
// ========================

const RoundResultsTab = ({ results }: { results: ApplicationRoundResult[] }) => {
    const sorted = useMemo(
        () => [...results].sort((a, b) => a.round_number - b.round_number),
        [results],
    );

    if (results.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <ListOrdered className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No round results recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline connector */}
            {sorted.length > 1 && (
                <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gray-100 dark:bg-gray-800" />
            )}

            <div className="space-y-4">
                {sorted.map((result) => {
                    const statusColors = RESULT_STATUS_COLORS[result.result_status] || RESULT_STATUS_COLORS.pending;
                    const statusLabel = RESULT_STATUS_LABELS[result.result_status] || result.result_status;

                    const TIMELINE_DOT_CLASSES: Record<string, string> = {
                        passed: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
                        failed: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                        absent: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                    };
                    const dotClass = TIMELINE_DOT_CLASSES[result.result_status] || "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";

                    return (
                        <div key={result.result_id || result.round_id} className="relative flex gap-4 items-start">
                            {/* Timeline dot */}
                            <div className={`relative z-10 h-[46px] w-[46px] rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${dotClass}`}>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{result.round_number}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{result.round_name}</h4>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                                        {statusLabel}
                                    </span>
                                </div>
                                {result.remarks && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{result.remarks}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ========================
// STATUS ACTIONS TAB
// ========================

const StatusActionsTab = ({
    application,
    jobId,
    onRefresh,
}: {
    application: ApplicationDetail;
    jobId: string;
    onRefresh: () => void;
}) => {
    const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

    const validTransitions = VALID_TRANSITIONS[application.application_status] || [];

    if (validTransitions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <Ban className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">No further actions available</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    This application is <StatusBadge status={application.application_status} /> — a terminal state.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-5">
                {/* Current status */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-4 flex items-center gap-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current status:</p>
                    <StatusBadge status={application.application_status} size="md" />
                </div>

                {/* Action buttons */}
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Available transitions:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {validTransitions.map((targetStatus) => {
                            const config = STATUS_ACTION_CONFIG[targetStatus];
                            if (!config) return null;
                            const Icon = config.icon;
                            const label = APPLICATION_STATUS_LABELS[targetStatus] || targetStatus;

                            return (
                                <button
                                    key={targetStatus}
                                    type="button"
                                    onClick={() => setConfirmTarget(targetStatus)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold transition shadow-sm hover:shadow-md ${config.btnBg}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    Mark as {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Confirmation modal */}
            {confirmTarget && (
                <StatusActionModal
                    application={application}
                    targetStatus={confirmTarget}
                    jobId={jobId}
                    onClose={() => setConfirmTarget(null)}
                    onSuccess={() => {
                        setConfirmTarget(null);
                        onRefresh();
                    }}
                />
            )}
        </>
    );
};

// ========================
// STATUS ACTION MODAL
// ========================

const StatusActionModal = ({
    application,
    targetStatus,
    jobId,
    onClose,
    onSuccess,
}: {
    application: ApplicationDetail;
    targetStatus: string;
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { remarks, loading, setStatus, setRemarks, handleSubmit, reset } =
        useUpdateApplicationStatus(jobId, onSuccess);

    useEffect(() => {
        setStatus(targetStatus);
    }, [targetStatus, setStatus]);

    const config = STATUS_ACTION_CONFIG[targetStatus];
    const label = APPLICATION_STATUS_LABELS[targetStatus] || targetStatus;

    const handleConfirm = () => {
        handleSubmit(application.application_id);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!config) return null;
    const Icon = config.icon;

    return (
        <ModalWrapper
            isOpen={true}
            onClose={handleClose}
            disabled={loading}
            title={`Mark as ${label}`}
            titleIcon={<Icon className={`h-5 w-5 ${config.iconColor}`} />}
            size="md"
        >
            <div className="space-y-5">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Change <span className="font-semibold text-gray-800 dark:text-gray-100">{application.student_name}</span>&apos;s
                    application from <StatusBadge status={application.application_status} /> to <StatusBadge status={targetStatus} />?
                </p>

                <div className={`rounded-xl border p-4 ${config.boxBg} ${config.boxBorder}`}>
                    <p className={`text-sm font-medium mb-2 ${config.boxText}`}>This action will:</p>
                    <ul className={`text-sm space-y-1 ${config.boxText}`}>
                        {config.consequences.map((c, i) => (
                            <li key={`consequence-${String(i)}`} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <label htmlFor="status-remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Remarks <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                    </label>
                    <textarea
                        id="status-remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add notes about this decision..."
                        rows={3}
                        maxLength={1000}
                        disabled={loading}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">{remarks.length}/1000</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${config.confirmBg}`}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Updating..." : `Mark as ${label}`}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ========================
// SKELETON LOADING
// ========================

const DetailSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Hero skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-48" />
                    <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-64" />
                </div>
                <div className="h-7 bg-gray-50 dark:bg-gray-800 rounded-full w-24" />
            </div>
            <div className="flex gap-3">
                <div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-28" />
                <div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-20" />
                <div className="h-6 bg-gray-50 dark:bg-gray-800 rounded-full w-32" />
            </div>
        </div>
        {/* Academic skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" /></div>
            <div className="grid grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`acad-skel-${String(i)}`} className="bg-white dark:bg-gray-900 p-4 text-center">
                        <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-12 mx-auto mb-2" />
                        <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-16 mx-auto" />
                    </div>
                ))}
            </div>
        </div>
        {/* Tabs skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex gap-6 mb-6">
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                <div className="h-8 bg-gray-50 dark:bg-gray-800 rounded w-28" />
                <div className="h-8 bg-gray-50 dark:bg-gray-800 rounded w-28" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`tab-skel-${String(i)}`} className="h-20 bg-gray-50 dark:bg-gray-800 rounded-xl" />
                ))}
            </div>
        </div>
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

const ApplicationDetailView = ({ applicationId, jobId, onApplicationLoaded }: ApplicationDetailViewProps) => {
    const navigate = useNavigate();
    const { application, loading, error, refresh } = useViewApplication(applicationId);
    const [activeTab, setActiveTab] = useState<DetailTab>("answers");

    // Notify parent of loaded data (for breadcrumb)
    useEffect(() => {
        if (application && onApplicationLoaded) {
            onApplicationLoaded(application.student_name, application.job_title);
        }
    }, [application, onApplicationLoaded]);

    // Loading
    if (loading) return <DetailSkeleton />;

    // Error
    if (error || !application) {
        return (
            <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400 dark:text-red-500" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">Failed to load application</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error || "Application not found"}</p>
                <button
                    type="button"
                    onClick={() => navigate(`/college/job/${jobId}`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Job
                </button>
            </div>
        );
    }

    const app = application;
    const avatarColor = AVATAR_COLORS[((app.student_name || "").codePointAt(0) || 0) % AVATAR_COLORS.length];
    const avatarInitials = (app.student_name || "?")
        .split(" ")
        .filter((w) => w.length > 0)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?";

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5">
                    {/* Back link */}
                    <button
                        type="button"
                        onClick={() => navigate(`/college/job/${jobId}`)}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-4"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Applications
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Student info */}
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className={`h-14 w-14 rounded-2xl ${avatarColor.bg} flex items-center justify-center flex-shrink-0`}>
                                <span className={`text-lg font-bold ${avatarColor.text}`}>
                                    {avatarInitials}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{app.student_name}</h2>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                                    <span className="inline-flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5" /> {app.student_email}
                                    </span>
                                    {app.prn_no && (
                                        <span className="inline-flex items-center gap-1">
                                            <Hash className="h-3.5 w-3.5" /> {app.prn_no}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status badge */}
                        <StatusBadge status={app.application_status} size="md" />
                    </div>

                    {/* Meta badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        {app.dept_name && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                                <GraduationCap className="h-3 w-3" /> {app.dept_name}
                            </span>
                        )}
                        {app.position_name && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                                {app.position_name}
                            </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            app.is_eligible ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        }`}>
                            {app.is_eligible ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {app.is_eligible ? "Eligible" : "Not Eligible"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            Applied {new Date(app.applied_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                    </div>

                    {/* Job context */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{app.job_title}</span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span>{app.company_name}</span>
                    </div>
                </div>
            </div>

            {/* Academic Info */}
            <AcademicInfoCard info={app.academic_info} />

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Tab selector */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto" role="tablist">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;

                        let badge = 0;
                        if (tab.key === "answers") badge = app.answers.length;
                        else if (tab.key === "rounds") badge = app.round_results.length;
                        else badge = (VALID_TRANSITIONS[app.application_status] || []).length;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    isActive
                                        ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                                {badge > 0 && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                        isActive ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                    }`}>
                                        {badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="p-6">
                    {activeTab === "answers" && <AnswersTab answers={app.answers} />}
                    {activeTab === "rounds" && <RoundResultsTab results={app.round_results} />}
                    {activeTab === "actions" && <StatusActionsTab application={app} jobId={jobId} onRefresh={refresh} />}
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailView;
