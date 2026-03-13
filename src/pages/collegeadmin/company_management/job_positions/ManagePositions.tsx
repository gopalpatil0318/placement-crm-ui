import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import PositionManager from "@/components/collegeadmin/company_management/job_positions/PositionManager";
import { useViewJob } from "@/hooks/collegeadmin/company_management/job_postings/useViewJob";
import { ArrowLeft } from "lucide-react";

const ManagePositions = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const { job, loading, error, refresh } = useViewJob(jobId);

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Jobs", path: "/college/jobs" },
        { label: job?.job_title || "Job", path: `/college/job/${jobId}` },
        { label: "Manage Positions", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Manage Positions" breadcrumbs={breadcrumbs} />

                <div className="p-8 bg-white rounded-xl border">
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-5 bg-gray-100 rounded w-1/3" />
                            <div className="h-4 bg-gray-100 rounded w-2/3" />
                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                        </div>
                    ) : error || !job ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 font-medium">{error || "Job not found"}</p>
                            <button type="button" onClick={() => navigate("/college/jobs")} className="mt-4 text-blue-600 hover:underline font-medium flex items-center gap-2 mx-auto">
                                <ArrowLeft size={16} /> Back to Jobs
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">{job.job_title}</h2>
                                <p className="text-sm text-gray-500 mt-1">{job.company_name} — {job.job_location}</p>
                            </div>
                            <PositionManager
                                jobId={job.job_id}
                                jobStatus={job.job_status}
                                positions={job.positions}
                                onRefresh={refresh}
                            />
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManagePositions;
