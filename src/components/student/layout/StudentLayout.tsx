import { useState, useCallback, useEffect, useRef } from "react"
import { Outlet, useLocation } from "react-router-dom"
import StudentSidebar from "./StudentSidebar"
import StudentTopBar from "./StudentTopBar"
import StudentMobileBottomBar from "./StudentMobileBottomBar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

const MD_BREAKPOINT = 768

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => globalThis.innerWidth < MD_BREAKPOINT)
  useEffect(() => {
    const mql = globalThis.matchMedia(`(max-width: ${MD_BREAKPOINT - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])
  return isMobile
}

/**
 * Shared layout route for all /student/* protected pages.
 * Desktop: premium collapsible sidebar + slim top bar.
 * Mobile: top bar + bottom tab bar (no sidebar).
 * Stays mounted across navigations — only <Outlet /> re-renders.
 */
export default function StudentLayout() {
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const mainRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()

  // Scroll main content to top on route change
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  // Auto-close sidebar on mobile, auto-open on desktop
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- responsive layout sync
    setIsSidebarOpen(!isMobile)
  }, [isMobile])

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), [])

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar — desktop only */}
      {!isMobile && (
        <StudentSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      )}

      {/* Sidebar — mobile sheet drawer */}
      {isMobile && (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[280px] sm:max-w-[280px]">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <StudentSidebar isOpen onToggle={closeSidebar} onNavigate={closeSidebar} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <StudentTopBar onMenuClick={toggleSidebar} isMobile={isMobile} />

        <div className={`flex-1 p-4 sm:p-6 text-gray-900 dark:text-gray-100 ${isMobile ? "pb-24" : ""}`}>
          <Outlet />
        </div>
      </main>

      {/* Bottom bar — mobile only */}
      {isMobile && <StudentMobileBottomBar />}
    </div>
  )
}
