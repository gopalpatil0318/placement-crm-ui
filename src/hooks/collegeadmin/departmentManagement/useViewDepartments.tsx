import { useState, useEffect, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

export const useViewDepartments = () => {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const apiData = await CollegeAdminService.getDepartments();
            setDepartments(Array.isArray(apiData) ? apiData : Array.isArray(apiData?.departments) ? apiData.departments : []);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to fetch departments";

            setError(errorMessage);

            showToast({
                type: "error",
                title: "Fetch Error",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    return {
        departments,
        loading,
        error,
        refresh: fetchDepartments,
    };
};
