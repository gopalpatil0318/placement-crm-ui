import { useCallback } from "react";
import PageHeader from "@/components/student/PageHeader";
import ChangePasswordForm from "@/components/ui/ChangePasswordForm";
import { StudentProfileService } from "@/services/student/student.services";
import AnimatedPage from "@/components/ui/AnimatedPage";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/student/dashboard" },
    { label: "Settings" },
    { label: "Change Password", active: true },
];

export default function StudentChangePassword() {
    const handleSubmit = useCallback(
        (payload: { current_password: string; new_password: string; confirm_password: string }) =>
            StudentProfileService.changePassword(payload),
        []
    );

    return (
        <AnimatedPage className="space-y-8">
            <PageHeader title="Change Password" breadcrumbs={BREADCRUMBS} />
            <ChangePasswordForm onSubmit={handleSubmit} />
        </AnimatedPage>
    );
}