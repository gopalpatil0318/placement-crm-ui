import { LayoutDashboard, Briefcase, FileText, User, MoreHorizontal } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"

const tabs = [
  { icon: LayoutDashboard, label: "Home", path: "/student/dashboard" },
  { icon: Briefcase, label: "Jobs", path: "/student/jobs" },
  { icon: FileText, label: "Applications", path: "/student/applications" },
  { icon: User, label: "Profile", path: "/student/profile" },
  { icon: MoreHorizontal, label: "More", path: "/student/settings" },
] as const

export default function StudentMobileBottomBar() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path || (path !== "/student/dashboard" && pathname.startsWith(path))

          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute -top-px left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={`transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
              />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
