/**
 * ProfileSkeleton — shimmer loading placeholder for the StudentProfile page.
 * Mirrors the real layout: hero banner → two-column grid of 8 section cards.
 */

/* ─── Reusable shimmer bar ─── */
function Bar({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700/60 ${className ?? ""}`} />
    );
}

/* ─── Hero Banner Skeleton ─── */
function HeroBannerSkeleton() {
    return (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* Dark banner area */}
            <div
                className="relative px-6 sm:px-8 py-8"
                style={{ background: "linear-gradient(135deg, #192644 0%, #2c3b55 50%, #1e3048 100%)" }}
            >
                <div className="flex items-center gap-5 sm:gap-6">
                    {/* Avatar circle */}
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/10 animate-pulse flex-shrink-0" />

                    {/* Name + detail lines */}
                    <div className="flex-1 space-y-3">
                        <div className="h-6 w-48 sm:w-64 rounded-md bg-white/10 animate-pulse" />
                        <div className="h-3.5 w-36 sm:w-44 rounded-md bg-white/[0.07] animate-pulse" />
                        <div className="flex flex-wrap gap-2 pt-1">
                            {/* Badge pills */}
                            <div className="h-6 w-16 rounded-full bg-white/[0.07] animate-pulse" />
                            <div className="h-6 w-20 rounded-full bg-white/[0.07] animate-pulse" />
                            <div className="h-6 w-14 rounded-full bg-white/[0.07] animate-pulse" />
                        </div>
                    </div>

                    {/* Progress ring placeholder — desktop only */}
                    <div className="hidden sm:block h-24 w-24 rounded-full bg-white/[0.06] animate-pulse flex-shrink-0" />
                </div>
            </div>

            {/* Light sub-bar (social links area) */}
            <div className="px-6 sm:px-8 py-3 bg-white dark:bg-gray-900 flex items-center gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
                <div className="ml-auto h-4 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
        </div>
    );
}

/* ─── Section Card Skeleton ─── */
function SectionCardSkeleton({ lines = 3, hasChips = false }: { lines?: number; hasChips?: boolean }) {
    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            {/* Section header */}
            <div className="flex items-center gap-2.5 mb-5">
                <div className="h-8 w-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 animate-pulse" />
                <Bar className="h-4 w-28" />
            </div>

            {/* Content lines */}
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <Bar
                        key={i}
                        className={`h-3 ${i === 0 ? "w-full" : i === lines - 1 ? "w-3/5" : "w-4/5"}`}
                    />
                ))}
            </div>

            {/* Optional chip row */}
            {hasChips && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-6 rounded-full animate-pulse bg-gray-100 dark:bg-gray-800"
                            style={{ width: `${56 + i * 16}px` }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Main Export ─── */
export default function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            {/* Page header placeholder */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Bar className="h-5 w-36" />
                    <Bar className="h-3 w-56" />
                </div>
                <Bar className="h-10 w-28 rounded-xl" />
            </div>

            {/* Hero banner */}
            <HeroBannerSkeleton />

            {/* Two-column section grid (matches the real layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column: About, Projects, Skills, Activities */}
                <div className="space-y-6">
                    <SectionCardSkeleton lines={4} />
                    <SectionCardSkeleton lines={5} hasChips />
                    <SectionCardSkeleton lines={3} hasChips />
                    <SectionCardSkeleton lines={3} />
                </div>

                {/* Right column: Experience, Certificates, Achievements, Contact */}
                <div className="space-y-6">
                    <SectionCardSkeleton lines={4} />
                    <SectionCardSkeleton lines={4} hasChips />
                    <SectionCardSkeleton lines={3} />
                    <SectionCardSkeleton lines={3} />
                </div>
            </div>
        </div>
    );
}
