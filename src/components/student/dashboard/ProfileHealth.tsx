import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, AlertCircle, Clock } from "lucide-react"
import { fadeInUp } from "@/lib/animations"
import type { ProfileHealth as ProfileHealthType } from "@/services/student/dashboard.service"

// ─── Completion Ring ────────────────────────────────────────────────────────────

function CompletionRing({ percentage, size = "lg" }: Readonly<{ percentage: number; size?: "sm" | "lg" }>) {
  const shouldReduce = useReducedMotion()
  const dim = size === "lg" ? 96 : 64
  const radius = size === "lg" ? 42 : 27
  const strokeWidth = size === "lg" ? 6 : 4
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (percentage / 100) * circumference
  const isComplete = percentage >= 100

  return (
    <div className="relative shrink-0" style={{ width: dim, height: dim }}>
      <svg className="-rotate-90" viewBox={`0 0 ${dim} ${dim}`} width={dim} height={dim} aria-label={`Profile ${percentage}% complete`}>
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          className="stroke-gray-100 dark:stroke-gray-800"
        />
        {shouldReduce ? (
          <circle
            cx={dim / 2} cy={dim / 2} r={radius}
            fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
            className={isComplete ? "stroke-emerald-500" : "stroke-indigo-500"}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
          />
        ) : (
          <motion.circle
            cx={dim / 2} cy={dim / 2} r={radius}
            fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
            className={isComplete ? "stroke-emerald-500" : "stroke-indigo-500"}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold text-gray-900 dark:text-gray-100 ${size === "lg" ? "text-lg" : "text-xs"}`}>
          {percentage}%
        </span>
      </div>
    </div>
  )
}

// ─── Section Bar ────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  personal_information: "Personal Info",
  academic_information: "Academic Info",
  semester_grades: "Semester Grades",
  skills: "Skills",
  profile_links: "Profile Links",
  projects: "Projects",
  experience: "Experience",
  certificates: "Certificates",
}

function SectionBar({ name, weight, completed }: Readonly<{ name: string; weight: number; completed: boolean }>) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-28 truncate">
        {SECTION_LABELS[name] || name}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${completed ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
          style={{ width: completed ? "100%" : "0%" }}
        />
      </div>
      <span className="text-[10px] text-gray-400 dark:text-gray-500 w-8 text-right">{weight}%</span>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface ProfileHealthProps {
  profile: ProfileHealthType
  mode: "hero" | "compact"
}

export default function ProfileHealth({ profile, mode }: Readonly<ProfileHealthProps>) {
  const shouldReduce = useReducedMotion()

  // Rejection banner (shown in both modes)
  if (profile.approval_status === "rejected") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Your profile was rejected. Please update and resubmit.
            </p>
            {profile.rejection_reason && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Reason: {profile.rejection_reason}
              </p>
            )}
          </div>
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition shrink-0"
          >
            Fix & Resubmit
          </Link>
        </div>
        {mode === "hero" && <ProfileSections profile={profile} />}
      </div>
    )
  }

  // Pending approval banner
  if (profile.is_complete && !profile.is_approved && profile.approval_status !== "rejected") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 px-4 py-3">
        <Clock className="h-5 w-5 text-blue-500 shrink-0" />
        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 flex-1">
          Your profile is pending approval by your TPO. You'll be able to apply once approved.
        </p>
      </div>
    )
  }

  // 100% complete — hide in compact mode
  if (profile.is_complete && profile.is_approved && mode === "compact") {
    return null
  }

  // Hero mode — large card with sections breakdown
  if (mode === "hero") {
    const Wrapper = shouldReduce ? "div" : motion.div
    return (
      <Wrapper
        {...(!shouldReduce && { variants: fadeInUp, initial: "initial", animate: "animate" })}
        className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50 dark:from-indigo-950/30 dark:via-blue-950/30 dark:to-violet-950/30 border border-indigo-100/60 dark:border-indigo-800/30 p-6"
      >
        <div className="flex items-start gap-6">
          <CompletionRing percentage={profile.total_percentage} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {profile.total_percentage === 0 ? "Welcome! Let's set up your profile" : "Complete your profile"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {profile.next_incomplete
                ? `${profile.next_incomplete.suggestion} (+${profile.next_incomplete.weight}%)`
                : "A complete profile increases your chances of getting shortlisted."
              }
            </p>
            <Link
              to="/student/profile"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              {profile.total_percentage === 0 ? "Get Started" : "Continue Setup"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {Object.entries(profile.sections).map(([key, section]) => (
            <SectionBar key={key} name={key} weight={section.weight} completed={section.completed} />
          ))}
        </div>
      </Wrapper>
    )
  }

  // Compact mode — small ring + suggestion
  return (
    <Link
      to="/student/profile"
      className="flex items-center gap-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      <CompletionRing percentage={profile.total_percentage} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Profile {profile.total_percentage}% complete
        </p>
        {profile.next_incomplete && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {profile.next_incomplete.suggestion} (+{profile.next_incomplete.weight}%)
          </p>
        )}
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors shrink-0" />
    </Link>
  )
}

// ─── Sections Breakdown (used in hero rejected state) ───────────────────────────

function ProfileSections({ profile }: Readonly<{ profile: ProfileHealthType }>) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 space-y-2">
      <div className="flex items-center gap-3 mb-3">
        <CompletionRing percentage={profile.total_percentage} size="sm" />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Profile Sections</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Fix the issues below and resubmit</p>
        </div>
      </div>
      {Object.entries(profile.sections).map(([key, section]) => (
        <SectionBar key={key} name={key} weight={section.weight} completed={section.completed} />
      ))}
    </div>
  )
}
