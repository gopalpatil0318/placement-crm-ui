import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import JobDetailView from "@/components/collegeadmin/company_management/job_postings/JobDetailView";

const JobDetail = () => {
    const { jobId } = useParams<{ jobId: string }>();

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Jobs", path: "/college/jobs" },
        { label: "Job Detail", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Job Details" breadcrumbs={breadcrumbs} />
                <JobDetailView jobId={jobId} />
            </div>
        </DashboardLayout>
    );
};

export default JobDetail;
