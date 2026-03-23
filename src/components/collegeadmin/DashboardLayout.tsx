import { useState, useCallback, useEffect } from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"

const LG_BREAKPOINT = 1024

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < LG_BREAKPOINT)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])
  return isMobile
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Auto-close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false)
    else setIsSidebarOpen(true)
  }, [isMobile])

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={isMobile} />

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <Header onMenuClick={toggleSidebar} />
        <div className="flex-1 p-4 sm:p-6 text-gray-900 dark:text-gray-100">
          {children}
        </div>
      </main>
    </div>
  )
}
