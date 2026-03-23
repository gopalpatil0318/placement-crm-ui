import CreateTrainingForm from "@/components/collegeadmin/training_programs/CreateTrainingForm";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Training Programs", path: "/college/training-programs" },
    { label: "Create New", active: true },
];

const CreateTrainingProgram = () => {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Create Training Program" breadcrumbs={BREADCRUMBS} />
                <CreateTrainingForm />
            </div>
        </AnimatedPage>
    );
};

export default CreateTrainingProgram;
