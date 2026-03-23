import CreateJobForm from "@/components/collegeadmin/company_management/job_postings/CreateJobForm";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Jobs", path: "/college/jobs" },
    { label: "Create Job", active: true },
];

const CreateJob = () => (
    <AnimatedPage>
        <div className="space-y-6">
            <PageHeader title="Create New Job Posting" breadcrumbs={BREADCRUMBS} />
            <CreateJobForm />
        </div>
    </AnimatedPage>
);

export default CreateJob;
