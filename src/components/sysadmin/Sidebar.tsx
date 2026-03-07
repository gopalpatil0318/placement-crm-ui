import React, { useState, useEffect } from "react";
import {
  Database,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/sysadmin/useAuth";

interface SubItem {
  label: string;
  path: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path?: string;
  subItems?: SubItem[];
}

const navItems: NavItemProps[] = [
  {
    icon: <LayoutDashboard size={18} />,
    label: "Dashboard",
    path: "/sysadmin/dashboard",
  },
  {
    icon: <Database size={18} />,
    label: "Colleges",
    subItems: [
      { label: "View Colleges", path: "/sysadmin/colleges" },
      { label: "Create College", path: "/sysadmin/colleges/create" },
    ],
  },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const activeItem = navItems.find((item) =>
      item.subItems?.some((sub) => location.pathname.startsWith(sub.path))
    )?.label;

    return activeItem ? [activeItem] : ["Colleges"];
  });

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  useEffect(() => {
    const activeItem = navItems.find((item) =>
      item.subItems?.some((sub) => location.pathname.startsWith(sub.path))
    )?.label;

    if (activeItem) {
      setExpandedItems((prev) =>
        prev.includes(activeItem) ? prev : [...prev, activeItem]
      );
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/sysadmin/login");
    }
  };

  return (
    <aside
      className={`h-screen bg-white border-r flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-[280px]" : "w-0"}`}
    >
      <div className="flex flex-col h-full min-w-[280px]">
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-2 shrink-0">
          <span className="text-2xl font-bold text-blue-600 tracking-tight">
            PCRM
          </span>
        </div>

        {/* Profile Card */}
        <div className="px-4 mb-2 shrink-0">
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
                  {user?.email || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace("_", " ") || "Admin"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-2 px-4 text-sm overflow-y-auto custom-scrollbar pb-4">
          <p className="mb-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Super Admin
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                isExpanded={expandedItems.includes(item.label)}
                onToggle={() => toggleExpand(item.label)}
                activePath={location.pathname}
              />
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group font-medium"
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

const NavItem = React.memo(function NavItem({
  icon,
  label,
  path,
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
    path === activePath || subItems?.some((sub) => activePath.startsWith(sub.path));

  return (
    <div className="mb-1">
      {hasSubItems ? (
        <button
          type="button"
          onClick={onToggle}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"} transition-colors`}
            >
              {icon}
            </span>
            {label}
          </div>

          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isActive
              ? "text-blue-600"
              : "text-gray-400 group-hover:text-blue-600"
              }`}
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
          <span
            className={`${activePath === path ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"} transition-colors`}
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
              className={`flex items-center gap-2 py-2 px-3 rounded-md transition-all duration-200 group ${activePath === sub.path || activePath.startsWith(sub.path + "/")
                ? "text-blue-600 bg-blue-50/50 font-medium"
                : "text-gray-500 hover:text-blue-600"
                }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all ${activePath === sub.path || activePath.startsWith(sub.path + "/")
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
});
