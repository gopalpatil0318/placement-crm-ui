import { useCreateCompany } from "@/hooks/collegeadmin/company_management/useCreateCompany";
import CompanyForm from "./CompanyForm";

// ========================
// COMPONENT
// ========================

const CreateCompanyForm = () => {
    const { formData, errors, loading, handleChange, handleSubmit, handleCancel } =
        useCreateCompany();

    return (
        <CompanyForm
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

export default CreateCompanyForm;
