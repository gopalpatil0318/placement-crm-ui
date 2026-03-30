import { useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { modalVariants, backdropVariants } from "@/lib/animations"
import { X } from "lucide-react"

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
} as const

interface ModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  /** When true, disables close button, Escape key, and backdrop click */
  disabled?: boolean
  size?: keyof typeof SIZE_CLASSES
  /** Optional modal title — renders a header with close button */
  title?: string
  /** Icon element shown before the title */
  titleIcon?: React.ReactNode
  children: React.ReactNode
  hideCloseButton?: boolean
  /** Fixed footer rendered below the scrollable body — always visible */
  footer?: React.ReactNode
}

/**
 * Animated modal with backdrop blur, focus trap, Escape key, and body scroll lock.
 * Replaces all inline `{showModal && <div className="fixed...">}` patterns.
 *
 * Usage:
 * ```tsx
 * <ModalWrapper isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm">
 *   <div className="p-6">...content...</div>
 * </ModalWrapper>
 * ```
 */
export default function ModalWrapper({
  isOpen,
  onClose,
  disabled = false,
  size = "md",
  title,
  titleIcon,
  children,
  hideCloseButton = false,
  footer,
}: ModalWrapperProps) {
  const shouldReduce = useReducedMotion()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Use refs for values accessed inside event handlers to avoid effect re-runs
  const onCloseRef = useRef(onClose)
  const disabledRef = useRef(disabled)

  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  useEffect(() => { disabledRef.current = disabled }, [disabled])

  // Focus trap, Escape key, body scroll lock, focus restore
  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disabledRef.current) {
        onCloseRef.current()
        return
      }

      // Focus trap — cycle Tab within the modal
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    // Auto-focus first focusable element after animation frame
    requestAnimationFrame(() => {
      const firstEl = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      firstEl?.focus()
    })

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = prevOverflow
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  const handleBackdropClick = useCallback(() => {
    if (!disabledRef.current) onCloseRef.current()
  }, [])

  const contentVariants = shouldReduce ? undefined : modalVariants
  const bgVariants = shouldReduce ? undefined : backdropVariants

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={bgVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Content */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative w-full ${SIZE_CLASSES[size]} bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header (optional) */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {titleIcon}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h3>
                </div>
                {!hideCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={disabled}
                    aria-label="Close modal"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">{children}</div>

            {/* Footer (optional — always visible below scroll) */}
            {footer && <div className="flex-shrink-0">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
