import StudentDashboardLayout from "@/components/student/StudentDashboardLayout";
import PageHeader from "@/components/student/PageHeader";
import AchievementsForm from "@/components/student/AchievementsForm";

export default function Achievements() {
    const refreshProfile = async () => { };
    const nextStep = () => { };

    return (
        <StudentDashboardLayout>
            <PageHeader
                title="Achievements"
                breadcrumbs={[
                    { label: "Home" },
                    { label: "Student" },
                    { label: "Update Profile" },
                    { label: "Achievements", active: true },
                ]}
            />

            <div className="mt-8 max-w-5xl">
                <AchievementsForm
                    profileData={null}
                    refreshProfile={refreshProfile}
                    nextStep={nextStep}
                />
            </div>
        </StudentDashboardLayout>
    );
}
