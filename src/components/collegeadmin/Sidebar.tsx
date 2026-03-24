import { useState, useEffect, type ComponentType } from "react"
import {
  LayoutDashboard,
  ChevronDown,
  GraduationCap,
  BriefcaseBusiness,
  FileText,
  Settings,
  LogOut,
  User as UserIcon,
  BookOpen,
  UserCheck,
  Building2,
  Lightbulb,
  ClipboardCheck,
  MessageSquare,
  Bell,
  ShieldAlert,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useAuth } from "@/hooks/collegeadmin/useAuth"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SubItem {
  label: string
  path: string
}

interface NavItemConfig {
  icon: ComponentType<{ size?: number; className?: string }>
  label: string
  path?: string
  badge?: string
  subItems?: SubItem[]
  allowedRoles?: string[]
}

interface NavSection {
  section: string
  items: NavItemConfig[]
}

// ─── Navigation Data (icon REFERENCES, not JSX) ────────────────────────────────

const navItems: NavSection[] = [
  {
    section: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/college/dashboard" },
    ],
  },
  {
    section: "Recruitment & Jobs",
    items: [
      {
        icon: Building2,
        label: "Companies",
        allowedRoles: ["collegeadmin", "tpo", "tpc"],
        subItems: [
          { label: "All Companies", path: "/college/companies" },
          { label: "Add Company", path: "/college/create-company" },
        ],
      },
      {
        icon: BriefcaseBusiness,
        label: "Job Postings",
        allowedRoles: ["collegeadmin", "tpo", "tpc"],
        subItems: [
          { label: "All Jobs", path: "/college/jobs" },
          { label: "Create Job", path: "/college/create-job" },
          { label: "Override Requests", path: "/college/overrides" },
        ],
      },
      {
        icon: BriefcaseBusiness,
        label: "Placements",
        badge: "Active",
        allowedRoles: ["collegeadmin", "tpo", "tpc"],
        subItems: [
          { label: "All Placements", path: "/college/placements" },
          { label: "Placement Stats", path: "/college/placements/stats" },
        ],
      },
    ],
  },
  {
    section: "Student Management",
    items: [
      {
        icon: UserCheck,
        label: "Students",
        subItems: [
          { label: "All Students", path: "/college/students" },
          { label: "Student Registration", path: "/college/create-student" },
          { label: "Bulk Registration", path: "/college/bulk-register" },
        ],
      },
      { icon: ClipboardCheck, label: "Verification Center", path: "/college/verifications" },
      { icon: ShieldAlert, label: "Student Restrictions", path: "/college/restrictions" },
    ],
  },
  {
    section: "Academics & Training",
    items: [
      {
        icon: BookOpen,
        label: "Departments",
        allowedRoles: ["collegeadmin"],
        subItems: [
          { label: "All Departments", path: "/college/departments" },
          { label: "Create Department", path: "/college/create-department" },
        ],
      },
      { icon: Lightbulb, label: "Skills Master", path: "/college/skills" },
      {
        icon: BookOpen,
        label: "Training Programs",
        subItems: [
          { label: "All Programs", path: "/college/training-programs" },
          { label: "Create Program", path: "/college/create-training-program" },
        ],
      },
      {
        icon: FileText,
        label: "Policies",
        allowedRoles: ["collegeadmin", "tpo"],
        subItems: [
          { label: "All Policies", path: "/college/placement-policies" },
        ],
      },
    ],
  },
  {
    section: "Feedback & Communications",
    items: [
      {
        icon: MessageSquare,
        label: "Feedback & Reviews",
        subItems: [
          { label: "Placement Feedback", path: "/college/feedback" },
          { label: "Interview Questions", path: "/college/interview-questions" },
        ],
      },
      {
        icon: Bell,
        label: "Notifications",
        subItems: [
          { label: "Send Notification", path: "/college/send-notification" },
          { label: "Sent History", path: "/college/notification-history" },
        ],
      },
    ],
  },
  {
    section: "Administration",
    items: [
      {
        icon: GraduationCap,
        label: "Users",
        allowedRoles: ["collegeadmin"],
        subItems: [
          { label: "All Users", path: "/college/view-users" },
          { label: "Create Users", path: "/college/create-user" },
        ],
      },
      {
        icon: Settings,
        label: "Settings",
        subItems: [
          { label: "Change Password", path: "/college/change-password" },
        ],
      },
    ],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getFilteredNavItems(role: string | undefined): NavSection[] {
  if (!role) return []
  return navItems
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(role),
      ),
    }))
    .filter((section) => section.items.length > 0)
}

// ─── Sidebar Component ─────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean
  /** Mobile: called when user clicks backdrop overlay */
  onClose?: () => void
  /** true when viewport < lg breakpoint */
  isMobile?: boolean
}

export default function Sidebar({ isOpen, onClose, isMobile = false }: SidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const shouldReduce = useReducedMotion()
  const filteredNav = getFilteredNavItems(user?.role)

  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const activeSection = filteredNav
      .flatMap((s) => s.items)
      .find((item) =>
        item.subItems?.some((sub) => location.pathname.startsWith(sub.path)),
      )?.label
    const initial = ["Dashboard"]
    if (activeSection && !initial.includes(activeSection)) initial.push(activeSection)
    return initial
  })

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    )
  }

  useEffect(() => {
    const activeSection = filteredNav
      .flatMap((s) => s.items)
      .find((item) =>
        item.subItems?.some((sub) => location.pathname.startsWith(sub.path)),
      )?.label
    if (activeSection) {
      setExpandedItems((prev) =>
        prev.includes(activeSection) ? prev : [...prev, activeSection],
      )
    }
  }, [location.pathname, filteredNav])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Error toast already shown in context
    }
  }

  // ── Animation config ──
  const sidebarTransition = shouldReduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 30 }

  return (
    <>
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {isOpen && onClose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: isMobile ? (isOpen ? 280 : 0) : (isOpen ? 280 : 72) }}
        transition={sidebarTransition}
        className={`h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden
          ${isMobile ? "fixed z-50" : "relative"}`}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2 shrink-0">
          <span className="text-2xl font-bold text-blue-600 tracking-tight shrink-0 w-8 text-center">P</span>
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
            transition={{ duration: 0.15 }}
            className="text-2xl font-bold text-blue-600 tracking-tight overflow-hidden whitespace-nowrap"
          >
            CRM
          </motion.span>
        </div>

        {/* User Card — visible only when expanded */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="px-4 mb-2 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-900 transition-colors group overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <UserIcon size={20} />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={user?.name || user?.email}>
                    {user?.name || user?.email || "College User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role?.replace("_", " ") || "Institution User"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav Sections */}
        <nav className="flex-1 mt-2 px-3 text-sm overflow-y-auto pb-4">
          {filteredNav.map((section, idx) => (
            <div key={section.section} className={idx !== 0 ? "mt-6" : ""}>
              {isOpen ? (
                <p className="mb-2 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden">
                  {section.section}
                </p>
              ) : (
                <div className="mb-2 border-b border-gray-100 dark:border-gray-800" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.label}
                    item={item}
                    isExpanded={expandedItems.includes(item.label)}
                    onToggle={() => toggleExpand(item.label)}
                    activePath={location.pathname}
                    isOpen={isOpen}
                    shouldReduce={shouldReduce}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group font-medium cursor-pointer
              ${isOpen ? "px-3 py-2.5" : "justify-center py-2.5"}`}
            aria-label="Log out"
            title={!isOpen ? "Log Out" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            <motion.span
              animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              Log Out
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}

// ─── NavItem Sub-component ──────────────────────────────────────────────────────

interface NavItemComponentProps {
  item: NavItemConfig
  isExpanded: boolean
  onToggle: () => void
  activePath: string
  isOpen: boolean
  shouldReduce: boolean | null
}

function NavItem({ item, isExpanded, onToggle, activePath, isOpen, shouldReduce }: NavItemComponentProps) {
  const { icon: Icon, label, path, badge, subItems } = item
  const hasSubItems = subItems && subItems.length > 0
  const isActive = path === activePath || subItems?.some((sub) => sub.path === activePath)

  const iconEl = (
    <span className={`shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 dark:text-gray-500 group-hover:text-blue-600"} transition-colors`}>
      <Icon size={18} />
    </span>
  )

  const labelEl = (
    <motion.span
      animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
      transition={{ duration: 0.15 }}
      className="overflow-hidden whitespace-nowrap"
    >
      {label}
    </motion.span>
  )

  return (
    <div className="relative">
      {hasSubItems ? (
        <button
          type="button"
          onClick={onToggle}
          title={!isOpen ? label : undefined}
          className={`w-full flex items-center rounded-lg transition-all duration-200 group cursor-pointer
            ${isOpen ? "justify-between px-3" : "justify-center px-0"} py-2.5
            ${isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600"}
          `}
        >
          <div className="flex items-center gap-3">
            {iconEl}
            {labelEl}
          </div>
          {isOpen && (
            <div className="flex items-center gap-2 shrink-0">
              {badge && (
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase">
                  {badge}
                </span>
              )}
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`}
              />
            </div>
          )}
        </button>
      ) : (
        <Link
          to={path || "#"}
          title={!isOpen ? label : undefined}
          className={`flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group
            ${isOpen ? "px-3" : "justify-center px-0"}
            ${activePath === path ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600"}
          `}
        >
          {iconEl}
          {labelEl}
        </Link>
      )}

      {/* Active indicator bar — no layoutId to avoid cross-item jank */}
      {isActive && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-blue-600" />
      )}

      {/* Sub-items with animated expand/collapse */}
      <AnimatePresence initial={false}>
        {hasSubItems && isExpanded && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={shouldReduce ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-9 mt-1 space-y-0.5 relative before:absolute before:left-0 before:top-0 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-700">
              {subItems.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  className={`flex items-center gap-2 py-2 px-3 rounded-md transition-all duration-200 group
                    ${activePath === sub.path ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 font-medium" : "text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"}
                  `}
                >
                  <span className={`h-1.5 w-1.5 rounded-full transition-all ${activePath === sub.path ? "bg-blue-600 scale-125" : "bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-600"}`} />
                  {sub.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
