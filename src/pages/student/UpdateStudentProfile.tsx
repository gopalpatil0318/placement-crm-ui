import { useRef, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    User,
    GraduationCap,
    BookOpen,
    Wrench,
    FolderKanban,
    Briefcase,
    Trophy,
    Award,
    Activity,
    Link2,
    CheckCircle2,
} from "lucide-react";
import AnimatedPage from "@/components/ui/AnimatedPage";
import AnimatedTabContent from "@/components/ui/AnimatedTabContent";
import PageHeader from "@/components/student/PageHeader";
import { useStudentProfile } from "@/hooks/student/useStudentProfile";
import UpdateProfileSkeleton from "@/components/student/UpdateProfileSkeleton";

// Edit form components (each manages its own data/mutations via internal hooks)
import PersonalInfoForm from "@/components/student/PersonalInfoForm";
import AcademicInfoForm from "@/components/student/AcademicInfoForm";
import SemInfoForm from "@/components/student/SemInfoForm";
import SkillsForm from "@/components/student/SkillsForm";
import ExperienceForm from "@/components/student/ExperienceForm";
import ProjectsForm from "@/components/student/ProjectsForm";
import CertificatesForm from "@/components/student/CertificatesForm";
import AchievementsForm from "@/components/student/AchievementsForm";
import ActivitiesForm from "@/components/student/ActivitiesForm";
import ProfileLinksForm from "@/components/student/ProfileLinksForm";

import type { ProfileCompletion } from "@/types/student";

/* ─── Section Definitions ─── */
interface Section {
    id: string;
    label: string;
    icon: typeof User;
    completionKey?: keyof ProfileCompletion["sections"];
}

const SECTIONS: Section[] = [
    { id: "personal", label: "Personal Info", icon: User, completionKey: "personal_information" },
    { id: "academic", label: "Academic Info", icon: GraduationCap, completionKey: "academic_information" },
    { id: "semester", label: "Semester Grades", icon: BookOpen, completionKey: "semester_grades" },
    { id: "skills", label: "Skills", icon: Wrench, completionKey: "skills" },
    { id: "experience", label: "Experience", icon: Briefcase, completionKey: "experience" },
    { id: "projects", label: "Projects", icon: FolderKanban, completionKey: "projects" },
    { id: "certificates", label: "Certificates", icon: Award, completionKey: "certificates" },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "activities", label: "Activities", icon: Activity },
    { id: "profile-links", label: "Profile Links", icon: Link2, completionKey: "profile_links" },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

/* ─── Main Component ─── */
export default function UpdateStudentProfile() {
    const { profileCompletion, isLoading, error, refetch } = useStudentProfile();

    const [activeSection, setActiveSection] = useState(SECTION_IDS[0]);
    const mobileNavRef = useRef<HTMLDivElement>(null);

    // Auto-scroll mobile nav to keep active tab visible
    useEffect(() => {
        if (!mobileNavRef.current) return;
        const activeBtn = mobileNavRef.current.querySelector(`[data-section="${activeSection}"]`);
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, [activeSection]);

    const isSectionComplete = (key?: keyof ProfileCompletion["sections"]) => {
        if (!key || !profileCompletion?.sections) return false;
        return profileCompletion.sections[key]?.completed ?? false;
    };

    // Active section metadata for the content header
    const activeMeta = useMemo(
        () => SECTIONS.find((s) => s.id === activeSection) ?? SECTIONS[0],
        [activeSection],
    );

    /* ─── Loading ─── */
    if (isLoading) {
        return (
            <AnimatedPage>
                <UpdateProfileSkeleton />
            </AnimatedPage>
        );
    }

    /* ─── Error ─── */
    if (error) {
        return (
            <AnimatedPage>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <span className="text-red-400 text-2xl">!</span>
                        </div>
                        <p className="text-base text-gray-800 dark:text-gray-200 font-semibold">Unable to load profile</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{error}</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    const ActiveIcon = activeMeta.icon;

    /* ─── Success ─── */
    return (
        <AnimatedPage>
            <div className="space-y-4">
                {/* ─── Top Bar: Back + Header ─── */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <PageHeader
                        title="Update Profile"
                        breadcrumbs={[
                            { label: "Home" },
                            { label: "Student" },
                            { label: "Update Profile", active: true },
                        ]}
                    />
                    <Link
                        to="/student/profile"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-sm transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Profile
                    </Link>
                </div>

                {/* ─── Mobile-only: Compact Completion Badge ─── */}
                {profileCompletion && (
                    <div className="lg:hidden flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
                        <div className="relative h-8 w-8 flex-shrink-0">
                            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800" />
                                <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" strokeLinecap="round" stroke="url(#completionGradMobile)" strokeDasharray={`${(profileCompletion.total_percentage / 100) * 97.4} 97.4`} />
                                <defs><linearGradient id="completionGradMobile" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#694ed6" /><stop offset="100%" stopColor="#c137a2" /></linearGradient></defs>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700 dark:text-gray-200">{Math.round(profileCompletion.total_percentage)}%</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">Profile Completion</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{profileCompletion.is_complete ? "All sections complete" : "Complete sections below"}</p>
                        </div>
                    </div>
                )}

                {/* ─── Mobile: Horizontal scrollable tab bar ─── */}
                <div
                    ref={mobileNavRef}
                    className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1"
                >
                    {SECTIONS.map((sec) => {
                        const Icon = sec.icon;
                        const isActive = activeSection === sec.id;
                        const complete = isSectionComplete(sec.completionKey);
                        return (
                            <button
                                key={sec.id}
                                type="button"
                                data-section={sec.id}
                                onClick={() => setActiveSection(sec.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer border ${
                                    isActive
                                        ? "text-white border-transparent shadow-md"
                                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-200 dark:hover:border-violet-800"
                                }`}
                                style={isActive ? { background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" } : undefined}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {sec.label}
                                {complete && <CheckCircle2 className={`h-3 w-3 ${isActive ? "text-white/80" : "text-emerald-500"}`} />}
                            </button>
                        );
                    })}
                </div>

                {/* ─── Desktop: Sidebar + Content ─── */}
                <div className="flex gap-6">
                    {/* Sticky sidebar — desktop only */}
                    <nav className="hidden lg:block w-56 flex-shrink-0">
                        <div className="sticky top-24 space-y-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
                            {/* ─── Sidebar Completion Badge ─── */}
                            {profileCompletion && (
                                <div className="flex items-center gap-2.5 px-2 py-2.5 mb-2 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/40 dark:to-fuchsia-950/40 border border-violet-100 dark:border-violet-900/50">
                                    <div className="relative h-9 w-9 flex-shrink-0">
                                        <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-violet-100 dark:text-violet-900/50" />
                                            <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" strokeLinecap="round" stroke="url(#completionGrad)" strokeDasharray={`${(profileCompletion.total_percentage / 100) * 97.4} 97.4`} />
                                            <defs><linearGradient id="completionGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#694ed6" /><stop offset="100%" stopColor="#c137a2" /></linearGradient></defs>
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700 dark:text-gray-200">{Math.round(profileCompletion.total_percentage)}%</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">Profile Completion</p>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{profileCompletion.is_complete ? "All sections complete" : "Complete sections below"}</p>
                                    </div>
                                </div>
                            )}

                            {SECTIONS.map((sec) => {
                                const Icon = sec.icon;
                                const isActive = activeSection === sec.id;
                                const complete = isSectionComplete(sec.completionKey);
                                return (
                                    <button
                                        key={sec.id}
                                        type="button"
                                        onClick={() => setActiveSection(sec.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                                            isActive
                                                ? "text-white shadow-md"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                        }`}
                                        style={isActive ? { background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" } : undefined}
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{sec.label}</span>
                                        {complete && (
                                            <CheckCircle2 className={`h-3.5 w-3.5 ml-auto flex-shrink-0 ${isActive ? "text-white/80" : "text-emerald-500"}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Content: Only active section renders */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 transition-shadow hover:shadow-md">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2 mb-6">
                                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                                    <ActiveIcon className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                                </div>
                                {activeMeta.label}
                            </h2>

                            <AnimatedTabContent activeTab={activeSection} tabKeys={SECTION_IDS}>
                                {activeSection === "personal" && <PersonalInfoForm onSaveSuccess={() => setActiveSection("academic")} />}
                                {activeSection === "academic" && <AcademicInfoForm />}
                                {activeSection === "semester" && <SemInfoForm />}
                                {activeSection === "skills" && <SkillsForm />}
                                {activeSection === "experience" && <ExperienceForm />}
                                {activeSection === "projects" && <ProjectsForm />}
                                {activeSection === "certificates" && <CertificatesForm />}
                                {activeSection === "achievements" && <AchievementsForm />}
                                {activeSection === "activities" && <ActivitiesForm />}
                                {activeSection === "profile-links" && <ProfileLinksForm />}
                            </AnimatedTabContent>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}
