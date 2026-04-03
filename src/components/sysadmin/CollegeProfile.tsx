import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Globe,
  ShieldCheck,
  UserCog,
  MapPin,
  Calendar,
  Pencil,
  Power,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { motion, LayoutGroup } from "framer-motion"
import { useCollegeProfile } from "@/hooks/sysadmin/useCollegeProfile"
import ModalWrapper from "@/components/ui/ModalWrapper"
import AnimatedTabContent from "@/components/ui/AnimatedTabContent"

// ─── Constants ──────────────────────────────────────────────────────────────────

const ALL_FEATURES = [
  { key: "core", label: "Core Modules", description: "Essential placement management features", locked: true },
  { key: "training", label: "Training Programs", description: "Manage training sessions and enrollments" },
  { key: "feedback", label: "Placement Feedback", description: "Collect post-placement feedback from students" },
  { key: "interview_questions", label: "Interview Questions", description: "Share interview questions across batches" },
]

const TAB_KEYS = ["overview", "features", "admin"] as const

const AVATAR_COLORS = [
  "bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600",
  "bg-rose-600", "bg-cyan-600", "bg-indigo-600", "bg-teal-600",
]

const ACADEMIC_YEARS = Array.from({ length: 21 }, (_, i) => 2020 + i)

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDateTime(dateStr: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (name.codePointAt(i) ?? 0) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function toggleFeatureSelection(
  key: string,
  setter: React.Dispatch<React.SetStateAction<string[]>>,
) {
  if (key === "core") return
  setter((prev) =>
    prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
  )
}

async function handleModalSave(
  saveFn: () => Promise<unknown>,
  setLoading: (v: boolean) => void,
  closeModal: () => void,
) {
  setLoading(true)
  try {
    await saveFn()
    closeModal()
  } catch {
    // Error toast shown by mutation onError
  } finally {
    setLoading(false)
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CollegeProfile() {
  const navigate = useNavigate()
  const {
    college,
    loading,
    error,
    toggling,
    showConfirmDialog,
    requestStatusToggle,
    confirmStatusToggle,
    cancelStatusToggle,
    updateFeatures,
    updateAcademicYear,
  } = useCollegeProfile()

  const [activeTab, setActiveTab] = useState<typeof TAB_KEYS[number]>("overview")

  // Features modal
  const [showFeaturesModal, setShowFeaturesModal] = useState(false)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [savingFeatures, setSavingFeatures] = useState(false)

  // Academic year modal
  const [showYearModal, setShowYearModal] = useState(false)
  const [selectedYear, setSelectedYear] = useState(2025)
  const [savingYear, setSavingYear] = useState(false)

  const openFeaturesModal = () => {
    setSelectedFeatures(college?.enabled_features || ["core"])
    setShowFeaturesModal(true)
  }

  const toggleFeature = (key: string) => toggleFeatureSelection(key, setSelectedFeatures)

  const handleSaveFeatures = () =>
    handleModalSave(
      () => updateFeatures(selectedFeatures),
      setSavingFeatures,
      () => setShowFeaturesModal(false),
    )

  const openYearModal = () => {
    setSelectedYear(college?.default_academic_year || 2025)
    setShowYearModal(true)
  }

  const handleSaveYear = () =>
    handleModalSave(
      () => updateAcademicYear(selectedYear),
      setSavingYear,
      () => setShowYearModal(false),
    )

  const avatarColor = useMemo(() => college ? getAvatarColor(college.college_name) : "", [college])
  const initials = useMemo(() => college ? getInitials(college.college_name) : "", [college])

  // ─── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) return <CollegeProfileSkeleton />

  if (!college) return <CollegeNotFound error={error} />

  const isActive = college.college_status === "active"
  const toggleLabel = isActive ? "Deactivate" : "Activate"

  return (
    <div className="space-y-6">
      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className={`h-18 w-18 ${avatarColor} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight truncate">
              {college.college_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <Globe className="h-3.5 w-3.5 text-blue-500" />
                {college.college_subdomain}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                {college.college_status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 capitalize">
                {college.college_type}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate(`/sysadmin/colleges/${college.college_id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={requestStatusToggle}
              disabled={toggling}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                isActive
                  ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
              }`}
            >
              {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
              {toggleLabel}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Settings} label="Features Enabled" value={`${college.enabled_features?.length ?? 0} of ${ALL_FEATURES.length}`} />
        <StatCard icon={Calendar} label="Academic Year" value={String(college.default_academic_year)} />
        <StatCard icon={UserCog} label="Admin" value={college.admin_name || "—"} />
      </div>

      {/* ─── Tabbed Content ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Tab Bar */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-6">
          <LayoutGroup id="profile-tabs">
            <nav className="flex gap-6" aria-label="Profile sections">
              {(["overview", "features", "admin"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-3.5 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.span
                      layoutId="profile-tab-indicator"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                    />
                  )}
                </button>
              ))}
            </nav>
          </LayoutGroup>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          <AnimatedTabContent activeTab={activeTab} tabKeys={TAB_KEYS}>
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Address */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <MapPin className="h-4.5 w-4.5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Address</h3>
                  </div>
                  <div className="space-y-3.5">
                    <InfoRow label="Address" value={college.college_address} />
                    <InfoRow label="City" value={college.college_city} />
                    <InfoRow label="Taluka" value={college.college_taluka} />
                    <InfoRow label="District" value={college.college_district} />
                    <InfoRow label="State" value={college.college_state} />
                    <InfoRow label="Pincode" value={college.college_pincode} />
                  </div>
                </div>

                {/* Meta */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Calendar className="h-4.5 w-4.5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Timeline</h3>
                  </div>
                  <div className="space-y-3.5">
                    <InfoRow label="Academic Year" value={college.default_academic_year} />
                    <InfoRow label="Created" value={formatDateTime(college.created_at)} />
                    <InfoRow label="Last Updated" value={formatDateTime(college.updated_at)} />
                    <InfoRow label="College ID" value={college.college_id} mono />
                  </div>
                </div>

                {/* Branding & Identity */}
                {(college.college_logo_url || college.college_website || college.college_affiliation || college.college_established_year || college.college_description) && (
                  <div className="col-span-1 lg:col-span-2 mt-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-5">
                      <Globe className="h-4.5 w-4.5 text-blue-500" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Branding & Identity</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3.5">
                      <InfoRow label="Logo URL" value={college.college_logo_url ?? undefined} />
                      <InfoRow label="Website" value={college.college_website ?? undefined} />
                      <InfoRow label="Affiliation" value={college.college_affiliation ?? undefined} />
                      <InfoRow label="Established Year" value={college.college_established_year ?? undefined} />
                      <div className="lg:col-span-2">
                        <InfoRow label="Description" value={college.college_description ?? undefined} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "features" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Module Features</h3>
                  </div>
                  <button
                    type="button"
                    onClick={openFeaturesModal}
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Update Features
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ALL_FEATURES.map((f) => {
                    const enabled = college.enabled_features?.includes(f.key)
                    return (
                      <div
                        key={f.key}
                        className={`p-4 rounded-xl border transition-colors ${
                          enabled
                            ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10"
                            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{f.label}</p>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              enabled
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{f.description}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Academic Year card */}
                <div className="mt-6 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Default Academic Year</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{college.default_academic_year}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openYearModal}
                      className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "admin" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <UserCog className="h-4.5 w-4.5 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Admin Account</h3>
                </div>
                <div className="max-w-lg space-y-4">
                  <InfoRow label="Name" value={college.admin_name} />
                  <InfoRow label="Email" value={college.admin_email} />
                  <InfoRow label="Status" value={college.college_status} badge={isActive ? "active" : "inactive"} />
                </div>
              </div>
            )}
          </AnimatedTabContent>
        </div>
      </div>

      {/* ─── Status Toggle Modal ───────────────────────────────────────────── */}
      <ModalWrapper
        isOpen={showConfirmDialog}
        onClose={cancelStatusToggle}
        disabled={toggling}
        size="sm"
        title={isActive ? "Deactivate College" : "Activate College"}
        titleIcon={<Power className={`h-5 w-5 ${isActive ? "text-red-500" : "text-emerald-500"}`} />}
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isActive ? (
              <>
                Deactivating <span className="font-semibold text-gray-900 dark:text-gray-100">{college.college_name}</span> will
                prevent all college users from logging in. This can be reversed later.
              </>
            ) : (
              <>
                Activate <span className="font-semibold text-gray-900 dark:text-gray-100">{college.college_name}</span> to
                restore access for all college users.
              </>
            )}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={cancelStatusToggle}
              disabled={toggling}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmStatusToggle}
              disabled={toggling}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
              {isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* ─── Features Modal ────────────────────────────────────────────────── */}
      <ModalWrapper
        isOpen={showFeaturesModal}
        onClose={() => setShowFeaturesModal(false)}
        disabled={savingFeatures}
        size="md"
        title="Update Features"
        titleIcon={<Settings className="h-5 w-5 text-blue-500" />}
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Toggle features for this college. Core Modules cannot be disabled.</p>
          <div className="space-y-3">
            {ALL_FEATURES.map((feature) => {
              const checked = selectedFeatures.includes(feature.key)
              return (
                <div
                  key={feature.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{feature.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFeature(feature.key)}
                    disabled={feature.locked}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    } ${feature.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    role="switch"
                    aria-checked={checked}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      checked ? "translate-x-[22px]" : "translate-x-[3px]"
                    }`} />
                  </button>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowFeaturesModal(false)}
              disabled={savingFeatures}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveFeatures}
              disabled={savingFeatures}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {savingFeatures && <Loader2 className="h-4 w-4 animate-spin" />}
              {savingFeatures ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* ─── Academic Year Modal ───────────────────────────────────────────── */}
      <ModalWrapper
        isOpen={showYearModal}
        onClose={() => setShowYearModal(false)}
        disabled={savingYear}
        size="sm"
        title="Update Academic Year"
        titleIcon={<Calendar className="h-5 w-5 text-blue-500" />}
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Current: <span className="font-semibold text-gray-900 dark:text-gray-100">{college.default_academic_year}</span>
          </p>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full h-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            {ACADEMIC_YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowYearModal(false)}
              disabled={savingYear}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveYear}
              disabled={savingYear || selectedYear === college.default_academic_year}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {savingYear && <Loader2 className="h-4 w-4 animate-spin" />}
              {savingYear ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function CollegeNotFound({ error }: Readonly<{ error: string | null }>) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {error ? "Failed to Load College" : "College Not Found"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {error || "The requested college could not be loaded."}
      </p>
    </div>
  )
}

function CollegeProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="h-18 w-18 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex gap-3">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['skel-stat-0', 'skel-stat-1', 'skel-stat-2'].map(id => (
          <div key={id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
        <div className="flex gap-6 mb-8">
          {['skel-tab-0', 'skel-tab-1', 'skel-tab-2'].map(id => (
            <div key={id} className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
        <div className="space-y-4">
          {['skel-row-0', 'skel-row-1', 'skel-row-2', 'skel-row-3', 'skel-row-4', 'skel-row-5'].map(id => (
            <div key={id} className="flex gap-4">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: Readonly<{ icon: React.ComponentType<{ className?: string }>; label: string; value: string }>) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono, badge }: Readonly<{
  label: string
  value: string | number | undefined
  mono?: boolean
  badge?: "active" | "inactive"
}>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:w-28 shrink-0">
        {label}
      </span>
      {badge ? (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
          badge === "active"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${badge === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
          {value ?? "—"}
        </span>
      ) : (
        <span className={`text-sm text-gray-900 dark:text-gray-100 font-medium ${mono ? "font-mono text-xs break-all" : ""}`}>
          {value ?? "—"}
        </span>
      )}
    </div>
  )
}
