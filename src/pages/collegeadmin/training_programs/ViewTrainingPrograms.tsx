import TrainingProgramGrid from "@/components/collegeadmin/training_programs/TrainingProgramGrid";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Training Programs", active: true },
];

const ViewTrainingPrograms = () => {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Training Programs" breadcrumbs={BREADCRUMBS} />
                <TrainingProgramGrid />
            </div>
        </AnimatedPage>
    );
};

export default ViewTrainingPrograms;
