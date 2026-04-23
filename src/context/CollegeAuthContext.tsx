import { createContext, useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from "react";
import api from "../lib/api";
import { showToast } from "@/utils/ToastUtils";
import { clearOtherSessions } from "@/lib/clearAllAuthSessions";
import type { User, UserRole, CollegeAuthContextType, SubscriptionStatus } from "../types/auth";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";

// eslint-disable-next-line react-refresh/only-export-components -- context object co-exported with provider
export const CollegeAuthContext = createContext<CollegeAuthContextType | undefined>(undefined);

const STORAGE_KEY = "college_user";

export function CollegeAuthProvider({ children }: Readonly<{ children: ReactNode }>) {
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

    const login = useCallback(async (email: string, password: string) => {
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
            subscriptionStatus: (userData.subscription_status || 'none') as SubscriptionStatus,
            departments: userData.departments,
            permissions: userData.permissions ?? null,
            deptScoped: userData.dept_scoped ?? false,
            deptIds: userData.dept_ids ?? [],
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

        return newUser;
    }, []);

    const refreshPermissions = useCallback(async () => {
        if (!user) return;
        try {
            const response = await api.get("/college/my-permissions");
            const data = response.data?.data;
            if (!data) return;

            setUser(prev => {
                if (!prev) return null;
                const updated = {
                    ...prev,
                    permissions: data.permissions ?? [],
                    deptScoped: data.dept_scoped ?? false,
                    deptIds: data.dept_ids ?? [],
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        } catch {
            // Silently fail — user keeps stale permissions
        }
    }, [user]);

    // Listen for 403 permission-denied events from the axios interceptor
    const refreshRef = useRef(refreshPermissions);
    refreshRef.current = refreshPermissions;

    useEffect(() => {
        let lastFired = 0;
        const DEBOUNCE_MS = 3000;
        const handler = async (e: Event) => {
            const now = Date.now();
            if (now - lastFired < DEBOUNCE_MS) return;
            lastFired = now;

            const detail = (e as CustomEvent<{ message?: string }>).detail;
            const msg = detail?.message || "You do not have permission for this action";
            showToast({ type: "error", title: "Access Denied", description: msg });

            // Silently refresh permissions in case they changed
            try { await refreshRef.current(); } catch { /* ignore */ }
        };
        globalThis.addEventListener("placenex:permission-denied", handler);
        return () => globalThis.removeEventListener("placenex:permission-denied", handler);
    }, []);

    // Listen for 403 department-scope-denied events (no permission refresh needed)
    useEffect(() => {
        let lastFired = 0;
        const DEBOUNCE_MS = 3000;
        const handler = (e: Event) => {
            const now = Date.now();
            if (now - lastFired < DEBOUNCE_MS) return;
            lastFired = now;

            const detail = (e as CustomEvent<{ message?: string }>).detail;
            const msg = detail?.message || "This resource is outside your assigned departments.";
            showToast({ type: "error", title: "Department Scope", description: msg });
        };
        globalThis.addEventListener("placenex:dept-scope-denied", handler);
        return () => globalThis.removeEventListener("placenex:dept-scope-denied", handler);
    }, []);

    const logout = useCallback(async () => {
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
            queryClient.clear();
            setUser(null);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem("placenex_selected_year");
        }
    }, []);

    const contextValue = useMemo(() => ({
        user, isAuthenticated: !!user, isLoading, login, logout, refreshPermissions,
    }), [user, isLoading, login, logout, refreshPermissions]);

    return (
        <CollegeAuthContext.Provider value={contextValue}>
            {!isLoading && children}
        </CollegeAuthContext.Provider>
    );
}
