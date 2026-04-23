import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion"
import { ArrowRight, ChevronDown, ChevronUp, Briefcase, Sparkles } from "lucide-react"
import type { FunnelData, WaitlistRank } from "@/services/student/dashboard.service"

// ─── Animated Number ────────────────────────────────────────────────────────────

function AnimatedNumber({ value }: Readonly<{ value: number }>) {
  const shouldReduce = useReducedMotion()
  const spring = useSpring(0, { stiffness: 100, damping: 20 })
  const display = useTransform(spring, (v) => Math.round(v))

  if (shouldReduce) return <span>{value}</span>

  spring.set(value)

  return <motion.span aria-hidden="true">{display}</motion.span>
}

// ─── Stage Config ───────────────────────────────────────────────────────────────

interface StageConfig {
  label: string
  key: keyof FunnelData
  bgColor: string
  statusFilter: string
}

const STAGES: StageConfig[] = [
  { label: "Applied", key: "total", bgColor: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", statusFilter: "" },
  { label: "Under Review", key: "under_review", bgColor: "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300", statusFilter: "under_review" },
  { label: "Shortlisted", key: "shortlisted", bgColor: "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300", statusFilter: "shortlisted" },
  { label: "Selected", key: "selected", bgColor: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", statusFilter: "selected" },
  { label: "Offered", key: "offered", bgColor: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300", statusFilter: "offered" },
]

// ─── Component ──────────────────────────────────────────────────────────────────

interface JourneyFunnelProps {
  funnel: FunnelData
  waitlistRanks: WaitlistRank[]
  muted?: boolean
}

export default function JourneyFunnel({ funnel, waitlistRanks, muted = false }: Readonly<JourneyFunnelProps>) {
  const [showCollapsed, setShowCollapsed] = useState(false)

  const rejectedTotal = funnel.rejected + funnel.withdrawn + funnel.auto_withdrawn

  // Zero applications
  if (funnel.total === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 text-center">
        <Briefcase className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No applications yet</p>
        <Link
          to="/student/jobs"
          className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
        >
          Browse Jobs <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  // All rejected/withdrawn — compassionate state
  if (funnel.active_count === 0 && rejectedTotal > 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 text-center">
        <Sparkles className="h-8 w-8 mx-auto text-indigo-400 dark:text-indigo-500 mb-2" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Keep going — new opportunities are always coming up
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {funnel.total} application{funnel.total === 1 ? "" : "s"} didn't advance, but that's part of the journey.
        </p>
        <Link
          to="/student/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-3"
        >
          Browse new jobs <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 ${muted ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Application Pipeline</h3>
        <Link to="/student/applications" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          View all
        </Link>
      </div>

      {/* Horizontal funnel — vertical on small screens */}
      <ul className="flex flex-col sm:flex-row gap-2 sm:gap-1 list-none" aria-label="Application pipeline stages">
        {STAGES.map((stage) => {
          const count = funnel[stage.key] as number
          const isActive = count > 0
          const filterParam = stage.statusFilter ? `?status=${stage.statusFilter}` : ""

          return (
            <li key={stage.key} className="flex-1 list-none">
              <Link
                to={`/student/applications${filterParam}`}
                aria-label={`${count} ${stage.label}`}
                className={`flex items-center sm:flex-col gap-2 sm:gap-1 p-2.5 sm:py-3 rounded-xl transition-all hover:shadow-sm ${
                  isActive ? stage.bgColor : "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500"
                }`}
              >
                <span className={`text-lg sm:text-xl font-bold ${isActive ? "" : "text-gray-300 dark:text-gray-600"}`}>
                  <AnimatedNumber value={count} />
                  <span className="sr-only">{count}</span>
                </span>
                <span className="text-[11px] font-medium truncate">{stage.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Waitlisted branch */}
      {funnel.waitlisted > 0 && (
        <div className="mt-3 flex items-center gap-2 px-2">
          <div className="h-px flex-1 bg-amber-200 dark:bg-amber-800/40" />
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 shrink-0">
            {funnel.waitlisted} Waitlisted
          </span>
          {waitlistRanks.length > 0 && (
            <span className="text-[11px] text-amber-500 dark:text-amber-500">
              ({waitlistRanks.map(w => `Rank #${w.waitlist_rank} for ${w.company_name}`).join(", ")})
            </span>
          )}
          <div className="h-px flex-1 bg-amber-200 dark:bg-amber-800/40" />
        </div>
      )}

      {/* Collapsed rejected/withdrawn */}
      {rejectedTotal > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowCollapsed(!showCollapsed)}
            className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {rejectedTotal} didn't advance
          </button>
          {showCollapsed && (
            <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400 pl-5">
              {funnel.rejected > 0 && <span>{funnel.rejected} rejected</span>}
              {funnel.withdrawn > 0 && <span>{funnel.withdrawn} withdrawn</span>}
              {funnel.auto_withdrawn > 0 && <span>{funnel.auto_withdrawn} auto-withdrawn</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
