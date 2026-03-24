import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Building2,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
} from "lucide-react"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedList"
import { SysAdminService } from "@/services/sysadmin/sysadmin.services"
import { queryKeys } from "@/lib/queryKeys"
import { useAuth } from "@/hooks/sysadmin/useAuth"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: allData, isLoading: loadingAll } = useQuery({
    queryKey: queryKeys.colleges.all({ page: 1, limit: 1 }),
    queryFn: () => SysAdminService.getCollegesData({ page: 1, limit: 1 }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: queryKeys.colleges.all({ page: 1, limit: 1, status: "active" }),
    queryFn: () => SysAdminService.getCollegesData({ page: 1, limit: 1, status: "active" }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: inactiveData, isLoading: loadingInactive } = useQuery({
    queryKey: queryKeys.colleges.all({ page: 1, limit: 1, status: "inactive" }),
    queryFn: () => SysAdminService.getCollegesData({ page: 1, limit: 1, status: "inactive" }),
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = loadingAll || loadingActive || loadingInactive

  const stats = useMemo(() => ({
    total: allData?.pagination?.total ?? 0,
    active: activeData?.pagination?.total ?? 0,
    inactive: inactiveData?.pagination?.total ?? 0,
  }), [allData, activeData, inactiveData])

  return (
    <AnimatedPage>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening across your colleges.
          </p>
        </div>

        {/* Stats Cards */}
        <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <AnimatedGridItem>
            <StatCard
              icon={Building2}
              label="Total Colleges"
              value={isLoading ? "—" : String(stats.total)}
              color="blue"
            />
          </AnimatedGridItem>
          <AnimatedGridItem>
            <StatCard
              icon={CheckCircle2}
              label="Active Colleges"
              value={isLoading ? "—" : String(stats.active)}
              color="emerald"
            />
          </AnimatedGridItem>
          <AnimatedGridItem>
            <StatCard
              icon={XCircle}
              label="Inactive Colleges"
              value={isLoading ? "—" : String(stats.inactive)}
              color="red"
            />
          </AnimatedGridItem>
        </AnimatedGrid>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => navigate("/sysadmin/colleges/create")}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors text-left group"
            >
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Register New College</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Onboard a new institution to the platform</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/sysadmin/colleges")}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors text-left group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">View All Colleges</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage existing institutions and settings</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}

const COLOR_MAP = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
} as const

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: keyof typeof COLOR_MAP
}) {
  const c = COLOR_MAP[color]
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  )
}
