import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Menu, Search, Sun, Moon, User, KeyRound, LogOut } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/collegeadmin/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import NotificationDropdown from "@/components/collegeadmin/notifications/NotificationDropdown"
import YearSelector from "@/components/collegeadmin/YearSelector"
import CommandPalette from "@/components/ui/CommandPalette"
import { useCommandPaletteShortcut } from "@/hooks/useCommandPalette"
import { collegeAdminNav } from "@/lib/navigationRegistry"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: Readonly<HeaderProps>) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { hasPermission, hasAnyPermission } = usePermissions()
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const [imgError, setImgError] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const openPalette = useCallback(() => setIsPaletteOpen(true), [])
  const closePalette = useCallback(() => setIsPaletteOpen(false), [])
  useCommandPaletteShortcut(openPalette)
  const initials = (user?.name || user?.email || "U").charAt(0).toUpperCase()

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isDropdownOpen])

  // Filter command palette items by permissions
  const filteredNavItems = useMemo(
    () =>
      collegeAdminNav.filter((entry) => {
        if (!entry.requiredPermission) return true
        if (Array.isArray(entry.requiredPermission)) {
          return hasAnyPermission(...entry.requiredPermission)
        }
        return hasPermission(entry.requiredPermission)
      }),
    [hasPermission, hasAnyPermission],
  )

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
          aria-pressed={theme === "dark"}
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

        {/* Year filter */}
        <YearSelector />

        {/* Notifications */}
        <NotificationDropdown />

        {/* Avatar dropdown */}
        <div className="ml-1 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className="cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {!imgError && user?.name ? (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=36`}
                alt={user.name}
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
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>

                {/* Links */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => { setIsDropdownOpen(false); navigate("/college/my-profile") }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsDropdownOpen(false); navigate("/college/change-password") }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4 text-gray-400" />
                    Change Password
                  </button>
                </div>

                {/* Divider + Logout */}
                <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                  <button
                    type="button"
                    onClick={() => { setIsDropdownOpen(false); logout() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CommandPalette items={filteredNavItems} isOpen={isPaletteOpen} onClose={closePalette} />
    </header>
  )
}
