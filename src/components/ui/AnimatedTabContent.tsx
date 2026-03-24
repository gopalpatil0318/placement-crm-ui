import { useRef } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { tabContentVariants } from "@/lib/animations"

interface AnimatedTabContentProps {
  /** Current active tab key — used as the animation key */
  activeTab: string
  /** Ordered array of all tab keys — used to determine slide direction */
  tabKeys: readonly string[]
  children: React.ReactNode
  className?: string
}

/**
 * Wraps tab content in AnimatePresence with direction-aware slide animation.
 * Switching from tab index 0→2 slides right, 2→0 slides left.
 * Respects `prefers-reduced-motion`.
 *
 * Usage:
 * ```tsx
 * <AnimatedTabContent activeTab={activeTab} tabKeys={["overview", "contacts", "jobs"]}>
 *   {activeTab === "overview" && <OverviewTab />}
 *   {activeTab === "contacts" && <ContactsTab />}
 * </AnimatedTabContent>
 * ```
 */
export default function AnimatedTabContent({
  activeTab,
  tabKeys,
  children,
  className,
}: AnimatedTabContentProps) {
  const shouldReduce = useReducedMotion()
  const prevTabRef = useRef(activeTab)
  const directionRef = useRef(0)

  // Compute direction synchronously during render (idempotent — safe in StrictMode)
  if (prevTabRef.current !== activeTab) {
    const prevIndex = tabKeys.indexOf(prevTabRef.current)
    const nextIndex = tabKeys.indexOf(activeTab)
    directionRef.current = nextIndex > prevIndex ? 1 : -1
    prevTabRef.current = activeTab
  }

  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait" custom={directionRef.current}>
      <motion.div
        key={activeTab}
        custom={directionRef.current}
        variants={tabContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
