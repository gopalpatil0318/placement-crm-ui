import { useCallback } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services"
import { showToast } from "@/utils/ToastUtils"
import PageHeader from "@/components/collegeadmin/PageHeader"
import AnimatedPage from "@/components/ui/AnimatedPage"
import {
  ShieldCheck, Briefcase, UserCheck, Trophy, Award,
  Zap, RefreshCcw, User, GraduationCap, BookOpen, Info,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface VerificationSettings {
  require_profile_approval_for_jobs: boolean
  auto_approve_profile_on_complete: boolean
  bypass: {
    profiles: boolean
    experience: boolean
    achievements: boolean
    certificates: boolean
  }
  re_verify_on_edit: {
    personal_info: boolean
    academic_info: boolean
    semester_grades: boolean
    experience: boolean
    achievements: boolean
    certificates: boolean
  }
}

// ─── Breadcrumbs ────────────────────────────────────────────────────────────────

const BREADCRUMBS = [
  { label: "Dashboard", path: "/college/dashboard" },
  { label: "Settings" },
  { label: "Verification Settings", active: true },
]

// ─── Section Card ───────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  children,
  infoBadge,
}: Readonly<{
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  title: string
  description: string
  children: React.ReactNode
  infoBadge?: string
}>) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-start gap-4 px-6 pt-6 pb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
          {infoBadge && (
            <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium w-fit">
              <Info className="h-3.5 w-3.5" />
              {infoBadge}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Toggle Row ─────────────────────────────────────────────────────────────────

function ToggleRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  description,
  checked,
  onChange,
  disabled,
}: Readonly<{
  icon?: React.ComponentType<{ className?: string }>
  iconBg?: string
  iconColor?: string
  label: string
  description: string
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}>) {
  return (
    <div className={`flex items-center justify-between gap-4 py-4 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && (
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
          transition-colors duration-200 ease-in-out focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2
          focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white
            shadow-sm ring-0 transition duration-200 ease-in-out
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  )
}

// ─── Skeleton ───────────────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Verification Settings" breadcrumbs={BREADCRUMBS} />
      {[1, 2, 4, 6].map((rows) => (
        <div key={rows} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm animate-pulse">
          <div className="flex items-start gap-4 px-6 pt-6 pb-4">
            <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-36 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3.5 w-72 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
          <div className="px-6 pb-6 divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-64 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
                <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function VerificationSettings() {
  const { hasPermission } = usePermissions()
  const canManage = hasPermission("settings.manage")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ data: VerificationSettings }>({
    queryKey: queryKeys.verifications.settings(),
    queryFn: () => CollegeAdminService.getVerificationSettings(),
    staleTime: 5 * 60 * 1000,
  })

  const settings = data?.data

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      CollegeAdminService.updateVerificationSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verifications.settings() })
      showToast({ type: "success", title: "Saved", description: "Verification settings updated." })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save settings"
      showToast({ type: "error", title: "Error", description: msg })
    },
  })

  const update = useCallback(
    (patch: Record<string, unknown>) => mutation.mutate(patch),
    [mutation],
  )

  if (isLoading) return <SettingsSkeleton />

  if (!settings) {
    return (
      <div className="space-y-6">
        <PageHeader title="Verification Settings" breadcrumbs={BREADCRUMBS} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <ShieldCheck className="h-7 w-7 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Unable to load settings</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please try again or contact support.</p>
        </div>
      </div>
    )
  }

  const isSaving = mutation.isPending
  const bypassAll = settings.bypass.profiles

  return (
    <AnimatedPage className="space-y-6 max-w-4xl">
      <PageHeader title="Verification Settings" breadcrumbs={BREADCRUMBS} />

      {/* ── Section 1: Job Eligibility ── */}
      <SectionCard
        icon={ShieldCheck}
        iconBg="bg-blue-50 dark:bg-blue-900/20"
        iconColor="text-blue-600 dark:text-blue-400"
        title="Job Eligibility"
        description="Control what students need before they can apply for jobs."
      >
        <ToggleRow
          icon={ShieldCheck}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
          label="Require Approved Profile for Jobs"
          description="Students need an approved profile to apply for jobs. When off, a completed profile is enough."
          checked={settings.require_profile_approval_for_jobs}
          disabled={isSaving || !canManage}
          onChange={(val) => update({ require_profile_approval_for_jobs: val })}
        />
      </SectionCard>

      {/* ── Section 2: Bypass (Auto-Approval) ── */}
      <SectionCard
        icon={Zap}
        iconBg="bg-purple-50 dark:bg-purple-900/20"
        iconColor="text-purple-600 dark:text-purple-400"
        title="Auto-Approval (Bypass Verification)"
        description="Skip TPO review. Items are approved automatically."
        infoBadge={bypassAll ? "All verification is bypassed. Everything is auto-approved." : undefined}
      >
        <ToggleRow
          icon={UserCheck}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
          label="Auto-Approve Profiles"
          description="Profiles are approved automatically when students complete them. No TPO review needed."
          checked={settings.bypass.profiles}
          disabled={isSaving || !canManage}
          onChange={(val) => update({ bypass: { profiles: val } })}
        />
        <ToggleRow
          icon={Briefcase}
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
          label="Auto-Approve Experience"
          description="Experience entries are approved automatically. No TPO review needed."
          checked={settings.bypass.experience}
          disabled={isSaving || bypassAll || !canManage}
          onChange={(val) => update({ bypass: { experience: val } })}
        />
        <ToggleRow
          icon={Trophy}
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600 dark:text-amber-400"
          label="Auto-Approve Achievements"
          description="Achievements are approved automatically. No TPO review needed."
          checked={settings.bypass.achievements}
          disabled={isSaving || bypassAll || !canManage}
          onChange={(val) => update({ bypass: { achievements: val } })}
        />
        <ToggleRow
          icon={Award}
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          label="Auto-Approve Certificates"
          description="Certificates are approved automatically. No TPO review needed."
          checked={settings.bypass.certificates}
          disabled={isSaving || bypassAll || !canManage}
          onChange={(val) => update({ bypass: { certificates: val } })}
        />
      </SectionCard>

      {/* ── Section 3: Re-verification on Edit ── */}
      <SectionCard
        icon={RefreshCcw}
        iconBg="bg-amber-50 dark:bg-amber-900/20"
        iconColor="text-amber-600 dark:text-amber-400"
        title="Re-verification on Edit"
        description="When turned on, editing a section sends that item back for TPO review."
      >
        <ToggleRow
          icon={User}
          iconBg="bg-gray-50 dark:bg-gray-800"
          iconColor="text-gray-500 dark:text-gray-400"
          label="Personal Info"
          description="Editing personal details sends the profile back for re-approval."
          checked={settings.re_verify_on_edit.personal_info}
          disabled={isSaving || bypassAll || !canManage}
          onChange={(val) => update({ re_verify_on_edit: { personal_info: val } })}
        />
        <ToggleRow
          icon={GraduationCap}
          iconBg="bg-gray-50 dark:bg-gray-800"
          iconColor="text-gray-500 dark:text-gray-400"
          label="Academic Info"
          description="Editing academic details sends the profile back for re-approval."
          checked={settings.re_verify_on_edit.academic_info}
          disabled={isSaving || bypassAll || !canManage}
          onChange={(val) => update({ re_verify_on_edit: { academic_info: val } })}
        />
        <ToggleRow
          icon={BookOpen}
          iconBg="bg-gray-50 dark:bg-gray-800"
          iconColor="text-gray-500 dark:text-gray-400"
          label="Semester Grades"
          description="Editing grades sends the profile back for re-approval."
          checked={settings.re_verify_on_edit.semester_grades}
          disabled={isSaving || bypassAll || !canManage}
          onChange={(val) => update({ re_verify_on_edit: { semester_grades: val } })}
        />
        <ToggleRow
          icon={Briefcase}
          iconBg="bg-gray-50 dark:bg-gray-800"
          iconColor="text-gray-500 dark:text-gray-400"
          label="Experience"
          description="Editing an experience sends it back for TPO review."
          checked={settings.re_verify_on_edit.experience}
          disabled={isSaving || settings.bypass.experience || !canManage}
          onChange={(val) => update({ re_verify_on_edit: { experience: val } })}
        />
        <ToggleRow
          icon={Trophy}
          iconBg="bg-gray-50 dark:bg-gray-800"
          iconColor="text-gray-500 dark:text-gray-400"
          label="Achievements"
          description="Editing an achievement sends it back for TPO review."
          checked={settings.re_verify_on_edit.achievements}
          disabled={isSaving || settings.bypass.achievements || !canManage}
          onChange={(val) => update({ re_verify_on_edit: { achievements: val } })}
        />
        <ToggleRow
          icon={Award}
          iconBg="bg-gray-50 dark:bg-gray-800"
          iconColor="text-gray-500 dark:text-gray-400"
          label="Certificates"
          description="Editing a certificate sends it back for TPO review."
          checked={settings.re_verify_on_edit.certificates}
          disabled={isSaving || settings.bypass.certificates || !canManage}
          onChange={(val) => update({ re_verify_on_edit: { certificates: val } })}
        />
      </SectionCard>
    </AnimatedPage>
  )
}
