import { useParams } from "react-router-dom";
import UpdateJobForm from "@/components/collegeadmin/company_management/job_postings/UpdateJobForm";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";

const UpdateJob = () => {
    const { jobId } = useParams<{ jobId: string }>();

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Jobs", path: "/college/jobs" },
        { label: "Update Job", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Update Job Posting" breadcrumbs={breadcrumbs} />
                <UpdateJobForm jobId={jobId} />
            </div>
        </DashboardLayout>
    );
};

export default UpdateJob;
