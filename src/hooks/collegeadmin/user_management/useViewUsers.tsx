import { useState, useEffect, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

export interface User {
    user_id: string;
    user_name: string;
    user_email: string;
    user_role: string;
    user_status: string;
    user_phone?: string;
}

export const useViewUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);



        try {
            const apiData = await CollegeAdminService.getUsers();
            setUsers(apiData);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to fetch users";

            setError(errorMessage);

            showToast({
                type: "error",
                title: "Fetch Error",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        loading,
        error,
        refresh: fetchUsers,
    };
};
