import { useState } from "react";
import {
    User,
    GraduationCap,
    BookOpen,
    Loader2,
    Lock,
} from "lucide-react";
import StudentDashboardLayout from "@/components/student/StudentDashboardLayout";
import PageHeader from "@/components/student/PageHeader";
import { useStudentProfile } from "@/hooks/student/useStudentProfile";

// Profile sections (always visible)
import ProfileHeader from "@/components/student/profile/ProfileHeader";
import AboutSection from "@/components/student/profile/AboutSection";
import ProjectsSection from "@/components/student/profile/ProjectsSection";
import ExperienceSection from "@/components/student/profile/ExperienceSection";
import SkillsSection from "@/components/student/profile/SkillsSection";
import CertificatesSection from "@/components/student/profile/CertificatesSection";
import AchievementsSection from "@/components/student/profile/AchievementsSection";
import ActivitiesSection from "@/components/student/profile/ActivitiesSection";
import ContactSection from "@/components/student/profile/ContactSection";

// Private sections (own-view only)
import PersonalInfoForm from "@/components/student/profile/PersonalInfoForm";
import AcademicInfoForm from "@/components/student/profile/AcademicInfoForm";
import SemesterGradesForm from "@/components/student/profile/SemesterGradesForm";

type PrivateTab = "personal" | "academic" | "semester" | null;

const PRIVATE_TABS = [
    {
        key: "personal" as const,
        label: "Personal Info",
        icon: User,
        desc: "Basic details, family & address",
    },
    {
        key: "academic" as const,
        label: "Academic Info",
        icon: GraduationCap,
        desc: "College, education & backlogs",
    },
    {
        key: "semester" as const,
        label: "Semester Grades",
        icon: BookOpen,
        desc: "SGPA, CGPA & backlog subjects",
    },
];

interface StudentProfileProps {
    isOwnProfile?: boolean;
}

export default function StudentProfile({
    isOwnProfile = true,
}: StudentProfileProps) {
    const {
        student,
        profileCompletion,
        personalInfo,
        academicInfo,
        semesterGrades,
        skills,
        projects,
        experiences,
        achievements,
        certificates,
        activities,
        profileLinks,
        isLoading,
        error,
        refetch,
    } = useStudentProfile();

    const [activeTab, setActiveTab] = useState<PrivateTab>(null);

    /* ─── Loading State ─── */
    if (isLoading) {
        return (
            <StudentDashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div
                                className="h-14 w-14 rounded-full opacity-20"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #6a54c2ff 0%, #c137a2 100%)",
                                }}
                            />
                            <Loader2 className="h-6 w-6 animate-spin text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                            Loading your profile...
                        </p>
                    </div>
                </div>
            </StudentDashboardLayout>
        );
    }

    /* ─── Error State ─── */
    if (error) {
        return (
            <StudentDashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center">
                            <span className="text-red-400 text-2xl">!</span>
                        </div>
                        <div>
                            <p className="text-base text-gray-800 font-semibold">
                                Unable to load profile
                            </p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={refetch}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background:
                                    "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)",
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </StudentDashboardLayout>
        );
    }

    /* ─── Success State ─── */
    return (
        <StudentDashboardLayout>
            <PageHeader
                title="Student Profile"
                breadcrumbs={[
                    { label: "Home" },
                    { label: "Student" },
                    { label: "Profile", active: true },
                ]}
            />

            <div className="mt-6 space-y-6">
                {/* ═══════════════════════ Profile Header ═══════════════════════ */}
                <ProfileHeader
                    student={student}
                    profileLinks={profileLinks}
                    profileCompletion={profileCompletion}
                />

                {/* ═══════════════════════ Balanced Two-Column Layout ═══════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ─── Left Column ─── */}
                    <div className="space-y-6">
                        <AboutSection profileLinks={profileLinks} />
                        <ProjectsSection
                            projects={{
                                total_projects: projects.length,
                                max_projects: 10,
                                projects: projects,
                            }}
                        />
                        <SkillsSection mySkills={skills} />
                        <ActivitiesSection
                            activities={{
                                total_activities: activities.length,
                                max_activities: 10,
                                activities: activities,
                            }}
                        />
                    </div>

                    {/* ─── Right Column ─── */}
                    <div className="space-y-6">
                        <ExperienceSection
                            experiences={{
                                total_experience: experiences.length,
                                max_experience: 10,
                                experience: experiences,
                            }}
                        />
                        <CertificatesSection
                            certificates={{
                                total_certificates: certificates.length,
                                max_certificates: 15,
                                certificates: certificates,
                            }}
                        />
                        <AchievementsSection
                            achievements={{
                                total_achievements: achievements.length,
                                max_achievements: 10,
                                achievements: achievements,
                            }}
                        />
                        <ContactSection
                            personalInfo={personalInfo}
                            student={student}
                        />
                    </div>
                </div>

                {/* ═══════════════════════ Private Info (own-view only) ═══════════════════════ */}
                {isOwnProfile && (
                    <div className="mt-2">
                        {/* Section divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className="h-px flex-1"
                                style={{
                                    background:
                                        "linear-gradient(to right, transparent, #e5e7eb 30%, #e5e7eb 70%, transparent)",
                                }}
                            />
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                                <Lock className="h-3 w-3 text-gray-400" />
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                    Private Information
                                </span>
                            </div>
                            <div
                                className="h-px flex-1"
                                style={{
                                    background:
                                        "linear-gradient(to right, #e5e7eb 30%, #e5e7eb 70%, transparent)",
                                }}
                            />
                        </div>

                        {/* Tab cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                            {PRIVATE_TABS.map((tab) => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() =>
                                            setActiveTab(
                                                isActive ? null : tab.key
                                            )
                                        }
                                        className={`
                                            flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer border
                                            ${isActive
                                                ? "text-white shadow-lg border-transparent scale-[1.02]"
                                                : "bg-white border-gray-100 text-gray-600 hover:border-violet-200 hover:shadow-sm"
                                            }
                                        `}
                                        style={
                                            isActive
                                                ? {
                                                    background:
                                                        "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)",
                                                }
                                                : undefined
                                        }
                                    >
                                        <div
                                            className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive
                                                ? "bg-white/20"
                                                : "bg-violet-50"
                                                }`}
                                        >
                                            <tab.icon
                                                className={`h-4 w-4 ${isActive
                                                    ? "text-white"
                                                    : "text-violet-500"
                                                    }`}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p
                                                className={`text-sm font-semibold ${isActive
                                                    ? "text-white"
                                                    : "text-gray-800"
                                                    }`}
                                            >
                                                {tab.label}
                                            </p>
                                            <p
                                                className={`text-[11px] mt-0.5 ${isActive
                                                    ? "text-white/70"
                                                    : "text-gray-400"
                                                    }`}
                                            >
                                                {tab.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab content */}
                        {activeTab === "personal" && (
                            <PersonalInfoForm personalInfo={personalInfo} />
                        )}
                        {activeTab === "academic" && (
                            <AcademicInfoForm academicInfo={academicInfo} />
                        )}
                        {activeTab === "semester" && (
                            <SemesterGradesForm
                                semesterGrades={{
                                    total_semesters_in_dept: 8,
                                    completed_semesters: semesterGrades.length,
                                    grades: semesterGrades,
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        </StudentDashboardLayout>
    );
}
