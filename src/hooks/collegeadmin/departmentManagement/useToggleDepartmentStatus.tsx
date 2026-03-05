import { useState } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

export const useToggleDepartmentStatus = () => {
    const [loading, setLoading] = useState(false);

    const toggleStatus = async (
        deptId: string,
        currentStatus: boolean,
        onSuccess?: () => void
    ) => {
        setLoading(true);
        try {
            const newStatus = !currentStatus;
            const response = await CollegeAdminService.toggleDepartmentStatus(
                deptId,
                newStatus
            );

            const successMessage =
                response?.message ||
                `Department ${newStatus ? "activated" : "deactivated"} successfully`;

            showToast({
                type: "success",
                title: "Status Updated",
                description: successMessage,
            });

            // Callback to refresh the list
            if (onSuccess) onSuccess();
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error",
                description:
                    error.message || "Failed to toggle department status",
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        toggleStatus,
        loading,
    };
};
