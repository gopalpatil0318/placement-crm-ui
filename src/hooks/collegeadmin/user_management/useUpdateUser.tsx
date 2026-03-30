import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
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
    const [isCollegeAdmin, setIsCollegeAdmin] = useState(false);
    const [fetchedUserName, setFetchedUserName] = useState<string | undefined>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ── Fetch user data via React Query ──
    const { data: userData, isLoading: fetchingUser } = useQuery({
        queryKey: queryKeys.users.detail(userId!),
        queryFn: async () => {
            const response = await CollegeAdminService.getUser(userId);
            return response.data || response;
        },
        enabled: !!userId,
    });

    // ── Fetch departments via React Query ──
    const { data: deptData, isLoading: fetchingDepts } = useQuery({
        queryKey: queryKeys.departments.all({ status: "active" }),
        queryFn: () => CollegeAdminService.getDepartments({ is_active: true }),
    });

    const depts = deptData?.data || deptData;
    const departments: Department[] = Array.isArray(depts) ? depts : [];

    const fetchError = fetchingUser ? null : (!userData && userId ? "User not found" : null);

    // ── Sync fetched user data into form state ──
    useEffect(() => {
        if (!userData) return;
        const user = userData;

        // eslint-disable-next-line react-hooks/set-state-in-effect -- data prefill from query
        setFetchedUserName(user.user_name || "User");

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
    }, [userData]);

    const fetching = fetchingUser || fetchingDepts;

    // ── Update mutation ──
    const mutation = useMutation({
        mutationFn: (payload: Record<string, string | null>) =>
            CollegeAdminService.updateUser(userId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "User updated successfully",
            });
            navigate("/college/view-users");
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ userEmail: message });
            }

            showToast({
                type: "error",
                title: "Error Updating User",
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
            if (!prev[name as keyof UpdateUserForm]) return prev;
            return { ...prev, [name]: undefined };
        });
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
        const orig = originalData;
        const changedFields: Record<string, string | null> = {};

        if (orig) {
            if (formData.userName.trim() !== orig.user_name.trim()) {
                changedFields.user_name = formData.userName.trim();
            }
            if (formData.userEmail.trim() !== orig.user_email.trim()) {
                changedFields.user_email = formData.userEmail.trim();
            }
            if (formData.userRole !== orig.user_role) {
                changedFields.user_role = formData.userRole;
            }
            if (formData.deptId !== orig.dept_id) {
                changedFields.dept_id = formData.deptId;
            }
        }

        if (Object.keys(changedFields).length === 0) {
            showToast({
                type: "warning",
                title: "No Changes",
                description: "Nothing has been changed.",
            });
            return;
        }

        setErrors({});
        mutation.mutate(changedFields);
    }, [formData, originalData, isCollegeAdmin, mutation]);

    const handleCancel = useCallback(() => {
        navigate("/college/view-users");
    }, [navigate]);

    return {
        formData,
        originalData,
        errors,
        loading: mutation.isPending,
        fetching,
        fetchError,
        fetchedUserName,
        departments,
        isCollegeAdmin,
        setErrors,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
