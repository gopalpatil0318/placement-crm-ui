import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/collegeadmin/useAuth";
import { useYearFilter } from "@/context/YearFilterContext";

// ========================
// TYPES
// ========================

export type DashboardTab =
    | "overview"
    | "placement"
    | "funnel"
    | "students"
    | "departments"
    | "companies"
    | "diversity"
    | "training"
    | "yearComparison";

export type DashboardOverview = Readonly<{
    total_students: number;
    placed_count: number;
    placement_percentage: number;
    total_offers: number;
    highest_package: number;
    lowest_package: number;
    average_package: number;
    median_package: number;
    unplaced_count: number;
    total_companies: number;
    total_job_postings: number;
}>;

export type PackageSlabs = Readonly<{
    below_3l: number;
    "3l_to_5l": number;
    "5l_to_8l": number;
    "8l_to_12l": number;
    "12l_to_20l": number;
    above_20l: number;
}>;

export type OfferBreakdown = Readonly<{
    fulltime_offers: number;
    internship_offers: number;
    pending_offers: number;
    accepted_offers: number;
    joined_count: number;
    rejected_offers: number;
    cancelled_offers: number;
    students_with_multiple_offers: number;
}>;

export type InternshipStats = Readonly<{
    highest_stipend: number;
    average_stipend: number;
    with_stipend_count: number;
}>;

export type PlacementStats = Readonly<{
    package_slabs: PackageSlabs;
    offer_breakdown: OfferBreakdown;
    internship_stats: InternshipStats;
}>;

export type ApplicationFunnel = Readonly<{
    total_applications: number;
    unique_applicants: number;
    pending: number;
    under_review: number;
    shortlisted: number;
    selected: number;
    offered: number;
    rejected: number;
    withdrawn: number;
    selection_rate: number;
    applications_per_student: number;
    eligible_not_applied_count: number;
}>;

export type StudentReadiness = Readonly<{
    student_status: Readonly<{
        total_students: number;
        active: number;
        inactive: number;
        suspended: number;
        graduated: number;
        dropout: number;
        profile_complete: number;
        profile_incomplete: number;
        profile_approved: number;
        profile_pending_approval: number;
    }>;
    restrictions: Readonly<{
        total_active_restrictions: number;
        bar_from_placements: number;
        bar_from_company: number;
        probation: number;
        warning: number;
        temporary_suspension: number;
        restricted_students: number;
    }>;
}>;

export type DiversityStats = Readonly<{
    gender_wise: ReadonlyArray<Readonly<{
        gender: string;
        total: number;
        placed: number;
        placement_percentage: number;
    }>>;
    category_wise: ReadonlyArray<Readonly<{
        category: string;
        total: number;
        placed: number;
        placement_percentage: number;
    }>>;
}>;

export type TrainingStats = Readonly<{
    training: Readonly<{
        total_programs: number;
        upcoming: number;
        enrollment_open: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        total_enrolled: number;
        total_completed_enrollment: number;
        total_dropped: number;
        overall_avg_rating: number;
    }>;
    feedback: Readonly<{
        total_feedback: number;
        average_rating: number;
        five_star: number;
        four_star: number;
        three_star: number;
        two_star: number;
        one_star: number;
    }>;
}>;

export type DepartmentStat = Readonly<{
    dept_id: string;
    dept_name: string;
    total_students: number;
    placed_count: number;
    placement_percentage: number;
    unplaced_count: number;
    highest_package: number;
    average_package: number;
    avg_cgpa: number;
    profile_complete_count: number;
}>;

export type CompanyStat = Readonly<{
    company_id: string;
    company_name: string;
    industry: string;
    total_jobs: number;
    total_positions: number;
    total_applications: number;
    shortlisted: number;
    selected: number;
    rejected: number;
    selection_rate: number;
    offers_made: number;
    avg_package: number;
    highest_package: number;
    feedback_avg_rating: number;
    feedback_count: number;
}>;

export type YearComparison = Readonly<{
    passout_year: number;
    total_students: number;
    placed_count: number;
    placement_percentage: number;
    total_offers: number;
    fulltime_count: number;
    internship_count: number;
    highest_package: number;
    average_package: number;
    total_companies: number;
    total_job_postings: number;
    total_applications: number;
    selection_rate: number;
}>;

// ========================
// HELPERS
// ========================

export function formatPackage(amount: number | null | undefined): string {
    const n = Number(amount);
    if (!n || n === 0) return "—";
    return `₹${(n / 100000).toFixed(2)} LPA`;
}

export function formatStipend(amount: number | null | undefined): string {
    const n = Number(amount);
    if (!n || n === 0) return "—";
    return `₹${n.toLocaleString("en-IN")}/mo`;
}

export function formatPercentage(value: number | null | undefined): string {
    if (value === null || value === undefined) return "—";
    return `${Number(value).toFixed(2)}%`;
}

export function getGrowthPercent(
    current: number | string,
    previous: number | string,
): number | null {
    const c = Number(current);
    const p = Number(previous);
    if (!p || p === 0) return null;
    return Number(((c - p) / p * 100).toFixed(2));
}

export const SLAB_LABELS: Record<string, string> = {
    below_3l: "< ₹3 LPA",
    "3l_to_5l": "₹3-5 LPA",
    "5l_to_8l": "₹5-8 LPA",
    "8l_to_12l": "₹8-12 LPA",
    "12l_to_20l": "₹12-20 LPA",
    above_20l: "₹20+ LPA",
};

// ========================
// HOOK
// ========================

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useDashboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { selectedYear } = useYearFilter();

    const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
    const [comparisonYears, setComparisonYears] = useState<number[]>(() => {
        const y = Number.parseInt(
            new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric' }),
            10,
        );
        return [y, y - 1, y - 2];
    });

    // ── Overview (always fires) ──
    const overview = useQuery({
        queryKey: queryKeys.dashboard.overview(selectedYear),
        queryFn: async () => {
            const res = await CollegeAdminService.getDashboardOverview(selectedYear);
            return res.data as DashboardOverview;
        },
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
    });

    // ── Tab queries (lazy — only fire when tab is active) ──
    const placement = useQuery({
        queryKey: queryKeys.dashboard.placement(selectedYear),
        queryFn: async () => {
            const res = await CollegeAdminService.getDashboardPlacementStats(selectedYear);
            return res.data as PlacementStats;
        },
        enabled: activeTab === "placement",
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
    });

    const funnel = useQuery({
        queryKey: queryKeys.dashboard.funnel(selectedYear),
        queryFn: async () => {
            const res = await CollegeAdminService.getDashboardApplicationFunnel(selectedYear);
            return res.data as ApplicationFunnel;
        },
        enabled: activeTab === "funnel",
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
    });

    const students = useQuery({
        queryKey: queryKeys.dashboard.students(selectedYear),
        queryFn: async () => {
            const res = await CollegeAdminService.getDashboardStudentReadiness(selectedYear);
            return res.data as StudentReadiness;
        },
        enabled: activeTab === "students",
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
    });

    const diversity = useQuery({
        queryKey: queryKeys.dashboard.diversity(selectedYear),
        queryFn: async () => {
            const res = await CollegeAdminService.getDashboardDiversityStats(selectedYear);
            return res.data as DiversityStats;
        },
        enabled: activeTab === "diversity",
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
    });

    const training = useQuery({
        queryKey: queryKeys.dashboard.training(selectedYear),
        queryFn: async () => {
            const res = await CollegeAdminService.getDashboardTrainingStats(selectedYear);
            return res.data as TrainingStats;
        },
        enabled: activeTab === "training",
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
    });

    const departments = useQuery({
        queryKey: queryKeys.dashboard.departments(selectedYear),
        queryFn: async () => {
            const res = await CollegeAdminService.getDashboardDepartmentWise(selectedYear);
            return res.data as DepartmentStat[];
        },
        enabled: activeTab === "departments",
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
    });

    const companies = useQuery({
        queryKey: queryKeys.dashboard.companies(selectedYear),
        queryFn: async () => {
            const res = await CollegeAdminService.getDashboardCompanyWise(selectedYear);
            return res.data as CompanyStat[];
        },
        enabled: activeTab === "companies",
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
    });

    const yearComparison = useQuery({
        queryKey: queryKeys.dashboard.yearComparison(comparisonYears),
        queryFn: async () => {
            const res = await CollegeAdminService.getDashboardYearComparison(comparisonYears);
            return res.data as YearComparison[];
        },
        enabled: activeTab === "yearComparison" && comparisonYears.length >= 2,
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false,
    });

    // ── Manual refresh ──
    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() });
    }, [queryClient]);

    return {
        collegeName: user?.collegeName ?? "",
        selectedYear,
        activeTab,
        setActiveTab,
        comparisonYears,
        setComparisonYears,
        overview,
        placement,
        funnel,
        students,
        diversity,
        training,
        departments,
        companies,
        yearComparison,
        refresh,
    };
}
