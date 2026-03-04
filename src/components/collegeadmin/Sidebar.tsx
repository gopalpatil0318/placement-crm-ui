"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ChevronDown,
  GraduationCap,
  BriefcaseBusiness,
  Settings,
  LogOut,
  User as UserIcon,
  BookOpen,
  UserCheck
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/collegeadmin/useAuth"; // College admin specific hook

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

// Updated navigation items specifically for College Administrators
const navItems: { section: string; items: NavItemProps[] }[] = [
  {
    section: "Main Navigation",
    items: [
      {
        icon: <LayoutDashboard size={18} />,
        label: "Dashboard",
        path: "/collegeadmin/dashboard",
      },
    ],
  },
  {
    section: "Academic Management",
    items: [
      {
        icon: <GraduationCap size={18} />,
        label: "Users",
        subItems: [
          { label: "All Users", path: "/collegeadmin/view-users" },
          { label: "Create Users", path: "/collegeadmin/create-user" },
        ],
      },
      {
        icon: <UserCheck size={18} />,
        label: "Students",
        subItems: [
          { label: "Student Registration", path: "/collegeadmin/create-student" },
          { label: "Bulk Registration", path: "/collegeadmin/bulk-register" },
        ],
      },
      {
        icon: <BookOpen size={18} />,
        label: "Departments",
        subItems: [
          { label: "All Departments", path: "/collegeadmin/departments" },
          { label: "Create Department", path: "/collegeadmin/create-department" },
        ],
      },
    ],
  },
  {
    section: "Career & Placement",
    items: [
      {
        icon: <BriefcaseBusiness size={18} />,
        label: "Placements",
        badge: "Active",
        subItems: [
          { label: "Job Drives", path: "/collegeadmin/placements/drives" },
          { label: "Placement Stats", path: "/collegeadmin/placements/stats" },
        ]
      },
    ],
  },
  {
    section: "System",
    items: [
      { icon: <Settings size={18} />, label: "College Settings", path: "/collegeadmin/settings" },
    ],
  },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Initialize expandedItems logic from sysadmin
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const activeSection = navItems
      .flatMap(section => section.items)
      .find(item => item.subItems?.some(sub => location.pathname.startsWith(sub.path)))
      ?.label;

    const initial = ["Dashboard"];
    if (activeSection && !initial.includes(activeSection)) {
      initial.push(activeSection);
    }
    return initial;
  });

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  // Auto-expand logic based on current URL
  useEffect(() => {
    const activeSection = navItems
      .flatMap(section => section.items)
      .find(item => item.subItems?.some(sub => location.pathname.startsWith(sub.path)))
      ?.label;

    if (activeSection) {
      setExpandedItems(prev => prev.includes(activeSection) ? prev : [...prev, activeSection]);
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
    <aside className={`h-screen bg-white border-r flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-[280px]" : "w-0"}`}>
      <div className="flex flex-col h-full min-w-[280px]">

        {/* Header: Logo consistent with sysadmin */}
        <div className="px-6 py-5 flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600 tracking-tight">PCRM</span>
        </div>

        {/* Dynamic Profile Card */}
        <div className="px-4 mb-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <UserIcon size={20} />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-gray-900 truncate" title={user?.email}>
                  {user?.email || "College Admin"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace("_", " ") || "Institution User"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Nav Sections */}
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

        {/* Footer Logout Button */}
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

// Sub-component for individual Nav Items
function NavItem({ icon, label, path, badge, subItems, isExpanded, onToggle, activePath }: any) {
  const hasSubItems = subItems && subItems.length > 0;
  const isActive = path === activePath || subItems?.some((sub: any) => sub.path === activePath);

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
          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase">
                {badge}
              </span>
            )}
            <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`} />
          </div>
        </button>
      ) : (
        <Link to={path || "#"} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activePath === path ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}>
          <span className={`${activePath === path ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"} transition-colors`}>
            {icon}
          </span>
          {label}
        </Link>
      )}

      {hasSubItems && isExpanded && (
        <div className="ml-9 mt-1.5 space-y-1 relative before:absolute before:top-0 before:bottom-2 before:bg-gray-100">
          {subItems.map((sub: any) => (
            <Link key={sub.path} to={sub.path} className={`flex items-center gap-2 py-2 px-3 rounded-md transition-all duration-200 group ${activePath === sub.path ? "text-blue-600 bg-blue-50/50 font-medium" : "text-gray-500 hover:text-blue-600"}`}>
              <span className={`h-1.5 w-1.5 rounded-full transition-all ${activePath === sub.path ? "bg-blue-600 scale-125" : "bg-gray-300 group-hover:bg-blue-600"}`} />
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}