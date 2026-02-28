"use client";

import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    ChevronDown,
    BarChart3,
    LayoutGrid,
    Database,
    LineChart,
    GraduationCap,
    LogOut,
    User as UserIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useStudentAuth } from "@/hooks/student/useStudentAuth";

interface SubItem {
    label: string;
    path: string;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    path?: string;
    badge?: string;
    subItems?: SubItem[];
}

const navItems: { section: string; items: NavItemProps[] }[] = [
    {
        section: "Student Profile",
        items: [
            {
                icon: <Database size={18} />,
                label: "Students",
                subItems: [
                    { label: "Student Dashboard", path: "/student/dashboard" },
                    { label: "Student Profile", path: "/student/profile" },
                ],
            },
        ],
    },
    {
        section: "Navigation",
        items: [
            {
                icon: <LayoutDashboard size={18} />,
                label: "Dashboard",
                badge: "2",
                subItems: [
                    { label: "Default", path: "/student/dashboard" },
                    { label: "Analytics", path: "/student/analytics" },
                    { label: "Finance", path: "/student/finance" },
                ],
            },
            {
                icon: <LayoutGrid size={18} />,
                label: "Layouts",
                path: "/student/layouts",
            },
        ],
    },
    {
        section: "Widget",
        items: [
            { icon: <BarChart3 size={18} />, label: "Statistics", path: "/student/statistics" },
            { icon: <Database size={18} />, label: "Data", path: "/student/data" },
            { icon: <LineChart size={18} />, label: "Chart", path: "/student/chart" },
        ],
    },
    {
        section: "Student Panel",
        items: [
            {
                icon: <GraduationCap size={18} />,
                label: "Online Courses",
                path: "/student/courses",
                subItems: [{ label: "All Courses", path: "/student/courses/all" }],
            },
        ],
    },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const location = useLocation();
    const { user, logout } = useStudentAuth();

    const [expandedItems, setExpandedItems] = useState<string[]>(() => {
        const activeSection = navItems
            .flatMap((section) => section.items)
            .find((item) =>
                item.subItems?.some((sub) =>
                    location.pathname.startsWith(sub.path)
                )
            )?.label;

        const initial = ["Dashboard"];
        if (activeSection && !initial.includes(activeSection)) {
            initial.push(activeSection);
        }
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
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

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
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <UserIcon size={20} />
                            </div>
                            <div className="truncate">
                                <p
                                    className="text-sm font-semibold text-gray-900 truncate"
                                    title={user?.email}
                                >
                                    {user?.email || "Student"}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.role?.replace("_", " ") || "Student"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Navigation */}
                <nav className="flex-1 mt-2 px-4 text-sm overflow-y-auto custom-scrollbar pb-4">
                    {navItems.map((section, idx) => (
                        <div
                            key={section.section}
                            className={idx !== 0 ? "mt-8" : ""}
                        >
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
                        <LogOut
                            size={18}
                            className="group-hover:scale-110 transition-transform"
                        />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

// Sub-component for individual nav items
function NavItem({
    icon,
    label,
    path,
    badge,
    subItems,
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
                        <span
                            className={`${isActive
                                ? "text-blue-600"
                                : "text-gray-400 group-hover:text-blue-600"
                                } transition-colors`}
                        >
                            {icon}
                        </span>
                        {label}
                    </div>

                    <div className="flex items-center gap-2">
                        {badge && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                                {badge}
                            </span>
                        )}
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                                } ${isActive
                                    ? "text-blue-600"
                                    : "text-gray-400 group-hover:text-blue-600"
                                }`}
                        />
                    </div>
                </button>
            ) : (
                <Link
                    to={path || "#"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activePath === path
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                >
                    <span
                        className={`${activePath === path
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-blue-600"
                            } transition-colors`}
                    >
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
                            <span
                                className={`h-1.5 w-1.5 rounded-full transition-all ${activePath === sub.path
                                    ? "bg-blue-600 scale-125"
                                    : "bg-gray-300 group-hover:bg-blue-600"
                                    }`}
                            />
                            {sub.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
