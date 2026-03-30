import { useState, useMemo, useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { ApiError } from "@/lib/api";
import AnimatedTabContent from "@/components/ui/AnimatedTabContent";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
    BarChart3,
    TrendingUp,
    FileText,
    Users,
    Building2,
    Briefcase,
    PieChart as PieChartIcon,
    GraduationCap,
    RefreshCcw,
    ChevronDown,
    AlertTriangle,
    IndianRupee,
    Award,
    UserX,
    ArrowUpRight,
    ArrowDownRight,
    Star,
    Loader2,
    Trophy,
    Target,
    Activity,
    Clock,
    CheckCircle2,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ResponsiveContainer,
} from "recharts";
import {
    useDashboard,
    formatPackage,
    getGrowthPercent,
    SLAB_LABELS,
    type DashboardTab,
    type DashboardOverview,
    type PlacementStats,
    type ApplicationFunnel,
    type StudentReadiness,
    type DiversityStats,
    type TrainingStats,
    type DepartmentStat,
    type CompanyStat,
    type YearComparison,
} from "@/hooks/collegeadmin/dashboard/useDashboard";

// ========================
// CONSTANTS
// ========================

const TAB_KEYS = ["overview", "placement", "funnel", "students", "departments", "companies", "diversity", "training", "yearComparison"] as const;

const CHART_COLORS = {
    primary: "#4F46E5",
    secondary: "#0EA5E9",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    muted: "#6B7280",
    slabs: ["#DBEAFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8"],
    gender: ["#3B82F6", "#EC4899", "#8B5CF6"],
    statuses: ["#3B82F6", "#10B981", "#F59E0B", "#6B7280", "#EF4444"],
};

interface TabConfig {
    key: DashboardTab;
    label: string;
    icon: typeof BarChart3;
}

const TABS: TabConfig[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "placement", label: "Placement", icon: TrendingUp },
    { key: "funnel", label: "Applications", icon: FileText },
    { key: "students", label: "Students", icon: Users },
    { key: "departments", label: "Departments", icon: Building2 },
    { key: "companies", label: "Companies", icon: Briefcase },
    { key: "diversity", label: "Diversity / NAAC", icon: PieChartIcon },
    { key: "training", label: "Training", icon: GraduationCap },
    { key: "yearComparison", label: "Year Trends", icon: TrendingUp },
];

const STAR_KEYS = ["star-1", "star-2", "star-3", "star-4", "star-5"] as const;

function LegendLabel(v: string) {
    return <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>;
}

// ========================
// ANIMATED COUNTER
// ========================

function AnimatedNumber({ value, decimals = 0 }: Readonly<{ value: number; decimals?: number }>) {
    const prefersReduced = useReducedMotion();
    const spring = useSpring(0, { stiffness: 60, damping: 20 });
    const display = useTransform(spring, (v) =>
        decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN"),
    );

    useEffect(() => {
        if (!prefersReduced) spring.set(value);
    }, [value, prefersReduced, spring]);

    if (prefersReduced) {
        return <>{decimals > 0 ? value.toFixed(decimals) : value.toLocaleString("en-IN")}</>;
    }

    return <motion.span>{display}</motion.span>;
}

// ========================
// CIRCULAR PROGRESS
// ========================

function CircularProgress({ percentage, ringColor, size = 100, strokeWidth = 8 }: Readonly<{ percentage: number; ringColor: string; size?: number; strokeWidth?: number }>) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const pct = Math.min(Math.max(percentage, 0), 100);
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    strokeWidth={strokeWidth}
                    className="stroke-gray-200/60 dark:stroke-gray-700/60"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${ringColor} transition-[stroke-dashoffset] duration-1000 ease-out`}
                />
            </svg>
        </div>
    );
}

function PackageStat({ label, value, color, icon: Icon }: Readonly<{ label: string; value: string; color: string; icon: typeof IndianRupee }>) {
    return (
        <div className="rounded-lg bg-white/50 p-2.5 dark:bg-gray-900/30">
            <div className="flex items-center gap-1.5">
                <Icon className={`h-3 w-3 ${color}`} />
                <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
            </div>
            <div className={`mt-1 text-lg font-bold ${color}`}>{value}</div>
        </div>
    );
}

// ========================
// KPI CARD
// ========================

interface KPICardProps {
    icon: typeof BarChart3;
    iconBg: string;
    iconColor: string;
    value: string | number;
    label: string;
    subText?: string;
    highlight?: "success" | "warning" | "danger";
    animateValue?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    accentColor?: string;
}

function getPlacementGradient(pct: number): string {
    if (pct >= 70) return "from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20";
    if (pct >= 50) return "from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20";
    return "from-red-50 to-rose-50/50 dark:from-red-950/30 dark:to-rose-950/20";
}

function getPlacementBarColor(pct: number): string {
    if (pct >= 70) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-500";
    return "bg-red-500";
}

function getPlacementStrokeColor(pct: number): string {
    if (pct >= 70) return "stroke-emerald-500";
    if (pct >= 50) return "stroke-amber-500";
    return "stroke-red-500";
}

function getPlacementTextColor(pct: number): string {
    if (pct >= 70) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
}

function placementColor(pct: number): string {
    if (pct >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
}

function selectionColor(rate: number): string {
    if (rate >= 20) return "text-emerald-600 dark:text-emerald-400";
    if (rate >= 10) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
}

function getHighlightClass(highlight?: "success" | "warning" | "danger"): string {
    if (highlight === "danger") return "border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20";
    if (highlight === "warning") return "border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20";
    return "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900";
}

function KPICard({
    icon: Icon,
    iconBg,
    iconColor,
    value,
    label,
    subText,
    highlight,
    animateValue,
    decimals,
    prefix,
    suffix,
    accentColor,
}: Readonly<KPICardProps>) {
    const highlightClass = getHighlightClass(highlight);

    const accentBorder = accentColor ? ` border-l-[3px] ${accentColor}` : "";

    return (
        <div
        className={`group relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${highlightClass}${accentBorder}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
                    <div className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-50">
                        {prefix}
                        {animateValue === undefined ? (
                            value
                        ) : (
                            <AnimatedNumber value={animateValue} decimals={decimals} />
                        )}
                        {suffix}
                    </div>
                    {subText && (
                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {subText}
                        </div>
                    )}
                </div>
                <div className={`rounded-lg p-2 ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}

function KPICardSkeleton() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-pulse">
            <div className="mb-3 h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-1 h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
    );
}

// ========================
// OVERVIEW SECTION
// ========================

function OverviewSection({ data, loading }: Readonly<{ data?: DashboardOverview; loading: boolean }>) {
    const shouldReduce = useReducedMotion();

    if (loading || !data) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                    <div className="h-44 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse lg:col-span-3" />
                    <div className="h-44 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse lg:col-span-2" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                    {["sk-companies", "sk-offers", "sk-jobs", "sk-students", "sk-unplaced"].map((id) => (
                        <KPICardSkeleton key={id} />
                    ))}
                </div>
            </div>
        );
    }

    const pct = Number(data.placement_percentage);
    const placedCount = Number(data.placed_count);
    const totalStudents = Number(data.total_students);
    const unplacedCount = Number(data.unplaced_count);
    const unplacedPercent = totalStudents > 0 ? (unplacedCount / totalStudents) * 100 : 0;

    const ringColor = getPlacementStrokeColor(pct);
    const ringTextColor = getPlacementTextColor(pct);
    const ringBg = getPlacementGradient(pct);
    const barColor = getPlacementBarColor(pct);

    const kpiCards = [
        <KPICard key="companies" icon={Building2} iconBg="bg-violet-100 dark:bg-violet-900/30" iconColor="text-violet-600 dark:text-violet-400" value="" animateValue={data.total_companies} label="Companies Visited" accentColor="border-l-violet-500" />,
        <KPICard key="offers" icon={Award} iconBg="bg-sky-100 dark:bg-sky-900/30" iconColor="text-sky-600 dark:text-sky-400" value="" animateValue={data.total_offers} label="Total Offers" accentColor="border-l-sky-500" />,
        <KPICard key="jobs" icon={Briefcase} iconBg="bg-indigo-100 dark:bg-indigo-900/30" iconColor="text-indigo-600 dark:text-indigo-400" value="" animateValue={data.total_job_postings} label="Job Postings" accentColor="border-l-indigo-500" />,
        <KPICard key="students" icon={Users} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" value="" animateValue={totalStudents} label="Total Students" subText={`${placedCount} placed`} accentColor="border-l-blue-500" />,
        <KPICard key="unplaced" icon={UserX} iconBg="bg-red-100 dark:bg-red-900/30" iconColor="text-red-600 dark:text-red-400" value="" animateValue={unplacedCount} label="Yet to be Placed" highlight={unplacedPercent > 30 ? "danger" : undefined} accentColor="border-l-red-500" />,
    ];

    return (
        <div className="space-y-4">
            {/* Hero Row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                {/* Placement Hero Card */}
                <div className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br ${ringBg} p-5 shadow-sm lg:col-span-3 dark:border-gray-800`}>
                    <div className="flex items-center gap-6">
                        <CircularProgress percentage={pct} ringColor={ringColor} />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                Placement Rate
                            </div>
                            <div className={`mt-1 text-4xl font-extrabold tracking-tight ${ringTextColor}`}>
                                {pct.toFixed(1)}%
                            </div>
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-bold text-gray-900 dark:text-gray-100">{placedCount.toLocaleString("en-IN")}</span> of{" "}
                                <span className="font-bold text-gray-900 dark:text-gray-100">{totalStudents.toLocaleString("en-IN")}</span> students placed
                            </div>
                            <div className="mt-3 h-2 w-full max-w-xs rounded-full bg-white/60 dark:bg-gray-800/60">
                                <div
                                    className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    {unplacedCount > 0 && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 text-xs dark:bg-gray-900/30">
                            <UserX className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                <span className="font-semibold text-red-600 dark:text-red-400">{unplacedCount}</span> students yet to be placed
                            </span>
                        </div>
                    )}
                </div>

                {/* Package Highlight Card */}
                <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 shadow-sm lg:col-span-2 dark:border-gray-800 dark:from-blue-950/30 dark:to-indigo-950/20">
                    <div className="mb-3 flex items-center gap-2">
                        <div className="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/40">
                            <IndianRupee className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            Package Overview
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <PackageStat label="Highest" value={formatPackage(data.highest_package)} color="text-emerald-600 dark:text-emerald-400" icon={Trophy} />
                        <PackageStat label="Average" value={formatPackage(data.average_package)} color="text-blue-600 dark:text-blue-400" icon={Target} />
                        <PackageStat label="Median" value={formatPackage(data.median_package)} color="text-violet-600 dark:text-violet-400" icon={Activity} />
                        <PackageStat label="Lowest" value={formatPackage(data.lowest_package)} color="text-gray-500 dark:text-gray-400" icon={IndianRupee} />
                    </div>
                </div>
            </div>

            {/* Secondary Stats Row — staggered */}
            {shouldReduce ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                    {kpiCards}
                </div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5"
                >
                    {kpiCards.map((card) => (
                        <motion.div key={card.key} variants={staggerItem}>
                            {card}
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

// ========================
// PROBLEM INDICATORS
// ========================

function ProblemIndicators({
    data,
    onNavigate,
}: Readonly<{
    data: DashboardOverview;
    onNavigate: (tab: DashboardTab) => void;
}>) {
    const alerts: { message: string; severity: "danger" | "warning"; tab: DashboardTab }[] = [];

    const unplacedPercent = Number(data.total_students) > 0
        ? (Number(data.unplaced_count) / Number(data.total_students)) * 100
        : 0;
    if (unplacedPercent > 30) {
        alerts.push({
            message: `${unplacedPercent.toFixed(1)}% students unplaced`,
            severity: "danger",
            tab: "students",
        });
    }

    if (alerts.length === 0) return null;

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                Attention Required
            </div>
            <div className="flex flex-wrap gap-3">
                {alerts.map((a) => (
                    <button
                        key={a.message}
                        type="button"
                        onClick={() => onNavigate(a.tab)}
                        className={`min-h-[44px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            a.severity === "danger"
                                ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                        }`}
                    >
                        {a.message}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ========================
// TAB BAR
// ========================

function TabBar({
    activeTab,
    onTabChange,
    loadingTabs,
}: Readonly<{
    activeTab: DashboardTab;
    onTabChange: (tab: DashboardTab) => void;
    loadingTabs: Set<DashboardTab>;
}>) {
    return (
        <div className="scrollbar-hide relative flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/50">
            {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const isLoading = loadingTabs.has(tab.key);
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onTabChange(tab.key)}
                        className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors min-h-[44px] ${
                            isActive
                                ? "bg-white text-indigo-700 shadow-sm dark:bg-gray-700 dark:text-indigo-300"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                        }`}
                    >
                        {isLoading && isActive ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Icon className="h-3.5 w-3.5" />
                        )}
                        <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

// ========================
// TAB SKELETON & EMPTY STATE
// ========================

function TabSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {["tsk-1", "tsk-2", "tsk-3", "tsk-4"].map((id) => (
                    <div key={id} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
                ))}
            </div>
            <div className="h-72 rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
    );
}

function EmptyTabState({ year }: Readonly<{ year: number }>) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                No data available
            </h3>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                No statistics found for the batch year {year}.
            </p>
        </div>
    );
}

function TabError({ message, onRetry }: Readonly<{ message: string; onRetry: () => void }>) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="mb-3 h-12 w-12 text-red-300 dark:text-red-600" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                Failed to load data
            </h3>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">{message}</p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
}

// ========================
// CHART HELPERS
// ========================

function useChartTheme() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    return {
        isDark,
        axisColor: isDark ? "#9CA3AF" : "#6B7280",
        gridColor: isDark ? "#374151" : "#E5E7EB",
        tooltipBg: isDark ? "#1F2937" : "#FFFFFF",
        tooltipBorder: isDark ? "#374151" : "#E5E7EB",
        textColor: isDark ? "#E5E7EB" : "#374151",
    };
}

function ChartCard({ title, children, className }: Readonly<{ title: string; children: React.ReactNode; className?: string }>) {
    return (
        <div className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 ${className ?? ""}`}>
            <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h4>
            {children}
        </div>
    );
}

function StatCard({ label, value, color }: Readonly<{ label: string; value: string | number; color?: string }>) {
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50">
            <div className={`text-xl font-bold ${color ?? "text-gray-900 dark:text-gray-100"}`}>
                {value}
            </div>
            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</div>
        </div>
    );
}

function StarRating({ rating, size = "sm" }: Readonly<{ rating: number; size?: "sm" | "md" }>) {
    const s = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
    return (
        <span className="inline-flex items-center gap-0.5">
            {STAR_KEYS.map((starKey, starIdx) => (
                <Star
                    key={starKey}
                    className={`${s} ${
                        starIdx < Math.round(rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
                    }`}
                />
            ))}
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                {Number(rating).toFixed(1)}
            </span>
        </span>
    );
}

// ========================
// PLACEMENT TAB
// ========================

function PlacementTab({ data, year }: Readonly<{ data?: PlacementStats; year: number }>) {
    const ct = useChartTheme();
    if (!data) return <EmptyTabState year={year} />;

    const slabData = Object.entries(data.package_slabs).map(([key, count]) => ({
        name: SLAB_LABELS[key] ?? key,
        count: count,
    }));

    const offerPieData = [
        { name: "Full-time", value: data.offer_breakdown.fulltime_offers },
        { name: "Internship", value: data.offer_breakdown.internship_offers },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-5">
                <ChartCard title="Package Distribution" className="lg:col-span-3">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={slabData} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} />
                            <XAxis type="number" tick={{ fill: ct.axisColor, fontSize: 12 }} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={90}
                                tick={{ fill: ct.axisColor, fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: ct.tooltipBg,
                                    borderColor: ct.tooltipBorder,
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                            />
                            <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]}>
                                {slabData.map((entry, i) => (
                                    <Cell key={entry.name} fill={CHART_COLORS.slabs[i]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Offer Type Split" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={offerPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                <Cell fill={CHART_COLORS.primary} />
                                <Cell fill={CHART_COLORS.warning} />
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: ct.tooltipBg,
                                    borderColor: ct.tooltipBorder,
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                formatter={LegendLabel}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {data.offer_breakdown.students_with_multiple_offers > 0 && (
                        <div className="mt-2 rounded-lg bg-indigo-50 px-3 py-2 text-center text-xs font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
                            {data.offer_breakdown.students_with_multiple_offers} students received 2+ offers
                        </div>
                    )}
                </ChartCard>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                <StatCard label="Accepted Offers" value={data.offer_breakdown.accepted_offers} color="text-emerald-600 dark:text-emerald-400" />
                <StatCard label="Joined" value={data.offer_breakdown.joined_count} color="text-blue-600 dark:text-blue-400" />
                <StatCard label="Pending" value={data.offer_breakdown.pending_offers} color="text-amber-600 dark:text-amber-400" />
                <StatCard label="Rejected" value={data.offer_breakdown.rejected_offers} color="text-red-600 dark:text-red-400" />
                <StatCard label="Cancelled" value={data.offer_breakdown.cancelled_offers} color="text-gray-500 dark:text-gray-400" />
                <StatCard label="Multiple Offers" value={data.offer_breakdown.students_with_multiple_offers} color="text-violet-600 dark:text-violet-400" />
            </div>

            {(data.internship_stats.with_stipend_count > 0) && (
                <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Internship Stats</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard label="Highest Stipend" value={`₹${data.internship_stats.highest_stipend.toLocaleString("en-IN")}/mo`} color="text-emerald-600 dark:text-emerald-400" />
                        <StatCard label="Average Stipend" value={`₹${data.internship_stats.average_stipend.toLocaleString("en-IN")}/mo`} color="text-blue-600 dark:text-blue-400" />
                        <StatCard label="With Stipend" value={data.internship_stats.with_stipend_count} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ========================
// FUNNEL TAB
// ========================

function FunnelTab({ data, year }: Readonly<{ data?: ApplicationFunnel; year: number }>) {
    if (!data) return <EmptyTabState year={year} />;

    const stages = [
        { label: "Total Applications", value: data.total_applications, color: "bg-blue-500" },
        { label: "Shortlisted", value: data.shortlisted, color: "bg-indigo-500" },
        { label: "Selected", value: data.selected, color: "bg-emerald-500" },
        { label: "Offered", value: data.offered, color: "bg-amber-500" },
    ];
    const maxVal = Math.max(...stages.map((s) => s.value), 1);

    return (
        <div className="space-y-6">
            <ChartCard title="Application Funnel">
                <div className="space-y-1">
                    {stages.map((stage, idx) => {
                        const widthPct = Math.max((stage.value / maxVal) * 100, 20);
                        const convRate = idx > 0 && stages[idx - 1].value > 0 ? ((stage.value / stages[idx - 1].value) * 100).toFixed(1) : null;
                        return (
                            <div key={stage.label}>
                                {idx > 0 && convRate && (
                                    <div className="flex items-center justify-center py-0.5">
                                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                            {convRate}% conversion \u2193
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <span className="w-32 shrink-0 text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {stage.label}
                                    </span>
                                    <div className="flex flex-1 justify-center">
                                        <div
                                            className={`h-10 rounded-lg ${stage.color} flex items-center justify-center transition-all duration-700`}
                                            style={{ width: `${widthPct}%` }}
                                        >
                                            <span className="text-xs font-bold text-white drop-shadow-sm">
                                                {stage.value.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                    <div>Pending: <span className="font-semibold text-gray-700 dark:text-gray-200">{data.pending}</span></div>
                    <div>Under Review: <span className="font-semibold text-gray-700 dark:text-gray-200">{data.under_review}</span></div>
                    <div>Rejected: <span className="font-semibold text-gray-700 dark:text-gray-200">{data.rejected.toLocaleString("en-IN")}</span></div>
                    <div>Withdrawn: <span className="font-semibold text-gray-700 dark:text-gray-200">{data.withdrawn}</span></div>
                </div>
            </ChartCard>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="Selection Rate" value={`${Number(data.selection_rate).toFixed(1)}%`} color="text-emerald-600 dark:text-emerald-400" />
                <StatCard label="Apps per Student" value={Number(data.applications_per_student).toFixed(1)} color="text-blue-600 dark:text-blue-400" />
                <StatCard label="Unique Applicants" value={data.unique_applicants} />
                <StatCard label="Withdrawn" value={data.withdrawn} color={data.withdrawn > 100 ? "text-amber-600 dark:text-amber-400" : undefined} />
            </div>

            {data.eligible_not_applied_count > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
                        <AlertTriangle className="h-4 w-4" />
                        {data.eligible_not_applied_count} eligible students didn&apos;t apply
                    </div>
                    <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
                        These students meet eligibility criteria but haven&apos;t submitted applications. Consider sending a reminder notification.
                    </p>
                </div>
            )}
        </div>
    );
}

// ========================
// STUDENTS TAB
// ========================

function StudentsTab({ data, year }: Readonly<{ data?: StudentReadiness; year: number }>) {
    const ct = useChartTheme();
    if (!data) return <EmptyTabState year={year} />;

    const statusData = [
        { name: "Active", value: data.student_status.active, fill: CHART_COLORS.success },
        { name: "Inactive", value: data.student_status.inactive, fill: CHART_COLORS.muted },
        { name: "Suspended", value: data.student_status.suspended, fill: CHART_COLORS.warning },
        { name: "Graduated", value: data.student_status.graduated, fill: CHART_COLORS.primary },
        { name: "Dropout", value: data.student_status.dropout, fill: CHART_COLORS.danger },
    ].filter((d) => d.value > 0);

    const total = data.student_status.total_students || 1;
    const profileCompletePercent = (data.student_status.profile_complete / total) * 100;
    const approvedPercent = data.student_status.profile_complete > 0
        ? (data.student_status.profile_approved / data.student_status.profile_complete) * 100
        : 0;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Student Status Distribution">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {statusData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: ct.tooltipBg,
                                    borderColor: ct.tooltipBorder,
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                formatter={LegendLabel}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Profile Readiness">
                    <div className="space-y-5 pt-2">
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {data.student_status.profile_complete} / {total} ({profileCompletePercent.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${profileCompletePercent}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Profile Approval</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {data.student_status.profile_approved} / {data.student_status.profile_complete} ({approvedPercent.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${approvedPercent}%` }}
                                />
                            </div>
                        </div>
                        {data.student_status.profile_pending_approval > 0 && (
                            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                {data.student_status.profile_pending_approval} profiles pending approval
                            </div>
                        )}
                    </div>
                </ChartCard>
            </div>

            {data.restrictions.restricted_students > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                    <h4 className="mb-3 text-sm font-semibold text-red-700 dark:text-red-300">
                        Active Restrictions — {data.restrictions.restricted_students} students
                    </h4>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                        <StatCard label="Bar from Placements" value={data.restrictions.bar_from_placements} color="text-red-600 dark:text-red-400" />
                        <StatCard label="Bar from Company" value={data.restrictions.bar_from_company} color="text-red-600 dark:text-red-400" />
                        <StatCard label="Probation" value={data.restrictions.probation} color="text-amber-600 dark:text-amber-400" />
                        <StatCard label="Warning" value={data.restrictions.warning} color="text-amber-600 dark:text-amber-400" />
                        <StatCard label="Temp Suspension" value={data.restrictions.temporary_suspension} color="text-red-600 dark:text-red-400" />
                    </div>
                </div>
            )}
        </div>
    );
}

// ========================
// DEPARTMENTS TAB
// ========================

function DepartmentsTab({ data, year }: Readonly<{ data?: DepartmentStat[]; year: number }>) {
    const ct = useChartTheme();
    const [sortKey, setSortKey] = useState<"placement_percentage" | "average_package" | "total_students">("placement_percentage");
    const [sortAsc, setSortAsc] = useState(false);

    if (!data || data.length === 0) return <EmptyTabState year={year} />;

    const sorted = [...data].sort((a, b) =>
        sortAsc ? (a[sortKey] ?? 0) - (b[sortKey] ?? 0) : (b[sortKey] ?? 0) - (a[sortKey] ?? 0),
    );

    const chartData = sorted.map((d) => ({
        name: (d.dept_name?.length ?? 0) > 18 ? d.dept_name.substring(0, 18) + "…" : d.dept_name,
        placement: d.placement_percentage,
    }));

    function handleSort(key: typeof sortKey) {
        if (sortKey === key) setSortAsc(!sortAsc);
        else { setSortKey(key); setSortAsc(false); }
    }

    return (
        <div className="space-y-6">
            <ChartCard title="Placement Rate by Department">
                <ResponsiveContainer width="100%" height={Math.max(data.length * 45, 180)}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            tick={{ fill: ct.axisColor, fontSize: 12 }}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <YAxis type="category" dataKey="name" width={140} tick={{ fill: ct.axisColor, fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderRadius: 8, fontSize: 12 }}
                            formatter={(v) => [`${Number(v).toFixed(1)}%`, "Placement Rate"]}
                        />
                        <Bar dataKey="placement" name="Placement %" radius={[0, 4, 4, 0]} fill={CHART_COLORS.primary} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">#</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Department</th>
                            <SortHeader label="Total" active={sortKey === "total_students"} asc={sortAsc} onClick={() => handleSort("total_students")} />
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Placed</th>
                            <SortHeader label="Placement %" active={sortKey === "placement_percentage"} asc={sortAsc} onClick={() => handleSort("placement_percentage")} />
                            <SortHeader label="Avg Package" active={sortKey === "average_package"} asc={sortAsc} onClick={() => handleSort("average_package")} />
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Highest</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Avg CGPA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {sorted.map((d, i) => (
                            <tr key={d.dept_id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{d.dept_name}</td>
                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{d.total_students}</td>
                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{d.placed_count}</td>
                                <td className={`px-4 py-3 text-right font-semibold ${placementColor(Number(d.placement_percentage))}`}>
                                    {Number(d.placement_percentage).toFixed(1)}%
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatPackage(d.average_package)}</td>
                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatPackage(d.highest_package)}</td>
                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{d.avg_cgpa == null ? "—" : Number(d.avg_cgpa).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
                {sorted.map((d, i) => (
                    <div key={d.dept_id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{i + 1}. {d.dept_name}</span>
                            <span className={`text-sm font-bold ${placementColor(Number(d.placement_percentage))}`}>{Number(d.placement_percentage).toFixed(1)}%</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>Students: <span className="font-semibold text-gray-900 dark:text-gray-100">{d.total_students}</span></span>
                            <span>Placed: <span className="font-semibold text-gray-900 dark:text-gray-100">{d.placed_count}</span></span>
                            <span>Avg Pkg: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPackage(d.average_package)}</span></span>
                            <span>Highest: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPackage(d.highest_package)}</span></span>
                            <span>CGPA: <span className="font-semibold text-gray-900 dark:text-gray-100">{d.avg_cgpa == null ? "—" : Number(d.avg_cgpa).toFixed(2)}</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SortHeader({ label, active, asc, onClick }: Readonly<{ label: string; active: boolean; asc: boolean; onClick: () => void }>) {
    return (
        <th
            scope="col"
            className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors select-none"
            onClick={onClick}
        >
            <button
                type="button"
                className="inline-flex min-h-[44px] items-center gap-1"
                aria-label={`Sort by ${label}`}
            >
                {label}
                {active && <ChevronDown className={`h-3 w-3 transition-transform ${asc ? "rotate-180" : ""}`} />}
            </button>
        </th>
    );
}

// ========================
// COMPANIES TAB
// ========================

function CompaniesTab({ data, year }: Readonly<{ data?: CompanyStat[]; year: number }>) {
    const ct = useChartTheme();
    const [sortKey, setSortKey] = useState<"offers_made" | "selection_rate" | "avg_package">("offers_made");
    const [sortAsc, setSortAsc] = useState(false);

    if (!data || data.length === 0) return <EmptyTabState year={year} />;

    const sorted = [...data].sort((a, b) =>
        sortAsc ? (a[sortKey] ?? 0) - (b[sortKey] ?? 0) : (b[sortKey] ?? 0) - (a[sortKey] ?? 0),
    );

    const top10 = sorted.slice(0, 10).map((c) => ({
        name: (c.company_name?.length ?? 0) > 16 ? c.company_name.substring(0, 16) + "…" : c.company_name,
        offers: c.offers_made,
    }));

    function handleSort(key: typeof sortKey) {
        if (sortKey === key) setSortAsc(!sortAsc);
        else { setSortKey(key); setSortAsc(false); }
    }

    return (
        <div className="space-y-6">
            {top10.length > 0 && (
                <ChartCard title="Top Hiring Companies">
                    <ResponsiveContainer width="100%" height={top10.length * 38 + 20}>
                        <BarChart data={top10} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} />
                            <XAxis type="number" tick={{ fill: ct.axisColor, fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fill: ct.axisColor, fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderRadius: 8, fontSize: 12 }}
                            />
                            <Bar dataKey="offers" name="Offers Made" radius={[0, 4, 4, 0]} fill={CHART_COLORS.primary} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">#</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Company</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Industry</th>
                            <SortHeader label="Offers" active={sortKey === "offers_made"} asc={sortAsc} onClick={() => handleSort("offers_made")} />
                            <SortHeader label="Select %" active={sortKey === "selection_rate"} asc={sortAsc} onClick={() => handleSort("selection_rate")} />
                            <SortHeader label="Avg Pkg" active={sortKey === "avg_package"} asc={sortAsc} onClick={() => handleSort("avg_package")} />
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {sorted.map((c, i) => (
                            <tr key={c.company_id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{c.company_name}</td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.industry ?? "—"}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{c.offers_made}</td>
                                <td className={`px-4 py-3 text-right font-semibold ${selectionColor(Number(c.selection_rate))}`}>
                                    {Number(c.selection_rate).toFixed(1)}%
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatPackage(c.avg_package)}</td>
                                <td className="px-4 py-3">
                                    {c.feedback_count > 0 ? <StarRating rating={c.feedback_avg_rating} /> : <span className="text-xs text-gray-400">—</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
                {sorted.map((c, i) => (
                    <div key={c.company_id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{i + 1}. {c.company_name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{c.industry ?? "—"}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>Offers: <span className="font-semibold text-gray-900 dark:text-gray-100">{c.offers_made}</span></span>
                            <span>Select: <span className={`font-semibold ${selectionColor(Number(c.selection_rate))}`}>{Number(c.selection_rate).toFixed(1)}%</span></span>
                            <span>Avg Pkg: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPackage(c.avg_package)}</span></span>
                            <span>Rating: {c.feedback_count > 0 ? <StarRating rating={c.feedback_avg_rating} /> : <span className="text-gray-400">—</span>}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ========================
// DIVERSITY TAB
// ========================

function DiversityTab({ data, year }: Readonly<{ data?: DiversityStats; year: number }>) {
    const ct = useChartTheme();
    if (!data) return <EmptyTabState year={year} />;

    const genderChartData = data.gender_wise.map((g) => ({
        gender: g.gender,
        Total: g.total,
        Placed: g.placed,
    }));

    const categoryChartData = data.category_wise.map((c) => ({
        name: c.category,
        percentage: c.placement_percentage,
    }));

    return (
        <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Gender-Wise Placement">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={genderChartData} margin={{ left: 0, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} />
                            <XAxis dataKey="gender" tick={{ fill: ct.axisColor, fontSize: 12 }} />
                            <YAxis tick={{ fill: ct.axisColor, fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderRadius: 8, fontSize: 12 }} />
                            <Legend
                                formatter={LegendLabel}
                            />
                            <Bar dataKey="Total" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Placed" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Category-Wise Placement Rate">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={categoryChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tick={{ fill: ct.axisColor, fontSize: 12 }}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fill: ct.axisColor, fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderRadius: 8, fontSize: 12 }}
                                formatter={(v) => [`${Number(v).toFixed(1)}%`, "Placement %"]}
                            />
                            <Bar dataKey="percentage" name="Placement %" radius={[0, 4, 4, 0]} fill={CHART_COLORS.primary} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* NAAC Data Table */}
            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Gender / Category</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Total</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Placed</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Placement %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        <tr>
                            <td colSpan={4} className="bg-blue-50/50 px-4 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-900/10 dark:text-blue-300">
                                Gender-Wise
                            </td>
                        </tr>
                        {data.gender_wise.map((g) => (
                            <tr key={g.gender} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{g.gender}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{g.total}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{g.placed}</td>
                                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100">{Number(g.placement_percentage).toFixed(2)}%</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={4} className="bg-violet-50/50 px-4 py-2 text-xs font-semibold text-violet-700 dark:bg-violet-900/10 dark:text-violet-300">
                                Category-Wise
                            </td>
                        </tr>
                        {data.category_wise.map((c) => (
                            <tr key={c.category} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{c.category}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{c.total}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{c.placed}</td>
                                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100">{Number(c.placement_percentage).toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
                <div>
                    <div className="mb-2 text-xs font-semibold text-blue-700 dark:text-blue-300">Gender-Wise</div>
                    <div className="space-y-2">
                        {data.gender_wise.map((g) => (
                            <div key={g.gender} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{g.gender}</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{Number(g.placement_percentage).toFixed(2)}%</span>
                                </div>
                                <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <span>Total: <span className="font-semibold text-gray-900 dark:text-gray-100">{g.total}</span></span>
                                    <span>Placed: <span className="font-semibold text-gray-900 dark:text-gray-100">{g.placed}</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="mb-2 text-xs font-semibold text-violet-700 dark:text-violet-300">Category-Wise</div>
                    <div className="space-y-2">
                        {data.category_wise.map((c) => (
                            <div key={c.category} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.category}</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{Number(c.placement_percentage).toFixed(2)}%</span>
                                </div>
                                <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <span>Total: <span className="font-semibold text-gray-900 dark:text-gray-100">{c.total}</span></span>
                                    <span>Placed: <span className="font-semibold text-gray-900 dark:text-gray-100">{c.placed}</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ========================
// TRAINING TAB
// ========================

function TrainingTab({ data, year }: Readonly<{ data?: TrainingStats; year: number }>) {
    const ct = useChartTheme();
    if (!data) return <EmptyTabState year={year} />;

    const { training: t, feedback: f } = data;

    const statusPieData = [
        { name: "Upcoming", value: t.upcoming, fill: "#3B82F6" },
        { name: "Enrollment Open", value: t.enrollment_open, fill: "#10B981" },
        { name: "In Progress", value: t.in_progress, fill: "#F59E0B" },
        { name: "Completed", value: t.completed, fill: "#6B7280" },
        { name: "Cancelled", value: t.cancelled, fill: "#EF4444" },
    ].filter((d) => d.value > 0);

    const feedbackBars = [
        { name: "★★★★★", count: f.five_star },
        { name: "★★★★", count: f.four_star },
        { name: "★★★", count: f.three_star },
        { name: "★★", count: f.two_star },
        { name: "★", count: f.one_star },
    ];

    const completionRate = t.total_enrolled > 0
        ? (t.total_completed_enrollment / t.total_enrolled) * 100
        : 0;
    const dropoutRate = t.total_enrolled > 0
        ? (t.total_dropped / t.total_enrolled) * 100
        : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="Total Programs" value={t.total_programs} />
                <StatCard label="Active (In Progress)" value={t.in_progress} color="text-amber-600 dark:text-amber-400" />
                <StatCard label="Completed" value={t.completed} color="text-emerald-600 dark:text-emerald-400" />
                <StatCard label="Avg Rating" value={Number(t.overall_avg_rating) > 0 ? `${Number(t.overall_avg_rating).toFixed(1)} / 5` : "—"} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Programs by Status">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={statusPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {statusPieData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderRadius: 8, fontSize: 12 }} />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                formatter={LegendLabel}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Enrollment Progress">
                    <div className="space-y-4 pt-2">
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {t.total_completed_enrollment} / {t.total_enrolled} ({completionRate.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <StatCard label="Total Enrolled" value={t.total_enrolled} />
                            <StatCard
                                label="Dropped Out"
                                value={`${t.total_dropped} (${dropoutRate.toFixed(1)}%)`}
                                color={dropoutRate > 15 ? "text-red-600 dark:text-red-400" : undefined}
                            />
                        </div>
                        {dropoutRate > 15 && (
                            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
                                High dropout rate ({dropoutRate.toFixed(1)}%) — consider reviewing training quality
                            </div>
                        )}
                    </div>
                </ChartCard>
            </div>

            {f.total_feedback > 0 && (
                <ChartCard title={`Placement Feedback — ${f.total_feedback} responses (avg ${Number(f.average_rating).toFixed(1)} / 5)`}>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={feedbackBars} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} />
                            <XAxis type="number" tick={{ fill: ct.axisColor, fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" width={60} tick={{ fill: ct.axisColor, fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="count" name="Responses" radius={[0, 4, 4, 0]} fill={CHART_COLORS.warning} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}
        </div>
    );
}

// ========================
// YEAR COMPARISON TAB
// ========================

function YearComparisonTab({
    data,
    year,
    comparisonYears,
    onYearsChange,
}: Readonly<{
    data?: YearComparison[];
    year: number;
    comparisonYears: number[];
    onYearsChange: (years: number[]) => void;
}>) {
    const ct = useChartTheme();
    const currentYear = Number.parseInt(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric' }), 10);
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + 1 - i);

    if (!data || data.length === 0) return <EmptyTabState year={year} />;

    const sorted = [...data].sort((a, b) => a.passout_year - b.passout_year);

    const lineData = sorted.map((d) => ({
        year: String(d.passout_year),
        "Placement %": Number(d.placement_percentage),
        "Avg Package (LPA)": Number((Number(d.average_package) / 100000).toFixed(2)),
    }));

    function toggleYear(y: number) {
        if (comparisonYears.includes(y)) {
            if (comparisonYears.length <= 2) return; // min 2
            onYearsChange(comparisonYears.filter((v) => v !== y));
        } else {
            if (comparisonYears.length >= 5) return; // max 5
            onYearsChange([...comparisonYears, y].sort((a, b) => a - b));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Compare years:</span>
                {yearOptions.map((y) => {
                    const selected = comparisonYears.includes(y);
                    return (
                        <button
                            key={y}
                            type="button"
                            onClick={() => toggleYear(y)}
                            className={`rounded-lg px-3 py-1.5 min-h-[44px] text-xs font-medium transition-colors ${
                                selected
                                    ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-700"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            }`}
                        >
                            {y}
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Placement Rate Trend">
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={lineData} margin={{ left: 0, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} />
                            <XAxis dataKey="year" tick={{ fill: ct.axisColor, fontSize: 12 }} />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: ct.axisColor, fontSize: 12 }}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip contentStyle={{ backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderRadius: 8, fontSize: 12 }} />
                            <Line
                                type="monotone"
                                dataKey="Placement %"
                                stroke={CHART_COLORS.primary}
                                strokeWidth={2.5}
                                dot={{ r: 5, fill: CHART_COLORS.primary }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Package Trend (LPA)">
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={lineData} margin={{ left: 0, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} />
                            <XAxis dataKey="year" tick={{ fill: ct.axisColor, fontSize: 12 }} />
                            <YAxis tick={{ fill: ct.axisColor, fontSize: 12 }} tickFormatter={(v) => `₹${v}L`} />
                            <Tooltip contentStyle={{ backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderRadius: 8, fontSize: 12 }} />
                            <Line
                                type="monotone"
                                dataKey="Avg Package (LPA)"
                                stroke={CHART_COLORS.success}
                                strokeWidth={2.5}
                                dot={{ r: 5, fill: CHART_COLORS.success }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Comparison Table */}
            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Metric</th>
                            {sorted.map((d) => (
                                <th key={d.passout_year} scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    {d.passout_year}
                                </th>
                            ))}
                            {sorted.length >= 2 && (
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    Growth
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {[
                            { label: "Total Students", key: "total_students" as const },
                            { label: "Placed", key: "placed_count" as const },
                            { label: "Placement %", key: "placement_percentage" as const, suffix: "%", decimals: 1 },
                            { label: "Total Offers", key: "total_offers" as const },
                            { label: "Avg Package", key: "average_package" as const, format: "pkg" },
                            { label: "Highest Package", key: "highest_package" as const, format: "pkg" },
                            { label: "Companies", key: "total_companies" as const },
                            { label: "Jobs Posted", key: "total_job_postings" as const },
                            { label: "Full-time Offers", key: "fulltime_count" as const },
                            { label: "Internship Offers", key: "internship_count" as const },
                            { label: "Applications", key: "total_applications" as const },
                            { label: "Selection Rate", key: "selection_rate" as const, suffix: "%", decimals: 1 },
                        ].map((metric) => {
                            const first = sorted[0];
                            const last = sorted.at(-1)!;
                            const growth = getGrowthPercent(
                                last[metric.key],
                                first[metric.key],
                            );

                            return (
                                <tr key={metric.key} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                                        {metric.label}
                                    </td>
                                    {sorted.map((d) => {
                                        const val = d[metric.key];
                                        let display: string;
                                        if (metric.format === "pkg") display = formatPackage(val);
                                        else if (metric.suffix === "%") display = `${Number(val ?? 0).toFixed(metric.decimals ?? 0)}%`;
                                        else display = (val ?? 0).toLocaleString("en-IN");
                                        return (
                                            <td key={d.passout_year} className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">
                                                {display}
                                            </td>
                                        );
                                    })}
                                    {sorted.length >= 2 && (
                                        <td className="px-4 py-2.5 text-right">
                                            {growth === null ? (
                                        <span className="text-xs text-gray-400">—</span>
                                    ) : (
                                        <span
                                            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                                                growth >= 0
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-red-600 dark:text-red-400"
                                            }`}
                                        >
                                            {growth >= 0 ? (
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            ) : (
                                                <ArrowDownRight className="h-3.5 w-3.5" />
                                            )}
                                            {Math.abs(growth).toFixed(1)}%
                                        </span>
                                    )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
                {[
                    { label: "Total Students", key: "total_students" as const },
                    { label: "Placed", key: "placed_count" as const },
                    { label: "Placement %", key: "placement_percentage" as const, suffix: "%", decimals: 1 },
                    { label: "Total Offers", key: "total_offers" as const },
                    { label: "Avg Package", key: "average_package" as const, format: "pkg" },
                    { label: "Highest Package", key: "highest_package" as const, format: "pkg" },
                    { label: "Companies", key: "total_companies" as const },
                    { label: "Jobs Posted", key: "total_job_postings" as const },
                    { label: "Full-time Offers", key: "fulltime_count" as const },
                    { label: "Internship Offers", key: "internship_count" as const },
                    { label: "Applications", key: "total_applications" as const },
                    { label: "Selection Rate", key: "selection_rate" as const, suffix: "%", decimals: 1 },
                ].map((metric) => {
                    const first = sorted[0];
                    const last = sorted.at(-1)!;
                    const growth = getGrowthPercent(last[metric.key], first[metric.key]);

                    return (
                        <div key={metric.key} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{metric.label}</span>
                                {sorted.length >= 2 && growth !== null && (
                                    <span
                                        className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                                            growth >= 0
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-red-600 dark:text-red-400"
                                        }`}
                                    >
                                        {growth >= 0 ? (
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        ) : (
                                            <ArrowDownRight className="h-3.5 w-3.5" />
                                        )}
                                        {Math.abs(growth).toFixed(1)}%
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                {sorted.map((d) => {
                                    const val = d[metric.key];
                                    let display: string;
                                    if (metric.format === "pkg") display = formatPackage(val);
                                    else if (metric.suffix === "%") display = `${Number(val ?? 0).toFixed(metric.decimals ?? 0)}%`;
                                    else display = (val ?? 0).toLocaleString("en-IN");
                                    return (
                                        <span key={d.passout_year}>
                                            {d.passout_year}: <span className="font-semibold text-gray-900 dark:text-gray-100">{display}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ========================
// OVERVIEW TAB (quick insights below cards)
// ========================

function OverviewTab({ data }: Readonly<{ data?: DashboardOverview }>) {
    if (!data) return null;

    const pct = Number(data.placement_percentage);
    const totalStudents = Number(data.total_students);
    const placedCount = Number(data.placed_count);
    const barColor = getPlacementBarColor(pct);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Placement Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Placement Summary</h4>
                </div>
                <div className="space-y-3">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{placedCount.toLocaleString("en-IN")}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">/ {totalStudents.toLocaleString("en-IN")} placed</span>
                        </div>
                        <div className="mt-2 h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                            <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-1 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{pct.toFixed(1)}%</div>
                    </div>
                    <div className="flex items-center gap-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                        <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-violet-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400"><span className="font-bold text-gray-900 dark:text-gray-100">{data.total_companies}</span> companies</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-sky-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400"><span className="font-bold text-gray-900 dark:text-gray-100">{data.total_offers}</span> offers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Insights */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30">
                        <IndianRupee className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Package Insights</h4>
                </div>
                <div className="space-y-2">
                    {[
                        { label: "Highest", value: formatPackage(data.highest_package), color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
                        { label: "Average", value: formatPackage(data.average_package), color: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
                        { label: "Median", value: formatPackage(data.median_package), color: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
                        { label: "Lowest", value: formatPackage(data.lowest_package), color: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
                    ].map(pkg => (
                        <div key={pkg.label} className="flex items-center justify-between rounded-lg bg-gray-50/80 px-3 py-2.5 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${pkg.dot}`} />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{pkg.label}</span>
                            </div>
                            <span className={`text-sm font-bold ${pkg.color}`}>{pkg.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Snapshot */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-100 p-1.5 dark:bg-indigo-900/30">
                        <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Activity Snapshot</h4>
                </div>
                <div className="space-y-3">
                    {[
                        { label: "Job Postings", value: data.total_job_postings },
                        { label: "Total Students", value: totalStudents },
                        { label: "Companies", value: data.total_companies },
                    ].map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{Number(item.value).toLocaleString("en-IN")}</span>
                        </div>
                    ))}
                    {Number(data.unplaced_count) > 0 && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20">
                            <UserX className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-xs font-medium text-red-700 dark:text-red-400">
                                {data.unplaced_count} students yet to be placed
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ========================
// MAIN COMPONENT
// ========================

export default function DashboardManager() {
    const dash = useDashboard();

    const loadingTabs = useMemo(() => {
        const set = new Set<DashboardTab>();
        if (dash.placement.isFetching) set.add("placement");
        if (dash.funnel.isFetching) set.add("funnel");
        if (dash.students.isFetching) set.add("students");
        if (dash.departments.isFetching) set.add("departments");
        if (dash.companies.isFetching) set.add("companies");
        if (dash.diversity.isFetching) set.add("diversity");
        if (dash.training.isFetching) set.add("training");
        if (dash.yearComparison.isFetching) set.add("yearComparison");
        return set;
    }, [
        dash.placement.isFetching, dash.funnel.isFetching, dash.students.isFetching,
        dash.departments.isFetching, dash.companies.isFetching, dash.diversity.isFetching,
        dash.training.isFetching, dash.yearComparison.isFetching,
    ]);

    const isRefreshing = dash.overview.isFetching;

    function renderTabContent() {
        const tab = dash.activeTab;

        // Helper to render loading/error/content
        function renderQuery<T>(
            query: { isLoading: boolean; isFetching: boolean; isError: boolean; error: unknown; data?: T; refetch: () => void },
            render: (data: T) => React.ReactNode,
        ) {
            if (query.isLoading) return <TabSkeleton />;
            if (query.isError) {
                const msg = query.error instanceof ApiError ? query.error.message : "Something went wrong";
                return <TabError message={msg} onRetry={() => query.refetch()} />;
            }
            return render(query.data as T);
        }

        switch (tab) {
            case "overview":
                return <OverviewTab data={dash.overview.data} />;
            case "placement":
                return renderQuery(dash.placement, (d) => <PlacementTab data={d} year={dash.selectedYear} />);
            case "funnel":
                return renderQuery(dash.funnel, (d) => <FunnelTab data={d} year={dash.selectedYear} />);
            case "students":
                return renderQuery(dash.students, (d) => <StudentsTab data={d} year={dash.selectedYear} />);
            case "departments":
                return renderQuery(dash.departments, (d) => <DepartmentsTab data={d} year={dash.selectedYear} />);
            case "companies":
                return renderQuery(dash.companies, (d) => <CompaniesTab data={d} year={dash.selectedYear} />);
            case "diversity":
                return renderQuery(dash.diversity, (d) => <DiversityTab data={d} year={dash.selectedYear} />);
            case "training":
                return renderQuery(dash.training, (d) => <TrainingTab data={d} year={dash.selectedYear} />);
            case "yearComparison":
                return renderQuery(dash.yearComparison, (d) => (
                    <YearComparisonTab
                        data={d}
                        year={dash.selectedYear}
                        comparisonYears={dash.comparisonYears}
                        onYearsChange={dash.setComparisonYears}
                    />
                ));
            default:
                return null;
        }
    }

    return (
        <div className="space-y-5 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 lg:text-2xl">
                        Placement Dashboard
                    </h1>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {dash.collegeName && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {dash.collegeName}
                            </span>
                        )}
                        <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            Batch {dash.selectedYear}
                        </span>
                        <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                            <Clock className="h-3 w-3" />
                            Live data
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={dash.refresh}
                        disabled={isRefreshing}
                        className="rounded-lg border border-gray-200 bg-white p-2.5 min-h-[44px] min-w-[44px] text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        aria-label="Refresh dashboard"
                    >
                        <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <OverviewSection data={dash.overview.data} loading={dash.overview.isLoading} />

            {/* Problem Indicators */}
            {dash.overview.data && (
                <ProblemIndicators data={dash.overview.data} onNavigate={dash.setActiveTab} />
            )}

            {/* Tab Bar */}
            <TabBar
                activeTab={dash.activeTab}
                onTabChange={dash.setActiveTab}
                loadingTabs={loadingTabs}
            />

            {/* Tab Content */}
            <AnimatedTabContent activeTab={dash.activeTab} tabKeys={[...TAB_KEYS]}>
                <div className="min-h-[300px]">{renderTabContent()}</div>
            </AnimatedTabContent>
        </div>
    );
}
