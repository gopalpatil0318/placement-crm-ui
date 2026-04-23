import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { tabContentVariants } from "@/lib/animations"

interface AnimatedTabContentProps {
  /** Current active tab key — used as the animation key */
  readonly activeTab: string
  /** Ordered array of all tab keys — used to determine slide direction */
  readonly tabKeys: readonly string[]
  readonly children: React.ReactNode
  readonly className?: string
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
  const [prevTab, setPrevTab] = useState(activeTab)
  const [direction, setDirection] = useState(0)

  // Compute direction synchronously during render (React 18 derived-state-from-props pattern)
  if (prevTab !== activeTab) {
    const prevIndex = tabKeys.indexOf(prevTab)
    const nextIndex = tabKeys.indexOf(activeTab)
    setDirection(nextIndex > prevIndex ? 1 : -1)
    setPrevTab(activeTab)
  }

  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={activeTab}
        custom={direction}
        variants={tabContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        onAnimationComplete={(definition) => {
          if (definition === "animate") {
            // Clear transform so descendant sticky elements work
            const el = document.querySelector(`[data-tab-key="${activeTab}"]`)
            if (el instanceof HTMLElement) el.style.transform = "none"
          }
        }}
        data-tab-key={activeTab}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
