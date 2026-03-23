import { Link } from "react-router-dom";
import { useRef } from "react";
import {
    BookOpen,
    Calendar,
    Clock,
    Users,
    Star,
    User,
    Building2,
    Edit,
    ArrowRight,
    AlertCircle,
    RefreshCw,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import { useViewTrainingProgram } from "@/hooks/collegeadmin/training_programs/useViewTrainingProgram";
import { useToggleTrainingStatus } from "@/hooks/collegeadmin/training_programs/useToggleTrainingStatus";
import {
    PROGRAM_STATUS_COLORS,
    PROGRAM_STATUS_LABELS,
    PROGRAM_TYPE_LABELS,
    type ProgramStatus,
    type ProgramType,
} from "@/validators/TrainingProgramSchema";

// ========================
// COMPONENT
// ========================

interface TrainingProgramDetailViewProps {
    programId: string;
    onProgramLoaded?: (name: string) => void;
}

const TrainingProgramDetailView = ({ programId, onProgramLoaded }: TrainingProgramDetailViewProps) => {
    const { program, loading, error, refetch } = useViewTrainingProgram(programId);

    // Notify parent of program name for breadcrumbs
    const notifiedRef = useRef(false);
    if (program?.program_name && onProgramLoaded && !notifiedRef.current) {
        notifiedRef.current = true;
        onProgramLoaded(program.program_name);
    }

    // ── Loading skeleton ──
    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="h-6 w-64 bg-gray-100 dark:bg-gray-800 rounded" />
                            <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
                        </div>
                        <div className="h-8 w-28 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800" />
                    ))}
                </div>
            </div>
        );
    }

    // ── Error ──
    if (error || !program) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 flex flex-col items-center gap-4 text-center">
                <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Failed to load program</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Something went wrong. Please try again.</p>
                </div>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                >
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
            </div>
        );
    }

    const statusColors = PROGRAM_STATUS_COLORS[program.program_status as ProgramStatus];
    const statusLabel = PROGRAM_STATUS_LABELS[program.program_status as ProgramStatus] ?? program.program_status;
    const typeLabel = PROGRAM_TYPE_LABELS[program.program_type as ProgramType] ?? program.program_type;
    const stats = program.enrollment_stats;
    const isCancelled = program.program_status === "cancelled";

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Enrollment deadline time-remaining (granular)
    const deadlineRemaining = (() => {
        if (!program.enrollment_deadline) return null;
        const now = new Date();
        const deadline = new Date(program.enrollment_deadline);
        const diffMs = deadline.getTime() - now.getTime();
        const absDiffMs = Math.abs(diffMs);
        const expired = diffMs < 0;
        const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

        let label: string;
        if (days > 0) label = `${days}d ${hours}h`;
        else if (hours > 0) label = `${hours}h ${mins}m`;
        else label = `${mins}m`;

        if (expired) return `Expired ${label} ago`;
        return `${label} left to enroll`;
    })();

    return (
        <div className="space-y-6">
            {/* ── Header Card ── */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                {program.program_name}
                            </h1>
                            {statusColors && (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                                    {statusLabel}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-xs font-medium">{typeLabel}</span>
                            {program.created_by_name && (
                                <span>Created by {program.created_by_name}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {!isCancelled && (
                            <Link
                                to={`/college/training-program/${programId}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                <Edit className="h-4 w-4" /> Edit
                            </Link>
                        )}
                        <StatusToggleDropdown programId={programId} currentStatus={program.program_status} />
                    </div>
                </div>

                {/* Description */}
                {program.program_description && (
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {program.program_description}
                    </p>
                )}
            </div>

            {/* ── Info Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Trainer */}
                <InfoCard
                    icon={User}
                    label="Trainer"
                    value={program.trainer_name || "—"}
                    sub={program.trainer_organization || undefined}
                />

                {/* Schedule */}
                <InfoCard
                    icon={Calendar}
                    label="Schedule"
                    value={`${formatDate(program.start_date)} — ${formatDate(program.end_date)}`}
                    sub={program.enrollment_deadline ? `Deadline: ${formatDate(program.enrollment_deadline)}${deadlineRemaining ? ` (${deadlineRemaining})` : ""}` : undefined}
                />

                {/* Sessions */}
                <InfoCard
                    icon={Clock}
                    label="Sessions"
                    value={program.total_sessions ? `${program.total_sessions} sessions` : "—"}
                    sub={program.session_duration_hours ? `${program.session_duration_hours}h per session` : undefined}
                />
            </div>

            {/* ── Target Departments ── */}
            {program.target_dept_names && program.target_dept_names.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Target Departments</span>
                        {program.target_passout_year && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                Batch {program.target_passout_year}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {program.target_dept_names.map((d) => (
                            <span
                                key={d.dept_id}
                                className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                            >
                                {d.dept_name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Enrollment Stats ── */}
            {stats && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enrollment Statistics</span>
                        </div>
                        <Link
                            to={`/college/training-program/${programId}/enrollments`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                            View Enrollments <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <StatBox label="Enrolled" value={stats.enrolled_count} color="text-cyan-600 dark:text-cyan-400" />
                        <StatBox label="In Progress" value={stats.in_progress_count} color="text-amber-600 dark:text-amber-400" />
                        <StatBox label="Completed" value={stats.completed_count} color="text-emerald-600 dark:text-emerald-400" />
                        <StatBox label="Dropped" value={stats.dropped_count} color="text-gray-600 dark:text-gray-400" />
                        <StatBox label="Failed" value={stats.failed_count} color="text-red-600 dark:text-red-400" />
                    </div>

                    {/* Progress Bars */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {stats.avg_completion_percentage != null && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Avg Completion</span>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {stats.avg_completion_percentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <div
                                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${Math.min(stats.avg_completion_percentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        {stats.avg_sessions_attended != null && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Avg {stats.avg_sessions_attended.toFixed(1)} sessions attended
                                </span>
                            </div>
                        )}
                        {stats.avg_rating != null && (
                            <div className="flex items-center gap-2">
                                <Star className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {stats.avg_rating.toFixed(1)} avg rating
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ========================
// SUB-COMPONENTS
// ========================

interface InfoCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    sub?: string;
}

const InfoCard = ({ icon: Icon, label, value, sub }: InfoCardProps) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</p>
        {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
    </div>
);

interface StatBoxProps {
    label: string;
    value: number;
    color: string;
}

const StatBox = ({ label, value, color }: StatBoxProps) => (
    <div className="text-center">
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
);

// ── Status Toggle Dropdown ──

interface StatusToggleDropdownProps {
    programId: string;
    currentStatus: string;
}

const StatusToggleDropdown = ({ programId, currentStatus }: StatusToggleDropdownProps) => {
    const {
        allowedTransitions,
        showConfirm,
        selectedStatusLabel,
        currentStatusLabel,
        loading,
        handleStatusSelect,
        handleConfirm,
        handleCancelConfirm,
    } = useToggleTrainingStatus(programId, currentStatus);

    if (allowedTransitions.length === 0) return null;

    return (
        <>
            <div className="flex items-center gap-1">
                {allowedTransitions.map((status) => {
                    const colors = PROGRAM_STATUS_COLORS[status];
                    const label = PROGRAM_STATUS_LABELS[status];
                    return (
                        <button
                            type="button"
                            key={status}
                            onClick={() => handleStatusSelect(status)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${colors.bg} ${colors.text} border-transparent hover:opacity-80`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                            {label}
                        </button>
                    );
                })}
            </div>

            <ModalWrapper
                isOpen={showConfirm}
                onClose={handleCancelConfirm}
                disabled={loading}
                size="sm"
                title="Change Program Status"
                titleIcon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
                footer={
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleCancelConfirm}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={loading}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
                        >
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Confirm
                        </button>
                    </div>
                }
            >
                <div className="px-6 py-5">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Are you sure you want to change the program status from{" "}
                        <strong>{currentStatusLabel}</strong> to{" "}
                        <strong>{selectedStatusLabel}</strong>?
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        This action will update the program visibility and may affect student enrollments.
                    </p>
                </div>
            </ModalWrapper>
        </>
    );
};

export default TrainingProgramDetailView;
