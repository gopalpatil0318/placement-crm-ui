import { useState } from "react";
import {
    User,
    GraduationCap,
    BookOpen,
    Lock,
    AlertCircle,
    Clock,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import AnimatedPage from "@/components/ui/AnimatedPage";
import PageHeader from "@/components/student/PageHeader";
import { useStudentProfile } from "@/hooks/student/useStudentProfile";
import { useStudentProfileById } from "@/hooks/collegeadmin/useStudentProfileById";
import ProfileSkeleton from "@/components/student/profile/ProfileSkeleton";

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

type ViewMode = "student" | "college" | "interviewer";

interface StudentProfileProps {
    viewMode?: ViewMode;
    studentId?: string;
    onApproveExperience?: (id: string) => void;
    onRejectExperience?: (id: string) => void;
    processingExpId?: string | null;
    onApproveAchievement?: (id: string) => void;
    onRejectAchievement?: (id: string) => void;
    processingAchId?: string | null;
    onApproveCertificate?: (id: string) => void;
    onRejectCertificate?: (id: string) => void;
    processingCertId?: string | null;
}

export default function StudentProfile({
    viewMode = "student",
    studentId,
    onApproveExperience,
    onRejectExperience,
    processingExpId,
    onApproveAchievement,
    onRejectAchievement,
    processingAchId,
    onApproveCertificate,
    onRejectCertificate,
    processingCertId,
}: Readonly<StudentProfileProps>) {
    const isOwnProfile = viewMode === "student";
    const isCollegeView = viewMode === "college" && !!studentId;

    // Use college-admin API when viewing another student's profile, own-profile hook otherwise
    const selfProfile = useStudentProfile(!isCollegeView);
    const collegeProfile = useStudentProfileById(studentId || "", isCollegeView);
    const profileSource = isCollegeView ? collegeProfile : selfProfile;

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
    } = profileSource;

    const [activeTab, setActiveTab] = useState<PrivateTab>(null);
    const shouldReduce = useReducedMotion();

    /* ─── Loading State ─── */
    if (isLoading) {
        return (
            <AnimatedPage>
                <ProfileSkeleton />
            </AnimatedPage>
        );
    }

    /* ─── Error State ─── */
    if (error) {
        return (
            <AnimatedPage>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <span className="text-red-400 text-2xl">!</span>
                        </div>
                        <div>
                            <p className="text-base text-gray-800 dark:text-gray-200 font-semibold">
                                Unable to load profile
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                                {error}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => refetch()}
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
            </AnimatedPage>
        );
    }

    const Wrapper = shouldReduce ? "div" : motion.div;
    const sectionProps = shouldReduce
        ? {}
        : { variants: fadeInUp, initial: "initial" as const, whileInView: "animate" as const, viewport: { once: true, margin: "-40px" } };

    /* ─── Success State ─── */
    return (
        <AnimatedPage>
            <div className="space-y-6">
                {/* ─── Page Header (own profile only, hidden when embedded in college view) ─── */}
                {isOwnProfile && (
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <PageHeader
                            title="Student Profile"
                            breadcrumbs={[
                                { label: "Home" },
                                { label: "Student" },
                                { label: "Profile", active: true },
                            ]}
                        />
                    </div>
                )}

                {/* ─── Profile Approval Status Banner ─── */}
                {isOwnProfile && profileCompletion?.profile_approval_status === "rejected" && (
                    <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 px-4 py-3">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                Your profile was rejected by your TPO. Please update the required sections and resubmit.
                            </p>
                            {profileCompletion.profile_rejection_reason && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    Reason: {profileCompletion.profile_rejection_reason}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {isOwnProfile && profileCompletion?.profile_complete && !profileCompletion?.profile_is_approved && profileCompletion?.profile_approval_status !== "rejected" && (
                    <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 px-4 py-3">
                        <Clock className="h-5 w-5 text-blue-500 shrink-0" />
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 flex-1">
                            Your profile is pending approval by your TPO. You'll be able to apply for jobs once approved.
                        </p>
                    </div>
                )}

                {/* ═══════════════════════ Profile Header ═══════════════════════ */}
                <ProfileHeader
                    student={student}
                    profileLinks={profileLinks}
                    profileCompletion={profileCompletion}
                    viewMode={viewMode}
                />

                {/* ═══════════════════════ Two-Column Sections ═══════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ─── Left Column ─── */}
                    <div className="space-y-6">
                        <Wrapper {...sectionProps}><AboutSection profileLinks={profileLinks} /></Wrapper>
                        <Wrapper {...sectionProps}>
                            <ProjectsSection
                                projects={{ total_projects: projects.length, max_projects: 10, projects }}
                            />
                        </Wrapper>
                        <Wrapper {...sectionProps}><SkillsSection mySkills={skills} /></Wrapper>
                        <Wrapper {...sectionProps}>
                            <ActivitiesSection
                                activities={{ total_activities: activities.length, max_activities: 10, activities }}
                            />
                        </Wrapper>
                    </div>

                    {/* ─── Right Column ─── */}
                    <div className="space-y-6">
                        <Wrapper {...sectionProps}>
                            <ExperienceSection
                                experiences={{ total_experience: experiences.length, max_experience: 10, experience: experiences }}
                                viewMode={viewMode}
                                onApproveItem={onApproveExperience}
                                onRejectItem={onRejectExperience}
                                processingId={processingExpId}
                            />
                        </Wrapper>
                        <Wrapper {...sectionProps}>
                            <CertificatesSection
                                certificates={{ total_certificates: certificates.length, max_certificates: 15, certificates }}
                                viewMode={viewMode}
                                onApproveItem={onApproveCertificate}
                                onRejectItem={onRejectCertificate}
                                processingId={processingCertId}
                            />
                        </Wrapper>
                        <Wrapper {...sectionProps}>
                            <AchievementsSection
                                achievements={{ total_achievements: achievements.length, max_achievements: 10, achievements }}
                                viewMode={viewMode}
                                onApproveItem={onApproveAchievement}
                                onRejectItem={onRejectAchievement}
                                processingId={processingAchId}
                            />
                        </Wrapper>
                        <Wrapper {...sectionProps}>
                            <ContactSection personalInfo={personalInfo} student={student} />
                        </Wrapper>
                    </div>
                </div>

                {/* ═══════════════════════ Private Info (own-view + college-view) ═══════════════════════ */}
                {(isOwnProfile || isCollegeView) && (
                    <div className="mt-2">
                        {/* Section divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <Lock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    {isCollegeView ? "Confidential Information" : "Private Information"}
                                </span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 dark:from-gray-700 via-gray-200 dark:via-gray-700 to-transparent" />
                        </div>

                        {/* Tab cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                            {PRIVATE_TABS.map((tab) => {
                                const isActive = activeTab === tab.key;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        type="button"
                                        key={tab.key}
                                        onClick={() => setActiveTab(isActive ? null : tab.key)}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer border ${
                                            isActive
                                                ? "text-white shadow-lg border-transparent scale-[1.02]"
                                                : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-sm"
                                        }`}
                                        style={isActive ? { background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" } : undefined}
                                    >
                                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-white/20" : "bg-violet-50 dark:bg-violet-900/30"}`}>
                                            <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-violet-500 dark:text-violet-400"}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-800 dark:text-gray-200"}`}>
                                                {tab.label}
                                            </p>
                                            <p className={`text-[11px] mt-0.5 ${isActive ? "text-white/70" : "text-gray-400 dark:text-gray-500"}`}>
                                                {tab.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab content with AnimatePresence */}
                        <AnimatePresence mode="wait">
                            {activeTab === "personal" && (
                                <motion.div key="personal" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                                    <PersonalInfoForm personalInfo={personalInfo} />
                                </motion.div>
                            )}
                            {activeTab === "academic" && (
                                <motion.div key="academic" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                                    <AcademicInfoForm academicInfo={academicInfo} />
                                </motion.div>
                            )}
                            {activeTab === "semester" && (
                                <motion.div key="semester" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                                    <SemesterGradesForm
                                        semesterGrades={{ total_semesters_in_dept: 8, completed_semesters: semesterGrades.length, grades: semesterGrades }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
}
