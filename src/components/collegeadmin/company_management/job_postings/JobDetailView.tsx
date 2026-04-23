import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import TierBadge from "@/components/collegeadmin/TierBadge";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import AnimatedTabContent from "@/components/ui/AnimatedTabContent";
import {
    Pencil,
    FileText,
    Target,
    ShieldCheck,
    ListOrdered,
    HelpCircle,
    MapPin,
    Calendar,
    Briefcase,
    Users,
    AlertTriangle,
    CheckCircle2,
    RotateCcw,
    XCircle,
    Loader2,
    Building2,
    Search,
    UserX,
    Ban,
    ShieldAlert,
    Award,
    History,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useViewJob, type JobDetail } from "@/hooks/collegeadmin/company_management/job_postings/useViewJob";
import { useUpdateJobStatus } from "@/hooks/collegeadmin/company_management/job_postings/useUpdateJobStatus";
import { usePermissions } from "@/hooks/usePermissions";
import PositionManager from "@/components/collegeadmin/company_management/job_positions/PositionManager";
import RoundManager from "@/components/collegeadmin/company_management/job_rounds/RoundManager";
import JobCriteriaManager from "@/components/collegeadmin/company_management/job_eligibility_criteria/JobCriteriaManager";
import QuestionManager from "@/components/collegeadmin/company_management/application_questions/QuestionManager";
import ApplicationManager from "@/components/collegeadmin/company_management/applications/ApplicationManager";
import EligibleNotAppliedManager from "@/components/collegeadmin/company_management/eligible_denials/EligibleNotAppliedManager";
import DenialsManager from "@/components/collegeadmin/company_management/eligible_denials/DenialsManager";
import OverrideManager from "@/components/collegeadmin/company_management/overrides/OverrideManager";
import JobPlacementsTab from "@/components/collegeadmin/company_management/job_postings/JobPlacementsTab";
import { useEligibleStudents } from "@/hooks/collegeadmin/company_management/Job_eligibility_criteria/useEligibleStudents";
import { useAuth } from "@/hooks/collegeadmin/useAuth";
import ModalWrapper from "@/components/ui/ModalWrapper";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { CRITERIA_CONFIG } from "@/constants/criteriaConfig";

// ========================
// STATUS BADGE CONFIG
// ========================

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    draft:     { bg: "bg-gray-100 dark:bg-gray-800",       text: "text-gray-700 dark:text-gray-300",       dot: "bg-gray-500",    label: "Draft" },
    published: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", label: "Published" },
    closed:    { bg: "bg-blue-50 dark:bg-blue-900/20",     text: "text-blue-700 dark:text-blue-400",       dot: "bg-blue-500",    label: "Closed" },
    cancelled: { bg: "bg-red-50 dark:bg-red-900/20",       text: "text-red-600 dark:text-red-400",         dot: "bg-red-400",     label: "Cancelled" },
};

// ========================
// STATUS ACTIONS WITH CONSEQUENCE DETAILS
// ========================

interface StatusAction {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    btnClass: string;
    modalColor: string;
    heading: string;
    consequences: string[];
    reversible: string;
}

const getStatusActions = (status: string): StatusAction[] => {
    switch (status) {
        case "draft":
            return [
                {
                    label: "Publish", value: "published",
                    icon: CheckCircle2,
                    btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
                    modalColor: "emerald",
                    heading: "Publish this job posting?",
                    consequences: [
                        "The job will become visible to eligible students",
                        "Students can start submitting applications",
                        "Application deadline will be enforced",
                    ],
                    reversible: "You can close or cancel the job later",
                },
                {
                    label: "Cancel", value: "cancelled",
                    icon: XCircle,
                    btnClass: "bg-red-600 hover:bg-red-700 text-white",
                    modalColor: "red",
                    heading: "Cancel this job posting?",
                    consequences: [
                        "The job will be permanently cancelled",
                        "No students will be able to apply",
                        "This action cannot be undone",
                    ],
                    reversible: "This is a permanent action and cannot be reversed",
                },
            ];
        case "published":
            return [
                {
                    label: "Close Applications", value: "closed",
                    icon: XCircle,
                    btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
                    modalColor: "amber",
                    heading: "Close applications for this job?",
                    consequences: [
                        "No new applications will be accepted",
                        "Existing applications are preserved",
                        "Selection rounds can continue",
                    ],
                    reversible: "You can reopen the job to accept applications again",
                },
                {
                    label: "Cancel", value: "cancelled",
                    icon: XCircle,
                    btnClass: "bg-red-600 hover:bg-red-700 text-white",
                    modalColor: "red",
                    heading: "Cancel this job posting?",
                    consequences: [
                        "The job will be permanently cancelled",
                        "All pending applications will be affected",
                        "This action cannot be undone",
                    ],
                    reversible: "This is a permanent action and cannot be reversed",
                },
            ];
        case "closed":
            return [
                {
                    label: "Reopen", value: "published",
                    icon: RotateCcw,
                    btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
                    modalColor: "emerald",
                    heading: "Reopen this job posting?",
                    consequences: [
                        "The job will be published again",
                        "Students can submit new applications",
                        "Application deadline will be enforced",
                    ],
                    reversible: "You can close the job again at any time",
                },
            ];
        default:
            return [];
    }
};

// ========================
// TAB CONFIG (icon component refs, not JSX)
// ========================

type TabKey = "info" | "positions" | "eligibility" | "rounds" | "questions" | "applications" | "not_applied" | "denials" | "overrides" | "placements";

interface TabConfig {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
    { key: "info",        label: "Info",        icon: FileText },
    { key: "positions",   label: "Positions",   icon: Target },
    { key: "eligibility", label: "Eligibility", icon: ShieldCheck },
    { key: "rounds",      label: "Rounds",      icon: ListOrdered },
    { key: "questions",      label: "Questions",      icon: HelpCircle },
    { key: "applications",   label: "Applications",   icon: Users },
    { key: "not_applied",    label: "Not Applied",    icon: UserX },
    { key: "denials",        label: "Denials",        icon: Ban },
    { key: "overrides",      label: "Overrides",      icon: ShieldAlert },
    { key: "placements",     label: "Placements",    icon: Award },
];

const TAB_KEYS = TABS.map((t) => t.key) as readonly TabKey[];

// ========================
// COMPANY LOGO FALLBACK
// ========================

const CompanyAvatar = ({ name }: { name: string }) => {
    const colors = [
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
        "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    ];
    const colorIdx = (name.codePointAt(0) ?? 0) % colors.length;
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold ${colors[colorIdx]}`}>
            {initials}
        </div>
    );
};

// ========================
// DETAIL SKELETON
// ========================

const DetailSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse">
        {/* Hero skeleton */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-5">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                <div className="flex-1 space-y-3">
                    <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-lg w-72" />
                    <div className="h-4 bg-gray-50 dark:bg-gray-800/60 rounded w-48" />
                    <div className="flex gap-2">
                        <div className="h-6 bg-gray-50 dark:bg-gray-800/60 rounded-full w-20" />
                        <div className="h-6 bg-gray-50 dark:bg-gray-800/60 rounded-full w-16" />
                    </div>
                </div>
            </div>
        </div>

        {/* Stats skeleton */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((k) => (
                    <div key={k} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded w-10 mx-auto mb-2" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-16 mx-auto" />
                    </div>
                ))}
            </div>
        </div>

        {/* Tabs skeleton */}
        <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex gap-6">
                {[1, 2, 3, 4, 5].map((k) => (
                    <div key={k} className="h-5 bg-gray-50 dark:bg-gray-800/60 rounded w-16" />
                ))}
            </div>
        </div>

        {/* Content skeleton */}
        <div className="p-8 space-y-4">
            <div className="h-4 bg-gray-50 dark:bg-gray-800/60 rounded w-full" />
            <div className="h-4 bg-gray-50 dark:bg-gray-800/60 rounded w-2/3" />
            <div className="h-4 bg-gray-50 dark:bg-gray-800/60 rounded w-1/2" />
        </div>
    </div>
);

// ========================
// STATS CARDS (explicit classes — no dynamic interpolation)
// ========================

const formatDeadlineRemaining = (deadline: string): { label: string; sublabel: string; expired: boolean; urgentSoon: boolean } => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const absDiffMs = Math.abs(diffMs);
    const expired = diffMs < 0;

    const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    let label: string;
    if (days > 0) {
        label = `${days}d ${hours}h`;
    } else if (hours > 0) {
        label = `${hours}h ${minutes}m`;
    } else {
        label = `${minutes}m`;
    }

    const sublabel = expired ? `Expired ${label} ago` : `${label} left`;
    const urgentSoon = !expired && days < 3;

    return { label: expired ? "Expired" : label, sublabel, expired, urgentSoon };
};

const getDeadlineClass = (deadline: { expired: boolean; urgentSoon: boolean }, red: string, amber: string, emerald: string) => {
    if (deadline.expired) return red;
    if (deadline.urgentSoon) return amber;
    return emerald;
};

const StatsRow = ({ job }: { job: JobDetail }) => {
    const totalPositions = job.positions.reduce((sum, p) => sum + (p.vacancies || 0), 0);
    const totalApps = job.application_stats?.total ?? 0;
    const roundCount = job.rounds.length;

    const deadline = formatDeadlineRemaining(job.application_deadline);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/40 text-center">
                <p className="text-xl font-bold text-orange-700 dark:text-orange-400">{totalPositions || job.positions.length}</p>
                <p className="text-xs text-orange-600 dark:text-orange-500 font-medium mt-0.5">Positions</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 text-center">
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{totalApps}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 font-medium mt-0.5">Applications</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/40 text-center">
                <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{roundCount}</p>
                <p className="text-xs text-purple-600 dark:text-purple-500 font-medium mt-0.5">Rounds</p>
            </div>
            <div className={`p-4 rounded-xl border text-center ${getDeadlineClass(deadline,
                "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40",
                "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/40",
                "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/40"
            )}`}>
                <p className={`text-xl font-bold ${getDeadlineClass(deadline,
                    "text-red-700 dark:text-red-400",
                    "text-amber-700 dark:text-amber-400",
                    "text-emerald-700 dark:text-emerald-400"
                )}`}>
                    {deadline.label}
                </p>
                <p className={`text-[10px] font-medium mt-0.5 ${getDeadlineClass(deadline,
                    "text-red-600 dark:text-red-500",
                    "text-amber-600 dark:text-amber-500",
                    "text-emerald-600 dark:text-emerald-500"
                )}`}>
                    {deadline.sublabel}
                </p>
            </div>
        </div>
    );
};

// ========================
// CONFIRMATION MODAL (extracted to reduce cognitive complexity)
// ========================

const getColorByModalColor = (modalColor: string, colors: { red: string; amber: string; emerald: string }) => {
    if (modalColor === "red") return colors.red;
    if (modalColor === "amber") return colors.amber;
    return colors.emerald;
};

interface ConfirmationModalProps {
    confirmAction: StatusAction | null;
    onClose: () => void;
    statusLoading: boolean;
    onConfirm: (value: string) => void;
}

const ConfirmationModal = ({ confirmAction, onClose, statusLoading, onConfirm }: ConfirmationModalProps) => (
    <ModalWrapper
        isOpen={!!confirmAction}
        onClose={onClose}
        disabled={statusLoading}
        size="md"
        title={confirmAction?.label}
        titleIcon={
            confirmAction && (
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${getColorByModalColor(confirmAction.modalColor, {
                    red: "bg-red-50 dark:bg-red-900/20",
                    amber: "bg-amber-50 dark:bg-amber-900/20",
                    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
                })}`}>
                    <AlertTriangle className={`h-5 w-5 ${getColorByModalColor(confirmAction.modalColor, {
                        red: "text-red-500",
                        amber: "text-amber-500",
                        emerald: "text-emerald-500",
                    })}`} />
                </div>
            )
        }
    >
        {confirmAction && (
            <>
                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {confirmAction.heading}
                    </p>
                    <div className={`rounded-xl p-4 space-y-2 ${getColorByModalColor(confirmAction.modalColor, {
                        red: "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30",
                        amber: "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30",
                        emerald: "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30",
                    })}`}>
                        <p className={`text-xs font-semibold uppercase ${getColorByModalColor(confirmAction.modalColor, {
                            red: "text-red-700 dark:text-red-400",
                            amber: "text-amber-700 dark:text-amber-400",
                            emerald: "text-emerald-700 dark:text-emerald-400",
                        })}`}>
                            This action will:
                        </p>
                        <ul className="space-y-1">
                            {confirmAction.consequences.map((c) => (
                                <li key={c} className={`text-sm flex items-start gap-2 ${getColorByModalColor(confirmAction.modalColor, {
                                    red: "text-red-600 dark:text-red-400",
                                    amber: "text-amber-600 dark:text-amber-400",
                                    emerald: "text-emerald-600 dark:text-emerald-400",
                                })}`}>
                                    <span className="mt-1">•</span> {c}
                                </li>
                            ))}
                        </ul>
                        <p className={`text-xs mt-2 pt-2 border-t ${getColorByModalColor(confirmAction.modalColor, {
                            red: "text-red-500 dark:text-red-400 border-red-200 dark:border-red-800",
                            amber: "text-amber-500 dark:text-amber-400 border-amber-200 dark:border-amber-800",
                            emerald: "text-emerald-500 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
                        })}`}>
                            {confirmAction.reversible}
                        </p>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={statusLoading}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm(confirmAction.value);
                            onClose();
                        }}
                        disabled={statusLoading}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-colors disabled:opacity-60 ${confirmAction.btnClass}`}
                    >
                        {statusLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {statusLoading ? "Processing..." : `Confirm ${confirmAction.label}`}
                    </button>
                </div>
            </>
        )}
    </ModalWrapper>
);

// ========================
// COMPONENT
// ========================

interface JobDetailViewProps {
    jobId: string | undefined;
    onJobLoaded?: (title: string) => void;
}

const JobDetailView = ({ jobId, onJobLoaded }: JobDetailViewProps) => {
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission("jobs.update");
    const canManageStatus = hasPermission("jobs.manage_status");
    const { job, loading, error, refresh } = useViewJob(jobId);
    const { updateStatus, loading: statusLoading } = useUpdateJobStatus(refresh);
    const [activeTab, setActiveTab] = useState<TabKey>("info");
    const [confirmAction, setConfirmAction] = useState<StatusAction | null>(null);
    const shouldReduce = useReducedMotion();

    // Notify parent of job title for breadcrumb
    useEffect(() => {
        if (job && onJobLoaded) {
            onJobLoaded(job.job_title);
        }
    }, [job, onJobLoaded]);

    // ========================
    // LOADING / ERROR
    // ========================

    if (loading) return <DetailSkeleton />;

    if (error || !job) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400 font-semibold text-lg mb-1">Job Not Found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error || "The requested job posting could not be found."}</p>
                <button
                    type="button"
                    onClick={() => navigate("/college/jobs")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                     Back to Jobs
                </button>
            </div>
        );
    }

    const status = STATUS_CONFIG[job.job_status] || STATUS_CONFIG.draft;
    const statusActions = getStatusActions(job.job_status);

    const getTabBadge = (key: TabKey): number | undefined => {
        switch (key) {
            case "positions":  return job.positions.length;
            case "rounds":     return job.rounds.length;
            case "questions":     return job.questions.length;
            case "applications":  return job.application_stats?.total;
            default:              return undefined;
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                {/* ======================== HERO HEADER ======================== */}
                <div className="px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <CompanyAvatar name={job.company_name} />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{job.job_title}</h1>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                        <Building2 className="h-3.5 w-3.5" /> {job.company_name}
                                    </span>
                                    <TierBadge tierName={job.tier_name} tierLevel={job.tier_level} />
                                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                        <MapPin className="h-3.5 w-3.5" /> {job.job_location}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-3.5 w-3.5" /> {new Date(job.application_deadline).toLocaleDateString("en-IN")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    {/* Status badge */}
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                        {status.label}
                                    </span>
                                    {/* Job type tag */}
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                                        {job.job_type}
                                    </span>
                                    {/* Passout year tags */}
                                    {job.passout_years?.map((y) => (
                                        <span key={y} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                            {y}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {canEdit && job.job_status !== "cancelled" && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/college/job/${job.job_id}/edit`)}
                                    aria-label="Edit job posting"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
                                >
                                    <Pencil size={15} /> Edit
                                </button>
                            )}
                            {canManageStatus && statusActions.map((action) => {
                                const ActionIcon = action.icon;
                                return (
                                    <button
                                        key={action.value}
                                        type="button"
                                        onClick={() => setConfirmAction(action)}
                                        disabled={statusLoading}
                                        aria-label={action.label}
                                        className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 ${action.btnClass}`}
                                    >
                                        <ActionIcon className="h-4 w-4" /> {action.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ======================== STATS ROW ======================== */}
                <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                    <StatsRow job={job} />
                </div>

                {/* ======================== TABS ======================== */}
                <div className="px-8 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-20 bg-white dark:bg-gray-900">
                    <LayoutGroup>
                        <nav className="flex gap-1 overflow-x-auto -mb-px" aria-label="Job tabs">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const badge = getTabBadge(tab.key);
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                                            isActive
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                        {badge !== undefined && badge > 0 && (
                                            <span className={`ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold ${
                                                isActive ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            }`}>
                                                {badge}
                                            </span>
                                        )}
                                        {isActive && (
                                            shouldReduce ? (
                                                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                            ) : (
                                                <motion.span
                                                    layoutId="job-tab-indicator"
                                                    className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                                />
                                            )
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </LayoutGroup>
                </div>

                {/* ======================== TAB CONTENT ======================== */}
                <AnimatedTabContent activeTab={activeTab} tabKeys={TAB_KEYS} className="p-8">
                    {activeTab === "info"        && <InfoTab job={job} />}
                    {activeTab === "positions"   && (
                        <PositionManager
                            jobId={job.job_id}
                            jobStatus={job.job_status}
                            positions={job.positions}
                            onRefresh={refresh}
                        />
                    )}
                    {activeTab === "eligibility" && <EligibilityTab job={job} onRefresh={refresh} />}
                    {activeTab === "rounds"      && (
                        <RoundManager
                            jobId={job.job_id}
                            jobStatus={job.job_status}
                            rounds={job.rounds}
                            onRefresh={refresh}
                        />
                    )}
                    {activeTab === "questions" && (
                        <QuestionManager
                            jobId={job.job_id}
                            jobStatus={job.job_status}
                            questions={job.questions}
                            onRefresh={refresh}
                        />
                    )}
                    {activeTab === "applications" && (
                        <ApplicationManager
                            jobId={job.job_id}
                            jobStatus={job.job_status}
                            positions={job.positions}
                            onRefresh={refresh}
                        />
                    )}
                    {activeTab === "not_applied" && (
                        <EligibleNotAppliedManager jobId={job.job_id} onRefresh={refresh} />
                    )}
                    {activeTab === "denials" && (
                        <DenialsManager jobId={job.job_id} />
                    )}
                    {activeTab === "overrides" && (
                        <OverrideManager jobId={job.job_id} onRefresh={refresh} />
                    )}
                    {activeTab === "placements" && (
                        <JobPlacementsTab jobId={job.job_id} jobStatus={job.job_status} onRefresh={refresh} />
                    )}
                </AnimatedTabContent>
            </div>

            {/* ======================== CONFIRMATION MODAL ======================== */}
            <ConfirmationModal
                confirmAction={confirmAction}
                onClose={() => setConfirmAction(null)}
                statusLoading={statusLoading}
                onConfirm={(value) => updateStatus(job.job_id, value)}
            />
        </>
    );
};

// ========================
// TAB: INFO
// ========================

const InfoTab = ({ job }: { job: JobDetail }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow label="Job Title" value={job.job_title} />
            <InfoRow label="Company" value={job.company_name} />
            <InfoRow label="Location" value={job.job_location} />
            <InfoRow label="Job Type" value={job.job_type} />
            <InfoRow label="Salary Package" value={job.salary_package || "—"} />
            <InfoRow label="Salary Range" value={
                job.salary_min && job.salary_max
                    ? `₹${Number(job.salary_min).toLocaleString('en-IN')} — ₹${Number(job.salary_max).toLocaleString('en-IN')}`
                    : "—"
            } />
            <InfoRow label="Bond Duration" value={job.bond_duration || "—"} />
            <InfoRow label="Passout Year(s)" value={job.passout_years?.join(", ") || "—"} />
            <InfoRow label="Application Deadline" value={new Date(job.application_deadline).toLocaleString("en-IN")} />
            <InfoRow label="Created" value={new Date(job.created_at).toLocaleString("en-IN")} />
        </div>

        {job.bond_details && (
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase mb-1">Bond Details</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{job.bond_details}</p>
            </div>
        )}

        {job.job_description && (
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase mb-1">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{job.job_description}</p>
            </div>
        )}

        {job.internship_duration && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow label="Internship Duration" value={job.internship_duration} />
                <InfoRow label="Internship Stipend" value={job.internship_stipend || "—"} />
            </div>
        )}

        {/* Application Stats */}
        {job.application_stats && (
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase mb-3">Application Stats</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 text-center">
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{job.application_stats.total}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-500 font-medium">Total</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 text-center">
                        <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{job.application_stats.pending}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">Pending</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-900/40 text-center">
                        <p className="text-xl font-bold text-cyan-700 dark:text-cyan-400">{job.application_stats.shortlisted}</p>
                        <p className="text-xs text-cyan-600 dark:text-cyan-500 font-medium">Shortlisted</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 text-center">
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{job.application_stats.selected}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Selected</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 text-center">
                        <p className="text-xl font-bold text-red-700 dark:text-red-400">{job.application_stats.rejected}</p>
                        <p className="text-xs text-red-600 dark:text-red-500 font-medium">Rejected</p>
                    </div>
                </div>
            </div>
        )}
    </div>
);

// ========================
// TAB: ELIGIBILITY (interactive criteria + lazy student preview)
// ========================

const EligibilityTab = ({ job, onRefresh }: { job: JobDetail; onRefresh: () => void }) => {
    const [showStudents, setShowStudents] = useState(false);

    return (
        <div className="space-y-8">
            {/* Criteria Form — set or update */}
            <JobCriteriaManager
                jobId={job.job_id}
                jobStatus={job.job_status}
                existingCriteria={job.eligibility_criteria as Record<string, unknown> | null}
                onSuccess={() => {
                    onRefresh();
                    setShowStudents(false);
                }}
            />

            {/* Change History */}
            <CriteriaHistoryPanel jobId={job.job_id} />

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Eligible Students Preview — lazy-loaded behind CTA */}
            {showStudents ? (
                <EligibleStudentsPreview
                    jobId={job.job_id}
                    onCollapse={() => setShowStudents(false)}
                />
            ) : (
                <EligibilityStudentsCTA
                    hasCriteria={!!job.eligibility_criteria}
                    onPreview={() => setShowStudents(true)}
                />
            )}
        </div>
    );
};

// ========================
// CRITERIA HISTORY PANEL
// ========================

interface HistoryEntry {
    audit_id: string;
    user_name: string;
    user_role: string;
    action: string;
    old_value: Record<string, unknown> | null;
    new_value: Record<string, unknown> | null;
    summary: string;
    created_at: string;
}

function getFieldLabel(key: string): string {
    return CRITERIA_CONFIG[key]?.label || key.replaceAll("_", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

function formatFieldValue(_key: string, value: unknown): string {
    if (value == null) return "—";
    if (Array.isArray(value)) {
        if (value.length === 0) return "None";
        // Skills array
        if (value[0]?.skill_name) return value.map((s: { skill_name: string }) => s.skill_name).join(", ");
        return value.join(", ");
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value as string | number);
}

function getRoleBadgeClass(role: string): string {
    switch (role) {
        case "collegeadmin": return "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
        case "tpo": return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
        default: return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
}

function DiffCard({ fieldKey, oldVal, newVal }: Readonly<{ fieldKey: string; oldVal: unknown; newVal: unknown }>) {
    const label = getFieldLabel(fieldKey);
    const isArray = Array.isArray(oldVal) || Array.isArray(newVal);

    if (isArray) {
        const oldArr = Array.isArray(oldVal) ? oldVal : [];
        const newArr = Array.isArray(newVal) ? newVal : [];
        const getLabel = (v: unknown) => (typeof v === "object" && v && "skill_name" in v) ? (v as { skill_name: string }).skill_name : String(v);
        const oldLabels = oldArr.map(getLabel);
        const newLabels = newArr.map(getLabel);
        const added = newLabels.filter((l) => !oldLabels.includes(l));
        const removed = oldLabels.filter((l) => !newLabels.includes(l));

        if (added.length === 0 && removed.length === 0) return null;

        return (
            <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</p>
                <div className="flex flex-wrap gap-1">
                    {removed.map((v) => (
                        <span key={`r-${v}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 line-through">
                            {v}
                        </span>
                    ))}
                    {added.map((v) => (
                        <span key={`a-${v}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            + {v}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
            <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 line-through">
                    {formatFieldValue(fieldKey, oldVal)}
                </span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium">
                    {formatFieldValue(fieldKey, newVal)}
                </span>
            </div>
        </div>
    );
}

function CriteriaHistoryPanel({ jobId }: Readonly<{ jobId: string }>) {
    const [expanded, setExpanded] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.jobs.criteriaHistory(jobId),
        queryFn: () => CollegeAdminService.getCriteriaHistory(jobId),
        enabled: expanded,
        staleTime: 60_000,
    });

    const entries: HistoryEntry[] = data?.data?.history || [];

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header — always visible */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-800/80 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <History className="h-4.5 w-4.5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Change History</span>
                    {entries.length > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {entries.length}
                        </span>
                    )}
                </div>
                {expanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
            </button>

            {/* Content */}
            {expanded && (
                <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                    ) : entries.length === 0 ? ( // NOSONAR - ternary readable for loading states
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                            No changes recorded yet.
                        </p>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {entries.map((entry) => {
                                const oldVal = entry.old_value || {};
                                const newVal = entry.new_value || {};
                                const allKeys = [...new Set([...Object.keys(oldVal), ...Object.keys(newVal)])];
                                const changedKeys = allKeys.filter((k) => JSON.stringify(oldVal[k]) !== JSON.stringify(newVal[k]));
                                const date = new Date(entry.created_at);
                                const timeAgo = getRelativeTime(date);

                                return (
                                    <div key={entry.audit_id} className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                        {/* Entry Header */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                                    {(entry.user_name || "?").charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                        {entry.user_name || "Unknown"}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${getRoleBadgeClass(entry.user_role)}`}>
                                                        {entry.user_role === "collegeadmin" ? "Admin" : entry.user_role?.toUpperCase() || "?"}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                                    {timeAgo} · {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${entry.action === "create" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"}`}>
                                                {entry.action}
                                            </span>
                                        </div>

                                        {/* Diff Cards */}
                                        {changedKeys.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {changedKeys.map((k) => (
                                                    <DiffCard key={k} fieldKey={k} oldVal={oldVal[k]} newVal={newVal[k]} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">{entry.summary}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function getRelativeTime(date: Date): string {
    const now = Date.now();
    const diffMs = now - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

// ========================
// ELIGIBLE STUDENTS CTA (no criteria / ready to preview)
// ========================

const EligibilityStudentsCTA = ({
    hasCriteria,
    onPreview,
}: {
    hasCriteria: boolean;
    onPreview: () => void;
}) => (
    <div className="text-center py-10">
        <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 text-blue-500" />
        </div>
        {hasCriteria ? (
            <>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Preview Eligible Students</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 max-w-xs mx-auto">
                    See which students match the current eligibility criteria for this job
                </p>
                <button
                    type="button"
                    onClick={onPreview}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm"
                >
                    Preview Eligible Students
                </button>
            </>
        ) : (
            <>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">No Criteria Set</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                    Set eligibility criteria first to see matching students
                </p>
            </>
        )}
    </div>
);

// ========================
// ELIGIBLE STUDENTS PREVIEW (lazy-loaded)
// ========================

const getCgpaColorClass = (cgpa: number) => {
    if (cgpa >= 8) return "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
    if (cgpa >= 6) return "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    return "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
};

const getTwelfthDiplomaVal = (s: { twelfth_percentage?: number | null; diploma_percentage?: number | null }) => {
    if (s.twelfth_percentage != null) return `${s.twelfth_percentage}% (12th)`;
    if (s.diploma_percentage != null) return `${s.diploma_percentage}% (Dip)`;
    return "\u2014";
};

const getEmptyStudentsMessage = (hasFilter: boolean, eligibleCount: number): { title: string; subtitle: string } => {
    if (hasFilter) return { title: "No students match your search", subtitle: "Try adjusting your search or filters" };
    if (eligibleCount === 0) return { title: "No students match the current criteria", subtitle: "Try adjusting the eligibility filters" };
    return { title: "No eligible students found", subtitle: "Set eligibility criteria first to see matching students" };
};

const EligibleStudentsPreview = ({
    jobId,
    onCollapse,
}: {
    jobId: string;
    onCollapse: () => void;
}) => {
    const {
        students,
        eligibleCount,
        totalStudents,
        eligibilityPercentage,
        loading,
        error,
        pagination,
        search,
        deptFilter,
        handleSearchChange,
        handleDeptFilterChange,
        handlePageChange,
        refresh,
    } = useEligibleStudents(jobId);

    // Use departments from auth context (already loaded at login)
    const { user } = useAuth();
    const departments = user?.departments ?? [];
    const deptOptions = departments.map((d) => d.dept_name).sort((a, b) => a.localeCompare(b));

    // Skeleton loading on first fetch
    if (loading && students.length === 0) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg w-48" />
                {/* Stats skeleton */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-60" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full w-full" />
                    </div>
                    <div className="flex gap-3">
                        {[1, 2, 3].map((k) => (
                            <div key={k} className="w-20 h-16 rounded-xl bg-gray-100 dark:bg-gray-700" />
                        ))}
                    </div>
                </div>
                {/* Search + filter skeleton */}
                <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-gray-50 dark:bg-gray-800/60 rounded-xl" />
                    <div className="w-44 h-10 bg-gray-50 dark:bg-gray-800/60 rounded-xl" />
                </div>
                {/* Table skeleton */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="h-10 bg-gray-50 dark:bg-gray-800/60" />
                    {[1, 2, 3, 4, 5].map((k) => (
                        <div key={k} className="h-14 border-b border-gray-50 dark:border-gray-800 flex items-center gap-4 px-4">
                            <div className="h-3 w-6 bg-gray-100 dark:bg-gray-700 rounded" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-32" />
                                <div className="h-2.5 bg-gray-50 dark:bg-gray-800/60 rounded w-44" />
                            </div>
                            <div className="h-5 w-16 bg-gray-100 dark:bg-gray-700 rounded-full" />
                            <div className="h-3 w-10 bg-gray-100 dark:bg-gray-700 rounded" />
                            <div className="h-3 w-8 bg-gray-100 dark:bg-gray-700 rounded" />
                            <div className="h-3 w-10 bg-gray-100 dark:bg-gray-700 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Failed to load students</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{error}</p>
                <button
                    type="button"
                    onClick={refresh}
                    className="px-5 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const progressWidth = totalStudents > 0 ? Math.round((eligibleCount / totalStudents) * 100) : 0;
    const emptyMsg = getEmptyStudentsMessage(!!(search || deptFilter), eligibleCount);

    return (
        <div className="space-y-5">
            {/* Header with refresh + collapse */}
            <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">Eligible Students</h4>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={refresh}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-40"
                        aria-label="Refresh eligible students"
                    >
                        <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={onCollapse}
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        Collapse
                    </button>
                </div>
            </div>

            {/* Stats Bar — progress bar + 3 pills */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50/50 to-blue-50/50 dark:from-emerald-900/10 dark:to-blue-900/10 border border-emerald-100/60 dark:border-emerald-900/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Progress info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {eligibleCount} of {totalStudents} eligible ({eligibilityPercentage}%)
                        </p>
                        <div className="mt-2 h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressWidth}%` }}
                            />
                        </div>
                    </div>
                    {/* Stat Pills */}
                    <div className="flex gap-3 flex-shrink-0">
                        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 text-center min-w-[72px]">
                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{eligibleCount}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium uppercase tracking-wide">Eligible</p>
                        </div>
                        <div className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 text-center min-w-[72px]">
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{totalStudents}</p>
                            <p className="text-[10px] text-blue-600 dark:text-blue-500 font-medium uppercase tracking-wide">Total</p>
                        </div>
                        <div className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/40 text-center min-w-[72px]">
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{eligibilityPercentage}%</p>
                            <p className="text-[10px] text-purple-600 dark:text-purple-500 font-medium uppercase tracking-wide">Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search + Department Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search students by name or email..."
                        aria-label="Search eligible students by name or email"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>
                {deptOptions.length > 0 && (
                    <select
                        value={deptFilter}
                        onChange={(e) => handleDeptFilterChange(e.target.value)}
                        aria-label="Filter by department"
                        className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-w-[180px] [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800"
                    >
                        <option value="">All Departments</option>
                        {deptOptions.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Student Table or Empty States */}
            {students.length === 0 ? (
                <div className="text-center py-10">
                    <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{emptyMsg.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{emptyMsg.subtitle}</p>
                </div>
            ) : (
                <>
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th scope="col" className="px-4 py-3 rounded-tl-xl">#</th>
                                    <th scope="col" className="px-4 py-3">Student</th>
                                    <th scope="col" className="px-4 py-3">Department</th>
                                    <th scope="col" className="px-4 py-3">CGPA</th>
                                    <th scope="col" className="px-4 py-3">KTs</th>
                                    <th scope="col" className="px-4 py-3">10th %</th>
                                    <th scope="col" className="px-4 py-3">12th / Diploma %</th>
                                    <th scope="col" className="px-4 py-3 rounded-tr-xl">Gender</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, idx) => {
                                    const cgpaColor = getCgpaColorClass(s.overall_cgpa);
                                    // KTs badge: 0 = emerald, >0 = red
                                    const ktsColor =
                                        s.total_live_kts === 0
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40"
                                            : "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40";
                                    const twelfthDiplomaVal = getTwelfthDiplomaVal(s);

                                    return (
                                        <tr key={s.student_id} className="group border-b border-gray-50 dark:border-gray-800 text-sm hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors">
                                            <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 font-medium">
                                                {(pagination.page - 1) * pagination.limit + idx + 1}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{s.student_name}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{s.student_email}</p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
                                                    {s.dept_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${cgpaColor}`}>
                                                    {s.overall_cgpa == null ? "—" : Number(s.overall_cgpa).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ktsColor}`}>
                                                    {s.total_live_kts}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">{s.tenth_percentage ?? "—"}</td>
                                            <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">{twelfthDiplomaVal}</td>
                                            <td className="px-4 py-3.5">
                                                <span className="capitalize text-gray-600 dark:text-gray-400">{s.gender}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {students.map((s, idx) => {
                            const cgpaColor = getCgpaColorClass(s.overall_cgpa);
                            const ktsColor =
                                s.total_live_kts === 0
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40"
                                    : "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40";
                            const twelfthDiplomaVal = getTwelfthDiplomaVal(s);
                            return (
                                <div key={s.student_id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{s.student_name}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{s.student_email}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium flex-shrink-0 ml-2">
                                            #{(pagination.page - 1) * pagination.limit + idx + 1}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
                                            {s.dept_name}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${cgpaColor}`}>
                                            CGPA: {s.overall_cgpa == null ? "—" : Number(s.overall_cgpa).toFixed(2)}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ktsColor}`}>
                                            KTs: {s.total_live_kts}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <div>
                                            <p className="text-gray-400 dark:text-gray-500">10th</p>
                                            <p className="font-medium">{s.tenth_percentage ?? "—"}%</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 dark:text-gray-500">12th/Dip</p>
                                            <p className="font-medium">{twelfthDiplomaVal}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 dark:text-gray-500">Gender</p>
                                            <p className="font-medium capitalize">{s.gender}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                            </p>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => handlePageChange(p)}
                                        className={`min-h-[44px] min-w-[44px] px-2 rounded-lg text-xs font-semibold transition-colors ${
                                            p === pagination.page
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                {pagination.totalPages > 10 && (
                                    <span className="flex items-center px-2 text-xs text-gray-400 dark:text-gray-500">...</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Loading indicator for subsequent fetches */}
                    {loading && (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">Updating...</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};



// ========================
// HELPERS
// ========================

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mt-0.5">{value}</p>
    </div>
);

export default JobDetailView;
