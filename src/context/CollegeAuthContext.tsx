import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "../lib/api";
import { showToast } from "@/utils/ToastUtils";
import type { User, CollegeAuthContextType, ApiLoginResponse } from "../types/auth";

export const CollegeAuthContext = createContext<CollegeAuthContextType | undefined>(undefined);

export function CollegeAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize from LocalStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("college_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse college user", e);
                localStorage.removeItem("college_user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post<ApiLoginResponse>("/college/login", { email, password });

            console.log("🔍 College Login - Full response.data:", JSON.stringify(response.data, null, 2));

            const { data, message } = response.data as any;
            // Backend nests user data inside data.user
            const userData = data?.user || data;

            if (!userData) {
                throw new Error("Invalid response: User data missing");
            }

            const newUser: User = {
                id: userData.user_id || userData.id || email,
                email: userData.user_email || userData.email,
                role: (userData.user_role || userData.role || userData.type) as any,
                type: userData.user_role || userData.type,
                collegeId: userData.college_id,
                isActive: true,
            };

            setUser(newUser);
            localStorage.setItem("college_user", JSON.stringify(newUser));

            showToast({
                type: "success",
                title: "Success",
                description: message || "Welcome back!",
            });

        } catch (error: any) {
            console.error("College login error", error);

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
            const response = await api.post("/college/logout");

            const logoutMessage = response.data?.message || "You have been logged out successfully";

            showToast({
                type: "success",
                title: "Logged Out",
                description: logoutMessage,
            });

        } catch (error: any) {
            console.error("College logout error", error);

            const errorMessage = error.response?.data?.message || "Logout failed on server";

            showToast({
                type: "error",
                title: "Logout Issue",
                description: errorMessage,
            });

        } finally {
            setUser(null);
            localStorage.removeItem("college_user");
        }
    };

    return (
        <CollegeAuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {!isLoading && children}
        </CollegeAuthContext.Provider>
    );
}
