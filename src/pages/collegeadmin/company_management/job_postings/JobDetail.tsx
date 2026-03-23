import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/collegeadmin/PageHeader";
import JobDetailView from "@/components/collegeadmin/company_management/job_postings/JobDetailView";
import AnimatedPage from "@/components/ui/AnimatedPage";

const JobDetail = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const [jobTitle, setJobTitle] = useState("");

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Jobs", path: "/college/jobs" },
            { label: jobTitle || "Job Detail", active: true },
        ],
        [jobTitle]
    );

    const handleJobLoaded = useCallback((title: string) => setJobTitle(title), []);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Job Details" breadcrumbs={breadcrumbs} />
                <JobDetailView jobId={jobId} onJobLoaded={handleJobLoaded} />
            </div>
        </AnimatedPage>
    );
};

export default JobDetail;
