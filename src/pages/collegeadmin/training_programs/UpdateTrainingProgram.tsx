import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import UpdateTrainingForm from "@/components/collegeadmin/training_programs/UpdateTrainingForm";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const UpdateTrainingProgram = () => {
    const { programId } = useParams<{ programId: string }>();
    const [programName, setProgramName] = useState("");

    const handleProgramLoaded = useCallback((name: string) => {
        setProgramName(name);
    }, []);

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Training Programs", path: "/college/training-programs" },
        { label: programName || "Edit", path: programId ? `/college/training-program/${programId}` : undefined },
        { label: "Edit", active: true },
    ], [programName, programId]);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title={`Edit ${programName || "Program"}`} breadcrumbs={breadcrumbs} />
                <UpdateTrainingForm programId={programId} onProgramLoaded={handleProgramLoaded} />
            </div>
        </AnimatedPage>
    );
};

export default UpdateTrainingProgram;
