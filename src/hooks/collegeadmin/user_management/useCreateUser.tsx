import { useState } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { useNavigate } from "react-router-dom";
import { userSchemaCreate } from "@/validators/UserSchemaCreate";

interface CreateUserForm {
    userName: string;
    userEmail: string;
    userPassword: string;
}

type FormErrors = Partial<CreateUserForm>;

export const useCreateUser = () => {
    const [formData, setFormData] = useState<CreateUserForm>({
        userName: "",
        userEmail: "",
        userPassword: "",
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        // 1. ZOD VALIDATION
        const result = userSchemaCreate.safeParse(formData);
        console.log(result)
        if (!result.success) {
            // Show the first validation error as a toast warning
            const firstErrorMessage = result.error.issues[0].message;

            showToast({
                type: 'warning',
                title: 'Validation Failed',
                description: firstErrorMessage,
            });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            // 2. API CALL
            const response = await CollegeAdminService.createUser({
                userName: formData.userName,
                userEmail: formData.userEmail,
                userPassword: formData.userPassword,
            });

            // 3. SUCCESS TOAST
            const successMessage = response?.message || "User created successfully";

            showToast({
                type: 'success',
                title: 'Success',
                description: successMessage,
            });

            // Reset Form
            setFormData({
                userName: "",
                userEmail: "",
                userPassword: "",
            });

            navigate("/collegeadmin/view-users")
        } catch (error: any) {
            // 4. ERROR TOAST
            showToast({
                type: 'error',
                title: 'Error Creating User',
                description: error.message || "Something went wrong, please try again",
            });

        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        errors,
        loading,
        setErrors,
        handleChange,
        handleSubmit,
    };
};
