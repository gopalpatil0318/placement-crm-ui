import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useUpdateUser } from "@/hooks/collegeadmin/user_management/useUpdateUser";
import UserForm from "./UserForm";

interface UpdateUserFormProps {
    onUserLoaded?: (name: string) => void;
}

// ========================
// SKELETON
// ========================

const FormSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-8 animate-pulse">
        {/* Section header skeleton */}
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-1.5">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
        </div>
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            </div>
            <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            </div>
        </div>
        {/* Section header skeleton */}
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-1.5">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            </div>
            <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            </div>
        </div>
        {/* Bottom */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-10 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
    </div>
);

// ========================
// COMPONENT
// ========================

const UpdateUserForm = ({ onUserLoaded }: UpdateUserFormProps) => {
    const { userId } = useParams<{ userId: string }>();

    const {
        formData, errors, loading, fetching, fetchError, fetchedUserName,
        departments, isCollegeAdmin, handleChange, handleSubmit, handleCancel,
    } = useUpdateUser(userId || "");

    useEffect(() => {
        if (fetchedUserName && onUserLoaded) {
            onUserLoaded(fetchedUserName);
        }
    }, [fetchedUserName, onUserLoaded]);

    if (fetching) return <FormSkeleton />;

    if (fetchError) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">{fetchError}</p>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Users
                </button>
            </div>
        );
    }

    return (
        <UserForm
            mode="edit"
            formData={{ ...formData, userPassword: "" }}
            errors={errors}
            loading={loading}
            departments={departments}
            fetchedUserName={fetchedUserName}
            isCollegeAdmin={isCollegeAdmin}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
        />
    );
};

export default UpdateUserForm;
