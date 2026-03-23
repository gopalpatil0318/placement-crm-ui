import { Link } from "react-router-dom";
import {
    Calendar,
    Users,
    Clock,
    Star,
    ArrowRight,
    User,
    Building2,
    Timer,
} from "lucide-react";
import type { TrainingProgram } from "@/hooks/collegeadmin/training_programs/useViewTrainingPrograms";
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

interface TrainingProgramCardProps {
    program: TrainingProgram;
}

const TrainingProgramCard = ({ program }: TrainingProgramCardProps) => {
    const statusColors = PROGRAM_STATUS_COLORS[program.program_status as ProgramStatus];
    const statusLabel = PROGRAM_STATUS_LABELS[program.program_status as ProgramStatus] ?? program.program_status;
    const typeLabel = PROGRAM_TYPE_LABELS[program.program_type as ProgramType] ?? program.program_type;

    const enrollmentPercent =
        program.max_enrollment && program.enrolled_count
            ? Math.min(Math.round((program.enrolled_count / program.max_enrollment) * 100), 100)
            : null;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Enrollment deadline time-remaining (granular: days + hours + minutes)
    const deadlineInfo = (() => {
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

        if (expired) {
            return { label: "Expired", sublabel: `Expired ${label} ago`, expired: true, urgentSoon: false };
        }
        const urgentSoon = days < 3;
        return { label, sublabel: `${label} left`, expired: false, urgentSoon };
    })();

    return (
        <Link
            to={`/college/training-program/${program.program_id}`}
            className="group block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
        >
            {/* Header */}
            <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {program.program_name}
                        </h3>
                        <span className="inline-block mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {typeLabel}
                        </span>
                    </div>
                    {statusColors && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors.bg} ${statusColors.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                            {statusLabel}
                        </span>
                    )}
                </div>

                {/* Trainer Info */}
                {(program.trainer_name || program.trainer_organization) && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {program.trainer_name && (
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {program.trainer_name}
                            </span>
                        )}
                        {program.trainer_organization && (
                            <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {program.trainer_organization}
                            </span>
                        )}
                    </div>
                )}

                {/* Dates */}
                {(program.start_date || program.end_date) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>
                            {formatDate(program.start_date)}
                            {program.start_date && program.end_date && " — "}
                            {formatDate(program.end_date)}
                        </span>
                    </div>
                )}

                {/* Enrollment Deadline Warning */}
                {deadlineInfo && (
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium mb-3 ${
                        deadlineInfo.expired
                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            : deadlineInfo.urgentSoon
                                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    }`}>
                        <Timer className="h-3 w-3" />
                        <span>{deadlineInfo.sublabel}</span>
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            <div className="px-5 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {program.enrolled_count}
                            {program.max_enrollment ? ` / ${program.max_enrollment}` : ""}
                        </span>
                        {program.total_sessions && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {program.total_sessions} sessions
                            </span>
                        )}
                        {program.avg_rating != null && (
                            <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-amber-500" />
                                {program.avg_rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </div>

                {/* Enrollment Progress Bar */}
                {enrollmentPercent !== null && (
                    <div className="mt-2.5">
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                    enrollmentPercent >= 90
                                        ? "bg-red-500"
                                        : enrollmentPercent >= 70
                                            ? "bg-amber-500"
                                            : "bg-emerald-500"
                                }`}
                                style={{ width: `${enrollmentPercent}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default TrainingProgramCard;
