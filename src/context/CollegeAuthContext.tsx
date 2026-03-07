import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "../lib/api";
import { showToast } from "@/utils/ToastUtils";
import type { User, UserRole, CollegeAuthContextType } from "../types/auth";

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
        };

        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

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
