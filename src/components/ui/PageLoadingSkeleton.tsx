/**
 * Full-page loading skeleton that mirrors the DashboardLayout shape.
 * Used as the Suspense fallback in App.tsx instead of a simple spinner.
 * Includes dark mode support.
 */
export default function PageLoadingSkeleton() {
  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar skeleton — hidden on mobile */}
      <div className="hidden lg:flex flex-col w-[280px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-6">
        {/* Logo */}
        <div className="h-10 w-36 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />

        {/* Nav items */}
        <div className="space-y-3">
          {[140, 120, 160, 130, 110, 150].map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2">
              <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div
                className="h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"
                style={{ width: `${w}px` }}
              />
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="mt-auto space-y-3">
          <div className="h-px bg-gray-100 dark:bg-gray-800" />
          {[100, 80].map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2">
              <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div
                className="h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"
                style={{ width: `${w}px` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header skeleton */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse lg:hidden" />
            <div className="h-5 w-44 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3.5 w-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>

          {/* Page title */}
          <div className="h-8 w-56 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />

          {/* Content card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
