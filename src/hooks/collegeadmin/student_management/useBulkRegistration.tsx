import { useState } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

interface BulkRegisterResponse {
    success: boolean;
    message: string;
    data: {
        success: any[];
        failed: { student_email: string; error: string }[];
    };
}

export const useBulkRegistration = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<BulkRegisterResponse | null>(null);

    const registerDefault = async (students: any[]) => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await CollegeAdminService.bulkRegistration(students);
            setResult(response);

            showToast({
                type: 'success',
                title: 'Process Completed',
                description: response.message || 'Bulk registration process finished',
            });
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to upload file";
            setError(errorMessage);

            // If the error response contains the detailed data (e.g., partial failure), set the result
            if (err.response?.data?.data && (err.response.data.data.success || err.response.data.data.failed)) {
                setResult(err.response.data);
            }

            showToast({
                type: 'error',
                title: 'Error / Warning',
                description: errorMessage,
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
    };

    return {
        registerDefault,
        loading,
        error,
        result,
        reset,
    };
};
