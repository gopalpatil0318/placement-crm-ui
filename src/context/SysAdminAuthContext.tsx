import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "../lib/api";
import { showToast } from "@/utils/ToastUtils";
import type { User, SysAdminAuthContextType, ApiLoginResponse } from "../types/auth";

export const SysAdminAuthContext = createContext<SysAdminAuthContextType | undefined>(undefined);

export function SysAdminAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize from LocalStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("sysadmin_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse sysadmin user", e);
                localStorage.removeItem("sysadmin_user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post<ApiLoginResponse>("/sysadmin/login", { email, password });

            const { data, message } = response.data as any;
            // Backend may nest user data inside data.user
            const userData = data?.user || data;

            if (!userData) {
                throw new Error("Invalid response: User data missing");
            }

            const newUser: User = {
                id: userData.user_id || userData.id || email,
                email: userData.user_email || userData.email,
                role: (userData.user_role || userData.role || userData.type || "sysadmin") as any,
                type: userData.user_role || userData.type,
                isActive: true,
            };

            setUser(newUser);
            localStorage.setItem("sysadmin_user", JSON.stringify(newUser));

            showToast({
                type: "success",
                title: "Success",
                description: message || "Welcome back!",
            });

        } catch (error: any) {
            console.error("SysAdmin login error", error);

            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";

            showToast({
                type: "error",
                title: "Login Failed",
                description: errorMessage,
            });

            throw error;
        }
    };

    const logout = async () => {
        try {
            const response = await api.post("/sysadmin/logout");

            const logoutMessage = response.data?.message || "You have been logged out successfully";

            showToast({
                type: "success",
                title: "Logged Out",
                description: logoutMessage,
            });

        } catch (error: any) {
            console.error("SysAdmin logout error", error);

            const errorMessage = error.response?.data?.message || "Logout failed on server";

            showToast({
                type: "error",
                title: "Logout Issue",
                description: errorMessage,
            });

        } finally {
            setUser(null);
            localStorage.removeItem("sysadmin_user");
        }
    };

    return (
        <SysAdminAuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {!isLoading && children}
        </SysAdminAuthContext.Provider>
    );
}
