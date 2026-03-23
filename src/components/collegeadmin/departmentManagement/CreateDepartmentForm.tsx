import { useCreateDepartment } from "@/hooks/collegeadmin/departmentManagement/useCreateDepartment";
import DepartmentForm from "./DepartmentForm";

const CreateDepartmentForm = () => {
    const { formData, errors, loading, handleChange, handleSubmit, handleCancel } =
        useCreateDepartment();

    return (
        <DepartmentForm
            mode="create"
            formData={formData}
            errors={errors}
            loading={loading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
        />
    );
};

export default CreateDepartmentForm;
