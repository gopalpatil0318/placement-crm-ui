import { useState, useEffect, useRef } from "react"
import { Building2, Search, Loader2, X } from "lucide-react"
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services"

export interface CompanyOption {
  company_id: string
  company_name: string
  industry?: string
}

interface CompanySearchComboboxProps {
  selected: CompanyOption | null
  onSelect: (company: CompanyOption | null) => void
  placeholder?: string
  disabled?: boolean
}

export function CompanySearchCombobox({
  selected,
  onSelect,
  placeholder = "Search companies...",
  disabled = false,
}: Readonly<CompanySearchComboboxProps>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CompanyOption[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await CollegeAdminService.getAllCompanies({
          search: query.trim(),
          company_status: "active",
          limit: 10,
        })
        setResults(res?.data ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timerRef.current)
  }, [query])

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 dark:border-emerald-700 dark:bg-emerald-900/20">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {selected.company_name}
          </span>
        </div>
        {!disabled && (
          <button
            onClick={() => {
              onSelect(null)
              setQuery("")
            }}
            aria-label="Clear selected company"
            className="rounded p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-800/40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false)
          }}
          disabled={disabled}
          aria-label="Search companies"
          aria-expanded={open && query.trim().length >= 2}
          aria-controls="company-search-listbox"
          aria-autocomplete="list"
          role="combobox"
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 disabled:opacity-50"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div
          id="company-search-listbox"
          aria-label="Company search results"
          className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
        >
          {loading && (
            <div className="px-3 py-4 text-center text-sm text-gray-500">Searching...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-500">No companies found</div>
          )}
          {!loading &&
            results.map((c) => (
              <button
                key={c.company_id}
                onClick={() => {
                  onSelect(c)
                  setOpen(false)
                  setQuery("")
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {c.company_name}
                  </p>
                  {c.industry && (
                    <p className="text-xs text-gray-500 truncate">{c.industry}</p>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
