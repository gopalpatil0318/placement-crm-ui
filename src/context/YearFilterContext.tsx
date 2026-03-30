import { createContext, useContext, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "@/hooks/collegeadmin/useAuth"
import type { YearFilterContextType } from "@/types/auth"

const YearFilterContext = createContext<YearFilterContextType | undefined>(undefined)

export function YearFilterProvider({ children }: { children: React.ReactNode }) {
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

  // Read year from URL, validate it's within range, fallback to default
  const urlYear = searchParams.get("year")
  const parsed = urlYear !== null ? Number(urlYear) : NaN
  const selectedYear =
    !Number.isNaN(parsed) && yearOptions.includes(parsed) ? parsed : defaultYear

  const setSelectedYear = useCallback(
    (year: number) => {
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
