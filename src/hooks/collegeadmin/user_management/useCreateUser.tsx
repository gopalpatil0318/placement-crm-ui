import { useState, useEffect, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { useNavigate } from "react-router-dom";
import { userSchemaCreate } from "@/validators/UserSchemaCreate";

interface CreateUserForm {
    userName: string;
    userEmail: string;
    userPassword: string;
    userRole: string;
    deptId: string | null;
}

interface Department {
    dept_id: string;
    dept_name: string;
}

type FormErrors = Partial<Record<keyof CreateUserForm, string>>;

export const useCreateUser = () => {
    const [formData, setFormData] = useState<CreateUserForm>({
        userName: "",
        userEmail: "",
        userPassword: "",
        userRole: "",
        deptId: null,
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [fetchingDepts, setFetchingDepts] = useState(false);

    // Fetch departments for dropdown
    useEffect(() => {
        const fetchDepartments = async () => {
            setFetchingDepts(true);
            try {
                const response = await CollegeAdminService.getDepartments();
                const depts = response.data || response;
                setDepartments(Array.isArray(depts) ? depts : []);
            } catch {
                // Silently handle — dropdown will be empty
            } finally {
                setFetchingDepts(false);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value === "" && name === "deptId" ? null : value }));
        // Clear error for this field
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }, []);

    const handleSubmit = useCallback(async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        // ZOD VALIDATION
        const result = userSchemaCreate.safeParse(formData);

        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof CreateUserForm;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });
            setErrors(fieldErrors);

            showToast({
                type: "warning",
                title: "Validation Failed",
                description: result.error.issues[0].message,
            });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await CollegeAdminService.createUser({
                user_name: formData.userName,
                user_email: formData.userEmail,
                user_password: formData.userPassword,
                user_role: formData.userRole,
                dept_id: formData.deptId || null,
            });

            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "User created successfully",
            });

            navigate("/college/view-users");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Something went wrong, please try again";

            showToast({
                type: "error",
                title: "Error Creating User",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [formData, navigate]);

    return {
        formData,
        errors,
        loading,
        departments,
        fetchingDepts,
        setErrors,
        handleChange,
        handleSubmit,
    };
};
