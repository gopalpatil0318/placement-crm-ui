import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import type { User, StudentAuthContextType } from "@/types/auth";

export const StudentAuthContext = createContext<StudentAuthContextType | null>(null);

export const StudentAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from LocalStorage on mount (same as sysadmin AuthContext)
  useEffect(() => {
    const storedUser = localStorage.getItem("student_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse student user", e);
        localStorage.removeItem("student_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (collegeId: string, email: string, password: string) => {
    try {
      const response = await api.post("/student/login", { collegeId, email, password });

      const { data: userData, message } = response.data;

      if (!userData) {
        throw new Error("Invalid response: User data missing");
      }

      const newUser: User = {
        id: userData?.id || email,
        email: userData.email,
        role: "student",
        collegeId: userData.collegeId || collegeId,
        isActive: userData.isActive ?? true,
      };

      // 1. Update State
      setUser(newUser);
      localStorage.setItem("student_user", JSON.stringify(newUser));

      // 2. Success Toast
      showToast({
        type: "success",
        title: "Success",
        description: message || "Welcome back!",
      });

    } catch (error: any) {
      console.error("Student login error", error);

      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";

      // Error Toast
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
      const response = await api.post("/student/logout");

      const logoutMessage = response.data?.message || "You have been logged out successfully";

      showToast({
        type: "success",
        title: "Logged Out",
        description: logoutMessage,
      });

    } catch (error: any) {
      console.error("Student logout error", error);

      const errorMessage = error.response?.data?.message || "Logout failed on server";

      showToast({
        type: "error",
        title: "Logout Issue",
        description: errorMessage,
      });

    } finally {
      // Always clear local state, even if the server API failed
      setUser(null);
      localStorage.removeItem("student_user");
    }
  };

  return (
    <StudentAuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {!isLoading && children}
    </StudentAuthContext.Provider>
  );
};