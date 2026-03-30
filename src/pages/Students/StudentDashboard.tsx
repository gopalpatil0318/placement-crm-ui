import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Briefcase,
  FileText,
  CheckCircle2,
  Trophy,
  Clock,
  ArrowRight,
  MapPin,
  Building2,
  CircleDot,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { useDashboard } from "@/hooks/student/useDashboard"
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations"
import AnimatedPage from "@/components/ui/AnimatedPage"
import type { StatusSummary } from "@/services/student/dashboard.service"

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

// ─── Countdown Helper ───────────────────────────────────────────────────────────

function getCountdown(deadline: string): { text: string; urgent: boolean } {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return { text: "Expired", urgent: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 7) return { text: `${days}d left`, urgent: false }
  if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days <= 3 }
  return { text: `${hours}h left`, urgent: true }
}

// ─── Status Color Map ───────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  under_review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shortlisted: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  selected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  offered: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  withdrawn: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
}

// ─── Skeleton Components ────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-12 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-8 w-16 rounded bg-gray-100 dark:bg-gray-800 mb-1" />
      <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

function JobCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

function CompletionRingSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-5 w-40 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-3 w-56 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-9 w-32 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  )
}

// ─── Profile Completion Ring ────────────────────────────────────────────────────

function CompletionRing({ percentage }: { percentage: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (percentage / 100) * circumference
  const isComplete = percentage >= 100

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
        {/* Background track */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none" strokeWidth="6"
          className="stroke-gray-100 dark:stroke-gray-800"
        />
        {/* Progress arc */}
        <motion.circle
          cx="48" cy="48" r={radius}
          fill="none" strokeWidth="6" strokeLinecap="round"
          className={isComplete ? "stroke-emerald-500" : "stroke-indigo-500"}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{percentage}%</span>
      </div>
    </div>
  )
}

// ─── Stat Card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  bgColor: string
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <span className={color}>{icon}</span>
        </div>
      </div>
      <motion.p
        className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {value}
      </motion.p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </motion.div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useStudentAuth()
  const {
    profileCompletion,
    profileLoading,
    availableJobs,
    totalJobs,
    jobsLoading,
    recentApplications,
    statusSummary,
    applicationsLoading,
    hasError,
    refetch,
  } = useDashboard()

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "Student"
  const pct = profileCompletion?.total_percentage ?? 0
  const summary: StatusSummary = statusSummary ?? {
    total: 0, pending: 0, under_review: 0, shortlisted: 0,
    rejected: 0, selected: 0, offered: 0, withdrawn: 0,
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

      {/* ── Profile Completion ── */}
      {profileLoading ? (
        <CompletionRingSkeleton />
      ) : (
        pct < 100 && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50 dark:from-indigo-950/30 dark:via-blue-950/30 dark:to-violet-950/30 border border-indigo-100/60 dark:border-indigo-800/30 p-6"
          >
            <div className="flex items-center gap-6">
              <CompletionRing percentage={pct} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Complete your profile
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  A complete profile increases your chances of getting shortlisted. You're {pct}% there!
                </p>
                <Link
                  to="/student/profile"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  Continue Setup <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        )
      )}

      {/* ── Stat Cards ── */}
      {applicationsLoading || jobsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            icon={<Briefcase size={20} />}
            label="Jobs Available"
            value={totalJobs}
            color="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-50 dark:bg-blue-900/30"
          />
          <StatCard
            icon={<FileText size={20} />}
            label="Applications"
            value={summary.total}
            color="text-violet-600 dark:text-violet-400"
            bgColor="bg-violet-50 dark:bg-violet-900/30"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Shortlisted"
            value={summary.shortlisted + summary.selected}
            color="text-emerald-600 dark:text-emerald-400"
            bgColor="bg-emerald-50 dark:bg-emerald-900/30"
          />
          <StatCard
            icon={<Trophy size={20} />}
            label="Offers"
            value={summary.offered}
            color="text-amber-600 dark:text-amber-400"
            bgColor="bg-amber-50 dark:bg-amber-900/30"
          />
        </motion.div>
      )}

      {/* ── Two-Column: Upcoming Deadlines + Recent Applications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Upcoming Deadlines
              </h3>
            </div>
            <Link
              to="/student/jobs"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="p-3 space-y-1.5">
            {jobsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
            ) : availableJobs.length === 0 ? (
              <div className="py-10 text-center">
                <Briefcase size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No upcoming jobs right now</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Check back later for new opportunities</p>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-1.5">
                {availableJobs.slice(0, 5).map((job) => {
                  const { text: countdown, urgent } = getCountdown(job.application_deadline)
                  return (
                    <motion.div key={job.job_id} variants={staggerItem}>
                      <Link
                        to={`/student/jobs/${job.job_id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Building2 size={18} className="text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.job_title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{job.company_name}</span>
                            {job.job_location && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">·</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                                  <MapPin size={10} /> {job.job_location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${urgent ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
                          {countdown}
                        </span>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-violet-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Recent Applications
              </h3>
            </div>
            <Link
              to="/student/applications"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="p-3 space-y-1.5">
            {applicationsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
            ) : recentApplications.length === 0 ? (
              <div className="py-10 text-center">
                <FileText size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No applications yet</p>
                <Link
                  to="/student/jobs"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                >
                  Browse jobs <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-1.5">
                {recentApplications.slice(0, 5).map((app) => (
                  <motion.div key={app.application_id} variants={staggerItem}>
                    <Link
                      to={`/student/applications/${app.application_id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Building2 size={18} className="text-violet-500 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {app.job_title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.company_name}</span>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{app.position_name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[app.application_status] || statusColors.pending}`}>
                          {app.application_status.replace("_", " ")}
                        </span>
                        {app.total_rounds > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex gap-0.5">
                              {Array.from({ length: app.total_rounds }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 w-3 rounded-full ${i < app.rounds_passed ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              {app.rounds_passed}/{app.total_rounds}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <Link
          to="/student/jobs"
          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-md transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Briefcase size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Browse Jobs</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Find your next opportunity</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
        </Link>

        <Link
          to="/student/profile"
          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-md transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CircleDot size={18} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">My Profile</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Update your information</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
        </Link>

        <Link
          to="/student/applications"
          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-md transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Applications</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Track your progress</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
        </Link>
      </motion.div>
    </AnimatedPage>
  )
}
