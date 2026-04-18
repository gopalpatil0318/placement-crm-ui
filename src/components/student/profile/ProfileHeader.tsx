import { Link } from "react-router-dom";
import {
    Globe,
    Code2,
    BookOpen,
    FileText,
    Trophy,
    Pencil,
    CheckCircle2,
    Clock,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import type { ProfileLinks, ProfileCompletion, StudentInfo } from "@/types/student";
import { getCurrentYear } from "@/lib/utils";

type ViewMode = "student" | "college" | "interviewer";

// Brand SVG icons (lucide deprecated brand icons)
const LinkedInIcon = ({ className }: Readonly<{ className?: string }>) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
    </svg>
);
const GitHubIcon = ({ className }: Readonly<{ className?: string }>) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
);

interface ProfileHeaderProps {
    student: StudentInfo | null;
    profileLinks: ProfileLinks | null;
    profileCompletion: ProfileCompletion | null;
    viewMode?: ViewMode;
}

export default function ProfileHeader({
    student,
    profileLinks,
    profileCompletion,
    viewMode = "student",
}: Readonly<ProfileHeaderProps>) {
    const isOwnProfile = viewMode === "student";

    // Build display name
    const nameParts = [student?.first_name, student?.middle_name, student?.last_name].filter(Boolean);
    const name = nameParts.length > 0 ? nameParts.join(" ") : (student?.student_email || "Student");
    const initials = (student?.first_name?.[0] || "") + (student?.last_name?.[0] || "");

    const completionPct = profileCompletion?.total_percentage ?? 0;

    // Social links config
    const socialLinks = [
        { url: profileLinks?.linkedin_url, icon: LinkedInIcon, label: "LinkedIn" },
        { url: profileLinks?.github_url, icon: GitHubIcon, label: "GitHub" },
        { url: profileLinks?.personal_portfolio_url, icon: Globe, label: "Portfolio" },
        { url: profileLinks?.leetcode_url, icon: Code2, label: "LeetCode" },
        { url: profileLinks?.hackerrank_url, icon: Trophy, label: "HackerRank" },
        { url: profileLinks?.medium_url, icon: BookOpen, label: "Medium" },
        { url: profileLinks?.resume_url, icon: FileText, label: "Resume" },
    ].filter((l) => l.url);

    // SVG circle math for the progress ring
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (completionPct / 100) * circumference;

    // Status booleans
    const isActive = student?.student_status === "active";
    const isComplete = profileCompletion?.is_complete || student?.profile_complete;
    const isApproved = student?.profile_is_approved;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* ─── Dark Hero Banner ─── */}
            <div className="relative px-6 sm:px-8 py-8 overflow-hidden" style={{ background: "linear-gradient(135deg, #192644 0%, #2c3b55 50%, #1e3048 100%)" }}>
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                <div className="relative flex items-start justify-between flex-wrap gap-6">
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-5 sm:gap-6">
                        {/* Avatar with hover glow */}
                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500/40 to-pink-500/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div
                                className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-white flex-shrink-0 ring-2 ring-white/10"
                                style={{ background: "linear-gradient(135deg, #9e3a96 0%, #8b5cf6 100%)" }}
                            >
                                {initials || "S"}
                            </div>
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{name}</h1>

                            {/* Department + College */}
                            {(student?.dept_name || student?.college_name) && (
                                <p className="text-slate-300 text-sm mt-1">
                                    {student?.dept_name}
                                    {student?.dept_name && student?.college_name && " · "}
                                    {student?.college_name}
                                </p>
                            )}

                            {/* Year info */}
                            {student?.student_passout_year && (
                                <p className="text-slate-400 text-xs mt-0.5">
                                    Year {getCurrentYear(student.student_passout_year)} · Passout {student.student_passout_year}
                                </p>
                            )}

                            {/* Status badges row */}
                            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                {student?.student_status && (
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                                        isActive
                                            ? "bg-emerald-500/15 text-emerald-400"
                                            : "bg-red-500/15 text-red-400"
                                    }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                                        {student.student_status}
                                    </span>
                                )}
                                {isComplete && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-blue-500/15 text-blue-400">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Complete
                                    </span>
                                )}
                                {!isComplete && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400">
                                        <Clock className="h-3 w-3" />
                                        Incomplete
                                    </span>
                                )}
                                {isApproved && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400">
                                        <ShieldCheck className="h-3 w-3" />
                                        Approved
                                    </span>
                                )}
                                {!isApproved && viewMode === "college" && profileCompletion?.profile_approval_status === "pending" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400">
                                        <Clock className="h-3 w-3" />
                                        Pending Review
                                    </span>
                                )}
                                {!isApproved && viewMode === "college" && profileCompletion?.profile_approval_status === "rejected" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-red-500/15 text-red-400">
                                        <XCircle className="h-3 w-3" />
                                        Rejected
                                    </span>
                                )}
                            </div>

                            {/* Area of interest */}
                            {profileLinks?.area_of_interest && profileLinks.area_of_interest.length > 0 && (
                                <p className="text-slate-400 text-xs mt-2">
                                    {profileLinks.area_of_interest.slice(0, 3).join(" · ")}
                                </p>
                            )}

                            {/* Social icons with tooltips */}
                            {socialLinks.length > 0 && (
                                <div className="flex items-center gap-2 mt-3">
                                    {socialLinks.map((link) => {
                                        const Icon = link.icon;
                                        return (
                                            <Tooltip key={link.label}>
                                                <TooltipTrigger asChild>
                                                    <a
                                                        href={link.url!}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 flex items-center justify-center transition-all duration-200"
                                                    >
                                                        <Icon className="h-4 w-4 text-white" />
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" className="text-xs">
                                                    {link.label}
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Profile Completion Ring + Edit Button */}
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            Profile
                        </p>
                        <div className="relative h-[100px] w-[100px]">
                            <svg className="h-[100px] w-[100px] -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                                <circle
                                    cx="50" cy="50" r={radius} fill="none"
                                    stroke="url(#headerProgressGrad)"
                                    strokeWidth="5" strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    className="transition-all duration-1000 ease-out"
                                />
                                <defs>
                                    <linearGradient id="headerProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#694ed6" />
                                        <stop offset="100%" stopColor="#c137a2" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">{completionPct}%</span>
                            </div>
                        </div>

                        {/* Edit button — own profile only */}
                        {isOwnProfile && (
                            <Link
                                to="/student/update-profile"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-200 hover:scale-105 mt-1"
                            >
                                <Pencil className="h-3 w-3" />
                                Edit Profile
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Completion sections — only show unfilled ─── */}
            {profileCompletion?.sections && (() => {
                const incompleteSections = Object.entries(profileCompletion.sections).filter(
                    ([, section]) => !section.completed
                );
                if (incompleteSections.length === 0 && isComplete && isApproved) return null;
                return (
                    <div className="px-6 sm:px-8 py-4 border-t border-gray-100 dark:border-gray-800">
                        {incompleteSections.length > 0 && (
                            <>
                                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                                    Sections to complete
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {incompleteSections.map(([key, section]) => {
                                        const label = key.replaceAll("_", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
                                        return isOwnProfile ? (
                                            <Link
                                                key={key}
                                                to="/student/update-profile"
                                                className="px-3 py-1.5 rounded-full text-xs font-medium border bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                            >
                                                {label}
                                                {section.count === undefined
                                                    ? ` (${section.earned}/${section.weight})`
                                                    : ` (${section.count}/${section.weight})`}
                                            </Link>
                                        ) : (
                                            <span
                                                key={key}
                                                className="px-3 py-1.5 rounded-full text-xs font-medium border bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                            >
                                                {label}
                                                {section.count === undefined
                                                    ? ` (${section.earned}/${section.weight})`
                                                    : ` (${section.count}/${section.weight})`}
                                            </span>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Profile status banner */}
                        <div className={incompleteSections.length > 0 ? "mt-3" : ""}>
                            {!isComplete && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <span className="text-amber-600 dark:text-amber-400 text-xs">⚠</span>
                                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                        Profile is incomplete — fill in the missing sections to reach 100%.
                                    </p>
                                </div>
                            )}
                            {isComplete && !isApproved && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <span className="text-blue-600 dark:text-blue-400 text-xs">ℹ</span>
                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                        Profile is complete but not yet approved by college admin.
                                    </p>
                                </div>
                            )}
                            {isComplete && isApproved && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                                    <p className="text-xs font-medium text-green-700 dark:text-green-400">
                                        Profile is complete and approved.
                                    </p>
                                </div>
                            )}
                            {viewMode === "college" && profileCompletion?.profile_approval_status === "rejected" && profileCompletion.profile_rejection_reason && (
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mt-2">
                                    <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-red-700 dark:text-red-400">Profile rejected</p>
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{profileCompletion.profile_rejection_reason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
