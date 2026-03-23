import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/collegeadmin/PageHeader";
import UpdateJobForm from "@/components/collegeadmin/company_management/job_postings/UpdateJobForm";
import AnimatedPage from "@/components/ui/AnimatedPage";

const UpdateJob = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const [jobTitle, setJobTitle] = useState("");

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Jobs", path: "/college/jobs" },
            { label: jobTitle ? `Edit ${jobTitle}` : "Edit Job", active: true },
        ],
        [jobTitle]
    );

    const handleItemLoaded = useCallback((title: string) => setJobTitle(title), []);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Edit Job Posting" breadcrumbs={breadcrumbs} />
                <UpdateJobForm jobId={jobId} onItemLoaded={handleItemLoaded} />
            </div>
        </AnimatedPage>
    );
};

export default UpdateJob;
