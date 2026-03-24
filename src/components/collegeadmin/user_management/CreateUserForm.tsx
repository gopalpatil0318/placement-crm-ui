import { useCreateUser } from "@/hooks/collegeadmin/user_management/useCreateUser";
import { useNavigate } from "react-router-dom";
import UserForm from "./UserForm";

const CreateUserForm = () => {
    const { formData, errors, loading, departments, fetchingDepts, handleChange, handleSubmit } =
        useCreateUser();
    const navigate = useNavigate();

    return (
        <UserForm
            mode="create"
            formData={formData}
            errors={errors}
            loading={loading}
            departments={departments}
            fetchingDepts={fetchingDepts}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleCancel={() => navigate("/college/view-users")}
        />
    );
};

export default CreateUserForm;
