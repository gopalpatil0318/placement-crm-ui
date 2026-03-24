import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateStudent } from "@/hooks/collegeadmin/student_management/useCreateStudent";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import StudentForm from "@/components/collegeadmin/student_management/StudentForm";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Students", path: "/college/students" },
    { label: "Register Student", active: true },
] as const;

const CreateStudentForm = () => {
    const navigate = useNavigate();
    const { formData, errors, loading, handleChange, handleSubmit } = useCreateStudent();

    const breadcrumbs = useMemo(() => [...BREADCRUMBS], []);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Register Student" breadcrumbs={breadcrumbs} />
                <StudentForm
                    mode="create"
                    formData={formData}
                    errors={errors}
                    loading={loading}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={() => navigate("/college/students")}
                />
            </div>
        </AnimatedPage>
    );
};

export default CreateStudentForm;
