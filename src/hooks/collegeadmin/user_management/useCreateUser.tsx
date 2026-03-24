import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
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
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<FormErrors>({});

    // Fetch departments for dropdown via React Query
    const { data: deptData, isLoading: fetchingDepts } = useQuery({
        queryKey: queryKeys.departments.all({ status: "active" }),
        queryFn: () => CollegeAdminService.getDepartments({ is_active: true }),
    });

    const depts = deptData?.data || deptData;
    const departments: Department[] = Array.isArray(depts) ? depts : [];

    // Create mutation
    const mutation = useMutation({
        mutationFn: (payload: {
            user_name: string;
            user_email: string;
            user_password: string;
            user_role: string;
            dept_id: string | null;
        }) => CollegeAdminService.createUser(payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "User created successfully",
            });
            navigate("/college/view-users");
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong, please try again";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ userEmail: message });
            }

            showToast({
                type: "error",
                title: "Error Creating User",
                description: message,
            });
        },
    });

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value === "" && name === "deptId" ? null : value }));
        setErrors((prev) => {
            if (!prev[name as keyof CreateUserForm]) return prev;
            return { ...prev, [name]: undefined };
        });
    }, []);

    const handleSubmit = useCallback(async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        // ZOD VALIDATION
        const result = userSchemaCreate.safeParse(formData);

        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof CreateUserForm;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);

            showToast({
                type: "warning",
                title: "Validation Failed",
                description: result.error.issues[0].message,
            });
            return;
        }

        setErrors({});

        mutation.mutate({
            user_name: formData.userName.trim(),
            user_email: formData.userEmail.trim(),
            user_password: formData.userPassword,
            user_role: formData.userRole,
            dept_id: formData.deptId || null,
        });
    }, [formData, mutation]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        departments,
        fetchingDepts,
        setErrors,
        handleChange,
        handleSubmit,
    };
};
