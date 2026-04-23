// ─── Dashboard Loading Skeleton ─────────────────────────────────────────────────

function Shimmer({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      className={`animate-pulse motion-reduce:animate-none rounded-lg bg-gray-200 dark:bg-gray-800 ${className || ""}`}
    />
  )
}

// ─── Quick Stats Skeleton ───────────────────────────────────────────────────────

function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
      <Shimmer className="h-10 w-28 rounded-xl" />
      <Shimmer className="h-10 w-28 rounded-xl" />
      <Shimmer className="h-10 w-28 rounded-xl" />
      <Shimmer className="h-10 w-28 rounded-xl" />
    </div>
  )
}

// ─── Action Queue Skeleton ──────────────────────────────────────────────────────

function ActionQueueSkeleton() {
  const row = "flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800"
  return (
    <div className="space-y-2">
      <div className={row}>
        <Shimmer className="h-9 w-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5"><Shimmer className="h-3.5 w-48" /><Shimmer className="h-2.5 w-32" /></div>
        <Shimmer className="h-6 w-14 rounded-full" />
      </div>
      <div className={row}>
        <Shimmer className="h-9 w-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5"><Shimmer className="h-3.5 w-48" /><Shimmer className="h-2.5 w-32" /></div>
        <Shimmer className="h-6 w-14 rounded-full" />
      </div>
      <div className={row}>
        <Shimmer className="h-9 w-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5"><Shimmer className="h-3.5 w-48" /><Shimmer className="h-2.5 w-32" /></div>
        <Shimmer className="h-6 w-14 rounded-full" />
      </div>
    </div>
  )
}

// ─── Funnel Skeleton ────────────────────────────────────────────────────────────

function FunnelSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <Shimmer className="h-4 w-36 mb-4" />
      <div className="flex gap-1">
        <Shimmer className="flex-1 h-16 rounded-xl" />
        <Shimmer className="flex-1 h-16 rounded-xl" />
        <Shimmer className="flex-1 h-16 rounded-xl" />
        <Shimmer className="flex-1 h-16 rounded-xl" />
        <Shimmer className="flex-1 h-16 rounded-xl" />
      </div>
    </div>
  )
}

// ─── Schedule Skeleton ──────────────────────────────────────────────────────────

function ScheduleSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <Shimmer className="h-4 w-40" />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <Shimmer className="h-12 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5"><Shimmer className="h-3.5 w-48" /><Shimmer className="h-2.5 w-28" /></div>
        </div>
        <div className="flex gap-3">
          <Shimmer className="h-12 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5"><Shimmer className="h-3.5 w-48" /><Shimmer className="h-2.5 w-28" /></div>
        </div>
        <div className="flex gap-3">
          <Shimmer className="h-12 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5"><Shimmer className="h-3.5 w-48" /><Shimmer className="h-2.5 w-28" /></div>
        </div>
      </div>
    </div>
  )
}

// ─── Profile Health Skeleton ────────────────────────────────────────────────────

function ProfileHealthSkeleton({ hero = false }: Readonly<{ hero?: boolean }>) {
  if (hero) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-start gap-6">
          <Shimmer className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-5 w-56" />
            <Shimmer className="h-3 w-72" />
            <Shimmer className="h-10 w-32 rounded-xl mt-2" />
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <div className="flex items-center gap-2"><Shimmer className="h-2 w-28" /><Shimmer className="h-1.5 flex-1 rounded-full" /><Shimmer className="h-2 w-8" /></div>
          <div className="flex items-center gap-2"><Shimmer className="h-2 w-28" /><Shimmer className="h-1.5 flex-1 rounded-full" /><Shimmer className="h-2 w-8" /></div>
          <div className="flex items-center gap-2"><Shimmer className="h-2 w-28" /><Shimmer className="h-1.5 flex-1 rounded-full" /><Shimmer className="h-2 w-8" /></div>
          <div className="flex items-center gap-2"><Shimmer className="h-2 w-28" /><Shimmer className="h-1.5 flex-1 rounded-full" /><Shimmer className="h-2 w-8" /></div>
          <div className="flex items-center gap-2"><Shimmer className="h-2 w-28" /><Shimmer className="h-1.5 flex-1 rounded-full" /><Shimmer className="h-2 w-8" /></div>
          <div className="flex items-center gap-2"><Shimmer className="h-2 w-28" /><Shimmer className="h-1.5 flex-1 rounded-full" /><Shimmer className="h-2 w-8" /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <Shimmer className="h-16 w-16 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Shimmer className="h-3.5 w-40" />
        <Shimmer className="h-2.5 w-56" />
      </div>
    </div>
  )
}

// ─── Placement Card Skeleton ────────────────────────────────────────────────────

function PlacementSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Shimmer className="h-11 w-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Shimmer className="h-3.5 w-40" />
          <Shimmer className="h-2.5 w-28" />
        </div>
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
      <Shimmer className="h-4 w-24" />
      <div className="flex gap-2">
        <Shimmer className="flex-1 h-10 rounded-xl" />
        <Shimmer className="flex-1 h-10 rounded-xl" />
      </div>
    </div>
  )
}

// ─── Full Dashboard Skeleton ────────────────────────────────────────────────────

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Greeting */}
      <div className="space-y-1">
        <Shimmer className="h-6 w-64" />
        <Shimmer className="h-3.5 w-48" />
      </div>

      {/* Quick Stats */}
      <QuickStatsSkeleton />

      {/* Action Queue */}
      <ActionQueueSkeleton />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FunnelSkeleton />
          <ScheduleSkeleton />
        </div>
        <div className="space-y-6">
          <PlacementSkeleton />
          <ProfileHealthSkeleton />
        </div>
      </div>
    </div>
  )
}

// Named exports for per-section use
export {
  QuickStatsSkeleton,
  ActionQueueSkeleton,
  FunnelSkeleton,
  ScheduleSkeleton,
  ProfileHealthSkeleton,
  PlacementSkeleton,
}
