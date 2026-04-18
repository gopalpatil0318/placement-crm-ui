import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle, ArrowLeft, Award, BookOpen, CheckCircle,
    IndianRupee, Loader2, TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import {
    ENROLLMENT_STATUS_LABELS,
    ENROLLMENT_STATUS_COLORS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS,
    PROGRAM_TYPE_LABELS,
    type StudentTrainingReport as ReportType,
} from "@/validators/TrainingProgramSchema";

// ========================
// HELPERS
// ========================

const fmt = new Intl.NumberFormat("en-IN");

function formatDate(d: string | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

// ========================
// COMPONENT
// ========================

const StudentTrainingReportPage = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const sid = studentId ?? "";

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: queryKeys.trainingPrograms.studentReport(sid),
        queryFn: () => CollegeAdminService.getStudentTrainingReport(sid),
        enabled: !!studentId,
        staleTime: 30_000,
    });

    const report: ReportType | null = data?.data ?? null;

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Students", path: "/college/students" },
            { label: report?.student?.student_name ?? "Student", path: `/college/student/${studentId}` },
            { label: "Training Report", active: true },
        ],
        [report, studentId],
    );

    if (isLoading) {
        return (
            <AnimatedPage>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </AnimatedPage>
        );
    }

    if (isError || !report) {
        return (
            <AnimatedPage>
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Failed to load training report</p>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                            <ArrowLeft className="h-4 w-4" /> Go Back
                        </button>
                        <button type="button" onClick={() => refetch()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">Retry</button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    const { student, enrollments, summary } = report;

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title={`${student.student_name} — Training Report`}
                    breadcrumbs={breadcrumbs}
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard
                        icon={<BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                        label="Total Enrollments"
                        value={String(summary.total_enrollments)}
                        color="blue"
                    />
                    <SummaryCard
                        icon={<CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        label="Completed"
                        value={String(summary.completed)}
                        color="emerald"
                    />
                    <SummaryCard
                        icon={<Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                        label="Certificates"
                        value={String(summary.certificates_earned)}
                        color="purple"
                    />
                    <SummaryCard
                        icon={<TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
                        label="Avg Completion"
                        value={`${Math.round(summary.avg_completion_percentage)}%`}
                        color="cyan"
                    />
                </div>

                {/* Payment Summary */}
                {summary.total_amount_paid > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm">
                        <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            Total Paid: ₹{fmt.format(summary.total_amount_paid)}
                        </span>
                    </div>
                )}

                {/* Enrollments Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-3">Program</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Completion</th>
                                    <th className="px-4 py-3 text-right">Attendance</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Certificate</th>
                                    <th className="px-4 py-3">Enrolled</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {enrollments.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            No training enrollments found
                                        </td>
                                    </tr>
                                )}
                                {enrollments.map((e) => {
                                    const statusColor = ENROLLMENT_STATUS_COLORS[e.completion_status];
                                    const payColor = PAYMENT_STATUS_COLORS[e.payment_status];
                                    return (
                                        <tr key={e.enrollment_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/college/training-program/${e.program_id}`)}
                                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline text-left"
                                                >
                                                    {e.program_name}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                                {PROGRAM_TYPE_LABELS[e.program_type] ?? e.program_type}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor?.bg ?? ""} ${statusColor?.text ?? ""}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${statusColor?.dot ?? ""}`} />
                                                    {ENROLLMENT_STATUS_LABELS[e.completion_status] ?? e.completion_status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {Math.round(e.completion_percentage)}%
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {e.attendance_percentage == null ? "—" : `${Math.round(e.attendance_percentage)}%`}
                                            </td>
                                            <td className="px-4 py-3">
                                                {e.payment_status !== "not_applicable" && (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${payColor?.bg ?? ""} ${payColor?.text ?? ""}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${payColor?.dot ?? ""}`} />
                                                        {PAYMENT_STATUS_LABELS[e.payment_status] ?? e.payment_status}
                                                        {e.amount_paid > 0 && ` · ₹${fmt.format(e.amount_paid)}`}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                                {e.certificate_issued ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                        <Award className="h-3.5 w-3.5" /> Issued
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(e.enrolled_at)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

// ========================
// SUMMARY CARD
// ========================

const SummaryCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => {
    const borderMap: Record<string, string> = {
        blue: "border-blue-200 dark:border-blue-800",
        emerald: "border-emerald-200 dark:border-emerald-800",
        purple: "border-purple-200 dark:border-purple-800",
        cyan: "border-cyan-200 dark:border-cyan-800",
    };
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-xl border ${borderMap[color] ?? "border-gray-200 dark:border-gray-800"} p-4`}>
            <div className="flex items-center gap-3">
                {icon}
                <div>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
            </div>
        </div>
    );
};

export default StudentTrainingReportPage;
