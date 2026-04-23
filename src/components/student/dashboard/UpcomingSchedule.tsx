import { Link } from "react-router-dom"
import { Calendar, Clock, MapPin } from "lucide-react"
import type { ScheduleItem } from "@/services/student/dashboard.service"

// ─── Helpers ────────────────────────────────────────────────────────────────────

const EVENT_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  round: { dot: "bg-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  offer_deadline: { dot: "bg-red-500", bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  training_session: { dot: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
}

function formatDateLabel(dateStr: string): { day: string; month: string; label: string | null } {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  let label: string | null = null
  if (isToday) label = "Today"
  else if (isTomorrow) label = "Tomorrow"

  return {
    day: date.getDate().toString(),
    month: date.toLocaleDateString("en-IN", { month: "short" }),
    label,
  }
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// ─── Component ──────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 5

export default function UpcomingSchedule({ schedule }: Readonly<{ schedule: ScheduleItem[] }>) {
  if (schedule.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 text-center">
        <Calendar className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events in the next 30 days</p>
      </div>
    )
  }

  const visible = schedule.slice(0, MAX_VISIBLE)

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Upcoming Schedule</h3>
        </div>
      </div>

      <ol className="p-4 space-y-0 list-none" aria-label="Upcoming schedule items">
        {visible.map((event, i) => {
          const { day, month, label } = formatDateLabel(event.event_date)
          const colors = EVENT_COLORS[event.event_type] || EVENT_COLORS.round
          const isLast = i === visible.length - 1

          return (
            <li key={`${event.event_type}-${event.event_date}-${event.title}`} className="flex gap-3">
              {/* Date badge + timeline line */}
              <div className="flex flex-col items-center shrink-0 w-12">
                <div className={`w-10 rounded-lg py-1.5 text-center ${colors.bg}`}>
                  <p className={`text-sm font-bold leading-tight ${colors.text}`}>{day}</p>
                  <p className={`text-[10px] uppercase ${colors.text} opacity-70`}>{month}</p>
                </div>
                {!isLast && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />}
              </div>

              {/* Content */}
              <Link
                to={event.link}
                className="flex-1 pb-4 group"
              >
                <div className="flex items-start gap-2">
                  <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${colors.dot}`} />
                  <div className="flex-1 min-w-0">
                    {label && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${colors.text}`}>
                        {label}
                      </span>
                    )}
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatTime(event.event_date)}</span>
                      {event.subtitle && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="truncate">{event.subtitle}</span>
                        </>
                      )}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
