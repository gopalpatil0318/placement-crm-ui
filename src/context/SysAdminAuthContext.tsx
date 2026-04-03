import { createContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import api from "../lib/api";
import { showToast } from "@/utils/ToastUtils";
import { clearOtherSessions } from "@/lib/clearAllAuthSessions";
import { queryClient } from "@/lib/queryClient";
import type { User, UserRole, SysAdminAuthContextType } from "../types/auth";

// eslint-disable-next-line react-refresh/only-export-components -- context object co-exported with provider
export const SysAdminAuthContext = createContext<SysAdminAuthContextType | undefined>(undefined);

const STORAGE_KEY = "sysadmin_user";

export function SysAdminAuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await api.post("/sysadmin/login", { email, password });

            const responseData = response.data;
            const userData = responseData.data;

            if (!userData) {
                throw new Error("Invalid response: User data missing");
            }

            const newUser: User = {
                id: email,
                email: userData.email || email,
                role: (userData.role || "sysadmin") as UserRole,
            };

            setUser(newUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
            clearOtherSessions("sysadmin");

            showToast({
                type: "success",
                title: "Success",
                description: responseData.message || "Welcome back!",
            });

        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : "An unexpected error occurred";

            showToast({
                type: "error",
                title: "Login Failed",
                description: errorMessage,
            });

            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const response = await api.post("/sysadmin/logout");

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
            queryClient.clear();
            setUser(null);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const contextValue = useMemo(() => ({
        user, isAuthenticated: !!user, isLoading, login, logout,
    }), [user, isLoading, login, logout]);

    return (
        <SysAdminAuthContext.Provider value={contextValue}>
            {!isLoading && children}
        </SysAdminAuthContext.Provider>
    );
}
