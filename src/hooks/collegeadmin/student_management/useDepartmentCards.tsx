import { useState, useEffect, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

export const useDepartmentCards = () => {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalStudents, setTotalStudents] = useState<number>(0);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const [apiData, studentData] = await Promise.all([
                CollegeAdminService.getDepartments(),
                CollegeAdminService.getAllStudents({ page: 1, limit: 1 }),
            ]);
            const deptList = Array.isArray(apiData)
                ? apiData
                : Array.isArray(apiData?.departments)
                    ? apiData.departments
                    : [];
            setDepartments(deptList);
            setTotalStudents(studentData?.pagination?.total || 0);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to fetch departments";
            showToast({
                type: "error",
                title: "Fetch Error",
                description: errorMessage,
            });
            setDepartments([]);
            setTotalStudents(0);
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
        totalStudents,
        refresh: fetchDepartments,
    };
};
