import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import {
    Search,
    Plus,
    Lightbulb,
    Users,
    Calendar,
    Tag,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Trash2,
    X,
    AlertCircle,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RefreshCw,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useViewSkills, type SkillCategory } from "@/hooks/collegeadmin/skills/useViewSkills";
import { useCreateSkill } from "@/hooks/collegeadmin/skills/useCreateSkill";
import ModalWrapper from "@/components/ui/ModalWrapper";

// ─── Constants ──────────────────────────────────────────────────────────────────

const LIMIT_OPTIONS = [25, 50, 100];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    Frontend: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
    Backend: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    Database: { bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
    Cloud: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
    DevOps: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
    Programming: { bg: "bg-cyan-50 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
    "AI/ML": { bg: "bg-violet-50 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
    "Soft Skills": { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
};

const DEFAULT_CATEGORY_COLOR = { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" };

// ─── Sub-components ─────────────────────────────────────────────────────────────

function SkillsTableSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg bg-white px-4 py-3 dark:bg-gray-800"
                >
                    <div className="h-4 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700 ml-auto" />
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-7 w-7 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                <Lightbulb size={32} className="text-amber-500" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                No skills yet
            </h3>
            <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Start building your college&apos;s skill catalog. Students will be able
                to add these skills to their profiles.
            </p>
            <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
            >
                <Plus size={16} />
                Add your first skill
            </button>
        </div>
    );
}

function CategoryBadge({ category }: { category: string | null }) {
    if (!category) {
        return (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                —
            </span>
        );
    }

    const colors = CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
        >
            <Tag size={10} />
            {category}
        </span>
    );
}

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: string }) {
    if (sortBy !== field) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortOrder === "asc"
        ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" />
        : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />;
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Add Skill Modal ────────────────────────────────────────────────────────────

interface AddSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: SkillCategory[];
}

function AddSkillModal({ isOpen, onClose, categories }: AddSkillModalProps) {
    const { formData, errors, loading, handleChange, handleSubmit, resetForm } =
        useCreateSkill(() => {
            onClose();
        });

    const handleClose = useCallback(() => {
        if (!loading) {
            resetForm();
            onClose();
        }
    }, [loading, resetForm, onClose]);

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={handleClose}
            disabled={loading}
            size="sm"
            title="Add New Skill"
            titleIcon={<Lightbulb size={18} className="text-amber-500" />}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 px-6 py-5">
                    {/* Skill Name */}
                    <div>
                        <label
                            htmlFor="skill_name"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Skill Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="skill_name"
                            name="skill_name"
                            type="text"
                            value={formData.skill_name}
                            onChange={handleChange}
                            maxLength={100}
                            autoFocus
                            placeholder="e.g. React.js, Python, AWS"
                            className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors outline-none
                                ${errors.skill_name
                                    ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300"
                                    : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                }`}
                        />
                        <AnimatePresence mode="wait">
                            {errors.skill_name && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                                >
                                    <AlertCircle size={12} />
                                    {errors.skill_name}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Category */}
                    <div>
                        <label
                            htmlFor="skill_category"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Category
                        </label>
                        <input
                            id="skill_category"
                            name="skill_category"
                            type="text"
                            list="skill-categories"
                            value={formData.skill_category}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="e.g. Frontend, Backend, Cloud"
                            className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors outline-none
                                ${errors.skill_category
                                    ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300"
                                    : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                }`}
                        />
                        <datalist id="skill-categories">
                            {categories.map((cat) => (
                                <option key={cat.category} value={cat.category} />
                            ))}
                        </datalist>
                        <AnimatePresence mode="wait">
                            {errors.skill_category && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                                >
                                    <AlertCircle size={12} />
                                    {errors.skill_category}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            Select from existing or type a new category
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        {loading ? "Adding…" : "Add Skill"}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function SkillsManager() {
    const shouldReduce = useReducedMotion();
    useTheme();

    const {
        skills,
        categories,
        loading,
        isFetching,
        error,
        pagination,
        search,
        limit,
        categoryFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleCategoryFilterChange,
        handleSortChange,
        refetch,
    } = useViewSkills();

    const [showAddModal, setShowAddModal] = useState(false);

    const Wrapper = shouldReduce ? "div" : motion.div;
    const wrapperProps = shouldReduce
        ? {}
        : { variants: staggerContainer, initial: "hidden", animate: "show" };

    // ── Header ──
    const header = (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                    <Lightbulb size={20} className="text-amber-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        Skills Master
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {pagination.total > 0
                            ? `${pagination.total} skill${pagination.total !== 1 ? "s" : ""} in catalog`
                            : "Manage your college's skill catalog"}
                    </p>
                </div>
            </div>
            <motion.button
                type="button"
                onClick={() => setShowAddModal(true)}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
            >
                <Plus size={16} />
                Add Skill
            </motion.button>
        </div>
    );

    // ── Filter Bar ──
    const filterBar = (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search skills…"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => handleSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Category Filter */}
            <select
                value={categoryFilter}
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                        {cat.category} ({cat.count})
                    </option>
                ))}
            </select>

            {/* Limit */}
            <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
                {LIMIT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt} per page
                    </option>
                ))}
            </select>
        </div>
    );

    // ── Error State ──
    if (error) {
        return (
            <div className="space-y-6 p-4 lg:p-6">
                {header}
                <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 dark:border-red-800 dark:bg-red-900/10">
                    <AlertCircle size={40} className="mb-3 text-red-400" />
                    <h3 className="mb-1 text-lg font-semibold text-red-700 dark:text-red-400">
                        Failed to load skills
                    </h3>
                    <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        <RefreshCw size={14} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ── Table ──
    const sortableHeader = (label: string, field: string) => (
        <button
            type="button"
            onClick={() => handleSortChange(field)}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
            {label}
            <SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />
        </button>
    );

    const table = (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-12">
                            #
                        </th>
                        <th className="px-4 py-3">{sortableHeader("Skill Name", "skill_name")}</th>
                        <th className="px-4 py-3">{sortableHeader("Category", "skill_category")}</th>
                        <th className="px-4 py-3 text-center">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Students
                            </span>
                        </th>
                        <th className="px-4 py-3">{sortableHeader("Added", "created_at")}</th>
                        <th className="px-4 py-3 text-center">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Actions
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {skills.map((skill, idx) => {
                        const rowNum = (pagination.page - 1) * pagination.limit + idx + 1;
                        const Row = shouldReduce ? "tr" : motion.tr;
                        const rowProps = shouldReduce
                            ? {}
                            : { variants: staggerItem, layout: true };

                        return (
                            <Row
                                key={skill.skill_id}
                                {...rowProps}
                                className="group border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30"
                            >
                                <td className="px-4 py-3 text-gray-400 dark:text-gray-500 font-mono text-xs">
                                    {rowNum}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {skill.skill_name}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <CategoryBadge category={skill.skill_category} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <Users size={13} className="text-gray-400" />
                                        {skill.student_count}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                                        <Calendar size={12} />
                                        {formatDate(skill.created_at)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        type="button"
                                        disabled
                                        title="Delete — coming soon"
                                        className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </Row>
                        );
                    })}
                </tbody>
            </table>

            {/* Fetching overlay */}
            {isFetching && !loading && (
                <div className="flex items-center justify-center border-t border-gray-200 py-2 dark:border-gray-700">
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        Updating…
                    </span>
                </div>
            )}
        </div>
    );

    // ── Pagination ──
    const paginationBar = pagination.totalPages > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                    {(pagination.page - 1) * pagination.limit + 1}
                </span>
                –
                <span className="font-medium text-gray-900 dark:text-white">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                    {pagination.total}
                </span>
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <ChevronLeft size={14} />
                    Prev
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    Next
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );

    // ── Render ──
    return (
        <Wrapper {...wrapperProps} className="space-y-5 p-4 lg:p-6">
            {header}
            {filterBar}

            {loading ? (
                <SkillsTableSkeleton />
            ) : skills.length === 0 ? (
                <EmptyState onAdd={() => setShowAddModal(true)} />
            ) : (
                <>
                    {table}
                    {paginationBar}
                </>
            )}

            <AddSkillModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                categories={categories}
            />
        </Wrapper>
    );
}
