import { useState, useEffect, useCallback } from "react";
import StudentDashboardLayout from "@/components/student/StudentDashboardLayout";
import PageHeader from "@/components/student/PageHeader";
import PersonalInfoForm from "@/components/student/PersonalInfoForm";
import { StudentPersonalInfoService } from "@/services/student/personalInfo.service";
import { Loader2 } from "lucide-react";

export default function PersonalInfo() {
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const response = await StudentPersonalInfoService.getPersonalInfo();
            setProfileData(response.data);
        } catch (error) {
            console.log("No existing personal info found");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const refreshProfile = async () => {
        await fetchProfile();
    };

    const nextStep = () => {
        // Stay on the same page after saving
    };

    if (loading) {
        return (
            <StudentDashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-500">Loading personal info...</span>
                </div>
            </StudentDashboardLayout>
        );
    }

    return (
        <StudentDashboardLayout>
            <PageHeader
                title="Personal Information"
                breadcrumbs={[
                    { label: "Home" },
                    { label: "Student" },
                    { label: "Update Profile" },
                    { label: "Personal Info", active: true },
                ]}
            />

            <div className="mt-8 max-w-5xl">
                <PersonalInfoForm
                    profileData={profileData}
                    refreshProfile={refreshProfile}
                    nextStep={nextStep}
                />
            </div>
        </StudentDashboardLayout>
    );
}
