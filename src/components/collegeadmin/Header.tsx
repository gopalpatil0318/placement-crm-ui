import { useState } from "react"
import { Menu, Search, Sun, Moon } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/collegeadmin/useAuth"
import NotificationDropdown from "@/components/collegeadmin/notifications/NotificationDropdown"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const shouldReduce = useReducedMotion()

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const [imgError, setImgError] = useState(false)
  const initials = (user?.name || user?.email || "U").charAt(0).toUpperCase()

  const btnMotion = shouldReduce
    ? {}
    : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } }

  return (
    <header className="sticky top-0 z-30 w-full h-16 shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer"
          {...btnMotion}
        >
          <Menu size={20} />
        </motion.button>

        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search… (Ctrl+K)"
            className="pl-9 pr-4 py-2 w-56 lg:w-64 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-shadow"
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
        <NotificationDropdown />

        {/* Avatar */}
        <div className="ml-1">
          {!imgError && user?.name ? (
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=36`}
              alt={user.name}
              onError={() => setImgError(true)}
              className="h-9 w-9 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-semibold text-sm ring-2 ring-gray-200 dark:ring-gray-700">
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
