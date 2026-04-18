import { createContext, useContext, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "@/hooks/collegeadmin/useAuth"
import type { YearFilterContextType } from "@/types/auth"

const YearFilterContext = createContext<YearFilterContextType | undefined>(undefined)

const YEAR_STORAGE_KEY = "placenex_selected_year"

/** Read persisted year from localStorage. Returns NaN if absent or invalid. */
function readStoredYear(): number {
  const stored = localStorage.getItem(YEAR_STORAGE_KEY)
  return stored === null ? Number.NaN : Number(stored)
}

export function YearFilterProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultYear = user?.defaultAcademicYear ?? new Date().getFullYear()

  const yearOptions = useMemo(() => {
    const options: number[] = []
    for (let y = defaultYear + 2; y >= defaultYear - 3; y--) {
      options.push(y)
    }
    return options
  }, [defaultYear])

  // Priority: URL param → localStorage → defaultYear
  const urlYear = searchParams.get("year")
  const parsedUrl = urlYear === null ? Number.NaN : Number(urlYear)
  const parsedStored = readStoredYear()

  let selectedYear: number
  if (!Number.isNaN(parsedUrl) && yearOptions.includes(parsedUrl)) {
    selectedYear = parsedUrl
  } else if (!Number.isNaN(parsedStored) && yearOptions.includes(parsedStored)) {
    selectedYear = parsedStored
  } else {
    selectedYear = defaultYear
  }

  const setSelectedYear = useCallback(
    (year: number) => {
      // Persist to localStorage for cross-route navigation
      if (year === defaultYear) {
        localStorage.removeItem(YEAR_STORAGE_KEY)
      } else {
        localStorage.setItem(YEAR_STORAGE_KEY, String(year))
      }

      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (year === defaultYear) {
            next.delete("year")
          } else {
            next.set("year", String(year))
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams, defaultYear],
  )

  const isDefaultYear = selectedYear === defaultYear

  const value = useMemo<YearFilterContextType>(
    () => ({ selectedYear, setSelectedYear, yearOptions, isDefaultYear, defaultYear }),
    [selectedYear, setSelectedYear, yearOptions, isDefaultYear, defaultYear],
  )

  return (
    <YearFilterContext.Provider value={value}>
      {children}
    </YearFilterContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-exported with provider
export function useYearFilter(): YearFilterContextType {
  const context = useContext(YearFilterContext)
  if (context === undefined) {
    throw new Error("useYearFilter must be used within a YearFilterProvider")
  }
  return context
}
