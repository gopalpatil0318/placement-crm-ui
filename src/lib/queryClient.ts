import { QueryClient } from "@tanstack/react-query"

/**
 * Shared React Query client — provides caching, background refetch,
 * request deduplication, and request cancellation for all data fetching.
 *
 * Wrap the app in <QueryClientProvider client={queryClient}> in main.tsx.
 *
 * Default behavior:
 * - Data is "fresh" for 2 minutes (won't refetch if navigating back within 2min)
 * - Unused cache is garbage-collected after 10 minutes
 * - Failed GET requests retry up to 2× with exponential backoff + jitter
 * - Data refetches when the browser tab regains focus
 * - Mutations NEVER retry (would break 409/400 error handling)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes — data is fresh, served from cache instantly
      gcTime: 10 * 60 * 1000, // 10 minutes — unused cache evicted
      retry: (failureCount, error) => {
        const status =
          error instanceof Error && "status" in error
            ? (error as { status?: number }).status
            : undefined
        // Never retry client errors (4xx) — they won't succeed on retry
        if (status !== undefined && status >= 400 && status < 500) return false
        // Retry transient / server errors up to 2 times
        return failureCount < 2
      },
      retryDelay: (attempt) =>
        Math.min(1000 * 2 ** attempt, 30_000) + Math.random() * 1000,
      refetchOnWindowFocus: true, // Refetch stale data when user returns to tab
      refetchOnReconnect: true, // Refetch on network reconnect
    },
    mutations: {
      retry: false, // Never retry mutations — would break 409/400 ApiError handling
    },
  },
})
