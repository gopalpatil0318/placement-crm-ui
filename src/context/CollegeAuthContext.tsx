import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "../lib/api";
import { showToast } from "@/utils/ToastUtils";
import { clearOtherSessions } from "@/lib/clearAllAuthSessions";
import type { User, UserRole, CollegeAuthContextType } from "../types/auth";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";

// eslint-disable-next-line react-refresh/only-export-components -- context object co-exported with provider
export const CollegeAuthContext = createContext<CollegeAuthContextType | undefined>(undefined);

const STORAGE_KEY = "college_user";

export function CollegeAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize from LocalStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser) as User);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post("/college/login", { email, password });

        const { data, message } = response.data;
        const userData = data?.user;

        if (!userData) {
            throw new Error("Invalid response: User data missing");
        }

        const newUser: User = {
            id: userData.user_id,
            email: userData.user_email,
            role: userData.user_role as UserRole,
            name: userData.user_name,
            collegeId: userData.college_id,
            collegeName: userData.college_name,
            deptId: userData.dept_id,
            defaultAcademicYear: userData.default_academic_year,
            collegeType: userData.college_type,
            departments: userData.departments,
        };

        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        clearOtherSessions("college");

        // Prefetch dashboard overview for instant dashboard load (non-blocking)
        const defaultYear = userData.default_academic_year ?? new Date().getFullYear();
        queryClient.prefetchQuery({
            queryKey: queryKeys.dashboard.overview(defaultYear),
            queryFn: async () => {
                const res = await CollegeAdminService.getDashboardOverview(defaultYear);
                return res.data;
            },
            staleTime: 5 * 60 * 1000,
        });

        showToast({
            type: "success",
            title: "Success",
            description: message || "Welcome back!",
        });
    };

    const logout = async () => {
        try {
            const response = await api.post("/college/logout");

            showToast({
                type: "success",
                title: "Logged Out",
                description: response.data?.message || "You have been logged out successfully",
            });

        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Logout failed on server";

            showToast({
                type: "error",
                title: "Logout Issue",
                description: errorMessage,
            });
        } finally {
            setUser(null);
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    return (
        <CollegeAuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {!isLoading && children}
        </CollegeAuthContext.Provider>
    );
}
