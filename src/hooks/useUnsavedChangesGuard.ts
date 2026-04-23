import { useEffect, useCallback, useRef, useState } from "react"

/**
 * Guards against losing unsaved changes.
 * - Adds beforeunload listener when dirty
 * - Provides a confirm-before-switch dialog state
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  // beforeunload
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  /** Wraps an action — if dirty, queues it for confirmation; otherwise runs immediately. */
  const guardedAction = useCallback(
    (action: () => void) => {
      if (isDirtyRef.current) {
        setPendingAction(() => action)
      } else {
        action()
      }
    },
    [],
  )

  const confirmDiscard = useCallback(() => {
    const action = pendingAction
    setPendingAction(null)
    action?.()
  }, [pendingAction])

  const cancelDiscard = useCallback(() => {
    setPendingAction(null)
  }, [])

  return {
    showDiscardDialog: pendingAction !== null,
    guardedAction,
    confirmDiscard,
    cancelDiscard,
  }
}
