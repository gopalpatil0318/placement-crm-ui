import React, { useState, useEffect, useMemo } from "react";
import {
    LayoutDashboard,
    ChevronDown,
    User as UserIcon,
    Briefcase,
    FileText,
    Award,
    Settings,
    LogOut,
    Lock,
    ClipboardList,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStudentAuth } from "@/hooks/student/useStudentAuth";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubItem {
    label: string;
    path: string;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    path?: string;
    subItems?: SubItem[];
    disabled?: boolean;
    disabledMessage?: string;
}

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useStudentAuth();

    const isProfileApproved = user?.profileIsApproved === true;

    const navItems: { section: string; items: NavItemProps[] }[] = useMemo(() => [
        {
            section: "Main",
            items: [
                {
                    icon: <LayoutDashboard size={18} />,
                    label: "Dashboard",
                    path: "/student/dashboard",
                },
                {
                    icon: <ClipboardList size={18} />,
                    label: "Student Profile",
                    path: "/student/profile",
                },
                {
                    icon: <UserIcon size={18} />,
                    label: "My Profile",
                    subItems: [
                        { label: "Personal Info", path: "/student/personal-info" },
                        { label: "Academic Info", path: "/student/academic-info" },
                        { label: "Semester Info", path: "/student/sem-info" },
                        { label: "Skills", path: "/student/skills" },
                        { label: "Experience", path: "/student/experience" },
                        { label: "Projects", path: "/student/projects" },
                        { label: "Certificates", path: "/student/certificates" },
                        { label: "Achievements", path: "/student/achievements" },
                        { label: "Activities", path: "/student/activities" },
                        { label: "Profile Links", path: "/student/profile-links" },
                    ],
                },
            ],
        },
        {
            section: "Placements",
            items: [
                {
                    icon: <Briefcase size={18} />,
                    label: "Job Listings",
                    path: "/student/jobs",
                    disabled: !isProfileApproved,
                    disabledMessage: "Complete and get your profile approved to access this section",
                },
                {
                    icon: <FileText size={18} />,
                    label: "My Applications",
                    path: "/student/applications",
                    disabled: !isProfileApproved,
                    disabledMessage: "Complete and get your profile approved to access this section",
                },
                {
                    icon: <Award size={18} />,
                    label: "Placement Status",
                    path: "/student/placements",
                    disabled: !isProfileApproved,
                    disabledMessage: "Complete and get your profile approved to access this section",
                },
            ],
        },
        {
            section: "Account",
            items: [
                {
                    icon: <Settings size={18} />,
                    label: "Settings",
                    subItems: [
                        { label: "Change Password", path: "/student/change-password" },
                    ],
                },
            ],
        },
    ], [isProfileApproved]);

    const [expandedItems, setExpandedItems] = useState<string[]>(() => {
        const activeSection = navItems
            .flatMap((section) => section.items)
            .find((item) =>
                item.subItems?.some((sub) =>
                    location.pathname.startsWith(sub.path)
                )
            )?.label;

        const initial: string[] = [];
        if (activeSection) initial.push(activeSection);
        return initial;
    });

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label]
        );
    };

    useEffect(() => {
        const activeSection = navItems
            .flatMap((section) => section.items)
            .find((item) =>
                item.subItems?.some((sub) =>
                    location.pathname.startsWith(sub.path)
                )
            )?.label;

        if (activeSection) {
            setExpandedItems((prev) =>
                prev.includes(activeSection) ? prev : [...prev, activeSection]
            );
        }
    }, [location.pathname, navItems]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/student/login", { replace: true });
        } catch {
            navigate("/student/login", { replace: true });
        }
    };

    const displayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : user?.email || "Student";
    const displayDept = user?.deptName || "Student";

    return (
        <aside
            className={`h-screen bg-white border-r flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-[280px]" : "w-0"
                }`}
        >
            <div className="flex flex-col h-full min-w-[280px]">
                {/* Header: Logo */}
                <div className="px-6 py-5 flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600 tracking-tight">
                        PCRM
                    </span>
                </div>

                {/* Header: Profile Card */}
                <div className="px-4 mb-2">
                    <Link
                        to="/student/profile"
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-colors group"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <UserIcon size={20} />
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-semibold text-gray-900 truncate" title={displayName}>
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500 truncate" title={displayDept}>
                                    {displayDept}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Scrollable Navigation */}
                <nav className="flex-1 mt-2 px-4 text-sm overflow-y-auto custom-scrollbar pb-4">
                    {navItems.map((section, idx) => (
                        <div key={section.section} className={idx !== 0 ? "mt-8" : ""}>
                            <p className="mb-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {section.section}
                            </p>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <NavItem
                                        key={item.label}
                                        {...item}
                                        isExpanded={expandedItems.includes(item.label)}
                                        onToggle={() => toggleExpand(item.label)}
                                        activePath={location.pathname}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer: Logout Button */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group font-medium cursor-pointer"
                    >
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

function NavItem({
    icon,
    label,
    path,
    subItems,
    disabled,
    disabledMessage,
    isExpanded,
    onToggle,
    activePath,
}: NavItemProps & {
    isExpanded: boolean;
    onToggle: () => void;
    activePath: string;
}) {
    const hasSubItems = subItems && subItems.length > 0;
    const isActive =
        path === activePath ||
        subItems?.some((sub) => sub.path === activePath);

    if (disabled) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 cursor-not-allowed select-none">
                            <span className="text-gray-300">{icon}</span>
                            <span>{label}</span>
                            <Lock size={14} className="ml-auto text-gray-300" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[200px]">
                        <p className="text-xs">{disabledMessage}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className="mb-1">
            {hasSubItems ? (
                <button
                    onClick={onToggle}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span className={`${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"} transition-colors`}>
                            {icon}
                        </span>
                        {label}
                    </div>
                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`}
                    />
                </button>
            ) : (
                <Link
                    to={path || "#"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activePath === path
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                >
                    <span className={`${activePath === path ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"} transition-colors`}>
                        {icon}
                    </span>
                    {label}
                </Link>
            )}

            {hasSubItems && isExpanded && (
                <div className="ml-9 mt-1.5 space-y-1 relative before:absolute before:left-[-14px] before:top-0 before:bottom-2 before:w-[1px] before:bg-gray-100">
                    {subItems.map((sub) => (
                        <Link
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-center gap-2 py-2 px-3 rounded-md transition-all duration-200 group ${activePath === sub.path
                                ? "text-blue-600 bg-blue-50/50 font-medium"
                                : "text-gray-500 hover:text-blue-600"
                                }`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full transition-all ${activePath === sub.path ? "bg-blue-600 scale-125" : "bg-gray-300 group-hover:bg-blue-600"}`} />
                            {sub.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
