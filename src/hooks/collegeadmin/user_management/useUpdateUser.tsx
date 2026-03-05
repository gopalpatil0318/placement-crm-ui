import { useEffect, useState } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { userSchemaUpdate } from "@/validators/UserSchemaUpdate";

interface UpdateUserForm {
    userName: string;
    userEmail: string;
    userRole: string;
    userStatus: string;

}

type FormErrors = Partial<UpdateUserForm>;

export const useUpdateUser = (userId: string) => {
    const [formData, setFormData] = useState<UpdateUserForm>({
        userName: "",
        userEmail: "",
        userRole: "",
        userStatus:""
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // ==============================
    // FETCH USER (PRELOAD DATA)
    // ==============================
    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            setFetching(true);
            try {
                const user = await CollegeAdminService.getUser(userId);

                setFormData({
                    userName: user?.user_name || "",
                    userEmail: user?.user_email || "",
                    userRole: user?.user_role || "",
                    userStatus: user?.user_status || "",

                });
            } catch (error: any) {
                showToast({
                    type: "error",
                    title: "Error",
                    description: error.message || "Failed to fetch user data",
                });
            } finally {
                setFetching(false);
            }
        };

        fetchUser();
    }, [userId]);

    // ==============================
    // HANDLE INPUT CHANGE
    // ==============================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ==============================
    // HANDLE UPDATE SUBMIT
    // ==============================
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        // ZOD VALIDATION
        const result = userSchemaUpdate.safeParse(formData);

        if (!result.success) {
            const firstErrorMessage = result.error.issues[0].message;

            showToast({
                type: "warning",
                title: "Validation Failed",
                description: firstErrorMessage,
            });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await CollegeAdminService.updateUser(userId, {
                userName: formData.userName,
                userEmail: formData.userEmail,
                userRole: formData.userRole,
                userStatus: formData.userStatus,
            });

            const successMessage =
                response?.message || "User updated successfully";

            showToast({
                type: "success",
                title: "Success",
                description: successMessage,
            });
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error Updating User",
                description: error.message || "Something went wrong",
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        errors,
        loading,
        fetching,
        setErrors,
        handleChange,
        handleSubmit,
    };
};
