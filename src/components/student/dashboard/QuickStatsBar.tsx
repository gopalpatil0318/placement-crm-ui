import { Link } from "react-router-dom"
import {
  Briefcase, FileText, Bell, ShieldAlert, CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuickStats } from "@/services/student/dashboard.service"

// ─── Pill Config ────────────────────────────────────────────────────────────────

interface PillConfig {
  label: string
  valueKey: keyof QuickStats
  icon: React.ElementType
  to: string
}

const PILLS: PillConfig[] = [
  { label: "Jobs Available", valueKey: "jobs_available", icon: Briefcase, to: "/student/jobs" },
  { label: "Active Apps", valueKey: "active_applications", icon: FileText, to: "/student/applications" },
  { label: "Notifications", valueKey: "unread_notifications", icon: Bell, to: "/student/notifications" },
]

const STYLE_DEFAULT = "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 hover:shadow-md hover:-translate-y-0.5"
const STYLE_WARNING = "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 hover:shadow-md hover:-translate-y-0.5"
const STYLE_SUCCESS = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300"

const ICON_DEFAULT = "text-gray-400 dark:text-gray-500"
const ICON_WARNING = "text-red-500"
const ICON_SUCCESS = "text-emerald-500"

// ─── Component ──────────────────────────────────────────────────────────────────

interface QuickStatsBarProps {
  stats: QuickStats
  isPlaced: boolean
}

export default function QuickStatsBar({ stats, isPlaced }: Readonly<QuickStatsBarProps>) {
  return (
    <nav className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2" aria-label="Quick stats">
      {PILLS.map((pill) => {
        const value = stats[pill.valueKey] as number
        const Icon = pill.icon
        return (
          <Link
            key={pill.valueKey}
            to={pill.to}
            aria-label={`${value} ${pill.label}`}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
              STYLE_DEFAULT,
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", ICON_DEFAULT)} />
            <span>{value}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">{pill.label}</span>
          </Link>
        )
      })}

      {/* Restrictions warning */}
      {stats.active_restrictions > 0 && (
        <Link
          to="/student/profile"
          aria-label={`${stats.active_restrictions} active restrictions`}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
            STYLE_WARNING,
          )}
        >
          <ShieldAlert className={cn("h-4 w-4 shrink-0", ICON_WARNING)} />
          <span>{stats.active_restrictions}</span>
          <span className="text-xs hidden sm:inline">Restrictions</span>
        </Link>
      )}

      {/* Placement status badge */}
      <div
        aria-label={isPlaced ? "Placed" : "Not placed"}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium",
          isPlaced ? STYLE_SUCCESS : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400",
        )}
      >
        <CheckCircle2 className={cn("h-4 w-4 shrink-0", isPlaced ? ICON_SUCCESS : "text-gray-300 dark:text-gray-600")} />
        <span className="text-xs font-medium">{isPlaced ? "Placed" : "Not placed"}</span>
      </div>
    </nav>
  )
}
