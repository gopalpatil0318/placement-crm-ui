import StudentDashboardLayout from "@/components/student/StudentDashboardLayout";
import PageHeader from "@/components/student/PageHeader";
import ExperienceForm from "@/components/student/ExperienceForm";

export default function Experience() {
    const refreshProfile = async () => { };
    const nextStep = () => { };

    return (
        <StudentDashboardLayout>
            <PageHeader
                title="Experience"
                breadcrumbs={[
                    { label: "Home" },
                    { label: "Student" },
                    { label: "Update Profile" },
                    { label: "Experience", active: true },
                ]}
            />

            <div className="mt-8 max-w-5xl">
                <ExperienceForm
                    profileData={null}
                    refreshProfile={refreshProfile}
                    nextStep={nextStep}
                />
            </div>
        </StudentDashboardLayout>
    );
}
