import { useEffect } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Users,
    ArrowUpDown,
    Edit2,
    ExternalLink,
    Star,
    Award,
} from "lucide-react";
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList";
import { useViewEnrollments, type Enrollment } from "@/hooks/collegeadmin/training_programs/useViewEnrollments";
import {
    ENROLLMENT_STATUS_OPTIONS,
    ENROLLMENT_STATUS_LABELS,
    ENROLLMENT_STATUS_COLORS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS,
    type EnrollmentStatus,
    type PaymentStatus,
} from "@/validators/TrainingProgramSchema";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ========================
// COMPONENT
// ========================

interface EnrollmentTableProps {
    programId: string;
    onEditEnrollment: (enrollment: Enrollment, totalSessions?: number) => void;
    onProgramLoaded?: (name: string, totalSessions?: number) => void;
    selectedIds?: Set<string>;
    onToggleId?: (id: string) => void;
    onToggleAll?: (ids: string[]) => void;
}

const EnrollmentTable = ({ programId, onEditEnrollment, onProgramLoaded, selectedIds, onToggleId, onToggleAll }: Readonly<EnrollmentTableProps>) => {
    const {
        enrollments,
        summary,
        program,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleStatusFilterChange,
        handleSortFieldChange,
        handleSortOrderToggle,
        handleLimitChange,
    } = useViewEnrollments(programId);

    const totalSessions = program?.total_sessions ?? 0;

    // Notify parent of program name for breadcrumbs
    useEffect(() => {
        if (program?.program_name && onProgramLoaded) {
            onProgramLoaded(program.program_name, program.total_sessions);
        }
    }, [program?.program_name, program?.total_sessions, onProgramLoaded]);

    // ── Status Tabs with counts ──
    const statusTabs = [
        { value: "", label: "All", count: summary?.total_enrolled ?? 0 },
        ...ENROLLMENT_STATUS_OPTIONS.map((s) => ({
            value: s,
            label: ENROLLMENT_STATUS_LABELS[s],
            count: summary ? (summary[`${s}_count` as keyof typeof summary] as number) ?? 0 : 0,
        })),
    ];

    const completionColor = (pct: number) => {
        if (pct >= 80) return "bg-emerald-500";
        if (pct >= 50) return "bg-amber-500";
        return "bg-red-500";
    };

    return (
        <div className="space-y-5">
            {/* ── Summary Bar ── */}
            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <SummaryCard label="Total Enrolled" value={summary.total_enrolled} />
                    {summary.avg_completion != null && (
                        <SummaryCard label="Avg Completion" value={`${summary.avg_completion.toFixed(1)}%`} />
                    )}
                    {summary.avg_sessions != null && (
                        <SummaryCard label="Avg Sessions" value={summary.avg_sessions.toFixed(1)} />
                    )}
                    {summary.avg_rating != null && (
                        <SummaryCard label="Avg Rating" value={summary.avg_rating.toFixed(1)} Icon={Star} iconClassName="h-3.5 w-3.5 text-amber-500" />
                    )}
                    <SummaryCard label="Completed" value={summary.completed_count} />
                </div>
            )}

            {/* ── Status Tabs ── */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {statusTabs.map((tab) => (
                    <button
                        type="button"
                        key={tab.value}
                        onClick={() => handleStatusFilterChange(tab.value)}
                        className={`px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${statusFilter === tab.value
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                    >
                        {tab.label}
                        <span className={`text-[10px] ${statusFilter === tab.value ? "text-blue-200" : "text-gray-400 dark:text-gray-500"}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Search + Sort ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        aria-label="Search students"
                        maxLength={100}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortFieldChange(e.target.value)}
                        aria-label="Sort by field"
                        className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        <option value="enrolled_at">Date Enrolled</option>
                        <option value="student_name">Name</option>
                        <option value="sessions_attended">Sessions</option>
                        <option value="completion_percentage">Completion</option>
                        <option value="student_rating">Rating</option>
                    </select>
                    <button
                        type="button"
                        onClick={handleSortOrderToggle}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        title={sortOrder === "asc" ? "Ascending" : "Descending"}
                        aria-label={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
                    >
                        <ArrowUpDown className="h-4 w-4" />
                    </button>
                </div>

                {/* Show entries */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <span>Show</span>
                    <select
                        value={pagination.limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        aria-label="Page size"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Loading Skeleton ── */}
            {loading && enrollments.length === 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={`enrollment-skeleton-${String(i)}`} className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
                                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                                <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty State ── */}
            {!loading && enrollments.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Users className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No enrollments found</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {search || statusFilter ? "Try adjusting your search or filters" : "Students haven't enrolled yet"}
                    </p>
                </div>
            )}

            {/* ── Table (desktop) ── */}
            {enrollments.length > 0 && (
                <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    {onToggleAll && (
                                        <th scope="col" className="w-10 px-3 py-3">
                                            <input
                                                type="checkbox"
                                                checked={enrollments.length > 0 && enrollments.every((e) => selectedIds?.has(e.enrollment_id))}
                                                onChange={() => onToggleAll(enrollments.map((e) => e.enrollment_id))}
                                                aria-label="Select all enrollments"
                                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500/30"
                                            />
                                        </th>
                                    )}
                                    <th scope="col" className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                    <th scope="col" className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                                    <th scope="col" className="text-center px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sessions</th>
                                    <th scope="col" className="text-center px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion</th>
                                    <th scope="col" className="text-center px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="text-center px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                                    <th scope="col" className="text-center px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Certificate</th>
                                    <th scope="col" className="text-center px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                                    <th scope="col" className="text-right px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <AnimatedTableBody>
                                {enrollments.map((enrollment) => {
                                    const statusColors = ENROLLMENT_STATUS_COLORS[enrollment.completion_status as EnrollmentStatus];
                                    const statusLabel = ENROLLMENT_STATUS_LABELS[enrollment.completion_status as EnrollmentStatus] ?? enrollment.completion_status;
                                    return (
                                        <AnimatedRow key={enrollment.enrollment_id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            {onToggleId && (
                                                <td className="w-10 px-3 py-3.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds?.has(enrollment.enrollment_id) ?? false}
                                                        onChange={() => onToggleId(enrollment.enrollment_id)}
                                                        aria-label={`Select ${enrollment.student_name}`}
                                                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500/30"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-5 py-3.5">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{enrollment.student_name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{enrollment.student_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">{enrollment.dept_name}</span>
                                                <br />
                                                <span className="text-[11px] text-gray-400 dark:text-gray-500">Batch {enrollment.passout_year}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {enrollment.sessions_attended}{totalSessions ? ` / ${totalSessions}` : ""}
                                                </span>
                                                {totalSessions > 0 && (
                                                    <div className="mt-1 h-1 w-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-blue-500"
                                                            style={{ width: `${Math.min((enrollment.sessions_attended / totalSessions) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    {enrollment.completion_percentage}%
                                                </span>
                                                <div className="mt-1 h-1 w-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${completionColor(enrollment.completion_percentage)}`}
                                                        style={{ width: `${Math.min(enrollment.completion_percentage, 100)}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {statusColors && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColors.bg} ${statusColors.text}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                                                        {statusLabel}
                                                    </span>
                                                )}
                                            </td>
                                            {/* Payment */}
                                            <td className="px-5 py-3.5 text-center">
                                                {(() => {
                                                    const ps = enrollment.payment_status as PaymentStatus | undefined;
                                                    if (!ps || ps === "not_applicable") {
                                                        return <span className="text-xs text-gray-400 dark:text-gray-500">—</span>;
                                                    }
                                                    const pc = PAYMENT_STATUS_COLORS[ps];
                                                    return (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${pc.bg} ${pc.text}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                                                            {PAYMENT_STATUS_LABELS[ps]}
                                                            {enrollment.amount_paid > 0 && ` ₹${enrollment.amount_paid}`}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {!enrollment.certificate_issued && (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                                )}
                                                {enrollment.certificate_issued && enrollment.certificate_url && (
                                                    <a
                                                        href={enrollment.certificate_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        <Award className="h-3.5 w-3.5" /> View
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                                {enrollment.certificate_issued && !enrollment.certificate_url && (
                                                    <Award className="h-4 w-4 text-emerald-500 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {enrollment.student_rating == null ? (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                                                        <Star className="h-3 w-3 text-amber-500" />
                                                        {enrollment.student_rating}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => onEditEnrollment(enrollment, totalSessions || undefined)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" /> Update
                                                </button>
                                            </td>
                                        </AnimatedRow>
                                    );
                                })}
                            </AnimatedTableBody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Mobile Cards ── */}
            {enrollments.length > 0 && (
                <div className="md:hidden space-y-3">
                    {enrollments.map((enrollment) => {
                        const statusColors = ENROLLMENT_STATUS_COLORS[enrollment.completion_status as EnrollmentStatus];
                        const statusLabel = ENROLLMENT_STATUS_LABELS[enrollment.completion_status as EnrollmentStatus] ?? enrollment.completion_status;
                        return (
                            <div key={`mobile-${enrollment.enrollment_id}`} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{enrollment.student_name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{enrollment.dept_name} · Batch {enrollment.passout_year}</p>
                                    </div>
                                    {statusColors && (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColors.bg} ${statusColors.text}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                                            {statusLabel}
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Sessions</p>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{enrollment.sessions_attended}{totalSessions ? ` / ${totalSessions}` : ""}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Completion</p>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{enrollment.completion_percentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Rating</p>
                                        <p className="text-xs text-gray-700 dark:text-gray-300">
                                            {enrollment.student_rating == null ? (
                                                "—"
                                            ) : (
                                                <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{enrollment.student_rating}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onEditEnrollment(enrollment, totalSessions || undefined)}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    <Edit2 className="h-3.5 w-3.5" /> Update Enrollment
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Pagination ── */}
            {!loading && enrollments.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                        Showing{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {enrollments.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
                        </span>
                        {" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>
                        {" of "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span>
                    </span>

                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        loading={loading}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

// ========================
// SUB-COMPONENTS
// ========================

const Pagination = ({
    page,
    totalPages,
    loading,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    loading: boolean;
    onPageChange: (p: number) => void;
}) => {
    if (totalPages <= 1) return null;

    const pages: (number | "ellipsis")[] = [];
    const addPage = (p: number) => {
        if (!pages.includes(p)) pages.push(p);
    };

    addPage(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        addPage(i);
    }
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) addPage(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((p, idx) => {
                if (p === "ellipsis") {
                    return (
                        <span key={idx === 1 ? "ellipsis-start" : "ellipsis-end"} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">
                            ...
                        </span>
                    );
                }
                return (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        aria-label={`Go to page ${String(p)}`}
                        aria-current={p === page ? "page" : undefined}
                        className={`min-w-[44px] min-h-[44px] rounded-md text-sm font-medium transition ${p === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            } disabled:cursor-not-allowed`}
                    >
                        {p}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

interface SummaryCardProps {
    label: string;
    value: string | number;
    Icon?: React.ComponentType<{ className?: string }>;
    iconClassName?: string;
}

const SummaryCard = ({ label, value, Icon, iconClassName }: Readonly<SummaryCardProps>) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1 mb-0.5">
            {Icon && <Icon className={iconClassName} />}
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</span>
        </div>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
    </div>
);

export default EnrollmentTable;
