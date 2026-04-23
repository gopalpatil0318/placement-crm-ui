import { Link } from "react-router-dom"
import { AlertCircle, RefreshCw, Briefcase, ArrowRight, BookOpen, Upload } from "lucide-react"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { useDashboard } from "@/hooks/student/useDashboard"
import AnimatedPage from "@/components/ui/AnimatedPage"
import ErrorBoundary from "@/components/ui/ErrorBoundary"
import DashboardSkeleton from "@/components/student/dashboard/DashboardSkeleton"
import ActionQueue from "@/components/student/dashboard/ActionQueue"
import JourneyFunnel from "@/components/student/dashboard/JourneyFunnel"
import UpcomingSchedule from "@/components/student/dashboard/UpcomingSchedule"
import ProfileHealth from "@/components/student/dashboard/ProfileHealth"
import PlacementContextCard from "@/components/student/dashboard/PlacementContextCard"
import QuickStatsBar from "@/components/student/dashboard/QuickStatsBar"

// ─── Greeting Helper ────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// ─── Stage Layouts ──────────────────────────────────────────────────────────────

function OnboardingLayout({ profile }: Readonly<{ profile: NonNullable<ReturnType<typeof useDashboard>["profile"]> }>) {
  return <ProfileHealth profile={profile} mode="hero" />
}

function ReadyLayout({
  profile,
  totalJobs,
}: Readonly<{
  profile: NonNullable<ReturnType<typeof useDashboard>["profile"]>
  totalJobs: number
}>) {
  return (
    <div className="space-y-6">
      {/* Jobs CTA */}
      <Link
        to="/student/jobs"
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50 dark:from-indigo-950/30 dark:via-blue-950/30 dark:to-violet-950/30 border border-indigo-100/60 dark:border-indigo-800/30 p-5 hover:shadow-md transition-all group"
      >
        <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {totalJobs > 0 ? `${totalJobs} jobs available` : "Browse available jobs"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Start applying to build your pipeline</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors shrink-0" />
      </Link>

      <ProfileHealth profile={profile} mode="compact" />
    </div>
  )
}

function ActiveLayout({
  funnel,
  waitlistRanks,
  schedule,
  profile,
}: Readonly<{
  funnel: NonNullable<ReturnType<typeof useDashboard>["funnel"]>
  waitlistRanks: ReturnType<typeof useDashboard>["waitlistRanks"]
  schedule: ReturnType<typeof useDashboard>["schedule"]
  profile: NonNullable<ReturnType<typeof useDashboard>["profile"]>
}>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <JourneyFunnel funnel={funnel} waitlistRanks={waitlistRanks} />
        <UpcomingSchedule schedule={schedule} />
      </div>
      <div>
        <ProfileHealth profile={profile} mode="compact" />
      </div>
    </div>
  )
}

function OfferedLayout({
  placementContext,
  funnel,
  waitlistRanks,
  schedule,
}: Readonly<{
  placementContext: NonNullable<ReturnType<typeof useDashboard>["placementContext"]>
  funnel: NonNullable<ReturnType<typeof useDashboard>["funnel"]>
  waitlistRanks: ReturnType<typeof useDashboard>["waitlistRanks"]
  schedule: ReturnType<typeof useDashboard>["schedule"]
}>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PlacementContextCard context={placementContext} />
      <div className="space-y-6">
        <JourneyFunnel funnel={funnel} waitlistRanks={waitlistRanks} />
        <UpcomingSchedule schedule={schedule} />
      </div>
    </div>
  )
}

function PlacedLayout({
  placementContext,
  funnel,
  waitlistRanks,
  schedule,
}: Readonly<{
  placementContext: NonNullable<ReturnType<typeof useDashboard>["placementContext"]>
  funnel: NonNullable<ReturnType<typeof useDashboard>["funnel"]>
  waitlistRanks: ReturnType<typeof useDashboard>["waitlistRanks"]
  schedule: ReturnType<typeof useDashboard>["schedule"]
}>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PlacementContextCard context={placementContext} />
      <div className="space-y-6">
        <JourneyFunnel funnel={funnel} waitlistRanks={waitlistRanks} muted />
        <UpcomingSchedule schedule={schedule} />
      </div>
    </div>
  )
}

function OffSeasonLayout({
  profile,
  enabledFeatures,
}: Readonly<{
  profile: NonNullable<ReturnType<typeof useDashboard>["profile"]>
  enabledFeatures: string[]
}>) {
  return (
    <div className="space-y-6">
      <ProfileHealth profile={profile} mode="compact" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {enabledFeatures.includes("training") && (
          <Link
            to="/student/trainings"
            className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Training Sessions</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upskill while waiting</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors shrink-0" />
          </Link>
        )}

        {enabledFeatures.includes("off_campus") && (
          <Link
            to="/student/self-report"
            className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Upload className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Self-Report Placement</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Got placed off-campus?</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors shrink-0" />
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useStudentAuth()
  const {
    journeyStage,
    profile,
    actions,
    funnel,
    schedule,
    placementContext,
    quickStats,
    waitlistRanks,
    enabledFeatures,
    isLoading,
    hasError,
    refetch,
  } = useDashboard()

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "Student"
  const isPlaced = journeyStage === "placed"

  if (isLoading) {
    return (
      <AnimatedPage className="space-y-6 max-w-6xl">
        <DashboardSkeleton />
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage className="space-y-6 max-w-6xl">
      {/* ── Greeting ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate()}</p>
      </div>

      {/* ── Error Banner ── */}
      {hasError && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Something went wrong loading your dashboard.</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Some sections may show incomplete data.</p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* ── Quick Stats ── */}
      {quickStats && (
        <QuickStatsBar stats={quickStats} isPlaced={isPlaced} />
      )}

      {/* ── Action Queue ── */}
      <ActionQueue actions={actions} />

      {/* ── Stage-Specific Layout ── */}
      <ErrorBoundary>
        {journeyStage === "onboarding" && profile && (
        <OnboardingLayout profile={profile} />
      )}

      {journeyStage === "ready" && profile && quickStats && (
        <ReadyLayout profile={profile} totalJobs={quickStats.jobs_available} />
      )}

      {journeyStage === "active" && funnel && profile && (
        <ActiveLayout funnel={funnel} waitlistRanks={waitlistRanks} schedule={schedule} profile={profile} />
      )}

      {journeyStage === "offered" && placementContext && funnel && (
        <OfferedLayout placementContext={placementContext} funnel={funnel} waitlistRanks={waitlistRanks} schedule={schedule} />
      )}

      {journeyStage === "placed" && placementContext && funnel && (
        <PlacedLayout placementContext={placementContext} funnel={funnel} waitlistRanks={waitlistRanks} schedule={schedule} />
      )}

      {journeyStage === "off_season" && profile && (
        <OffSeasonLayout profile={profile} enabledFeatures={enabledFeatures} />
      )}
      </ErrorBoundary>
    </AnimatedPage>
  )
}
