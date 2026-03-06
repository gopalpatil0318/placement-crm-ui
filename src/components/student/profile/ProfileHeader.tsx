import {
    Linkedin,
    Github,
    Globe,
    Code2,
    BookOpen,
    FileText,
    Trophy,
} from "lucide-react";
import type { ProfileLinks, ProfileCompletion, StudentInfo } from "@/types/student";

interface ProfileHeaderProps {
    student: StudentInfo | null;
    profileLinks: ProfileLinks | null;
    profileCompletion: ProfileCompletion | null;
}

export default function ProfileHeader({
    student,
    profileLinks,
    profileCompletion,
}: ProfileHeaderProps) {
    // Build display name from student object
    const nameParts = [student?.first_name, student?.middle_name, student?.last_name].filter(Boolean);
    const name = nameParts.length > 0 ? nameParts.join(" ") : (student?.student_email || "Student");
    const initials = (student?.first_name?.[0] || "") + (student?.last_name?.[0] || "");

    const completionPct = profileCompletion?.total_percentage ?? 0;

    // Social links config
    const socialLinks = [
        { url: profileLinks?.linkedin_url, icon: Linkedin, label: "LinkedIn" },
        { url: profileLinks?.github_url, icon: Github, label: "GitHub" },
        { url: profileLinks?.personal_portfolio_url, icon: Globe, label: "Portfolio" },
        { url: profileLinks?.leetcode_url, icon: Code2, label: "LeetCode" },
        { url: profileLinks?.hackerrank_url, icon: Trophy, label: "HackerRank" },
        { url: profileLinks?.medium_url, icon: BookOpen, label: "Medium" },
        { url: profileLinks?.resume_url, icon: FileText, label: "Resume" },
    ].filter((l) => l.url);

    // SVG circle math for the progress ring
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (completionPct / 100) * circumference;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Dark header banner */}
            <div
                className="px-8 py-8"
                style={{ background: "linear-gradient(135deg, #192644ff 0%, #2c3b55ff 100%)" }}
            >
                <div className="flex items-start justify-between flex-wrap gap-6">
                    {/* Left: Avatar + Name + Links */}
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div
                            className="h-22 w-22 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #9e3a96ff 0%,  #8b5cf6 100%)" }}
                        >
                            {initials || "S"}
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-white">{name}</h1>

                            {/* Department + College */}
                            {(student?.dept_name || student?.college_name) && (
                                <p className="text-slate-300 text-sm mt-0.5">
                                    {student?.dept_name}
                                    {student?.dept_name && student?.college_name && " · "}
                                    {student?.college_name}
                                </p>
                            )}

                            {/* Year + Status */}
                            <div className="flex items-center gap-2 mt-1">
                                {student?.current_year && (
                                    <span className="text-slate-400 text-xs">
                                        Year {student.current_year} · Passout {student.student_passout_year}
                                    </span>
                                )}
                                {student?.student_status && (
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${student.student_status === "active"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {student.student_status}
                                    </span>
                                )}
                            </div>

                            {/* Area of interest */}
                            {profileLinks?.area_of_interest &&
                                profileLinks.area_of_interest.length > 0 && (
                                    <p className="text-slate-400 text-xs mt-1.5">
                                        {profileLinks.area_of_interest.slice(0, 3).join(" · ")}
                                    </p>
                                )}

                            {/* Social icons */}
                            {socialLinks.length > 0 && (
                                <div className="flex items-center gap-2.5 mt-3">
                                    {socialLinks.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.url!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={link.label}
                                            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        >
                                            <link.icon className="h-4 w-4 text-white" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Profile Completion Ring */}
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                            Profile Completion
                        </p>
                        <div className="relative h-24 w-24">
                            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
                                {/* Background circle */}
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="6"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    fill="none"
                                    stroke="url(#progressGradient)"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    className="transition-all duration-1000 ease-out"
                                />
                                <defs>
                                    <linearGradient
                                        id="progressGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#694ed6" />
                                        <stop offset="100%" stopColor="#c137a2" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                    {completionPct}%
                                </span>
                            </div>
                        </div>
                        {profileCompletion && !profileCompletion.is_complete && (
                            <p className="text-amber-400 text-[10px] font-medium">Incomplete</p>
                        )}
                        {profileCompletion?.is_complete && (
                            <p className="text-green-400 text-[10px] font-medium">Complete ✓</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Completion sections — only show unfilled sections */}
            {profileCompletion?.sections && (() => {
                const incompleteSections = Object.entries(profileCompletion.sections).filter(
                    ([, section]) => !section.completed
                );
                return (
                    <div className="px-8 py-4 border-t border-gray-100">
                        {incompleteSections.length > 0 && (
                            <>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Sections to complete
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {incompleteSections.map(([key, section]) => {
                                        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                                        return (
                                            <span
                                                key={key}
                                                className="px-3 py-1.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200"
                                            >
                                                {label}
                                                {section.count !== undefined
                                                    ? ` (${section.count}/${section.weight})`
                                                    : ` (${section.earned}/${section.weight})`}
                                            </span>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Profile status banner */}
                        <div className={incompleteSections.length > 0 ? "mt-3" : ""}>
                            {!profileCompletion?.is_complete && !student?.profile_complete && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                                    <span className="text-amber-600 text-xs">⚠</span>
                                    <p className="text-xs font-medium text-amber-700">
                                        Profile is incomplete — fill in the missing sections above to reach 100%.
                                    </p>
                                </div>
                            )}
                            {(profileCompletion?.is_complete || student?.profile_complete) && !student?.profile_is_approved && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                                    <span className="text-blue-600 text-xs">ℹ</span>
                                    <p className="text-xs font-medium text-blue-700">
                                        Profile is complete but not yet approved by college admin.
                                    </p>
                                </div>
                            )}
                            {(profileCompletion?.is_complete || student?.profile_complete) && student?.profile_is_approved && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                                    <span className="text-green-600 text-xs">✓</span>
                                    <p className="text-xs font-medium text-green-700">
                                        Profile is complete and approved by college admin.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

