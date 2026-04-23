import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Shield, RotateCcw, Copy, ChevronDown, ChevronRight, Loader2, Info,
  Search, Users, ArrowLeft, ChevronLeft, ChevronRight as ChevronRightIcon,
  UserCog, X,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { usePermissionManager, useUserPermissionManager, useUserPermissionDetail } from "@/hooks/collegeadmin/usePermissionManager"
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard"
import type {
  PermissionGroup, RolePermissionConfig,
  UserPermissionSummary, CollegeDepartment,
  CopyUserPermissionsPayload,
} from "@/types/permission"

// ─── Constants ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  tpo: "TPO",
  tpc: "TPC",
  hod: "HOD",
  teacher: "Teacher",
}

const ROLE_COLORS: Record<string, string> = {
  tpo: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  tpc: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  hod: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  teacher: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
}

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
]

const ROLE_ORDER = ["tpo", "tpc", "hod", "teacher"] as const
const PAGE_SIZES = [10, 20, 50] as const

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

function getAvatarGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = Math.trunc((hash << 5) - hash + (id.codePointAt(i) ?? 0))
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })
}

function getRoleConfig(roles: RolePermissionConfig[], role: string): RolePermissionConfig | undefined {
  return roles.find((r) => r.role === role)
}

function countTotalActions(modules: PermissionGroup[]): number {
  return modules.reduce((sum, g) => sum + g.modules.reduce((s, m) => s + m.actions.length, 0), 0)
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function PermissionManager() {
  const [activeTab, setActiveTab] = useState<"users" | "templates">("users")

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Permission Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage individual user permissions and role templates</p>
        </div>
      </div>

      {/* Top-level tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Users className="h-4 w-4" />
          Users
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "templates"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <UserCog className="h-4 w-4" />
          Role Templates
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "users" ? <UsersTab /> : <RoleTemplatesTab />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function UsersTab() {
  const navigate = useNavigate()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(20)

  // Mobile: show editor full-screen when user selected
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false)

  // Debounce search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    searchTimerRef.current = setTimeout(() => setSearchQuery(searchInput), 300)
    return () => clearTimeout(searchTimerRef.current)
  }, [searchInput])

  // Reset page when filters change — derived-state-from-props pattern
  const [prevFilters, setPrevFilters] = useState({ roleFilter, searchQuery })
  if (prevFilters.roleFilter !== roleFilter || prevFilters.searchQuery !== searchQuery) {
    setPrevFilters({ roleFilter, searchQuery })
    if (page !== 1) setPage(1)
  }

  const filters = useMemo(() => {
    const f: Record<string, unknown> = { page, limit }
    if (roleFilter !== "all") f.role = roleFilter
    if (searchQuery) f.search = searchQuery
    return f
  }, [page, limit, roleFilter, searchQuery])

  const { users, total, modules, isLoading, isError, error, updateUserPermissions, resetUserToDefault, copyUserPermissions, isSaving } =
    useUserPermissionManager(filters)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  // Unsaved changes state (lifted from editor)
  const [pendingPerms, setPendingPerms] = useState<Set<string> | null>(null)
  const [pendingDepts, setPendingDepts] = useState<Set<string> | null>(null)
  const isDirty = pendingPerms !== null || pendingDepts !== null

  const { showDiscardDialog, guardedAction, confirmDiscard, cancelDiscard } = useUnsavedChangesGuard(isDirty)

  const selectUser = useCallback(
    (userId: string) => {
      guardedAction(() => {
        setSelectedUserId(userId)
        setPendingPerms(null)
        setPendingDepts(null)
        setMobileEditorOpen(true)
      })
    },
    [guardedAction],
  )

  const handleMobileBack = useCallback(() => {
    guardedAction(() => {
      setMobileEditorOpen(false)
      setSelectedUserId(null)
      setPendingPerms(null)
      setPendingDepts(null)
    })
  }, [guardedAction])

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 mb-2 font-medium">Failed to load users</p>
        <p className="text-sm text-gray-500">{error?.message}</p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Left panel: user list — hidden on mobile when editor is open */}
        <div className={`space-y-4 ${mobileEditorOpen ? "hidden lg:block" : ""}`}>
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[120px]" size="sm">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLE_ORDER.map(r => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-8 h-8"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User list */}
          {users.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No staff members found</p>
              <p className="text-xs text-gray-400 mb-4">
                {searchQuery || roleFilter !== "all" ? "Try adjusting your filters" : "No users with configurable roles exist yet"}
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/college/create-user")}>
                Create User
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {users.map(user => (
                <UserCard
                  key={user.user_id}
                  user={user}
                  isSelected={selectedUserId === user.user_id}
                  hasPendingChanges={isDirty && selectedUserId === user.user_id}
                  onSelect={() => selectUser(user.user_id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span>Show</span>
                <Select value={String(limit)} onValueChange={v => { setLimit(Number(v)); setPage(1) }}>
                  <SelectTrigger className="h-7 w-[60px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <PaginationNumbers page={page} totalPages={totalPages} onPageChange={setPage} />
                <Button variant="ghost" size="icon-sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: permission editor */}
        <div className={`min-w-0 ${mobileEditorOpen ? "" : "hidden lg:block"}`}>
          {/* Mobile back button */}
          {mobileEditorOpen && (
            <button
              type="button"
              onClick={handleMobileBack}
              className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" /> Back to users
            </button>
          )}

          {selectedUserId ? (
            <UserPermissionEditor
              userId={selectedUserId}
              modules={modules}
              pendingPerms={pendingPerms}
              setPendingPerms={setPendingPerms}
              pendingDepts={pendingDepts}
              setPendingDepts={setPendingDepts}
              isDirty={isDirty}
              onSave={updateUserPermissions}
              onReset={resetUserToDefault}
              onCopy={copyUserPermissions}
              isSaving={isSaving}
              allUsers={users}
            />
          ) : (
            <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Select a user to manage their permissions</p>
              <p className="text-sm text-gray-400">Choose a staff member from the list on the left</p>
            </Card>
          )}
        </div>
      </div>

      {/* Discard changes dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={() => cancelDiscard()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Do you want to discard them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDiscard}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDiscard}>Discard Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── User Card ──────────────────────────────────────────────────────────────────

interface UserCardProps {
  user: UserPermissionSummary
  isSelected: boolean
  hasPendingChanges: boolean
  onSelect: () => void
}

function UserCard({ user, isSelected, hasPendingChanges, onSelect }: Readonly<UserCardProps>) {
  const isInactive = user.user_status !== "active"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/15 ring-1 ring-blue-500/30"
          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
      } ${isInactive ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarGradient(user.user_id)} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
          {getInitials(user.user_name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.user_name}</p>
            {hasPendingChanges && (
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Unsaved changes" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${ROLE_COLORS[user.user_role] ?? "bg-gray-100 text-gray-600"}`}>
              {ROLE_LABELS[user.user_role] ?? user.user_role}
            </span>
            {isInactive && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                Inactive
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            {user.departments.length > 0 ? (
              <span className="truncate">{user.departments.map(d => d.dept_name).join(", ")}</span>
            ) : (
              <span>All departments</span>
            )}
            <span className="shrink-0">· {user.permissions.length} perms</span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── User Permission Editor ─────────────────────────────────────────────────────

interface UserPermissionEditorProps {
  userId: string
  modules: PermissionGroup[]
  pendingPerms: Set<string> | null
  setPendingPerms: (v: Set<string> | null | ((prev: Set<string> | null) => Set<string> | null)) => void
  pendingDepts: Set<string> | null
  setPendingDepts: (v: Set<string> | null | ((prev: Set<string> | null) => Set<string> | null)) => void
  isDirty: boolean
  onSave: (args: { userId: string; payload: { permissions: string[]; dept_ids: string[]; expected_updated_at?: string } }, options?: { onSuccess?: () => void }) => void
  onReset: (userId: string, options?: { onSuccess?: () => void }) => void
  onCopy: (payload: CopyUserPermissionsPayload, options?: { onSuccess?: () => void }) => void
  isSaving: boolean
  allUsers: UserPermissionSummary[]
}

function UserPermissionEditor({
  userId, modules, pendingPerms, setPendingPerms, pendingDepts, setPendingDepts,
  isDirty, onSave, onReset, onCopy, isSaving, allUsers,
}: Readonly<UserPermissionEditorProps>) {
  const { data: detail, isLoading } = useUserPermissionDetail(userId)

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set())
  const [permSearch, setPermSearch] = useState("")
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  // Reset local state when user changes — derived-state-from-props pattern
  const [trackedUserId, setTrackedUserId] = useState(userId)
  if (trackedUserId !== userId) {
    setTrackedUserId(userId)
    setExpandedGroups(new Set())
    setPermSearch("")
  }

  const user = detail?.user
  const allDepartments: CollegeDepartment[] = detail?.allDepartments ?? []
  const serverPerms = useMemo(() => new Set(user?.permissions ?? []), [user?.permissions])
  const serverDepts = useMemo(() => new Set((user?.departments ?? []).map(d => d.dept_id)), [user?.departments])

  const currentPerms = pendingPerms ?? serverPerms
  const currentDepts = pendingDepts ?? serverDepts

  const totalActions = countTotalActions(modules)

  // ── Filtered modules (client-side search) ──
  const filteredModules = useMemo(() => {
    if (!permSearch.trim()) return modules
    const q = permSearch.toLowerCase()
    const matchesSearch = (a: { label: string; key: string; description: string }) =>
      a.label.toLowerCase().includes(q) || a.key.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    return modules
      .map(group => ({
        ...group,
        modules: group.modules
          .map(mod => ({ ...mod, actions: mod.actions.filter(matchesSearch) }))
          .filter(mod => mod.actions.length > 0),
      }))
      .filter(group => group.modules.length > 0)
  }, [modules, permSearch])

  // ── Handlers ──

  const togglePermission = useCallback((key: string) => {
    setPendingPerms((prev: Set<string> | null) => {
      const perms = new Set(prev ?? serverPerms)
      if (perms.has(key)) perms.delete(key)
      else perms.add(key)
      return perms
    })
  }, [serverPerms, setPendingPerms])

  const toggleModuleAll = useCallback((actionKeys: string[], allEnabled: boolean) => {
    setPendingPerms((prev: Set<string> | null) => {
      const perms = new Set(prev ?? serverPerms)
      for (const key of actionKeys) {
        if (allEnabled) perms.delete(key)
        else perms.add(key)
      }
      return perms
    })
  }, [serverPerms, setPendingPerms])

  const toggleDept = useCallback((deptId: string) => {
    setPendingDepts((prev: Set<string> | null) => {
      const depts = new Set(prev ?? serverDepts)
      if (depts.has(deptId)) depts.delete(deptId)
      else depts.add(deptId)
      return depts
    })
  }, [serverDepts, setPendingDepts])

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedGroups(new Set(modules.map(g => g.group)))
  }, [modules])

  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set())
  }, [])

  const handleSave = useCallback(() => {
    onSave(
      {
        userId,
        payload: {
          permissions: [...currentPerms],
          dept_ids: [...currentDepts],
          expected_updated_at: user?.permissions_updated_at ?? undefined,
        },
      },
      {
        onSuccess: () => {
          setPendingPerms(null)
          setPendingDepts(null)
        },
      },
    )
  }, [userId, currentPerms, currentDepts, user?.permissions_updated_at, onSave, setPendingPerms, setPendingDepts])

  const handleDiscard = useCallback(() => {
    setPendingPerms(null)
    setPendingDepts(null)
  }, [setPendingPerms, setPendingDepts])

  const handleReset = useCallback(() => {
    onReset(userId, {
      onSuccess: () => {
        setPendingPerms(null)
        setPendingDepts(null)
        setShowResetDialog(false)
      },
    })
  }, [userId, onReset, setPendingPerms, setPendingDepts])

  if (isLoading || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <Card className="p-4">
        <div className="flex items-start gap-4">
          <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${getAvatarGradient(user.user_id)} flex items-center justify-center text-white text-lg font-bold shrink-0`}>
            {getInitials(user.user_name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.user_name}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${ROLE_COLORS[user.user_role] ?? "bg-gray-100 text-gray-600"}`}>
                {ROLE_LABELS[user.user_role] ?? user.user_role}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                user.user_status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
              }`}>
                {user.user_status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{user.user_email}</p>
            <p className="text-xs text-gray-400 mt-1">Last updated {getTimeAgo(user.permissions_updated_at)}</p>
          </div>
        </div>
      </Card>

      {/* Department scope */}
      {allDepartments.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Department Scope</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(user.user_role === "hod" || user.user_role === "teacher")
                  ? "Select at least one department. This user will only see data from these departments."
                  : "Leave empty for all-department access, or select specific departments to restrict visibility."}
              </p>
            </div>
            <span className="text-xs text-gray-500 tabular-nums">
              {currentDepts.size} of {allDepartments.length} departments
            </span>
          </div>
          {(user.user_role === "hod" || user.user_role === "teacher") && currentDepts.size === 0 && (
            <div className="mb-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
              <span className="font-medium">⚠ {user.user_role === "hod" ? "HOD" : "Teacher"} roles require at least one department.</span>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allDepartments.map(dept => (
              <label
                key={dept.dept_id}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={currentDepts.has(dept.dept_id)}
                  onCheckedChange={() => toggleDept(dept.dept_id)}
                  disabled={isSaving}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{dept.dept_name}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Permission matrix header */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search permissions…"
            value={permSearch}
            onChange={e => setPermSearch(e.target.value)}
            className="pl-8 h-8"
          />
          {permSearch && (
            <button type="button" onClick={() => setPermSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button type="button" onClick={expandAll} className="text-blue-600 hover:underline cursor-pointer">Expand All</button>
          <span className="text-gray-300">|</span>
          <button type="button" onClick={collapseAll} className="text-blue-600 hover:underline cursor-pointer">Collapse All</button>
        </div>
        <span className="text-xs text-gray-500 tabular-nums ml-auto">
          {currentPerms.size} of {totalActions} enabled
        </span>
      </div>

      {/* Permission groups */}
      <div className="space-y-3">
        {filteredModules.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">No permissions match your search</p>
          </Card>
        ) : (
          filteredModules.map(group => (
            <PermissionGroupCard
              key={group.group}
              group={group}
              expanded={expandedGroups.has(group.group)}
              onToggle={() => toggleGroup(group.group)}
              currentPermissions={currentPerms}
              onTogglePermission={togglePermission}
              onToggleModuleAll={toggleModuleAll}
              disabled={isSaving}
            />
          ))
        )}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 z-10">
        <Card className={`p-3 flex items-center justify-between shadow-lg border transition-colors ${
          isDirty
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
        }`}>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCopyDialog(true)} disabled={isSaving}>
              <Copy className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Copy From…</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowResetDialog(true)} disabled={isSaving}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Reset to Default</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <Button variant="outline" size="sm" onClick={handleDiscard} disabled={isSaving}>
                Discard
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving || ((user.user_role === "hod" || user.user_role === "teacher") && currentDepts.size === 0)}>
              {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </Card>
      </div>

      {/* Copy dialog */}
      <CopyUserPermissionsDialog
        open={showCopyDialog}
        onOpenChange={setShowCopyDialog}
        targetUserId={userId}
        targetUserName={user.user_name}
        allUsers={allUsers}
        isSaving={isSaving}
        onCopy={(sourceId) => {
          onCopy(
            { source_user_id: sourceId, target_user_id: userId },
            {
              onSuccess: () => {
                setPendingPerms(null)
                setPendingDepts(null)
                setShowCopyDialog(false)
              },
            },
          )
        }}
      />

      {/* Reset dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset to Role Default</DialogTitle>
            <DialogDescription>
              This will reset <span className="font-medium text-gray-900 dark:text-gray-100">{user.user_name}</span>&apos;s
              permissions to the <span className="font-medium">{ROLE_LABELS[user.user_role]}</span> role template defaults. Department assignments will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Reset Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Copy User Permissions Dialog ───────────────────────────────────────────────

interface CopyUserPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetUserId: string
  targetUserName: string
  allUsers: UserPermissionSummary[]
  isSaving: boolean
  onCopy: (sourceUserId: string) => void
}

function CopyUserPermissionsDialog({
  open, onOpenChange, targetUserId, targetUserName, allUsers, isSaving, onCopy,
}: Readonly<CopyUserPermissionsDialogProps>) {
  const [sourceId, setSourceId] = useState<string>("")
  const otherUsers = allUsers.filter(u => u.user_id !== targetUserId)

  // Reset on open — derived-state-from-props pattern
  const [trackedOpen, setTrackedOpen] = useState(open)
  if (trackedOpen !== open) {
    setTrackedOpen(open)
    if (open) setSourceId("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Permissions</DialogTitle>
          <DialogDescription>
            Copy all permissions and department assignments to <span className="font-medium text-gray-900 dark:text-gray-100">{targetUserName}</span>.
            This will overwrite current settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-60 overflow-y-auto py-2">
          {otherUsers.map(u => (
            <label
              key={u.user_id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                sourceId === u.user_id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="copySource"
                value={u.user_id}
                checked={sourceId === u.user_id}
                onChange={() => setSourceId(u.user_id)}
                className="accent-blue-600"
              />
              <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarGradient(u.user_id)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                {getInitials(u.user_name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.user_name}</p>
                <p className="text-xs text-gray-400">
                  {ROLE_LABELS[u.user_role]} · {u.permissions.length} perms
                  {u.departments.length > 0 && ` · ${u.departments.map(d => d.dept_name).join(", ")}`}
                </p>
              </div>
            </label>
          ))}
          {otherUsers.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No other users available to copy from</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onCopy(sourceId)} disabled={!sourceId || isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Copy Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Pagination Numbers ─────────────────────────────────────────────────────────

function PaginationNumbers({ page, totalPages, onPageChange }: Readonly<{ page: number; totalPages: number; onPageChange: (p: number) => void }>) {
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("ellipsis-start")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push("ellipsis-end")
    pages.push(totalPages)
  }

  return (
    <>
      {pages.map(p =>
        typeof p === "string" ? (
          <span key={p} className="px-1 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-7 w-7 rounded text-xs font-medium transition-colors cursor-pointer ${
              page === p
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {p}
          </button>
        ),
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE TEMPLATES TAB (existing UI, minimal changes)
// ═══════════════════════════════════════════════════════════════════════════════

function RoleTemplatesTab() {
  const {
    roles, modules, isLoading, isError, error,
    updatePermissions, resetToDefault, copyPermissions, isSaving,
  } = usePermissionManager()

  const [activeRole, setActiveRole] = useState<string>("tpo")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set())
  const [pendingChanges, setPendingChanges] = useState<Map<string, { permissions: Set<string>; deptScoped: boolean }>>(new Map)
  const [copySource, setCopySource] = useState<string>("")
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const activeConfig = getRoleConfig(roles, activeRole)

  const currentPermissions = useMemo(() => {
    const pending = pendingChanges.get(activeRole)
    if (pending) return pending.permissions
    return new Set(activeConfig?.permissions ?? [])
  }, [activeRole, activeConfig, pendingChanges])

  const currentDeptScoped = useMemo(() => {
    const pending = pendingChanges.get(activeRole)
    if (pending) return pending.deptScoped
    return activeConfig?.dept_scoped ?? false
  }, [activeRole, activeConfig, pendingChanges])

  const hasPendingChanges = pendingChanges.has(activeRole)

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedGroups(new Set(modules.map(g => g.group)))
  }, [modules])

  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set())
  }, [])

  const togglePermission = useCallback(
    (key: string) => {
      setPendingChanges(prev => {
        const next = new Map(prev)
        const existing = next.get(activeRole)
        const perms = new Set(existing?.permissions ?? activeConfig?.permissions ?? [])
        const deptScoped = existing?.deptScoped ?? activeConfig?.dept_scoped ?? false
        if (perms.has(key)) perms.delete(key)
        else perms.add(key)
        next.set(activeRole, { permissions: perms, deptScoped })
        return next
      })
    },
    [activeRole, activeConfig],
  )

  const toggleDeptScoped = useCallback(() => {
    setPendingChanges(prev => {
      const next = new Map(prev)
      const existing = next.get(activeRole)
      const perms = new Set(existing?.permissions ?? activeConfig?.permissions ?? [])
      const deptScoped = !(existing?.deptScoped ?? activeConfig?.dept_scoped ?? false)
      next.set(activeRole, { permissions: perms, deptScoped })
      return next
    })
  }, [activeRole, activeConfig])

  const toggleModuleAll = useCallback(
    (moduleActions: string[], allEnabled: boolean) => {
      setPendingChanges(prev => {
        const next = new Map(prev)
        const existing = next.get(activeRole)
        const perms = new Set(existing?.permissions ?? activeConfig?.permissions ?? [])
        const deptScoped = existing?.deptScoped ?? activeConfig?.dept_scoped ?? false
        for (const key of moduleActions) {
          if (allEnabled) perms.delete(key)
          else perms.add(key)
        }
        next.set(activeRole, { permissions: perms, deptScoped })
        return next
      })
    },
    [activeRole, activeConfig],
  )

  const saveChanges = useCallback(() => {
    const pending = pendingChanges.get(activeRole)
    if (!pending) return
    updatePermissions(
      { role: activeRole, payload: { permissions: [...pending.permissions], dept_scoped: pending.deptScoped } },
      {
        onSuccess: () => {
          setPendingChanges(prev => { const next = new Map(prev); next.delete(activeRole); return next })
        },
      },
    )
  }, [activeRole, pendingChanges, updatePermissions])

  const discardChanges = useCallback(() => {
    setPendingChanges(prev => { const next = new Map(prev); next.delete(activeRole); return next })
  }, [activeRole])

  const handleReset = useCallback(() => {
    resetToDefault(activeRole, {
      onSuccess: () => {
        setPendingChanges(prev => { const next = new Map(prev); next.delete(activeRole); return next })
        setShowResetDialog(false)
      },
    })
  }, [activeRole, resetToDefault])

  const handleCopy = useCallback(() => {
    if (!copySource || copySource === activeRole) return
    copyPermissions(
      { source_role: copySource, target_role: activeRole },
      {
        onSuccess: () => {
          setPendingChanges(prev => { const next = new Map(prev); next.delete(activeRole); return next })
          setShowCopyDialog(false)
          setCopySource("")
        },
      },
    )
  }, [copySource, activeRole, copyPermissions])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-24" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 mb-2 font-medium">Failed to load permissions</p>
        <p className="text-sm text-gray-500">{error?.message}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <Card className="p-3 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          Role templates define the default permissions assigned to new users. Changes here do <span className="font-semibold">not</span> affect existing users — manage individual users in the Users tab.
        </p>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowCopyDialog(true)} disabled={isSaving}>
          <Copy className="h-4 w-4 mr-1.5" />
          Copy From…
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowResetDialog(true)} disabled={isSaving}>
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reset to Default
        </Button>
      </div>

      {/* Role tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800">
        {ROLE_ORDER.map(role => {
          const hasChanges = pendingChanges.has(role)
          return (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative cursor-pointer ${
                activeRole === role
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {ROLE_LABELS[role]}
              {hasChanges && (
                <span className="absolute top-1.5 right-1 h-2 w-2 rounded-full bg-amber-500" title="Unsaved changes" />
              )}
            </button>
          )
        })}
      </div>

      {/* Dept scoped toggle */}
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Department Scoped</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When enabled, this role can only access data within their assigned departments
            </p>
          </div>
        </div>
        <Switch checked={currentDeptScoped} onCheckedChange={toggleDeptScoped} disabled={isSaving} />
      </Card>

      {/* Expand/collapse */}
      <div className="flex items-center gap-2 text-xs">
        <button type="button" onClick={expandAll} className="text-blue-600 hover:underline cursor-pointer">Expand All</button>
        <span className="text-gray-300">|</span>
        <button type="button" onClick={collapseAll} className="text-blue-600 hover:underline cursor-pointer">Collapse All</button>
        <span className="ml-auto text-gray-500">
          {currentPermissions.size} of {countTotalActions(modules)} permissions enabled
        </span>
      </div>

      {/* Permission groups */}
      <div className="space-y-3">
        {modules.map(group => (
          <PermissionGroupCard
            key={group.group}
            group={group}
            expanded={expandedGroups.has(group.group)}
            onToggle={() => toggleGroup(group.group)}
            currentPermissions={currentPermissions}
            onTogglePermission={togglePermission}
            onToggleModuleAll={toggleModuleAll}
            disabled={isSaving}
          />
        ))}
      </div>

      {/* Save bar */}
      {hasPendingChanges && (
        <div className="sticky bottom-4 z-10">
          <Card className="p-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              You have unsaved changes for <span className="font-bold">{ROLE_LABELS[activeRole]}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={discardChanges} disabled={isSaving}>Discard</Button>
              <Button size="sm" onClick={saveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Copy dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copy Permissions</DialogTitle>
            <DialogDescription>
              Copy all permissions from another role to <span className="font-medium text-gray-900 dark:text-gray-100">{ROLE_LABELS[activeRole]}</span>.
              This will overwrite the current permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {ROLE_ORDER.filter(r => r !== activeRole).map(role => (
              <label
                key={role}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  copySource === role
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="copySource"
                  value={role}
                  checked={copySource === role}
                  onChange={() => setCopySource(role)}
                  className="accent-blue-600"
                />
                <span className="text-sm font-medium">{ROLE_LABELS[role]}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyDialog(false)}>Cancel</Button>
            <Button onClick={handleCopy} disabled={!copySource || isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Copy Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset to Default</DialogTitle>
            <DialogDescription>
              This will reset <span className="font-medium text-gray-900 dark:text-gray-100">{ROLE_LABELS[activeRole]}</span> to the
              system default permissions. Any custom changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Reset Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface PermissionGroupCardProps {
  group: PermissionGroup
  expanded: boolean
  onToggle: () => void
  currentPermissions: Set<string>
  onTogglePermission: (key: string) => void
  onToggleModuleAll: (moduleActions: string[], allEnabled: boolean) => void
  disabled: boolean
}

function PermissionGroupCard({
  group, expanded, onToggle, currentPermissions, onTogglePermission, onToggleModuleAll, disabled,
}: Readonly<PermissionGroupCardProps>) {
  const totalActions = group.modules.reduce((sum, m) => sum + m.actions.length, 0)
  const enabledActions = group.modules.reduce(
    (sum, m) => sum + m.actions.filter(a => currentPermissions.has(a.key)).length, 0,
  )

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{group.group}</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">{enabledActions}/{totalActions}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {group.modules.map(mod => {
            const actionKeys = mod.actions.map(a => a.key)
            const allEnabled = actionKeys.every(k => currentPermissions.has(k))

            return (
              <div key={mod.key} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{mod.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{mod.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleModuleAll(actionKeys, allEnabled)}
                    disabled={disabled}
                    className={`text-xs px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      allEnabled
                        ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        : "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {allEnabled ? "Disable All" : "Enable All"}
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {mod.actions.map(action => (
                    <label
                      key={action.key}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      <Switch
                        checked={currentPermissions.has(action.key)}
                        onCheckedChange={() => onTogglePermission(action.key)}
                        disabled={disabled}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{action.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate" title={action.description}>
                          {action.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
