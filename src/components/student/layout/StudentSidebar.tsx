import { useState, useEffect, type ComponentType } from "react"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bell,
  Trophy,
  User as UserIcon,
  Pencil,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { useCollegeTenant } from "@/context/CollegeTenantContext"
import { sanitizeImageUrl } from "@/utils/sanitize"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SubItem {
  label: string
  path: string
}

interface NavItemConfig {
  icon: ComponentType<{ size?: number; className?: string }>
  label: string
  path?: string
  subItems?: SubItem[]
}

interface NavSection {
  section: string
  items: NavItemConfig[]
}

// ─── Navigation Data ────────────────────────────────────────────────────────────

const navSections: NavSection[] = [
  {
    section: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
      { icon: Bell, label: "Notifications", path: "/student/notifications" },
    ],
  },
  {
    section: "Placements",
    items: [
      { icon: Briefcase, label: "Browse Jobs", path: "/student/jobs" },
      { icon: FileText, label: "My Applications", path: "/student/applications" },
      { icon: Trophy, label: "My Placements", path: "/student/placements" },
      { icon: ShieldAlert, label: "My Restrictions", path: "/student/restrictions" },
      { icon: ShieldCheck, label: "Override Requests", path: "/student/overrides" },
    ],
  },
  {
    section: "Training",
    items: [
      { icon: GraduationCap, label: "Training Programs", path: "/student/trainings" },
    ],
  },
  {
    section: "Community",
    items: [
      { icon: MessageSquare, label: "Feedback", path: "/student/feedback" },
      { icon: HelpCircle, label: "Interview Questions", path: "/student/interview-questions" },
    ],
  },
  {
    section: "Profile & Account",
    items: [
      { icon: UserIcon, label: "View Profile", path: "/student/profile" },
      { icon: Pencil, label: "Update Profile", path: "/student/update-profile" },
      {
        icon: Settings,
        label: "Settings",
        subItems: [
          { label: "Change Password", path: "/student/change-password" },
        ],
      },
    ],
  },
]

// ─── Sidebar Component ─────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

// ─── Helpers to reduce cognitive complexity ────────────────────────────────────

function getNavSectionClass(idx: number): string {
  return idx === 0 ? "" : "mt-5"
}

function getLogoutClass(isOpen: boolean): string {
  return `flex items-center gap-3 w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium cursor-pointer
    ${isOpen ? "px-6 py-3" : "justify-center py-3"}`
}

function getCollapseClass(isOpen: boolean): string {
  return `flex items-center gap-3 w-full text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer border-t border-gray-100 dark:border-gray-800
    ${isOpen ? "px-6 py-3" : "justify-center py-3"}`
}

export default function StudentSidebar({ isOpen, onToggle }: Readonly<SidebarProps>) {
  const location = useLocation()
  const { user, logout } = useStudentAuth()
  const { college } = useCollegeTenant()
  const shouldReduce = useReducedMotion()
  const [logoError, setLogoError] = useState(false)

  // Auto-expand the section containing the active path
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const active = navSections
      .flatMap((s) => s.items)
      .find((item) =>
        item.subItems?.some((sub) => location.pathname === sub.path),
      )?.label
    return active ? [active] : []
  })

  useEffect(() => {
    const active = navSections
      .flatMap((s) => s.items)
      .find((item) =>
        item.subItems?.some((sub) => location.pathname === sub.path),
      )?.label
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- navigation sync
      setExpandedItems((prev) =>
        prev.includes(active) ? prev : [...prev, active],
      )
    }
  }, [location.pathname])

  const toggleExpand = (label: string) =>
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    )

  const handleLogout = async () => {
    try { await logout() } catch { /* toast shown in context */ }
  }

  const sidebarTransition = shouldReduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 30 }

  const initials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : (user?.name || user?.email || "S").charAt(0).toUpperCase()

  return (
    <motion.aside
      animate={{ width: isOpen ? 264 : 68 }}
      transition={sidebarTransition}
      className="h-screen relative flex flex-col overflow-hidden shrink-0
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
        border-r border-gray-200/60 dark:border-gray-800/60"
    >
      {/* ── College branding ── */}
      <div className="px-4 py-5 flex items-center gap-2.5 shrink-0 min-h-[60px]">
        {college && sanitizeImageUrl(college.college_logo_url) && !logoError ? (
          <img
            src={sanitizeImageUrl(college.college_logo_url)!}
            alt={college.college_name}
            width={32}
            height={32}
            decoding="async"
            onError={() => setLogoError(true)}
            className="h-8 w-8 shrink-0 rounded-xl object-contain"
          />
        ) : (
          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <GraduationCap size={20} className="text-white" />
          </div>
        )}
        <motion.span
          animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate overflow-hidden whitespace-nowrap"
          title={college?.college_name}
        >
          {college?.college_name || "PlacementCRM"}
        </motion.span>
      </div>

      {/* ── User Card (expanded only) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="px-3 mb-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-100/60 dark:border-indigo-800/30">
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user?.name || "Student"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.deptName || user?.email || ""}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collapsed: small avatar ── */}
      {!isOpen && (
        <div className="px-3 mb-3 flex justify-center">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
            {initials}
          </div>
        </div>
      )}

      {/* ── Nav Sections ── */}
      <nav className="flex-1 px-3 text-sm overflow-y-auto pb-4 scrollbar-thin">
        {navSections.map((section, idx) => (
          <div key={section.section} className={getNavSectionClass(idx)}>
            {isOpen ? (
              <p className="mb-2 px-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {section.section}
              </p>
            ) : (
              idx > 0 && <div className="mb-2 mx-2 border-b border-gray-100 dark:border-gray-800" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavItem
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

      {/* ── Bottom: Logout + Collapse Toggle ── */}
      <div className="shrink-0 border-t border-gray-100 dark:border-gray-800">
        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className={getLogoutClass(isOpen)}
          aria-label="Log out"
          title={isOpen ? undefined : "Log Out"}
        >
          <LogOut size={18} className="shrink-0" />
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap text-sm"
          >
            Log Out
          </motion.span>
        </button>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={onToggle}
          className={getCollapseClass(isOpen)}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <motion.span
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronLeft size={18} />
          </motion.span>
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap text-sm"
          >
            Collapse
          </motion.span>
        </button>
      </div>
    </motion.aside>
  )
}

// ─── NavItem Sub-component ──────────────────────────────────────────────────────

interface NavItemProps {
  item: NavItemConfig
  isExpanded: boolean
  onToggle: () => void
  activePath: string
  isOpen: boolean
  shouldReduce: boolean | null
}

// ─── NavItem style helpers ──────────────────────────────────────────────────────

function getIconClass(isActive: boolean): string {
  return isActive
    ? "shrink-0 transition-colors text-indigo-600 dark:text-indigo-400"
    : "shrink-0 transition-colors text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
}

function getNavButtonClass(isOpen: boolean, isActive: boolean): string {
  const layout = isOpen ? "justify-between px-3" : "justify-center px-0"
  const state = isActive
    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-indigo-600 dark:hover:text-indigo-400"
  return `w-full flex items-center rounded-xl transition-all duration-200 group cursor-pointer ${layout} py-2.5 ${state}`
}

function getNavLinkClass(isOpen: boolean, isActive: boolean): string {
  const layout = isOpen ? "px-3" : "justify-center px-0"
  const state = isActive
    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-indigo-600 dark:hover:text-indigo-400"
  return `flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group ${layout} ${state}`
}

function getSubItemClass(isSubActive: boolean): string {
  return isSubActive
    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-900/10 font-medium"
    : "text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/40"
}

function getSubDotClass(isSubActive: boolean): string {
  return isSubActive
    ? "bg-indigo-600 dark:bg-indigo-400 scale-125"
    : "bg-gray-300 dark:bg-gray-600 group-hover:bg-indigo-500"
}

function SidebarNavItem({ item, isExpanded, onToggle, activePath, isOpen, shouldReduce }: Readonly<NavItemProps>) {
  const { icon: Icon, label, path, subItems } = item
  const hasSubItems = subItems && subItems.length > 0
  const isActive = path === activePath || subItems?.some((sub) => sub.path === activePath)
  const titleAttr = isOpen ? undefined : label

  const iconEl = (
    <span className={getIconClass(!!isActive)}>
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
          title={titleAttr}
          className={getNavButtonClass(isOpen, !!isActive)}
        >
          <div className="flex items-center gap-3">
            {iconEl}
            {labelEl}
          </div>
          {isOpen && (
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 group-hover:text-indigo-600"}`}
            />
          )}
        </button>
      ) : (
        <Link
          to={path || "#"}
          title={titleAttr}
          className={getNavLinkClass(isOpen, activePath === path)}
        >
          {iconEl}
          {labelEl}
        </Link>
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-indigo-500 to-blue-500" />
      )}

      {/* Sub-items */}
      <AnimatePresence initial={false}>
        {hasSubItems && isExpanded && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={shouldReduce ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-9 mt-1 space-y-0.5 relative before:absolute before:left-0 before:top-0 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-700/50">
              {subItems.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 group text-[13px] ${getSubItemClass(activePath === sub.path)}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full transition-all ${getSubDotClass(activePath === sub.path)}`} />
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
