import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { pageVariants } from "@/lib/animations"

interface AnimatedPageProps {
  readonly children: React.ReactNode
  readonly className?: string
}

/**
 * Wraps page content in a motion.div with enter/exit transitions.
 * Usage: Wrap the return of any page component.
 * Respects user's OS-level `prefers-reduced-motion` setting.
 *
 * After the entrance animation completes the CSS transform is cleared
 * so that descendant `position: sticky` elements work correctly.
 */
export default function AnimatedPage({ children, className }: AnimatedPageProps) {
  const shouldReduce = useReducedMotion()
  const [entered, setEntered] = useState(false)

  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      onAnimationComplete={(definition) => {
        if (definition === "animate") setEntered(true)
      }}
      style={entered ? { transform: "none" } : undefined}
    >
      {children}
    </motion.div>
  )
}
