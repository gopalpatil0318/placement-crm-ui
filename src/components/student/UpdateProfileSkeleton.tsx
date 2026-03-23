/**
 * UpdateProfileSkeleton — shimmer loading placeholder for the UpdateStudentProfile page.
 * Mirrors the real layout: top bar → mobile tab bar → sidebar (10 nav items) + stacked form cards.
 */

/* ─── Reusable shimmer bar ─── */
function Bar({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700/60 ${className ?? ""}`} />
    );
}

/* ─── Sidebar Skeleton (desktop) ─── */
function SidebarSkeleton() {
    return (
        <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-3 space-y-1">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse flex-shrink-0" />
                        <div
                            className="h-3.5 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse"
                            style={{ width: `${72 + (i % 3) * 20}px` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Mobile Tab Bar Skeleton ─── */
function MobileTabBarSkeleton() {
    return (
        <div className="lg:hidden flex gap-2 overflow-hidden pb-2 -mx-1 px-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="h-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse flex-shrink-0"
                    style={{ width: `${80 + (i % 3) * 18}px` }}
                />
            ))}
        </div>
    );
}

/* ─── Form Card Skeleton ─── */
function FormCardSkeleton({ inputCount = 4, hasChips = false }: { inputCount?: number; hasChips?: boolean }) {
    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            {/* Section title */}
            <div className="flex items-center gap-2 mb-6">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 animate-pulse" />
                <Bar className="h-4 w-32" />
            </div>

            {/* Input field placeholders in a responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                {Array.from({ length: inputCount }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Bar className="h-3 w-20" />
                        <Bar className="h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Optional chip row (skills, tech tags) */}
            {hasChips && (
                <div className="flex flex-wrap gap-2 mt-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-7 rounded-full animate-pulse bg-gray-100 dark:bg-gray-800"
                            style={{ width: `${52 + i * 14}px` }}
                        />
                    ))}
                </div>
            )}

            {/* Save button placeholder */}
            <div className="mt-6 flex justify-end">
                <Bar className="h-10 w-28 rounded-xl" />
            </div>
        </div>
    );
}

/* ─── Main Export ─── */
export default function UpdateProfileSkeleton() {
    return (
        <div className="space-y-4">
            {/* Top bar: header + back button */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Bar className="h-5 w-36" />
                    <Bar className="h-3 w-56" />
                </div>
                <Bar className="h-10 w-32 rounded-xl" />
            </div>

            {/* Completion badge */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700/60 animate-pulse flex-shrink-0" />
                <div className="space-y-2">
                    <Bar className="h-3.5 w-36" />
                    <Bar className="h-2.5 w-52" />
                </div>
            </div>

            {/* Mobile tab bar */}
            <MobileTabBarSkeleton />

            {/* Desktop: Sidebar + single active form card */}
            <div className="flex gap-6">
                <SidebarSkeleton />

                <div className="flex-1 min-w-0">
                    <FormCardSkeleton inputCount={6} />
                </div>
            </div>
        </div>
    );
}
