import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "../lib/api";
import { showToast } from "@/utils/ToastUtils";
import type { User, AuthContextType, ApiLoginResponse } from "../types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<ApiLoginResponse>("/auth/login", { email, password });
      
      // Destructure 'data' (the user object) and 'message' (success text) from the API body
      const { data: userData, message } = response.data;

      if (!userData) {
        throw new Error("Invalid response: User data missing");
      }

      const newUser: User = {
        id: userData?.id || email,
        email: userData.email,
        role: (userData.role || userData.type) as any,
        type: userData.type,
        isActive: true,
      };

      // 1. Update State
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      // 2. Success Toast
      showToast({
        type: "success",
        title: "success",
        description: message || "Welcome back!", // Fallback if message is empty
      });

    } catch (error: any) {
      console.error("Login error", error);

      // Extract error message safely from Axios response or generic error
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";

      // 3. Error Toast
      showToast({
        type: "error",
        title: "Login Failed",
        description: errorMessage,
      });

      // Rethrow so the UI component (Login form) knows to stop loading state
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await api.post("/auth/logout");
      
      // 1. Success Toast for Logout
      // Using optional chaining incase response structure differs slightly
      const logoutMessage = response.data?.message || "You have been logged out successfully";
      
      showToast({
        type: "success",
        title: "Logged Out",
        description: logoutMessage,
      });

    } catch (error: any) {
      console.error("Logout error", error);
      
      const errorMessage = error.response?.data?.message || "Logout failed on server";

      // 2. Error Toast (Optional: You might not want to show an error if you clear the session anyway)
      showToast({
        type: "error",
        title: "Logout Issue",
        description: errorMessage,
      });
      
    } finally {
      // 3. Always clear local state, even if the server API failed
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}