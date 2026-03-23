import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import TrainingProgramDetailView from "@/components/collegeadmin/training_programs/TrainingProgramDetailView";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const TrainingProgramDetail = () => {
    const { programId } = useParams<{ programId: string }>();
    const [programName, setProgramName] = useState("");

    const handleProgramLoaded = useCallback((name: string) => {
        setProgramName(name);
    }, []);

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Training Programs", path: "/college/training-programs" },
        { label: programName || "Program Details", active: true },
    ], [programName]);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title={programName || "Program Details"} breadcrumbs={breadcrumbs} />
                <TrainingProgramDetailView programId={programId!} onProgramLoaded={handleProgramLoaded} />
            </div>
        </AnimatedPage>
    );
};

export default TrainingProgramDetail;
