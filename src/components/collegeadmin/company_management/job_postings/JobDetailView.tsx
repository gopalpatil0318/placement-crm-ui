import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, X } from "lucide-react";
import { useViewJob, type JobDetail } from "@/hooks/collegeadmin/company_management/job_postings/useViewJob";
import { useUpdateJobStatus } from "@/hooks/collegeadmin/company_management/job_postings/useUpdateJobStatus";
import PositionManager from "@/components/collegeadmin/company_management/job_positions/PositionManager";

// ========================
// STATUS HELPERS
// ========================

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
    published: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    closed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const getStatusActions = (status: string) => {
    switch (status) {
        case "draft":
            return [
                { label: "Publish", value: "published", cls: "bg-green-600 hover:bg-green-700 text-white" },
                { label: "Cancel", value: "cancelled", cls: "bg-red-600 hover:bg-red-700 text-white" },
            ];
        case "published":
            return [
                { label: "Close", value: "closed", cls: "bg-blue-600 hover:bg-blue-700 text-white" },
                { label: "Cancel", value: "cancelled", cls: "bg-red-600 hover:bg-red-700 text-white" },
            ];
        case "closed":
            return [
                { label: "Reopen", value: "published", cls: "bg-green-600 hover:bg-green-700 text-white" },
            ];
        default:
            return [];
    }
};

// ========================
// TAB LABELS
// ========================

const TABS = ["Info", "Positions", "Eligibility", "Rounds", "Questions"];

// ========================
// COMPONENT
// ========================

const JobDetailView = ({ jobId }: { jobId: string | undefined }) => {
    const navigate = useNavigate();
    const { job, loading, error, refresh } = useViewJob(jobId);
    const { updateStatus, loading: statusLoading } = useUpdateJobStatus(refresh);
    const [activeTab, setActiveTab] = useState(0);
    const [showConfirm, setShowConfirm] = useState<string | null>(null);

    // ========================
    // LOADING / ERROR
    // ========================

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-xl border animate-pulse">
                <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="p-8 bg-white rounded-xl border text-center">
                <p className="text-red-500 font-medium">{error || "Job not found"}</p>
                <button type="button" onClick={() => navigate("/college/jobs")} className="mt-4 text-blue-600 hover:underline font-medium">
                    ← Back to Jobs
                </button>
            </div>
        );
    }

    const badge = STATUS_BADGE[job.job_status] || STATUS_BADGE.draft;
    const statusActions = getStatusActions(job.job_status);

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => navigate("/college/jobs")} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900">{job.job_title}</h2>
                            <p className="text-sm text-slate-500 mt-1">{job.company_name} — {job.job_location}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                            {job.job_status.charAt(0).toUpperCase() + job.job_status.slice(1)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            {job.job_type}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {job.job_status !== "cancelled" && (
                            <button
                                type="button"
                                onClick={() => navigate(`/college/job/${job.job_id}/edit`)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
                            >
                                <Pencil size={16} /> Edit Job
                            </button>
                        )}
                        {statusActions.map((action) => (
                            <button
                                key={action.value}
                                type="button"
                                onClick={() => setShowConfirm(action.value)}
                                disabled={statusLoading}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 ${action.cls}`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-200 mb-6">
                    {TABS.map((tab, i) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(i)}
                            className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                                i === activeTab
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 0 && <InfoTab job={job} />}
                {activeTab === 1 && (
                    <PositionManager
                        jobId={job.job_id}
                        jobStatus={job.job_status}
                        positions={job.positions}
                        onRefresh={refresh}
                    />
                )}
                {activeTab === 2 && <EligibilityTab job={job} />}
                {activeTab === 3 && <RoundsTab job={job} />}
                {activeTab === 4 && <QuestionsTab job={job} />}
            </div>

            {/* Status Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !statusLoading && setShowConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Confirm Status Change</h2>
                            <button type="button" onClick={() => setShowConfirm(null)} disabled={statusLoading} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to change the status to <span className="font-bold">{showConfirm}</span>?
                            </p>
                            {showConfirm === "cancelled" && (
                                <p className="text-xs text-amber-600 mt-3 bg-amber-50 px-3 py-2 rounded-lg">
                                    ⚠️ Cancelling a job is permanent and cannot be undone.
                                </p>
                            )}
                        </div>
                        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setShowConfirm(null)} disabled={statusLoading} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await updateStatus(job.job_id, showConfirm);
                                    setShowConfirm(null);
                                }}
                                disabled={statusLoading}
                                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center gap-2"
                            >
                                {statusLoading && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {statusLoading ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ========================
// TAB COMPONENTS
// ========================

const InfoTab = ({ job }: { job: JobDetail }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow label="Job Title" value={job.job_title} />
            <InfoRow label="Company" value={job.company_name} />
            <InfoRow label="Location" value={job.job_location} />
            <InfoRow label="Job Type" value={job.job_type} />
            <InfoRow label="Salary Package" value={job.salary_package || "—"} />
            <InfoRow label="Salary Range" value={
                job.salary_min && job.salary_max
                    ? `₹${Number(job.salary_min).toLocaleString()} — ₹${Number(job.salary_max).toLocaleString()}`
                    : "—"
            } />
            <InfoRow label="Bond Duration" value={job.bond_duration || "—"} />
            <InfoRow label="Passout Year(s)" value={job.passout_years?.join(", ") || "—"} />
            <InfoRow label="Application Deadline" value={new Date(job.application_deadline).toLocaleString("en-IN")} />
            <InfoRow label="Created" value={new Date(job.created_at).toLocaleString("en-IN")} />
        </div>

        {job.bond_details && (
            <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Bond Details</p>
                <p className="text-sm text-gray-700">{job.bond_details}</p>
            </div>
        )}

        {job.job_description && (
            <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.job_description}</p>
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
            <div className="mt-4">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Application Stats</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <StatCard label="Total" value={job.application_stats.total} color="blue" />
                    <StatCard label="Pending" value={job.application_stats.pending} color="amber" />
                    <StatCard label="Shortlisted" value={job.application_stats.shortlisted} color="cyan" />
                    <StatCard label="Selected" value={job.application_stats.selected} color="green" />
                    <StatCard label="Rejected" value={job.application_stats.rejected} color="red" />
                </div>
            </div>
        )}
    </div>
);


const EligibilityTab = ({ job }: { job: JobDetail }) => {
    const ec = job.eligibility_criteria;
    if (!ec) {
        return <p className="text-sm text-gray-500 text-center py-8">No eligibility criteria set for this job.</p>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoRow label="Min CGPA" value={ec.min_overall_cgpa ? String(ec.min_overall_cgpa) : "—"} />
                <InfoRow label="Max Live KTs" value={ec.max_live_kts !== null ? String(ec.max_live_kts) : "—"} />
                <InfoRow label="Min 10th %" value={ec.min_tenth_percentage ? String(ec.min_tenth_percentage) : "—"} />
                <InfoRow label="Min 12th %" value={ec.min_twelfth_percentage ? String(ec.min_twelfth_percentage) : "—"} />
                <InfoRow label="Min Diploma %" value={ec.min_diploma_percentage ? String(ec.min_diploma_percentage) : "—"} />
                <InfoRow label="Exclude Already Placed" value={ec.exclude_already_placed ? "Yes" : "No"} />
            </div>

            {ec.allowed_genders && ec.allowed_genders.length > 0 && (
                <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Allowed Genders</p>
                    <div className="flex flex-wrap gap-1.5">
                        {ec.allowed_genders.map((g) => (
                            <span key={g} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">{g}</span>
                        ))}
                    </div>
                </div>
            )}

            {ec.allowed_departments && ec.allowed_departments.length > 0 && (
                <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Allowed Departments</p>
                    <div className="flex flex-wrap gap-1.5">
                        {ec.allowed_departments.map((d) => (
                            <span key={d} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">{d}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const RoundsTab = ({ job }: { job: JobDetail }) => (
    <div>
        {job.rounds.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No selection rounds defined.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">ROUND</th>
                            <th className="px-4 py-3">TYPE</th>
                            <th className="px-4 py-3">DATE</th>
                            <th className="px-4 py-3">VENUE</th>
                            <th className="px-4 py-3">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {job.rounds.map((r) => (
                            <tr key={r.round_id} className="border-b text-sm">
                                <td className="px-4 py-3 text-gray-500">{r.round_number}</td>
                                <td className="px-4 py-3 font-medium text-gray-800">{r.round_name}</td>
                                <td className="px-4 py-3">
                                    {r.round_type ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">{r.round_type}</span>
                                    ) : "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {r.round_date ? new Date(r.round_date).toLocaleDateString("en-IN") : "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{r.round_venue || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        r.round_status === "completed" ? "bg-green-100 text-green-700"
                                            : r.round_status === "in_progress" ? "bg-amber-100 text-amber-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}>
                                        {r.round_status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const QuestionsTab = ({ job }: { job: JobDetail }) => (
    <div>
        {job.questions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No application questions defined.</p>
        ) : (
            <div className="space-y-4">
                {job.questions.map((q) => (
                    <div key={q.question_id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">
                                    Q{q.question_order}. {q.question_text}
                                    {q.is_required && <span className="text-red-500 ml-1">*</span>}
                                </p>
                                {q.question_options && q.question_options.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {q.question_options.map((opt, i) => (
                                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                {opt}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600 whitespace-nowrap">
                                {q.question_type.replace("_", " ")}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ========================
// HELPERS
// ========================

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
        <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
    </div>
);

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className={`p-3 rounded-xl bg-${color}-50 border border-${color}-100 text-center`}>
        <p className={`text-xl font-bold text-${color}-700`}>{value}</p>
        <p className={`text-xs text-${color}-600 font-medium`}>{label}</p>
    </div>
);

export default JobDetailView;
