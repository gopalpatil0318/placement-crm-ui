import { useParams } from "react-router-dom";
import CreateJobForm from "@/components/collegeadmin/company_management/job_postings/CreateJobForm";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";

const CreateJob = () => {
    const { companyId } = useParams<{ companyId: string }>();

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Companies", path: "/college/companies" },
        { label: "Jobs", path: "/college/jobs" },
        { label: "Create Job", active: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Create New Job Posting" breadcrumbs={breadcrumbs} />
                <CreateJobForm companyId={companyId} />
            </div>
        </DashboardLayout>
    );
};

export default CreateJob;
