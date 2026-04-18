import { useState, useRef, useEffect, useCallback } from "react"
import { Calendar, ChevronDown, Check } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useYearFilter } from "@/context/YearFilterContext"

export default function YearSelector() {
  const { selectedYear, setSelectedYear, yearOptions, isDefaultYear, defaultYear } = useYearFilter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const shouldReduce = useReducedMotion()

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  const handleSelect = useCallback(
    (year: number) => {
      setSelectedYear(year)
      setOpen(false)
    },
    [setSelectedYear],
  )

  const dropdownMotion = shouldReduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: -4, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.97 },
        transition: { duration: 0.15 },
      }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <motion.button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Academic year filter: ${selectedYear}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors
          hover:bg-gray-100 dark:hover:bg-gray-800
          text-gray-700 dark:text-gray-200
          border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-900
          cursor-pointer select-none"
        {...(shouldReduce ? {} : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } })}
      >
        <Calendar size={15} className="text-gray-500 dark:text-gray-400 shrink-0" />
        <span className="tabular-nums">{selectedYear}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
        {/* Amber dot when viewing non-default year */}
        {!isDefaultYear && (
          <span
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-gray-700"
            aria-label="Viewing non-default year"
          />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Select academic year"
            {...dropdownMotion}
            className="absolute right-0 mt-1.5 w-44 rounded-lg border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/30
              py-1 z-50 overflow-hidden"
          >
            {yearOptions.map((year) => {
              const isActive = year === selectedYear
              const isDefault = year === defaultYear
              return (
                <div
                  key={year}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={0}
                  onClick={() => handleSelect(year)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleSelect(year)
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors
                    ${isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums">{year}</span>
                    {isDefault && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-normal">
                        Default
                      </span>
                    )}
                  </span>
                  {isActive && <Check size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
