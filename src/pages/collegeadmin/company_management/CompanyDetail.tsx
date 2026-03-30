import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, LayoutGroup, useReducedMotion } from "framer-motion";
import {
    Building2,
    Globe,
    ExternalLink,
    Users,
    Briefcase,
    Pencil,
    Power,
    AlertCircle,
    AlertTriangle,
    FileText,
    Hash,
    Calendar,
    UserCheck,
    Loader2,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import AnimatedTabContent from "@/components/ui/AnimatedTabContent";
import ModalWrapper from "@/components/ui/ModalWrapper";
import { useViewCompany, type CompanyDetail as CompanyDetailType } from "@/hooks/collegeadmin/company_management/useViewCompany";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import ContactsTab from "@/components/collegeadmin/company_management/ContactsTab";
import CompanyJobsTab from "@/components/collegeadmin/company_management/CompanyJobsTab";

// ========================
// CONSTANTS
// ========================

type TabKey = "overview" | "contacts" | "jobs";

const TAB_ICONS: Record<TabKey, React.ComponentType<{ className?: string }>> = {
    overview: FileText,
    contacts: Users,
    jobs: Briefcase,
};

const TABS: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "jobs", label: "Jobs" },
    { key: "contacts", label: "Contacts" },
];

// ========================
// HELPERS
// ========================

const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600",
] as const;

const getAvatarGradient = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "â€”";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// ========================
// SUB-COMPONENTS
// ========================

/** Hero avatar â€” large logo or initials */
const HeroAvatar = ({ company }: { company: CompanyDetailType }) => {
    const [imgErr, setImgErr] = useState(false);

    if (company.company_logo && !imgErr) {
        return (
            <img
                src={company.company_logo}
                alt={company.company_name}
                className="h-16 w-16 rounded-xl object-contain border-2 border-white dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0"
                onError={() => setImgErr(true)}
            />
        );
    }

    return (
        <div
            className={`h-16 w-16 rounded-xl bg-gradient-to-br ${getAvatarGradient(company.company_name)} flex items-center justify-center flex-shrink-0 shadow-sm text-white text-xl font-bold`}
        >
            {getInitials(company.company_name)}
        </div>
    );
};

/** Stat card */
const StatCard = ({
    icon,
    value,
    label,
    color,
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    color: "cyan" | "blue" | "orange";
}) => {
    const colors = {
        cyan: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400",
        blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400",
        orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400",
    };
    const numColors = {
        cyan: "text-cyan-700 dark:text-cyan-300",
        blue: "text-blue-700 dark:text-blue-300",
        orange: "text-orange-700 dark:text-orange-300",
    };

    return (
        <div className={`flex items-center gap-4 p-5 rounded-xl border ${colors[color]}`}>
            <div className="h-11 w-11 rounded-lg bg-white/80 dark:bg-gray-800/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                {icon}
            </div>
            <div>
                <p className={`text-2xl font-bold ${numColors[color]}`}>{value}</p>
                <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
        </div>
    );
};

/** Info row for Overview tab */
const InfoRow = ({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) => (
    <div className="flex items-start gap-3 py-3.5">
        <div className="h-8 w-8 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
            <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
        </div>
    </div>
);

// ========================
// TAB CONTENT COMPONENTS
// ========================

/** Overview tab */
const OverviewTab = ({ company }: { company: CompanyDetailType }) => (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {/* Description */}
        {company.company_description && (
            <div className="pb-5">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">About</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                    {company.company_description}
                </p>
            </div>
        )}

        {/* Details grid */}
        <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {company.company_website && (
                <InfoRow icon={<Globe className="h-4 w-4" />} label="Website">
                    <a
                        href={company.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1 break-all"
                    >
                        {company.company_website}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                </InfoRow>
            )}

            {company.industry && (
                <InfoRow icon={<Building2 className="h-4 w-4" />} label="Industry">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                        {company.industry}
                    </span>
                </InfoRow>
            )}

            <InfoRow icon={<Hash className="h-4 w-4" />} label="Company ID">
                <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">
                    {company.company_id}
                </code>
            </InfoRow>

            <InfoRow icon={<Calendar className="h-4 w-4" />} label="Registered">
                {formatDate(company.created_at)}
            </InfoRow>

            {company.updated_at && (
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Last Updated">
                    {formatDate(company.updated_at)}
                </InfoRow>
            )}
        </div>
    </div>
);

/** Jobs tab â€” replaced by CompanyJobsTab component */

// ========================
// LOADING SKELETON
// ========================

const DetailSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
        {/* Hero skeleton */}
        <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
                <div className="space-y-2 flex-1">
                    <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-56" />
                    <div className="flex gap-2">
                        <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                        <div className="h-5 w-24 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-28 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    <div className="h-10 w-28 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                </div>
            </div>
        </div>
        {/* Stats skeleton */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700" />
                ))}
            </div>
        </div>
        {/* Tabs skeleton */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex gap-6">
            {[0, 1, 2].map((i) => (
                <div key={i} className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
            ))}
        </div>
        {/* Body skeleton */}
        <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
        </div>
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

const CompanyDetail = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const navigate = useNavigate();
    const shouldReduce = useReducedMotion();
    const queryClient = useQueryClient();
    const { company, loading, error, refresh } = useViewCompany(companyId);
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [showConfirm, setShowConfirm] = useState(false);

    const toggleMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            CollegeAdminService.toggleCompanyStatus(id, status),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId!) });
            showToast({
                type: "success",
                title: "Status Updated",
                description: response?.message || `Company status updated successfully.`,
            });
            setShowConfirm(false);
        },
        onError: (err: unknown) => {
            const msg = err instanceof ApiError ? err.message : "Failed to toggle status";
            showToast({ type: "error", title: "Error", description: msg });
        },
    });

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Companies", path: "/college/companies" },
            { label: company?.company_name || "Details", active: true },
        ],
        [company?.company_name]
    );

    const handleCloseConfirm = useCallback(() => {
        if (!toggleMutation.isPending) setShowConfirm(false);
    }, [toggleMutation.isPending]);

    const handleToggleStatus = useCallback(() => {
        if (!company) return;
        const newStatus = company.company_status === "active" ? "inactive" : "active";
        toggleMutation.mutate({ id: company.company_id, status: newStatus });
    }, [company, toggleMutation]);

    // â”€â”€ Loading â”€â”€
    if (loading) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Company Details" breadcrumbs={breadcrumbs} />
                    <DetailSkeleton />
                </div>
            </AnimatedPage>
        );
    }

    // â”€â”€ Error â”€â”€
    if (error || !company) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Company Details" breadcrumbs={breadcrumbs} />
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Failed to load company</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{error || "Company not found"}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/college/companies")}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                        >
                            â† Back to Companies
                        </button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    const isActive = company.company_status === "active";

    // Contacts/jobs counts for tab badges
    const tabBadge: Partial<Record<TabKey, number>> = {
        contacts: company.contacts_count ?? 0,
        jobs: company.jobs_count ?? 0,
    };

    const TAB_KEYS = TABS.map((t) => t.key) as TabKey[];

    return (
        <>
            <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Company Details" breadcrumbs={breadcrumbs} />

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* â”â” Hero Header â”â” */}
                    <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                            {/* Left: Avatar + info */}
                            <div className="flex items-center gap-4 min-w-0">
                                <HeroAvatar company={company} />

                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {company.company_name}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        {/* Status badge */}
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                isActive
                                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    isActive ? "bg-emerald-500" : "bg-red-400"
                                                }`}
                                            />
                                            {isActive ? "Active" : "Inactive"}
                                        </span>

                                        {/* Industry tag */}
                                        {company.industry && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                                                {company.industry}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/college/update-company/${company.company_id}`)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(true)}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition shadow-sm ${
                                        isActive
                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    }`}
                                >
                                    <Power className="h-4 w-4" />
                                    {isActive ? "Deactivate" : "Activate"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* â”â” Stats Row â”â” */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                icon={<Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
                                value={company.contacts_count ?? 0}
                                label="Total Contacts"
                                color="cyan"
                            />
                            <StatCard
                                icon={<UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                                value={company.active_contacts_count ?? 0}
                                label="Active Contacts"
                                color="blue"
                            />
                            <StatCard
                                icon={<Briefcase className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                                value={company.jobs_count ?? 0}
                                label="Jobs Posted"
                                color="orange"
                            />
                        </div>
                    </div>

                    {/* â”â” Tab Navigation â”â” */}
                    <div className="px-6 border-b border-gray-100 dark:border-gray-800">
                        <LayoutGroup>
                            <nav className="flex gap-1 -mb-px" aria-label="Tabs">
                                {TABS.map((tab) => {
                                    const isSelected = activeTab === tab.key;
                                    const badge = tabBadge[tab.key];
                                    const Icon = TAB_ICONS[tab.key];
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                                isSelected
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.label}
                                            {badge !== undefined && badge > 0 && (
                                                <span
                                                    className={`ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
                                                        isSelected
                                                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                    }`}
                                                >
                                                    {badge}
                                                </span>
                                            )}
                                            {isSelected && (
                                                shouldReduce ? (
                                                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                                ) : (
                                                    <motion.span
                                                        layoutId="tab-indicator"
                                                        className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                                    />
                                                )
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </LayoutGroup>
                    </div>

                    {/* â”â” Tab Content â”â” */}
                    <AnimatedTabContent activeTab={activeTab} tabKeys={TAB_KEYS} className="p-6">
                        {activeTab === "overview" && <OverviewTab company={company} />}
                        {activeTab === "jobs" && (
                            <CompanyJobsTab companyId={company.company_id} companyName={company.company_name} />
                        )}
                        {activeTab === "contacts" && (
                            <ContactsTab companyId={company.company_id} onContactsChanged={refresh} />
                        )}
                    </AnimatedTabContent>
                </div>
            </div>
            </AnimatedPage>

            {/* â”â”â”â”â” Toggle Confirmation Modal â”â”â”â”â” */}
            <ModalWrapper
                isOpen={showConfirm}
                onClose={handleCloseConfirm}
                disabled={toggleMutation.isPending}
                title={isActive ? "Deactivate Company" : "Activate Company"}
                titleIcon={
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                        isActive ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"
                    }`}>
                        <Power className={`h-4 w-4 ${
                            isActive ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                        }`} />
                    </div>
                }
                size="md"
            >
                {/* Modal body */}
                <div className="px-6 py-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to{" "}
                        <span className="font-semibold">
                            {isActive ? "deactivate" : "activate"}
                        </span>{" "}
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {company.company_name}
                        </span>
                        ?
                    </p>

                    {isActive && (
                        <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                <p className="font-medium">This action will:</p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    <li>Hide this company from new job postings</li>
                                    <li>Existing job postings will not be affected</li>
                                    <li>You can re-activate the company at any time</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {!isActive && (
                        <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                This company will be available for new job postings and visible across the platform.
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleCloseConfirm}
                        disabled={toggleMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleStatus}
                        disabled={toggleMutation.isPending}
                        className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${
                            isActive
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                    >
                        {toggleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {toggleMutation.isPending ? "Updating..." : isActive ? "Deactivate" : "Activate"}
                    </button>
                </div>
            </ModalWrapper>
        </>
    );
};

export default CompanyDetail;
