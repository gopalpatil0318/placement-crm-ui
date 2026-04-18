import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { getSubdomain } from "@/lib/subdomain"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TenantCollege {
  college_id: string
  college_name: string
  college_subdomain: string
  college_type: string
  college_city: string | null
  college_state: string | null
  college_logo_url: string | null
  college_website: string | null
  college_affiliation: string | null
  college_established_year: number | null
  college_description: string | null
  admin_email: string | null
  admin_phone: string | null
}

interface CollegeTenantContextType {
  /** Resolved college info (null until resolved, or when on admin subdomain) */
  college: TenantCollege | null
  /** True while the resolve API call is in flight */
  isLoading: boolean
  /** Error message if resolve failed */
  error: string | null
  /** True when subdomain is "admin" (sysadmin portal) */
  isAdmin: boolean
  /** Raw subdomain string (e.g. "rcpit", "admin", or null) */
  subdomain: string | null
}

const CollegeTenantContext = createContext<CollegeTenantContextType | undefined>(
  undefined,
)

// ─── Constants ──────────────────────────────────────────────────────────────

const MARKETING_URL = "https://placenex.in"

// ─── Provider ───────────────────────────────────────────────────────────────

export function CollegeTenantProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const subdomain = useMemo(() => getSubdomain(), [])
  const isAdmin = subdomain === "admin"

  // Check if we need to redirect (no subdomain in production)
  const needsRedirect = useMemo(() => {
    if (subdomain !== null) return false
    const isDev =
      globalThis.location.hostname === "localhost" ||
      globalThis.location.hostname === "127.0.0.1" ||
      globalThis.location.hostname === "lvh.me" ||
      globalThis.location.hostname.endsWith(".lvh.me")
    // Don't redirect if in dev
    if (isDev) return false
    // Only redirect if NOT already on placenex.in — prevents infinite loop
    const isOnMarketingDomain = globalThis.location.hostname === "placenex.in"
    return !isOnMarketingDomain
  }, [subdomain])

  if (needsRedirect) {
    globalThis.location.replace(MARKETING_URL)
  }

  // Resolve college via React Query — cached for the entire session.
  // Only runs when there's a real college subdomain (not admin, not null).
  const shouldResolve = subdomain !== null && !isAdmin && !needsRedirect
  const {
    data: college = null,
    isLoading,
    error: queryError,
  } = useQuery<TenantCollege>({
    queryKey: ["college-tenant", subdomain],
    queryFn: async ({ signal }) => {
      const res = await api.get<{ data: TenantCollege }>(
        `/college/resolve/${encodeURIComponent(subdomain!)}`,
        { signal },
      )
      return res.data.data
    },
    enabled: shouldResolve,
    staleTime: Infinity, // College info never changes within a session
    gcTime: Infinity, // Keep in cache for the entire app lifetime
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  let error: string | null = null
  if (queryError) {
    error =
      queryError instanceof Error
        ? queryError.message
        : "Failed to resolve college"
  }

  const value = useMemo<CollegeTenantContextType>(
    () => ({
      college,
      isLoading: shouldResolve ? isLoading : false,
      error,
      isAdmin,
      subdomain,
    }),
    [college, isLoading, error, isAdmin, subdomain, shouldResolve],
  )

  return (
    <CollegeTenantContext.Provider value={value}>
      {/* College subdomain failed to resolve — show error instead of children */}
      {shouldResolve && !isLoading && queryError ? (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-700">404</h1>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              College Not Found
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The college portal <strong className="text-gray-800 dark:text-gray-200">{subdomain}.placenex.in</strong> doesn&apos;t exist or is not registered.
            </p>
            <a
              href={MARKETING_URL}
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Go to Placenex
            </a>
          </div>
        </div>
      ) : children}
    </CollegeTenantContext.Provider>
  )
}

// ─── Hook ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components -- hook co-exported with provider
export function useCollegeTenant(): CollegeTenantContextType {
  const ctx = useContext(CollegeTenantContext)
  if (ctx === undefined) {
    throw new Error("useCollegeTenant must be used within CollegeTenantProvider")
  }
  return ctx
}
