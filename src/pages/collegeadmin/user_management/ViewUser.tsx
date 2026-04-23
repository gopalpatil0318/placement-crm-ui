import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import {
    Plus, ChevronLeft, ChevronRight, Search, Users, UserPlus, Filter,
    AlertCircle, RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList";
import { useViewUsers, type User } from "@/hooks/collegeadmin/user_management/useViewUsers";

// ========================
// CONSTANTS
// ========================

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Users", active: true },
];

const ROLE_FILTER_OPTIONS = [
    { value: "", label: "All Roles" },
    { value: "collegeadmin", label: "College Admin" },
    { value: "tpo", label: "TPO" },
    { value: "tpc", label: "TPC" },
    { value: "hod", label: "HOD" },
    { value: "teacher", label: "Teacher" },
];

const STATUS_FILTER_OPTIONS = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const ROLE_BADGE_MAP: Record<string, { label: string; color: string }> = {
    collegeadmin: { label: "College Admin", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
    tpo: { label: "TPO", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
    tpc: { label: "TPC", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" },
    hod: { label: "HOD", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" },
    teacher: { label: "Teacher", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" },
};

// ========================
// HELPERS
// ========================

const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// ========================
// SUB-COMPONENTS
// ========================

/** User avatar with deterministic color */
const UserAvatar = ({ user }: { user: User }) => {
    const initials = user.user_name
        ? user.user_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        : "?";
    const COLORS = [
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
        "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
        "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
        "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    ] as const;
    const color = COLORS[(user.user_name.codePointAt(0) ?? 0) % COLORS.length];
    return (
        <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${color}`}>
            {initials}
        </div>
    );
};

/** Numbered pagination with ellipsis */
const PaginationNav = ({
    page, totalPages, loading, onPageChange,
}: {
    page: number; totalPages: number; loading: boolean; onPageChange: (p: number) => void;
}) => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const add = (p: number) => { if (!pages.includes(p)) pages.push(p); };

    add(1);
    if (page > 3) pages.push("ellipsis-start");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
    if (page < totalPages - 2) pages.push("ellipsis-end");
    if (totalPages > 1) add(totalPages);

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map((p) =>
                typeof p === "string" ? (
                    <span key={p} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">...</span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        className={`min-w-[32px] h-8 rounded-md text-sm font-medium transition ${
                            p === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        } disabled:cursor-not-allowed`}
                    >
                        {p}
                    </button>
                )
            )}
            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

/** Empty state */
const EmptyState = ({ hasFilters, onReset, onAdd }: { hasFilters: boolean; onReset?: () => void; onAdd?: () => void }) => (
    <div className="py-16 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            {hasFilters ? (
                <Filter className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            ) : (
                <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {hasFilters ? "No users match your filters" : "No users yet"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
            {hasFilters
                ? "Try adjusting your search or filter criteria."
                : "Create your first user to get started with the platform."}
        </p>
        {(() => {
            if (hasFilters) return (
                <button
                    type="button"
                    onClick={onReset}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Clear all filters
                </button>
            );
            if (onAdd) return (
                <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
                >
                    <UserPlus className="h-4 w-4" />
                    Add New User
                </button>
            );
            return null;
        })()}
    </div>
);

/** Skeleton table rows */
const SkeletonRows = () => (
    <>
        {["sk-0", "sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((key) => (
            <tr key={key} className="border-b border-gray-100 dark:border-gray-800">
                {/* Name + Avatar */}
                <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className="space-y-1.5">
                            <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                    </div>
                </td>
                {/* Role */}
                <td className="px-4 py-3.5"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></td>
                {/* Department */}
                <td className="px-4 py-3.5"><div className="h-3.5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                {/* Status */}
                <td className="px-4 py-3.5"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></td>
                {/* Created */}
                <td className="px-4 py-3.5"><div className="h-3.5 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
            </tr>
        ))}
    </>
);

/** Desktop table body — loading / empty / data states */
const UsersTableBody = ({
    loading, users, isFetching, hasActiveFilters, canManage, clearFilters, navigate,
}: {
    loading: boolean; users: User[]; isFetching: boolean; hasActiveFilters: boolean;
    canManage: boolean; clearFilters: () => void; navigate: (path: string) => void;
}) => {
    if (loading) return <tbody><SkeletonRows /></tbody>;
    if (users.length === 0) {
        return (
            <tbody>
                <tr>
                    <td colSpan={5}>
                        <EmptyState
                            hasFilters={hasActiveFilters}
                            onReset={clearFilters}
                            onAdd={canManage ? () => navigate("/college/create-user") : undefined}
                        />
                    </td>
                </tr>
            </tbody>
        );
    }
    return (
        <AnimatedTableBody>
            {users.map((user) => {
                const roleBadge = ROLE_BADGE_MAP[user.user_role] || ROLE_BADGE_MAP.teacher;
                const isActive = user.user_status === "active";
                return (
                    <AnimatedRow
                        key={user.user_id}
                        onClick={() => navigate(`/college/user/${user.user_id}`)}
                        className={`border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-sm cursor-pointer transition-colors ${
                            isFetching ? "opacity-60" : ""
                        }`}
                    >
                        {/* User (avatar + name + email) */}
                        <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                                <UserAvatar user={user} />
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {user.user_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.user_email}
                                    </p>
                                </div>
                            </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge.color}`}>
                                {roleBadge.label}
                            </span>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                            {user.dept_name || (
                                <span className="text-gray-400 dark:text-gray-600 italic">—</span>
                            )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isActive
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        </td>

                        {/* Created */}
                        <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(user.created_at)}
                        </td>
                    </AnimatedRow>
                );
            })}
        </AnimatedTableBody>
    );
};

/** Mobile user list — loading / empty / data states */
const MobileUserList = ({
    loading, users, isFetching, hasActiveFilters, canManage, clearFilters, navigate,
}: {
    loading: boolean; users: User[]; isFetching: boolean; hasActiveFilters: boolean;
    canManage: boolean; clearFilters: () => void; navigate: (path: string) => void;
}) => {
    if (loading) {
        return (
            <>
                {["msk-0", "msk-1", "msk-2", "msk-3", "msk-4", "msk-5"].map((key) => (
                    <div key={key} className="p-4 space-y-3 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="h-3 w-44 bg-gray-100 dark:bg-gray-800 rounded" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                    </div>
                ))}
            </>
        );
    }
    if (users.length === 0) {
        return (
            <EmptyState
                hasFilters={hasActiveFilters}
                onReset={clearFilters}
                onAdd={canManage ? () => navigate("/college/create-user") : undefined}
            />
        );
    }
    return (
        <>
            {users.map((user) => {
                const roleBadge = ROLE_BADGE_MAP[user.user_role] || ROLE_BADGE_MAP.teacher;
                const isActive = user.user_status === "active";
                return (
                    <button
                        type="button"
                        key={user.user_id}
                        onClick={() => navigate(`/college/user/${user.user_id}`)}
                        className={`w-full text-left p-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors active:bg-blue-50 dark:active:bg-blue-900/20 ${
                            isFetching ? "opacity-60" : ""
                        }`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <UserAvatar user={user} />
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                                    {user.user_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.user_email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadge.color}`}>
                                {roleBadge.label}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isActive
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                                {isActive ? "Active" : "Inactive"}
                            </span>
                            {user.dept_name && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">{user.dept_name}</span>
                            )}
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{formatDate(user.created_at)}</span>
                        </div>
                    </button>
                );
            })}
        </>
    );
};

// ========================
// MAIN COMPONENT
// ========================

const ViewUsers = () => {
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const canManage = hasPermission("users.manage");
    const {
        users, loading, isFetching, error, pagination, search, roleFilter, statusFilter,
        handleSearchChange, handlePageChange, handleLimitChange,
        handleRoleFilterChange, handleStatusFilterChange, refresh,
    } = useViewUsers();

    const hasActiveFilters = !!(search || roleFilter || statusFilter);

    const startEntry = users.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

    const clearFilters = useMemo(() => () => {
        handleSearchChange("");
        handleRoleFilterChange("");
        handleStatusFilterChange("");
    }, [handleSearchChange, handleRoleFilterChange, handleStatusFilterChange]);

    return (
        <AnimatedPage>
            <div className="space-y-8">
                <PageHeader title="Users List" breadcrumbs={BREADCRUMBS} />

                {/* ── Error State ── */}
                {error && !loading && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-800/50 p-10 flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Failed to load users</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => refresh()}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                )}

                {!error && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Manage Users
                                {pagination.total > 0 && (
                                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        ({pagination.total})
                                    </span>
                                )}
                            </h2>
                            {canManage && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/college/create-user")}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add New User
                                </button>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                                />
                            </div>

                            {/* Role filter */}
                            <select
                                value={roleFilter}
                                onChange={(e) => handleRoleFilterChange(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                            >
                                {ROLE_FILTER_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            {/* Status filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                            >
                                {STATUS_FILTER_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            {/* Page size */}
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium ml-auto flex items-center gap-2">
                                {"Show "}
                                <select
                                    value={pagination.limit}
                                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                                    className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                >
                                    {PAGE_SIZE_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {" entries"}
                            </div>
                        </div>
                    </div>

                    {/* Table (desktop) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Created</th>
                                </tr>
                            </thead>

                            <UsersTableBody
                                loading={loading}
                                users={users}
                                isFetching={isFetching}
                                hasActiveFilters={hasActiveFilters}
                                canManage={canManage}
                                clearFilters={clearFilters}
                                navigate={navigate}
                            />
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                        <MobileUserList
                            loading={loading}
                            users={users}
                            isFetching={isFetching}
                            hasActiveFilters={hasActiveFilters}
                            canManage={canManage}
                            clearFilters={clearFilters}
                            navigate={navigate}
                        />
                    </div>

                    {/* Pagination Footer */}
                    {pagination.total > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Showing{" "}
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{startEntry}</span>
                                {" to "}
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{endEntry}</span>
                                {" of "}
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{pagination.total}</span>
                                {" "}entries
                            </p>
                            <PaginationNav
                                page={pagination.page}
                                totalPages={pagination.totalPages}
                                loading={loading}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>)}
            </div>
        </AnimatedPage>
    );
};

export default ViewUsers;
