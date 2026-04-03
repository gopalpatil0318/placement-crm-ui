import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ComponentType,
} from "react"
import { useNavigate } from "react-router-dom"
import { Search, CornerDownLeft } from "lucide-react"
import type { NavEntry } from "@/lib/navigationRegistry"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  /** Navigation entries to search through */
  items: NavEntry[]
  /** Whether the palette is open */
  isOpen: boolean
  /** Called to close the palette */
  onClose: () => void
}

// ─── Search logic ───────────────────────────────────────────────────────────────

function matchesQuery(entry: NavEntry, query: string): boolean {
  const q = query.toLowerCase()
  if (entry.label.toLowerCase().includes(q)) return true
  if (entry.section.toLowerCase().includes(q)) return true
  if (entry.path.toLowerCase().includes(q)) return true
  return entry.keywords.some((kw) => kw.toLowerCase().includes(q))
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CommandPalette({ items, isOpen, onClose }: Readonly<CommandPaletteProps>) {
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Filter results
  const results = useMemo(() => {
    if (!query.trim()) return items
    return items.filter((item) => matchesQuery(item, query.trim()))
  }, [items, query])

  // Open / close the native <dialog>
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
      setQuery("")
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  // Handle native dialog close (Escape key triggers this automatically)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener("close", handleClose)
    return () => dialog.removeEventListener("close", handleClose)
  }, [onClose])

  // Handle backdrop click (clicking outside the dialog content)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClick = (e: MouseEvent) => {
      // Only close if the click is directly on the <dialog> element (the backdrop area),
      // not on any child content inside it.
      const rect = dialog.getBoundingClientRect()
      const isInsideContent =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (!isInsideContent) onClose()
    }
    dialog.addEventListener("click", handleClick)
    return () => dialog.removeEventListener("click", handleClick)
  }, [onClose])

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const activeEl = list.children[activeIndex] as HTMLElement | undefined
    activeEl?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  // Navigate to selected item
  const selectItem = useCallback(
    (entry: NavEntry) => {
      onClose()
      navigate(entry.path)
    },
    [navigate, onClose],
  )

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setActiveIndex((prev) => (prev + 1) % Math.max(results.length, 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((prev) =>
            prev <= 0 ? Math.max(results.length - 1, 0) : prev - 1,
          )
          break
        case "Enter":
          e.preventDefault()
          if (results[activeIndex]) {
            selectItem(results[activeIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    },
    [results, activeIndex, selectItem, onClose],
  )

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [results.length])

  // Group results by section for display
  const grouped = results.reduce<Record<string, NavEntry[]>>((acc, entry) => {
    const key = entry.section
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  // Flat list for index tracking
  let flatIndex = -1

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 w-full max-w-lg mx-auto mt-[15vh] p-0 bg-transparent backdrop:bg-black/40 backdrop:backdrop-blur-sm rounded-xl outline-none"
      aria-label="Command palette"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages…"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
            aria-label="Search pages"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No pages found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([section, entries]) => (
              <div key={section}>
                <p className="px-4 pt-2 pb-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {section}
                </p>
                {entries.map((entry) => {
                  flatIndex++
                  const idx = flatIndex
                  const Icon: ComponentType<{ size?: number; className?: string }> = entry.icon
                  const isActive = idx === activeIndex
                  return (
                    <button
                      key={entry.path}
                      type="button"
                      onClick={() => selectItem(entry)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={
                          isActive
                            ? "text-blue-500 dark:text-blue-400 shrink-0"
                            : "text-gray-400 dark:text-gray-500 shrink-0"
                        }
                      />
                      <span className="truncate">{entry.label}</span>
                      {isActive && (
                        <CornerDownLeft size={14} className="ml-auto text-blue-400 dark:text-blue-500 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono">↑↓</kbd>
            {" "}navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono">↩</kbd>
            {" "}open
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono">esc</kbd>
            {" "}close
          </span>
        </div>
      </div>
    </dialog>
  )
}
