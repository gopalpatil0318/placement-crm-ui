import { useEffect, useRef } from "react"
import { showToast } from "@/utils/ToastUtils"

const eventTarget: EventTarget = globalThis

/**
 * Monitors browser online/offline events and shows user-friendly toasts.
 * Call once in a top-level layout component (e.g. App.tsx or a root layout).
 */
export function useOnlineStatus(): void {
  const wasOffline = useRef(false)

  useEffect(() => {
    function handleOffline() {
      wasOffline.current = true
      showToast({
        type: "error",
        title: "You're offline",
        description: "Some features may not work until you reconnect.",
      })
    }

    function handleOnline() {
      if (wasOffline.current) {
        wasOffline.current = false
        showToast({
          type: "success",
          title: "Back online",
          description: "Connection restored.",
        })
      }
    }

    eventTarget.addEventListener("offline", handleOffline)
    eventTarget.addEventListener("online", handleOnline)

    return () => {
      eventTarget.removeEventListener("offline", handleOffline)
      eventTarget.removeEventListener("online", handleOnline)
    }
  }, [])
}
