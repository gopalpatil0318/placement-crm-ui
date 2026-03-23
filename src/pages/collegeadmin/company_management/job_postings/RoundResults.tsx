import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/collegeadmin/PageHeader";
import RoundResultsManager from "@/components/collegeadmin/company_management/round_results/RoundResultsManager";
import AnimatedPage from "@/components/ui/AnimatedPage";

const RoundResults = () => {
    const { jobId, roundId } = useParams<{ jobId: string; roundId: string }>();
    const [roundName, setRoundName] = useState("");
    const [jobTitle, setJobTitle] = useState("");

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Jobs", path: "/college/jobs" },
            { label: jobTitle || "Job", path: `/college/job/${jobId}` },
            { label: roundName ? `${roundName} Results` : "Round Results", active: true },
        ],
        [jobId, jobTitle, roundName],
    );

    const handleResultLoaded = useCallback(
        (rName: string, jTitle: string) => {
            setRoundName(rName);
            setJobTitle(jTitle);
        },
        [],
    );

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Round Results" breadcrumbs={breadcrumbs} />
                <RoundResultsManager
                    roundId={roundId!}
                    jobId={jobId!}
                    onResultLoaded={handleResultLoaded}
                />
            </div>
        </AnimatedPage>
    );
};

export default RoundResults;
