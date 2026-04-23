import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import {
  Clock, AlertTriangle, FileWarning, Briefcase, Calendar,
  ShieldAlert, User, Upload, GraduationCap, Bell, FileCheck,
  CheckCircle2, ChevronRight,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/animations"
import type { DashboardAction } from "@/services/student/dashboard.service"

// ─── Icon map ───────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  clock: Clock,
  "file-warning": FileWarning,
  briefcase: Briefcase,
  calendar: Calendar,
  "shield-alert": ShieldAlert,
  user: User,
  upload: Upload,
  "graduation-cap": GraduationCap,
  bell: Bell,
  "file-check": FileCheck,
}

const PRIORITY_BORDER: Record<number, string> = {
  0: "border-l-red-500 dark:border-l-red-400",
  1: "border-l-amber-500 dark:border-l-amber-400",
  2: "border-l-yellow-500 dark:border-l-yellow-400",
  3: "border-l-blue-500 dark:border-l-blue-400",
}

const PRIORITY_ICON_BG: Record<number, string> = {
  0: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  1: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  2: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  3: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
}

// ─── Countdown ──────────────────────────────────────────────────────────────────

function formatCountdown(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return "Expired"
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours >= 48) return `${Math.floor(hours / 24)} days`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// ─── Component ──────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 5

export default function ActionQueue({ actions }: Readonly<{ actions: DashboardAction[] }>) {
  const shouldReduceMotion = useReducedMotion()

  if (actions.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 px-4 py-3" aria-live="polite">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          You're all caught up!
        </p>
      </div>
    )
  }

  const visible = actions.slice(0, MAX_VISIBLE)
  const remaining = actions.length - MAX_VISIBLE
  const Wrapper = shouldReduceMotion ? "div" : motion.div

  return (
    <div className="space-y-2">
      <Wrapper
        {...(!shouldReduceMotion && { variants: staggerContainer, initial: "initial", animate: "animate" })}
        className="space-y-2"
      >
        {visible.map((action, i) => {
          const Icon = ICON_MAP[action.icon_hint] || AlertTriangle
          const ItemWrapper = shouldReduceMotion ? "div" : motion.div

          return (
            <ItemWrapper
              key={`${action.type}-${action.link}-${action.priority}-${i}`}
              {...(!shouldReduceMotion && { variants: staggerItem })}
            >
              <Link
                to={action.link}
                aria-label={action.title}
                className={`flex items-center gap-3 p-3 rounded-xl border-l-[3px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all group ${PRIORITY_BORDER[action.priority] || PRIORITY_BORDER[3]}`}
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${PRIORITY_ICON_BG[action.priority] || PRIORITY_ICON_BG[3]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {action.title}
                  </p>
                  {action.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {action.subtitle}
                    </p>
                  )}
                </div>
                {action.deadline && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                    action.priority === 0
                      ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  }`}>
                    {formatCountdown(action.deadline)}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors shrink-0" />
              </Link>
            </ItemWrapper>
          )
        })}
      </Wrapper>

      {remaining > 0 && (
        <Link
          to="/student/notifications"
          className="block text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline py-1"
        >
          View all ({actions.length})
        </Link>
      )}
    </div>
  )
}
