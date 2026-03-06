"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    ChevronsRight,
    X,
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
} from "lucide-react";

interface ProfileNavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

const profileNavItems: ProfileNavItem[] = [
    { label: "Personal Info", path: "/student/profile/personal-info", icon: <User size={16} /> },
    { label: "Academic", path: "/student/profile/academic", icon: <GraduationCap size={16} /> },
    { label: "Sem Info", path: "/student/profile/sem-info", icon: <BookOpen size={16} /> },
    { label: "Skills", path: "/student/profile/skills", icon: <Wrench size={16} /> },
    { label: "Projects", path: "/student/profile/projects", icon: <FolderKanban size={16} /> },
    { label: "Experience", path: "/student/profile/experience", icon: <Briefcase size={16} /> },
    { label: "Achievements", path: "/student/profile/achievements", icon: <Trophy size={16} /> },
    { label: "Certificates", path: "/student/profile/certificates", icon: <Award size={16} /> },
    { label: "Activities", path: "/student/profile/activities", icon: <Activity size={16} /> },
    { label: "Profile Links", path: "/student/profile/profile-links", icon: <Link2 size={16} /> },
];

interface ProfileSidebarProps {
    isExpanded: boolean;
    onCollapse: () => void;
    onExpand: () => void;
}

export default function ProfileSidebar({ isExpanded, onCollapse, onExpand }: ProfileSidebarProps) {
    const location = useLocation();

    /* ===== Collapsed: icon-only sidebar ===== */
    if (!isExpanded) {
        return (
            <aside className="h-full bg-white border-r flex flex-col w-[56px] shrink-0">
                {/* Expand button */}
                <div className="px-2 py-4 flex justify-center border-b border-gray-100">
                    <button
                        onClick={onExpand}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Expand Update Profile"
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>

                {/* Icon-only nav */}
                <nav className="flex-1 py-3 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col items-center gap-1">
                        {profileNavItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    title={item.label}
                                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-400 hover:bg-gray-50 hover:text-blue-600"
                                        }`}
                                >
                                    {item.icon}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </aside>
        );
    }

    /* ===== Expanded: full sidebar with labels ===== */
    return (
        <aside className="h-full bg-white border-r flex flex-col w-[250px] shrink-0 transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Update Profile
                </h2>
                <button
                    onClick={onCollapse}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    title="Collapse"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                    {profileNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${isActive
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                    }`}
                            >
                                <span
                                    className={`${isActive
                                        ? "text-blue-600"
                                        : "text-gray-400 group-hover:text-blue-600"
                                        } transition-colors`}
                                >
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
}
