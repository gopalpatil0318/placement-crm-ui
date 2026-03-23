import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useUpdateDepartment } from "@/hooks/collegeadmin/departmentManagement/useUpdateDepartment";
import DepartmentForm from "./DepartmentForm";

// ========================
// COMPONENT
// ========================

interface UpdateDepartmentFormProps {
    deptId: string | undefined;
    onDeptLoaded?: (name: string) => void;
}

const UpdateDepartmentForm = ({ deptId, onDeptLoaded }: UpdateDepartmentFormProps) => {
    const {
        formData,
        errors,
        loading,
        fetching,
        fetchError,
        fetchedDeptName,
        handleChange,
        handleSubmit,
        handleCancel,
    } = useUpdateDepartment(deptId || "");

    // Notify parent page when dept name is fetched (for breadcrumb)
    useEffect(() => {
        if (fetchedDeptName && onDeptLoaded) {
            onDeptLoaded(fetchedDeptName);
        }
    }, [fetchedDeptName, onDeptLoaded]);

    // ── Loading skeleton ──
    if (fetching) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
                    <div className="space-y-1.5">
                        <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                        <div className="h-5 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                </div>
                <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="h-10 w-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                        <div className="h-10 w-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Fetch error state ──
    if (fetchError) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 flex flex-col items-center gap-4 text-center">
                <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Failed to load department</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{fetchError}</p>
                </div>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                    ← Back to Department
                </button>
            </div>
        );
    }

    // ── Form ──
    return (
        <DepartmentForm
            mode="edit"
            formData={formData}
            errors={errors}
            loading={loading}
            fetchedDeptName={fetchedDeptName}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
        />
    );
};

export default UpdateDepartmentForm;
