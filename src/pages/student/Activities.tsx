import StudentDashboardLayout from "@/components/student/StudentDashboardLayout";
import PageHeader from "@/components/student/PageHeader";
import ActivitiesForm from "@/components/student/ActivitiesForm";

export default function Activities() {
    const refreshProfile = async () => { };
    const nextStep = () => { };

    return (
        <StudentDashboardLayout>
            <PageHeader
                title="Activities"
                breadcrumbs={[
                    { label: "Home" },
                    { label: "Student" },
                    { label: "Update Profile" },
                    { label: "Activities", active: true },
                ]}
            />

            <div className="mt-8 max-w-5xl">
                <ActivitiesForm
                    profileData={null}
                    refreshProfile={refreshProfile}
                    nextStep={nextStep}
                />
            </div>
        </StudentDashboardLayout>
    );
}
