/**
 * Tier Badge — Small coloured label that indicates the tier of a job drive.
 *
 * Usage:
 *   <TierBadge tierName="Dream" tierLevel={3} />
 *   <TierBadge tierName={job.tier_name} tierLevel={job.tier_level} />
 *
 * When tierName is null/undefined the badge renders nothing.
 */

// ─── Colour palette keyed by tier level (wraps around) ──────────────────────
const TIER_COLORS: Record<number, string> = {
    1: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    2: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    3: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    4: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    5: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

function getColor(level: number): string {
    return TIER_COLORS[level] ?? TIER_COLORS[((level - 1) % 5) + 1] ?? TIER_COLORS[1]
}

export default function TierBadge({
    tierName,
    tierLevel,
}: Readonly<{
    tierName?: string | null
    tierLevel?: number | null
}>) {
    if (!tierName) return null

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-tight ${getColor(tierLevel ?? 1)}`}
        >
            {tierName}
        </span>
    )
}
