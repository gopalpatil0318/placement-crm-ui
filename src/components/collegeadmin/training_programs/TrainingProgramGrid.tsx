import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Plus,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    X,
    ArrowUpDown,
} from "lucide-react";
import { useViewTrainingPrograms } from "@/hooks/collegeadmin/training_programs/useViewTrainingPrograms";
import { AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedList";
import TrainingProgramCard from "./TrainingProgramCard";
import FloatingSelect from "@/components/ui/FloatingSelect";
import {
    PROGRAM_STATUS_OPTIONS,
    PROGRAM_STATUS_LABELS,
    PROGRAM_TYPE_OPTIONS,
    PROGRAM_TYPE_LABELS,
    type ProgramStatus,
    type ProgramType,
} from "@/validators/TrainingProgramSchema";

// ========================
// CONSTANTS
// ========================

const currentYear = new Date().getFullYear();
const PASSOUT_YEARS = Array.from({ length: 7 }, (_, i) => currentYear - 2 + i);

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const SORT_OPTIONS = [
    { value: "created_at", label: "Date Created" },
    { value: "program_name", label: "Name" },
    { value: "start_date", label: "Start Date" },
    { value: "end_date", label: "End Date" },
    { value: "program_type", label: "Type" },
    { value: "program_status", label: "Status" },
];

// ========================
// COMPONENT
// ========================

const TrainingProgramGrid = () => {
    const {
        programs,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        typeFilter,
        passoutYearFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        handlePassoutYearFilterChange,
        handleSortChange,
        handleSortFieldChange,
        handleSortOrderToggle,
        handleLimitChange,
    } = useViewTrainingPrograms();

    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = statusFilter || typeFilter || passoutYearFilter;

    const clearFilters = () => {
        handleStatusFilterChange("");
        handleTypeFilterChange("");
        handlePassoutYearFilterChange("");
    };

    // ── Status Tabs ──
    const statusTabs = [
        { value: "", label: "All" },
        ...PROGRAM_STATUS_OPTIONS.map((s) => ({
            value: s,
            label: PROGRAM_STATUS_LABELS[s],
        })),
    ];

    return (
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Training Programs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {pagination.total} program{pagination.total !== 1 ? "s" : ""} total
                    </p>
                </div>
                <Link
                    to="/college/create-training-program"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-blue-200 dark:shadow-none"
                >
                    <Plus className="h-4 w-4" />
                    Create Program
                </Link>
            </div>

            {/* ── Status Tabs ── */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {statusTabs.map((tab) => (
                    <button
                        type="button"
                        key={tab.value}
                        onClick={() => handleStatusFilterChange(tab.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                            statusFilter === tab.value
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Search + Filters Bar ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search programs..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                </div>

                {/* Filter toggle */}
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                        showFilters || hasActiveFilters
                            ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                </button>

                {/* Sort */}
                <div className="flex items-center gap-1">
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortFieldChange(e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleSortOrderToggle}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        title={sortOrder === "asc" ? "Ascending" : "Descending"}
                        aria-label={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
                    >
                        <ArrowUpDown className="h-4 w-4" />
                    </button>
                </div>

                {/* Show entries */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <span>Show</span>
                    <select
                        value={pagination.limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Filter Panel ── */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filters</span>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                <X className="h-3 w-3" /> Clear all
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FloatingSelect
                            label="Program Type"
                            name="typeFilter"
                            value={typeFilter}
                            onChange={(e) => handleTypeFilterChange(e.target.value)}
                            options={PROGRAM_TYPE_OPTIONS.map((t) => ({
                                value: t,
                                label: PROGRAM_TYPE_LABELS[t as ProgramType],
                            }))}
                        />
                        <FloatingSelect
                            label="Passout Year"
                            name="passoutYearFilter"
                            value={passoutYearFilter}
                            onChange={(e) => handlePassoutYearFilterChange(e.target.value)}
                            options={PASSOUT_YEARS.map((y) => ({
                                value: String(y),
                                label: String(y),
                            }))}
                        />
                    </div>
                </div>
            )}

            {/* ── Loading Skeleton ── */}
            {loading && programs.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between">
                                    <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
                                    <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
                                </div>
                                <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                                <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
                            </div>
                            <div className="px-5 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty State ── */}
            {!loading && programs.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <BookOpen className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No training programs found</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                        {search || hasActiveFilters
                            ? "Try adjusting your search or filters"
                            : "Create your first training program to get started"}
                    </p>
                    {!search && !hasActiveFilters && (
                        <Link
                            to="/college/create-training-program"
                            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Create Program
                        </Link>
                    )}
                </div>
            )}

            {/* ── Card Grid ── */}
            {programs.length > 0 && (
                <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {programs.map((program) => (
                        <AnimatedGridItem key={program.program_id}>
                            <TrainingProgramCard program={program} />
                        </AnimatedGridItem>
                    ))}
                </AnimatedGrid>
            )}

            {/* ── Pagination ── */}
            {!loading && programs.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                        Showing{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {programs.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
                        </span>
                        –
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span>
                    </span>

                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        loading={loading}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

// ========================
// SUB-COMPONENTS
// ========================

const Pagination = ({
    page,
    totalPages,
    loading,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    loading: boolean;
    onPageChange: (p: number) => void;
}) => {
    if (totalPages <= 1) return null;

    const pages: (number | "ellipsis")[] = [];
    const addPage = (p: number) => {
        if (!pages.includes(p)) pages.push(p);
    };

    addPage(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        addPage(i);
    }
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) addPage(totalPages);

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

            {pages.map((p, idx) =>
                p === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 dark:text-gray-500 text-sm select-none">
                        ...
                    </span>
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

export default TrainingProgramGrid;
