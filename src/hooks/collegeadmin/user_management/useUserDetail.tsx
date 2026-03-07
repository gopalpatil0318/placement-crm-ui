import { useState, useEffect, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

export interface UserDetail {
    user_id: string;
    user_name: string;
    user_email: string;
    user_role: string;
    user_status: string;
    dept_id: string | null;
    dept_name: string | null;
    college_id: string;
    college_name: string;
    created_at: string;
    updated_at: string;
}

export const useUserDetail = (userId: string) => {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await CollegeAdminService.getUser(userId);
            setUser(response.data || response);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to fetch user details";
            setError(msg);
            showToast({ type: "error", title: "Error", description: msg });
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return { user, loading, error, refresh: fetchUser };
};
