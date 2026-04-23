import { Users } from "lucide-react";

// ─── Color thresholds ───────────────────────────────────────────────────────
// green  → 0-69%   (healthy)
// amber  → 70-89%  (warning)
// red    → 90-99%  (critical)
// blocked → 100%   (quota full)

interface QuotaBarProps {
  used: number;
  quota: number | null;
  className?: string;
}

function getQuotaState(used: number, quota: number) {
  const pct = Math.min((used / quota) * 100, 100);
  if (pct >= 100) return { pct: 100, level: "blocked" as const };
  if (pct >= 90) return { pct, level: "critical" as const };
  if (pct >= 70) return { pct, level: "warning" as const };
  return { pct, level: "healthy" as const };
}

const STYLES = {
  healthy: {
    bar: "bg-emerald-500 dark:bg-emerald-400",
    track: "bg-emerald-100 dark:bg-emerald-900/30",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    label: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    bar: "bg-amber-500 dark:bg-amber-400",
    track: "bg-amber-100 dark:bg-amber-900/30",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    label: "text-amber-600 dark:text-amber-400",
  },
  critical: {
    bar: "bg-red-500 dark:bg-red-400",
    track: "bg-red-100 dark:bg-red-900/30",
    badge: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    label: "text-red-600 dark:text-red-400",
  },
  blocked: {
    bar: "bg-red-600 dark:bg-red-500",
    track: "bg-red-200 dark:bg-red-900/40",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    label: "text-red-700 dark:text-red-400",
  },
} as const;

const LABELS = {
  healthy: "Healthy",
  warning: "Filling Up",
  critical: "Almost Full",
  blocked: "Quota Full",
} as const;

export default function QuotaBar({ used, quota, className = "" }: Readonly<QuotaBarProps>) {
  // No subscription → unlimited, show simple count
  if (quota === null || quota === 0) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {used.toLocaleString()} Students
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Unlimited plan</p>
        </div>
      </div>
    );
  }

  const { pct, level } = getQuotaState(used, quota);
  const remaining = Math.max(quota - used, 0);
  const s = STYLES[level];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Student Quota
          </span>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
          {LABELS[level]}
        </span>
      </div>

      {/* Progress bar */}
      <div className={`relative h-2.5 w-full overflow-hidden rounded-full ${s.track}`}>
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${s.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-200">{used.toLocaleString()}</span>
          {" / "}
          {quota.toLocaleString()} used
        </span>
        <span className={`font-semibold ${s.label}`}>
          {remaining === 0 ? "No slots left" : `${remaining.toLocaleString()} remaining`}
        </span>
      </div>
    </div>
  );
}

export { getQuotaState };
export type { QuotaBarProps };
