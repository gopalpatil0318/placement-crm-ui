import { useEffect } from "react"

/**
 * Registers a global Ctrl+K (or Cmd+K on Mac) keyboard shortcut
 * to open the command palette.
 */
export function useCommandPaletteShortcut(onOpen: () => void) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        onOpen()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onOpen])
}
