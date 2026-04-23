import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Check,
    X,
    Loader2,
    Briefcase,
    Trophy,
    Award,
    Calendar,
    MapPin,
    Globe,
    FileText,
    Link as LinkIcon,
    Clock,
    Hash,
} from "lucide-react";
import { DocumentPreview } from "@/components/ui/DocumentPreview";
import type {
    PendingExperience,
    PendingAchievement,
    PendingCertificate,
    PendingProfile,
    PendingItem,
} from "@/hooks/collegeadmin/verification/useViewPendingItems";
import type { VerificationCategory } from "@/validators/VerificationSchema";

// ========================
// HELPERS
// ========================

const fmt = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatDuration = (exp: PendingExperience): string => {
    const start = fmt(exp.start_date);
    const end = exp.is_current ? "Present" : fmt(exp.end_date);
    const months = exp.duration_months;
    const dur = months ? ` · ${months} mo` : "";
    return `${start} → ${end}${dur}`;
};

function DetailRow({ label, value }: Readonly<{ label: string; value: React.ReactNode }>) {
    if (value === null || value === undefined || value === "" || value === "—") return null;
    return (
        <div className="flex items-start gap-3 py-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-28 flex-shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-gray-900 dark:text-white flex-1 min-w-0">{value}</span>
        </div>
    );
}

function ChipList({ items }: Readonly<{ items: string[] | null | undefined }>) {
    if (!items || items.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
                <span
                    key={item}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

function StudentHeader({ item }: Readonly<{ item: PendingItem }>) {
    const p = item as { first_name: string; middle_name?: string | null; last_name: string; student_email?: string; dept_name?: string; student_passout_year?: number };
    const name = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">
                    {p.first_name?.charAt(0)}{p.last_name?.charAt(0)}
                </span>
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.student_email}</p>
                {p.dept_name && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        {p.dept_name}{p.student_passout_year ? ` · ${p.student_passout_year}` : ""}
                    </p>
                )}
            </div>
        </div>
    );
}

// ========================
// CATEGORY-SPECIFIC DETAILS
// ========================

function ExperienceDetails({ item }: Readonly<{ item: PendingExperience }>) {
    return (
        <div className="space-y-4">
            {/* Title card */}
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.position_title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.company_name}</p>
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <DetailRow label="Type" value={
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {item.employment_type?.replaceAll("_", " ")}
                    </span>
                } />
                <DetailRow label="Duration" value={
                    <span className="inline-flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" /> {formatDuration(item)}
                    </span>
                } />
                {item.work_mode && <DetailRow label="Work Mode" value={item.work_mode.replaceAll("_", " ")} />}
                {item.work_location && <DetailRow label="Location" value={
                    <span className="inline-flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" /> {item.work_location}
                    </span>
                } />}
                {item.company_website && <DetailRow label="Website" value={
                    <a href={item.company_website} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <Globe className="h-3.5 w-3.5" /> {item.company_website}
                    </a>
                } />}
            </div>

            {item.job_description && (
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Job Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{item.job_description}</p>
                </div>
            )}

            {item.responsibilities && (
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Responsibilities</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{item.responsibilities}</p>
                </div>
            )}

            {item.technologies_used && item.technologies_used.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Technologies</p>
                    <ChipList items={item.technologies_used} />
                </div>
            )}

            {/* Documents */}
            {(item.offer_letter_url || item.completion_certificate_url) && (
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Documents
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {item.offer_letter_url && <DocumentPreview value={item.offer_letter_url} bucket="placenex-private" label="Offer Letter" variant="inline" />}
                        {item.completion_certificate_url && <DocumentPreview value={item.completion_certificate_url} bucket="placenex-private" label="Completion Certificate" variant="inline" />}
                    </div>
                </div>
            )}
        </div>
    );
}

function AchievementDetails({ item }: Readonly<{ item: PendingAchievement }>) {
    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.achievement_title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {item.achievement_type?.replaceAll("_", " ")}
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                            {item.achievement_level}
                        </span>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <DetailRow label="Date" value={
                    <span className="inline-flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" /> {fmt(item.achievement_date)}
                    </span>
                } />
                {item.issuing_organization && <DetailRow label="Organization" value={item.issuing_organization} />}
                {item.event_name && <DetailRow label="Event" value={item.event_name} />}
                {item.position_rank && <DetailRow label="Position/Rank" value={item.position_rank} />}
                {item.participants_count && <DetailRow label="Participants" value={item.participants_count.toLocaleString()} />}
            </div>

            {item.achievement_description && (
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{item.achievement_description}</p>
                </div>
            )}

            {(item.certificate_url || item.proof_url) && (
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Documents
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {item.certificate_url && <DocumentPreview value={item.certificate_url} bucket="placenex-private" label="Certificate" variant="inline" />}
                        {item.proof_url && <DocumentPreview value={item.proof_url} bucket="placenex-private" label="Proof" variant="inline" />}
                    </div>
                </div>
            )}
        </div>
    );
}

function CertificateDetails({ item }: Readonly<{ item: PendingCertificate }>) {
    let expiryText: string | null = null;
    if (item.does_not_expire) {
        expiryText = "No Expiry";
    } else if (item.expiry_date) {
        expiryText = fmt(item.expiry_date);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.certificate_name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.issuing_organization}</p>
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <DetailRow label="Type" value={
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {item.certificate_type?.replaceAll("_", " ")}
                    </span>
                } />
                {item.issuing_platform && <DetailRow label="Platform" value={item.issuing_platform} />}
                <DetailRow label="Issued" value={
                    <span className="inline-flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" /> {fmt(item.issue_date)}
                    </span>
                } />
                {expiryText && <DetailRow label="Expiry" value={
                    <span className="inline-flex items-center gap-1 text-sm">
                        <Clock className="h-3.5 w-3.5 text-gray-400" /> {expiryText}
                    </span>
                } />}
                {item.credential_id && <DetailRow label="Credential ID" value={
                    <span className="inline-flex items-center gap-1 text-sm font-mono text-xs">
                        <Hash className="h-3 w-3 text-gray-400" /> {item.credential_id}
                    </span>
                } />}
                {item.credential_url && <DetailRow label="Verify" value={
                    <a href={item.credential_url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <LinkIcon className="h-3.5 w-3.5" /> Verify Credential
                    </a>
                } />}
            </div>

            {item.certificate_description && (
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{item.certificate_description}</p>
                </div>
            )}

            {item.skills_covered && item.skills_covered.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Skills Covered</p>
                    <ChipList items={item.skills_covered} />
                </div>
            )}

            {item.certificate_url && (
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Documents
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <DocumentPreview value={item.certificate_url} bucket="placenex-private" label="View Certificate" variant="inline" />
                    </div>
                </div>
            )}
        </div>
    );
}

function ProfileDetails({ item }: Readonly<{ item: PendingProfile }>) {
    return (
        <div className="space-y-4">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <DetailRow label="Department" value={item.dept_name} />
                <DetailRow label="Passout Year" value={item.student_passout_year} />
                <DetailRow label="Profile Complete" value={item.profile_complete ? "Yes" : "No"} />
                <DetailRow label="Submitted" value={fmt(item.updated_at)} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                For a full profile review, click the student name in the table to open the detailed review page.
            </p>
        </div>
    );
}

// ========================
// CATEGORY CONFIG
// ========================

const SHEET_TITLES: Record<VerificationCategory, string> = {
    profiles: "Profile Review",
    experiences: "Experience Details",
    achievements: "Achievement Details",
    certificates: "Certificate Details",
};

// ========================
// MAIN COMPONENT
// ========================

interface PendingItemSheetProps {
    open: boolean;
    onClose: () => void;
    item: PendingItem | null;
    category: VerificationCategory;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    isApproving: boolean;
    isRejecting: boolean;
    processingId: string | null;
}

export default function PendingItemSheet({
    open,
    onClose,
    item,
    category,
    onApprove,
    onReject,
    isApproving,
    isRejecting,
    processingId,
}: Readonly<PendingItemSheetProps>) {
    if (!item) return null;

    let itemId: string;
    if (category === "profiles") {
        itemId = (item as PendingProfile).student_id;
    } else if (category === "experiences") {
        itemId = (item as PendingExperience).experience_id;
    } else if (category === "achievements") {
        itemId = (item as PendingAchievement).achievement_id;
    } else {
        itemId = (item as PendingCertificate).certificate_id;
    }

    const isProcessingThis = processingId === itemId;

    return (
        <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <SheetContent side="right" className="sm:max-w-md w-full flex flex-col">
                <SheetHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
                    <SheetTitle className="text-base">{SHEET_TITLES[category]}</SheetTitle>
                    <SheetDescription className="sr-only">
                        Review details for this {category.slice(0, -1)}
                    </SheetDescription>
                </SheetHeader>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                    <StudentHeader item={item} />

                    {category === "experiences" && <ExperienceDetails item={item as PendingExperience} />}
                    {category === "achievements" && <AchievementDetails item={item as PendingAchievement} />}
                    {category === "certificates" && <CertificateDetails item={item as PendingCertificate} />}
                    {category === "profiles" && <ProfileDetails item={item as PendingProfile} />}
                </div>

                {/* Action footer */}
                {(onApprove || onReject) && (
                    <SheetFooter className="border-t border-gray-100 dark:border-gray-800 pt-3 flex-row gap-3">
                        {onApprove && (
                            <button
                                type="button"
                                onClick={() => onApprove(itemId)}
                                disabled={isProcessingThis}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {isProcessingThis && isApproving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                Approve
                            </button>
                        )}
                        {onReject && (
                            <button
                                type="button"
                                onClick={() => onReject(itemId)}
                                disabled={isProcessingThis}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {isProcessingThis && isRejecting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                        Reject
                            </button>
                        )}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
