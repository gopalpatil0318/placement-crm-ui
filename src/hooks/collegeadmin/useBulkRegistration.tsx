import { useState } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

interface RegisteredStudent {
    student_email: string;
    default_password?: string;
    [key: string]: unknown;
}

interface BulkRegisterResponse {
    success: boolean;
    message: string;
    data: {
        success: RegisteredStudent[];
        failed: { student_email: string; error: string }[];
    };
}

export const useBulkRegistration = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<BulkRegisterResponse | null>(null);

    const registerDefault = async (students: Record<string, string>[]) => {
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
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string; data?: { success?: unknown; failed?: unknown } } }; message?: string };
            const errorMessage = axiosErr.response?.data?.message || axiosErr.message || "Failed to upload file";
            setError(errorMessage);

            // If the error response contains the detailed data (e.g., partial failure), set the result
            if (axiosErr.response?.data?.data && (axiosErr.response.data.data.success || axiosErr.response.data.data.failed)) {
                setResult(axiosErr.response.data as unknown as BulkRegisterResponse);
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
