import { useEffect, useState, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { useNavigate } from "react-router-dom";

interface UpdateUserForm {
    userName: string;
    userEmail: string;
    userRole: string;
    deptId: string | null;
}

interface OriginalData {
    user_name: string;
    user_email: string;
    user_role: string;
    user_status: string;
    dept_id: string | null;
    dept_name: string | null;
}

interface Department {
    dept_id: string;
    dept_name: string;
}

type FormErrors = Partial<Record<keyof UpdateUserForm, string>>;

export const useUpdateUser = (userId: string) => {
    const [formData, setFormData] = useState<UpdateUserForm>({
        userName: "",
        userEmail: "",
        userRole: "",
        deptId: null,
    });

    const [originalData, setOriginalData] = useState<OriginalData | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isCollegeAdmin, setIsCollegeAdmin] = useState(false);
    const navigate = useNavigate();

    // Fetch user data + departments
    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            setFetching(true);
            try {
                const [userResponse, deptResponse] = await Promise.all([
                    CollegeAdminService.getUser(userId),
                    CollegeAdminService.getDepartments(),
                ]);

                const user = userResponse.data;

                if (user.user_role === "collegeadmin") {
                    setIsCollegeAdmin(true);
                }

                setOriginalData({
                    user_name: user.user_name || "",
                    user_email: user.user_email || "",
                    user_role: user.user_role || "",
                    user_status: user.user_status || "",
                    dept_id: user.dept_id || null,
                    dept_name: user.dept_name || null,
                });

                setFormData({
                    userName: user.user_name || "",
                    userEmail: user.user_email || "",
                    userRole: user.user_role || "",
                    deptId: user.dept_id || null,
                });

                const depts = deptResponse.data || deptResponse;
                setDepartments(Array.isArray(depts) ? depts : []);
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : "Failed to fetch user data";
                showToast({ type: "error", title: "Error", description: msg });
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value === "" && name === "deptId" ? null : value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }, []);

    const handleSubmit = useCallback(async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        if (isCollegeAdmin) {
            showToast({
                type: "error",
                title: "Not Allowed",
                description: "College admin accounts cannot be modified",
            });
            return;
        }

        // Build partial update — only send changed fields
        const changedFields: Record<string, string | null> = {};

        if (originalData) {
            if (formData.userName !== originalData.user_name) {
                changedFields.user_name = formData.userName;
            }
            if (formData.userEmail !== originalData.user_email) {
                changedFields.user_email = formData.userEmail;
            }
            if (formData.userRole !== originalData.user_role) {
                changedFields.user_role = formData.userRole;
            }
            if (formData.deptId !== originalData.dept_id) {
                changedFields.dept_id = formData.deptId;
            }
        }

        if (Object.keys(changedFields).length === 0) {
            showToast({
                type: "info",
                title: "No Changes",
                description: "No fields were modified",
            });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await CollegeAdminService.updateUser(userId, changedFields);

            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "User updated successfully",
            });

            navigate(`/college/view-users`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Something went wrong";

            showToast({
                type: "error",
                title: "Error Updating User",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [formData, originalData, userId, navigate, isCollegeAdmin]);

    const handleCancel = useCallback(() => {
        navigate("/college/view-users");
    }, [navigate]);

    return {
        formData,
        originalData,
        errors,
        loading,
        fetching,
        departments,
        isCollegeAdmin,
        setErrors,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
