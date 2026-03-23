import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/collegeadmin/PageHeader";
import ApplicationDetailView from "@/components/collegeadmin/company_management/applications/ApplicationDetailView";
import AnimatedPage from "@/components/ui/AnimatedPage";

const ApplicationDetail = () => {
    const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
    const [studentName, setStudentName] = useState("");
    const [jobTitle, setJobTitle] = useState("");

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Jobs", path: "/college/jobs" },
            { label: jobTitle || "Job", path: `/college/job/${jobId}` },
            { label: studentName || "Application", active: true },
        ],
        [jobTitle, jobId, studentName],
    );

    const handleApplicationLoaded = useCallback((name: string, title: string) => {
        setStudentName(name);
        setJobTitle(title);
    }, []);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Application Details" breadcrumbs={breadcrumbs} />
                <ApplicationDetailView
                    applicationId={applicationId!}
                    jobId={jobId!}
                    onApplicationLoaded={handleApplicationLoaded}
                />
            </div>
        </AnimatedPage>
    );
};

export default ApplicationDetail;
