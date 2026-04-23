import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ShieldX } from "lucide-react";
import { useCreateStudent } from "@/hooks/collegeadmin/student_management/useCreateStudent";
import { useSubscriptionInfo } from "@/hooks/collegeadmin/useSubscriptionInfo";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import StudentForm from "@/components/collegeadmin/student_management/StudentForm";
import QuotaBar from "@/components/collegeadmin/QuotaBar";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Students", path: "/college/students" },
    { label: "Register Student", active: true },
] as const;

const CreateStudentForm = () => {
    const navigate = useNavigate();
    const { formData, errors, loading, handleChange, handleSubmit } = useCreateStudent();
    const { data: subInfo } = useSubscriptionInfo();

    const breadcrumbs = useMemo(() => [...BREADCRUMBS], []);

    const isBlocked = subInfo?.subscription_status === "expired" || subInfo?.subscription_status === "suspended";
    const isQuotaFull = subInfo?.subscription !== null && subInfo?.students_remaining === 0;

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Register Student" breadcrumbs={breadcrumbs} />

                {/* Subscription blocked banner */}
                {isBlocked && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 dark:border-red-800/50 dark:bg-red-950/40" role="alert">
                        <ShieldX className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                        <div>
                            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                                Registration blocked
                            </p>
                            <p className="mt-0.5 text-sm text-red-700 dark:text-red-300">
                                {subInfo?.subscription_status === "suspended"
                                    ? "Your college account is suspended. Contact the Placenex team."
                                    : "Your subscription has expired. Contact the Placenex team to renew."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Quota full banner */}
                {!isBlocked && isQuotaFull && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-800/50 dark:bg-amber-950/40" role="alert">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                                Student quota reached
                            </p>
                            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
                                All {subInfo?.subscription?.student_quota?.toLocaleString()} slots are used. Contact the Placenex team to increase your quota.
                            </p>
                        </div>
                    </div>
                )}

                {/* Quota progress bar */}
                {!isBlocked && subInfo?.subscription && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <QuotaBar
                            used={subInfo.students_used}
                            quota={subInfo.subscription.student_quota}
                        />
                    </div>
                )}

                <StudentForm
                    mode="create"
                    formData={formData}
                    errors={errors}
                    loading={loading || isBlocked || isQuotaFull}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={() => navigate("/college/students")}
                />
            </div>
        </AnimatedPage>
    );
};

export default CreateStudentForm;
