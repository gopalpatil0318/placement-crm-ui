import { useCreateTrainingProgram } from "@/hooks/collegeadmin/training_programs/useCreateTrainingProgram";
import TrainingForm from "./TrainingForm";

const CreateTrainingForm = () => {
    const {
        step,
        formData,
        errors,
        loading,
        handleChange,
        handleNext,
        handleBack,
        handleSubmit,
        handleCancel,
    } = useCreateTrainingProgram();

    return (
        <TrainingForm
            mode="create"
            step={step}
            formData={formData}
            errors={errors}
            loading={loading}
            handleChange={handleChange}
            handleNext={handleNext}
            handleBack={handleBack}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
        />
    );
};

export default CreateTrainingForm;
