import StudentDashboardLayout from "@/components/student/StudentDashboardLayout";
import PageHeader from "@/components/student/PageHeader";
import SkillsForm from "@/components/student/SkillsForm";

export default function Skills() {
    const refreshProfile = async () => { };
    const nextStep = () => { };

    return (
        <StudentDashboardLayout>
            <PageHeader
                title="Skills"
                breadcrumbs={[
                    { label: "Home" },
                    { label: "Student" },
                    { label: "Update Profile" },
                    { label: "Skills", active: true },
                ]}
            />

            <div className="mt-8 max-w-5xl">
                <SkillsForm
                    profileData={null}
                    refreshProfile={refreshProfile}
                    nextStep={nextStep}
                />
            </div>
        </StudentDashboardLayout>
    );
}
