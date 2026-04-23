import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Shield,
  Clock,
  Pencil,
  X,
  Check,
  Loader2,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import FloatingInput from "@/components/ui/FloatingInput"
import { useAuth } from "@/hooks/collegeadmin/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services"
import { showToast } from "@/utils/ToastUtils"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ProfileData {
  user_id: string
  user_name: string
  user_email: string
  user_role: string
  user_status: string
  phone_number: string | null
  profile_picture_url: string | null
  created_at: string
  updated_at: string
  college_name: string
  college_code: string | null
  departments: { dept_id: string; dept_name: string; dept_code: string | null }[]
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  collegeadmin: "College Admin",
  tpo: "TPO",
  tpc: "TPC",
  hod: "HOD",
  teacher: "Teacher",
}

const ROLE_COLORS: Record<string, string> = {
  collegeadmin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  tpo: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  tpc: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  hod: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  teacher: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function MyProfile() {
  const { user } = useAuth()
  const { permissions, deptScoped, isBypassRole, isConfigurableRole } = usePermissions()
  const queryClient = useQueryClient()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")

  // Fetch profile from API
  const profileQuery = useQuery<{ data: { profile: ProfileData } }>({
    queryKey: ["profile", "me"],
    queryFn: CollegeAdminService.getMyProfile,
  })

  const profile = profileQuery.data?.data?.profile

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { user_name?: string; phone_number?: string }) =>
      CollegeAdminService.updateMyProfile(data),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      // Sync auth context if name was changed
      if (variables.user_name) {
        const stored = localStorage.getItem("college_user")
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            parsed.name = variables.user_name
            localStorage.setItem("college_user", JSON.stringify(parsed))
          } catch { /* ignore parse errors */ }
        }
      }
      setIsEditing(false)
      showToast({ type: "success", title: "Profile Updated", description: "Your profile has been updated successfully." })
    },
    onError: (error: Error) => {
      showToast({ type: "error", title: "Update Failed", description: error.message })
    },
  })

  const startEditing = useCallback(() => {
    if (!profile) return
    setEditName(profile.user_name || "")
    setEditPhone(profile.phone_number || "")
    setIsEditing(true)
  }, [profile])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
  }, [])

  const saveProfile = useCallback(() => {
    if (!profile) return
    const changes: Record<string, string> = {}
    if (editName.trim() && editName.trim() !== profile.user_name) {
      changes.user_name = editName.trim()
    }
    if (editPhone.trim() !== (profile.phone_number || "")) {
      changes.phone_number = editPhone.trim()
    }
    if (Object.keys(changes).length === 0) {
      setIsEditing(false)
      return
    }
    updateMutation.mutate(changes)
  }, [profile, editName, editPhone, updateMutation])

  // ── Loading ──

  if (profileQuery.isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    )
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-2 font-medium">Failed to load profile</p>
          <p className="text-sm text-gray-500">{profileQuery.error?.message || "Profile not found"}</p>
        </Card>
      </div>
    )
  }

  const initials = (profile.user_name || "U").charAt(0).toUpperCase()
  const roleBadgeClass = ROLE_COLORS[profile.user_role] || "bg-gray-100 text-gray-700"
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT — Avatar card */}
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
            {initials}
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {profile.user_name}
          </h2>
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass} mb-3`}>
            {ROLE_LABELS[profile.user_role] || profile.user_role}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Building2 className="h-3.5 w-3.5" />
            <span>{profile.college_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Member since {memberSince}</span>
          </div>
        </Card>

        {/* RIGHT — Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic info */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-400" />
              Personal Information
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <FloatingInput
                  label="Full Name"
                  name="user_name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <FloatingInput
                  label="Phone Number"
                  name="phone_number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  type="tel"
                />
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" onClick={saveProfile} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1.5" />
                    )}
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={cancelEditing} disabled={updateMutation.isPending}>
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <InfoRow icon={UserIcon} label="Name" value={profile.user_name} />
                <InfoRow icon={Mail} label="Email" value={profile.user_email} />
                <InfoRow icon={Phone} label="Phone" value={profile.phone_number || "Not set"} muted={!profile.phone_number} />
              </div>
            )}
          </Card>

          {/* Department assignments */}
          {profile.departments.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                Assigned Departments
                {deptScoped && (
                  <span className="text-xs font-normal text-amber-600 dark:text-amber-400 ml-auto">
                    Department scoped
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.departments.map((dept) => (
                  <span
                    key={dept.dept_id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                    {dept.dept_name}
                    {dept.dept_code && (
                      <span className="text-xs text-gray-400">({dept.dept_code})</span>
                    )}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Permissions summary */}
          {isConfigurableRole && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                Permissions
                <span className="text-xs font-normal text-gray-500 ml-auto">
                  {permissions.length} active
                </span>
              </h3>
              {permissions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No permissions have been configured for your role. Contact your college admin.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {permissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          )}

          {isBypassRole && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                Permissions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                As a <span className="font-medium text-gray-700 dark:text-gray-300">{ROLE_LABELS[user?.role ?? ""] || user?.role}</span>,
                you have full access to all features and settings.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  muted = false,
}: Readonly<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  muted?: boolean
}>) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-sm ${muted ? "text-gray-400 italic" : "text-gray-900 dark:text-gray-100"}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
