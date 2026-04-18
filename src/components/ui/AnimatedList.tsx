import { motion, useReducedMotion } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/animations"

interface AnimatedListProps {
  children: React.ReactNode
  className?: string
}

/**
 * Animated <tbody> wrapper — staggers child rows on mount.
 * Each direct child should use `AnimatedRow` for the stagger effect.
 *
 * Usage:
 * ```tsx
 * <table>
 *   <thead>...</thead>
 *   <AnimatedTableBody>
 *     {items.map(item => (
 *       <AnimatedRow key={item.id} onClick={() => navigate(...)}>
 *         <td>...</td>
 *       </AnimatedRow>
 *     ))}
 *   </AnimatedTableBody>
 * </table>
 * ```
 */
export function AnimatedTableBody({ children, className }: Readonly<AnimatedListProps>) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <tbody className={className}>{children}</tbody>
  }

  return (
    <motion.tbody
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.tbody>
  )
}

/**
 * Animated <tr> — used as a child of AnimatedTableBody.
 * Inherits stagger timing from parent container.
 */
export function AnimatedRow({
  children,
  className,
  onClick,
}: AnimatedListProps & { onClick?: () => void }) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return (
      <tr className={className} onClick={onClick}>
        {children}
      </tr>
    )
  }

  return (
    <motion.tr variants={staggerItem} className={className} onClick={onClick}>
      {children}
    </motion.tr>
  )
}

/**
 * Animated <div> container — staggers child items on mount.
 * Use for card grids, vertical lists, or any non-table stagger layout.
 */
export function AnimatedGrid({ children, className }: Readonly<AnimatedListProps>) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated <div> child — used inside AnimatedGrid.
 * Inherits stagger timing from parent container.
 */
export function AnimatedGridItem({ children, className }: Readonly<AnimatedListProps>) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}
