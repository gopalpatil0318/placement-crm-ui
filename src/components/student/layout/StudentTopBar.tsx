import { useState, useCallback, useRef, useEffect } from "react"
import { Menu, Search, Sun, Moon, Bell } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useTheme } from "next-themes"
import { useLocation } from "react-router-dom"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { useUnreadCount } from "@/hooks/student/notifications/useUnreadCount"
import NotificationDropdown from "@/components/student/notifications/NotificationDropdown"

interface TopBarProps {
  onMenuClick: () => void
  isMobile: boolean
}

export default function StudentTopBar({ onMenuClick, isMobile }: Readonly<TopBarProps>) {
  const { theme, setTheme } = useTheme()
  const { user } = useStudentAuth()
  const { unreadCount, badgeLabel } = useUnreadCount()
  const shouldReduce = useReducedMotion()
  const location = useLocation()
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifContainerRef = useRef<HTMLDivElement>(null)
  const toggleNotifDropdown = useCallback(() => setIsNotifOpen((prev) => !prev), [])
  const closeNotifDropdown = useCallback(() => setIsNotifOpen(false), [])

  // Auto-close dropdown on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- route change sync
    setIsNotifOpen(false)
  }, [location.pathname])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const initials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : (user?.name || user?.email || "S").charAt(0).toUpperCase()

  const btnMotion = shouldReduce
    ? {}
    : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } }

  return (
    <header className="sticky top-0 z-30 w-full h-14 shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between px-4 sm:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {isMobile && (
          <motion.button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer"
            {...btnMotion}
          >
            <Menu size={20} />
          </motion.button>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search… (Ctrl+K)"
            className="pl-9 pr-4 py-2 w-48 sm:w-56 lg:w-64 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer relative overflow-hidden"
          {...btnMotion}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "dark" ? (
              <motion.span
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                <Moon size={18} />
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                <Sun size={18} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={notifContainerRef}>
          <motion.button
            type="button"
            onClick={toggleNotifDropdown}
            aria-label="Notifications"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer relative"
            {...btnMotion}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white dark:ring-gray-900">
                {badgeLabel}
              </span>
            )}
          </motion.button>
          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={closeNotifDropdown}
            unreadCount={unreadCount}
            containerRef={notifContainerRef}
          />
        </div>

        {/* Avatar (mobile only — desktop sidebar has user card) */}
        {isMobile && (
          <div className="ml-1 h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
            {initials}
          </div>
        )}
      </div>
    </header>
  )
}
