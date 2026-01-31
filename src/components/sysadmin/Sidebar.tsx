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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
    section: "Super Admin",
    items: [
      {
        icon: <Database size={18} />,
        label: "Colleges",
        subItems: [
          { label: "View Colleges", path: "/sysadmin/view-colleges" },
          { label: "Create College", path: "/sysadmin/create-college" },
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
          { label: "Default", path: "/sysadmin/dashboard" },
          { label: "Analytics", path: "/sysadmin/analytics" },
          { label: "Finance", path: "/sysadmin/finance" },
        ],
      },
      {
        icon: <LayoutGrid size={18} />,
        label: "Layouts",
        path: "/sysadmin/layouts",
      },
    ],
  },
  {
    section: "Widget",
    items: [
      { icon: <BarChart3 size={18} />, label: "Statistics", path: "/sysadmin/statistics" },
      { icon: <Database size={18} />, label: "Data", path: "/sysadmin/data" },
      { icon: <LineChart size={18} />, label: "Chart", path: "/sysadmin/chart" },
    ],
  },
  {
    section: "Admin Panel",
    items: [
      {
        icon: <GraduationCap size={18} />,
        label: "Online Courses",
        path: "/sysadmin/courses",
        subItems: [{ label: "All Courses", path: "/sysadmin/courses/all" }],
      },
    ],
  },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const location = useLocation();

  // Initialize expandedItems with the section containing the active path
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

  // Auto-expand active section on navigation (for internal link changes)
  useEffect(() => {
    const activeSection = navItems
      .flatMap(section => section.items)
      .find(item => item.subItems?.some(sub => location.pathname.startsWith(sub.path)))
      ?.label;

    if (activeSection) {
      setExpandedItems(prev => prev.includes(activeSection) ? prev : [...prev, activeSection]);
    }
  }, [location.pathname]);

  return (
    <aside className={`h-screen bg-white border-r flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-[280px]" : "w-0"}`}>
      <div className="min-w-[280px]">
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600 tracking-tight">PCRM</span>
        </div>

        {/* Profile Card */}
        <div className="px-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                👨🏻‍💻
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">John Smith</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>

            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M5 4h6M5 12h6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4 text-sm overflow-y-auto custom-scrollbar">
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
      </div>
    </aside>
  );
}

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
  const isActive = path === activePath || subItems?.some((sub) => sub.path === activePath);

  return (
    <div className="mb-1">
      {hasSubItems ? (
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
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
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                {badge}
              </span>
            )}
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"
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
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all ${activePath === sub.path ? "bg-blue-600 scale-125" : "bg-gray-300 group-hover:bg-blue-600"
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

