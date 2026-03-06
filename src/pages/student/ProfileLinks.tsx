import StudentDashboardLayout from "@/components/student/StudentDashboardLayout";
import PageHeader from "@/components/student/PageHeader";
import ProfileLinksForm from "@/components/student/ProfileLinksForm";

export default function ProfileLinks() {
    const refreshProfile = async () => { };
    const nextStep = () => { };

    return (
        <StudentDashboardLayout>
            <PageHeader
                title="Profile Links"
                breadcrumbs={[
                    { label: "Home" },
                    { label: "Student" },
                    { label: "Update Profile" },
                    { label: "Profile Links", active: true },
                ]}
            />

            <div className="mt-8 max-w-5xl">
                <ProfileLinksForm
                    profileData={null}
                    refreshProfile={refreshProfile}
                    nextStep={nextStep}
                />
            </div>
        </StudentDashboardLayout>
    );
}
