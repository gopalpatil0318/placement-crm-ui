import { motion, useReducedMotion } from "framer-motion"
import { pageVariants } from "@/lib/animations"

interface AnimatedPageProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wraps page content in a motion.div with enter/exit transitions.
 * Usage: Wrap the return of any page component.
 * Respects user's OS-level `prefers-reduced-motion` setting.
 */
export default function AnimatedPage({ children, className }: AnimatedPageProps) {
  const shouldReduce = useReducedMotion()

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
    >
      {children}
    </motion.div>
  )
}
