import { useCallback } from "react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import ChangePasswordForm from "@/components/ui/ChangePasswordForm";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Settings" },
    { label: "Change Password", active: true },
];

export default function ChangePassword() {
    const handleSubmit = useCallback(
        (payload: { current_password: string; new_password: string; confirm_password: string }) =>
            CollegeAdminService.changePassword(payload),
        []
    );

    return (
        <div className="space-y-8">
            <PageHeader title="Change Password" breadcrumbs={BREADCRUMBS} />
            <ChangePasswordForm onSubmit={handleSubmit} />
        </div>
    );
}