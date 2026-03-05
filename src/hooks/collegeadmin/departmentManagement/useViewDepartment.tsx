import { useState, useEffect } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";

export const useViewDepartment = (deptId: string | undefined) => {
    const [department, setDepartment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDepartment = async () => {
        if (!deptId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await CollegeAdminService.getDepartment(deptId);
            setDepartment(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch department");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartment();
    }, [deptId]);

    return { department, loading, error, refresh: fetchDepartment };
};
