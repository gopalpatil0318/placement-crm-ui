import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { clearOtherSessions } from "@/lib/clearAllAuthSessions";
import type { User, StudentAuthContextType } from "@/types/auth";

export const StudentAuthContext = createContext<StudentAuthContextType | null>(null);

export const StudentAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("student_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("student_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/student/login", { email, password });

    const { data: responseData, message } = response.data;

    // API returns { data: { student: { ... } } }
    const studentData = responseData?.student || responseData;

    if (!studentData) {
      throw new Error("Invalid response: Student data missing");
    }

    const newUser: User = {
      id: studentData.student_id,
      email: studentData.student_email,
      role: "student",
      firstName: studentData.first_name,
      middleName: studentData.middle_name,
      lastName: studentData.last_name,
      name: `${studentData.first_name} ${studentData.last_name}`,
      collegeId: studentData.college_id,
      collegeName: studentData.college_name,
      deptId: studentData.dept_id,
      deptName: studentData.dept_name,
      passoutYear: studentData.student_passout_year,
      currentYear: studentData.current_year,
      studentStatus: studentData.student_status,
      profileComplete: studentData.profile_complete ?? false,
      profileIsApproved: studentData.profile_is_approved ?? false,
      isActive: studentData.student_status === "active",
    };

    setUser(newUser);
    localStorage.setItem("student_user", JSON.stringify(newUser));
    clearOtherSessions("student");

    showToast({
      type: "success",
      title: "Success",
      description: message || "Welcome back!",
    });
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Logout failed on server";
      showToast({
        type: "error",
        title: "Logout Issue",
        description: msg,
      });
    } finally {
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