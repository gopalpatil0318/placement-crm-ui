import { useState, useCallback } from "react"
import { Menu, Search, Sun, Moon, Bell } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/sysadmin/useAuth"
import CommandPalette from "@/components/ui/CommandPalette"
import { useCommandPaletteShortcut } from "@/hooks/useCommandPalette"
import { sysadminNav } from "@/lib/navigationRegistry"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: Readonly<HeaderProps>) {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const shouldReduce = useReducedMotion()

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const [imgError, setImgError] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const openPalette = useCallback(() => setIsPaletteOpen(true), [])
  const closePalette = useCallback(() => setIsPaletteOpen(false), [])
  useCommandPaletteShortcut(openPalette)
  const initials = (user?.email || "U").charAt(0).toUpperCase()

  const btnMotion = shouldReduce
    ? {}
    : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } }

  return (
    <header className="sticky top-0 z-30 w-full h-16 shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer"
          {...btnMotion}
        >
          <Menu size={20} />
        </motion.button>

        {/* Search trigger — compact icon button */}
        <motion.button
          type="button"
          onClick={openPalette}
          aria-label="Search (Ctrl+K)"
          title="Search… (Ctrl+K)"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer"
          {...btnMotion}
        >
          <Search size={18} />
        </motion.button>
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
        <motion.button
          type="button"
          aria-label="Notifications"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors relative cursor-pointer"
          {...btnMotion}
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-gray-900" />
        </motion.button>

        {/* Avatar */}
        <div className="ml-1">
          {!imgError && user?.email ? (
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=3b82f6&color=fff&size=36`}
              alt={user.email}
              width={36}
              height={36}
              decoding="async"
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

      <CommandPalette items={sysadminNav} isOpen={isPaletteOpen} onClose={closePalette} />
    </header>
  )
}
