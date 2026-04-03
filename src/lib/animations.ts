import { type Variants, type Transition } from "framer-motion"

// ─── Transitions ────────────────────────────────────────────────────────────────

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}

export const smoothTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
}

export const gentleTransition: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
}

// ─── Basic Variants ─────────────────────────────────────────────────────────────
// All animations use only `opacity` + `transform` (GPU-accelerated, no layout shifts)

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: smoothTransition },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: 4, transition: { duration: 0.15 } },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

// ─── Stagger Variants ───────────────────────────────────────────────────────────
// Parent: staggerContainer, Children: staggerItem
// 0.03s stagger = 20 rows finish in ~0.6s — subtle, not distracting

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

// ─── Page Variants ──────────────────────────────────────────────────────────────
// Used by AnimatedPage for route enter/exit transitions

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: gentleTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

// ─── Modal Variants ─────────────────────────────────────────────────────────────
// Content: spring scale + fade. Backdrop: simple opacity fade.

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } },
}

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

// ─── Tab Content Variants ───────────────────────────────────────────────────────
// Direction-aware: positive = sliding right, negative = sliding left
// `custom` prop passes the direction number to the variant function

export const tabContentVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 16 : -16,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -16 : 16,
    transition: { duration: 0.15 },
  }),
}

// ─── Auth / Login Page Variants ─────────────────────────────────────────────────
// Split-screen panel entrances and form-field stagger for login pages

export const slideInFromLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.5 } },
}

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.5 } },
}

export const formFadeIn: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { type: "tween", ease: "easeOut", duration: 0.25 } },
}

export const formStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
}

export const formStaggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}
